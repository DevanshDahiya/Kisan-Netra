/**
 * Licensed Dealer Registry Importer - Odisha HTML Export Parser
 *
 * The data file is an HTML export from Microsoft Excel (saved as .xls but actually HTML).
 * Columns: Sl No | District | Farm Name | License No | Mail Id | Address | Valid From | Valid Till
 *
 * Run: node scripts/import-licensed-dealers-html.js [--dry-run] [--inspect]
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const LicensedDealer = require('../src/models/LicensedDealer');
const { normalizeLicense } = require('../src/utils/license-normalizer');

function stripHtml(str) {
    if (!str) return '';
    return str
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#[0-9]+;/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractEmails(rawText) {
    const text = stripHtml(rawText);
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    const unique = [];
    for (const m of matches) {
        const lc = m.toLowerCase().trim();
        if (!unique.includes(lc)) unique.push(lc);
    }
    return unique;
}

function parseDate(str) {
    if (!str) return null;
    const cleaned = str.trim();
    // DD-MM-YY or DD-MM-YYYY
    const match = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
    if (match) {
        let [, d, m, y] = match;
        if (y.length === 2) y = '20' + y;
        const parsed = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
        if (!isNaN(parsed.getTime())) return parsed;
    }
    const parsed = new Date(cleaned);
    return isNaN(parsed.getTime()) ? null : parsed;
}

function maskEmail(email) {
    if (!email || !email.includes('@')) return '***@***.***';
    const [local, domain] = email.split('@');
    const masked = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
    return `${masked}@${domain}`;
}

function parseTdCells(trHtml) {
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let match;
    while ((match = tdRegex.exec(trHtml)) !== null) {
        cells.push(stripHtml(match[1]));
    }
    return cells;
}

function parseHtmlTable(htmlContent) {
    const rows = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const trMatches = [];
    let trMatch;
    while ((trMatch = trRegex.exec(htmlContent)) !== null) {
        trMatches.push(trMatch[1]);
    }

    let i = 0;
    while (i < trMatches.length) {
        const cells = parseTdCells(trMatches[i]);
        if (cells.length >= 6 && /^\d+$/.test(cells[0])) {
            const district = cells[1] || '';
            const farmName = cells[2] || '';
            const licenseNo = cells[3] || '';
            const mailId = cells[4] || '';
            const addressLine1 = cells[5] || '';
            const validTill = cells[7] || '';

            let fullAddress = addressLine1;
            let j = i + 1;
            while (j < trMatches.length && j < i + 4) {
                const subCells = parseTdCells(trMatches[j]);
                if (subCells.length >= 6 && /^\d+$/.test(subCells[0])) break;
                if (subCells.length === 1 && subCells[0]) {
                    fullAddress += (fullAddress ? ', ' : '') + subCells[0];
                }
                j++;
            }

            rows.push({
                district: district.trim(),
                farmName: farmName.trim(),
                licenseNo: licenseNo.trim(),
                mailId: mailId.trim(),
                address: fullAddress.trim(),
                validTill: validTill.trim(),
            });

            i = j;
        } else {
            i++;
        }
    }

    return rows;
}

async function runImport() {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');
    const isInspect = args.includes('--inspect');

    // Auto-discover the HTML sheet file
    const candidateDirs = [
        path.join(__dirname, '../data'),
        path.join(__dirname, '../../Data/Odisha'),
    ];

    let htmlFilePath = null;

    for (const dir of candidateDirs) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir);
        for (const f of files) {
            const ext = path.extname(f).toLowerCase();
            if (!['.xls', '.htm', '.html'].includes(ext)) continue;
            const candidate = path.join(dir, f);

            // Check if the file itself contains the data headers
            try {
                const content = fs.readFileSync(candidate, 'utf-8');
                if (content.includes('Farm Name') && content.includes('License No')) {
                    htmlFilePath = candidate;
                    break;
                }
            } catch (_) {}

            // Check for companion sheet001.htm (Excel HTML frameset)
            const companionDir = path.join(dir, f.replace(ext, '_files'));
            const companionSheet = path.join(companionDir, 'sheet001.htm');
            if (fs.existsSync(companionSheet)) {
                try {
                    const sheetContent = fs.readFileSync(companionSheet, 'utf-8');
                    if (sheetContent.includes('Farm Name') && sheetContent.includes('License No')) {
                        htmlFilePath = companionSheet;
                        break;
                    }
                } catch (_) {}
            }
        }
        if (htmlFilePath) break;
    }

    if (!htmlFilePath) {
        console.error('ERROR: Could not find the dealer registry data file.');
        console.error('Looked in:', candidateDirs.join(', '));
        console.error('Make sure the .xls file (and its _files/ folder) is present.');
        process.exit(1);
    }

    console.log('Source file:', htmlFilePath);
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    const rows = parseHtmlTable(htmlContent);
    console.log(`Parsed ${rows.length} dealer records.`);

    if (isInspect) {
        console.log('\nColumn mapping (from HTML headers):');
        console.log('  District   -> district');
        console.log('  Farm Name  -> businessName');
        console.log('  License No -> licenseNumber (normalized)');
        console.log('  Mail Id    -> emails[]');
        console.log('  Address    -> address (multi-row concatenated)');
        console.log('  Valid Till -> licenseValidUntil');
        console.log('  (Phone is NOT in this dataset)');
        console.log('\nFirst 5 rows (emails masked):');
        rows.slice(0, 5).forEach((r, idx) => {
            console.log(`  [${idx + 1}]`, {
                district: r.district,
                farmName: r.farmName,
                licenseNo: r.licenseNo,
                email: r.mailId ? maskEmail(r.mailId) : '(none)',
                address: r.address.slice(0, 60) + (r.address.length > 60 ? '...' : ''),
                validTill: r.validTill,
            });
        });
        process.exit(0);
    }

    // Build deduplicated record map
    const recordMap = new Map();
    let rowsWithoutEmail = 0;

    for (const row of rows) {
        const normalizedLic = normalizeLicense(row.licenseNo);
        if (!normalizedLic) continue;
        const emails = extractEmails(row.mailId);
        if (emails.length === 0) rowsWithoutEmail++;

        if (recordMap.has(normalizedLic)) {
            const existing = recordMap.get(normalizedLic);
            emails.forEach(e => { if (!existing.emails.includes(e)) existing.emails.push(e); });
            if (!existing.address && row.address) existing.address = row.address;
        } else {
            recordMap.set(normalizedLic, {
                licenseNumber: normalizedLic,
                businessName: row.farmName,
                ownerName: '',
                emails,
                phones: [],
                address: row.address,
                district: row.district,
                state: 'Odisha',
                licenseValidUntil: parseDate(row.validTill),
                sourceFile: path.basename(htmlFilePath),
                importedAt: new Date(),
            });
        }
    }

    console.log(`Unique licenses: ${recordMap.size}`);
    console.log(`Rows without valid email: ${rowsWithoutEmail} (will use admin review)`);

    if (isDryRun) {
        console.log('\n[DRY RUN] No changes written to database.');
        console.log(`Would upsert ${recordMap.size} records.`);
        process.exit(0);
    }

    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI missing from .env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    let inserted = 0, updated = 0, errors = 0;

    for (const record of recordMap.values()) {
        try {
            const existing = await LicensedDealer.findOne({ licenseNumber: record.licenseNumber });
            if (existing) {
                const mergedEmails = Array.from(new Set([...existing.emails, ...record.emails]));
                await LicensedDealer.updateOne(
                    { licenseNumber: record.licenseNumber },
                    {
                        $set: {
                            businessName: record.businessName || existing.businessName,
                            emails: mergedEmails,
                            address: record.address || existing.address,
                            district: record.district || existing.district,
                            licenseValidUntil: record.licenseValidUntil || existing.licenseValidUntil,
                            sourceFile: record.sourceFile,
                            importedAt: new Date(),
                        }
                    }
                );
                updated++;
            } else {
                await LicensedDealer.create(record);
                inserted++;
            }
        } catch (err) {
            errors++;
            console.error(`Error on license ${record.licenseNumber}: ${err.message}`);
        }
    }

    console.log('\n======== IMPORT SUMMARY ========');
    console.log(`Rows parsed:               ${rows.length}`);
    console.log(`Unique licenses:           ${recordMap.size}`);
    console.log(`Inserted:                  ${inserted}`);
    console.log(`Updated:                   ${updated}`);
    console.log(`Without email (admin only): ${rowsWithoutEmail}`);
    console.log(`Errors:                    ${errors}`);
    console.log('================================');

    await mongoose.disconnect();
    process.exit(0);
}

runImport().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
