const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Load any spreadsheet into an ExcelJS Workbook.
 * .xls (legacy binary) is converted via SheetJS -> xlsx buffer first,
 * since ExcelJS only supports the .xlsx (ZIP-based) format.
 */
async function loadWorkbook(filePath) {
  const workbook = new ExcelJS.Workbook();
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') {
    await workbook.csv.readFile(filePath);
  } else if (ext === '.xls') {
    // SheetJS can read legacy .xls binary format
    const sheetjsBook = XLSX.readFile(filePath);
    const xlsxBuffer = XLSX.write(sheetjsBook, { type: 'buffer', bookType: 'xlsx' });
    await workbook.xlsx.load(xlsxBuffer);
  } else {
    // .xlsx and anything else: use ExcelJS directly
    await workbook.xlsx.readFile(filePath);
  }
  return workbook;
}

const LicensedDealer = require('../src/models/LicensedDealer');
const { normalizeLicense } = require('../src/utils/license-normalizer');

/**
 * Default COLUMN_MAP matching expected licensed dealer registry columns.
 * Can be customized based on state registry spreadsheet headers.
 */
const COLUMN_MAP = {
  licenseNumber: ['licence_no', 'license_no', 'licenceno', 'licenseno', 'licence_number', 'license_number', 'sl_no_license', 'license'],
  businessName: ['firm_name', 'business_name', 'shop_name', 'dealer_name', 'firm', 'name_of_the_firm', 'name_of_firm'],
  ownerName: ['proprietor_name', 'owner_name', 'name_of_proprietor', 'owner', 'proprietor', 'applicant_name'],
  emails: ['email', 'email_id', 'e_mail', 'email_address', 'mail'],
  phones: ['mobile', 'mobile_no', 'phone', 'contact_no', 'phone_no', 'cell_no', 'contact'],
  address: ['address', 'location', 'shop_address', 'firm_address', 'place_of_business', 'village'],
  district: ['district', 'dist', 'district_name'],
  licenseValidUntil: ['valid_up_to', 'validity', 'valid_upto', 'expiry_date', 'valid_till', 'valid_date']
};

/**
 * Normalization utilities
 */
function cleanText(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.text) val = val.text;
    else if (val.result) val = val.result;
    else val = String(val);
  }
  return String(val).replace(/\s+/g, ' ').trim();
}

function extractEmails(val) {
  if (!val) return [];
  const text = cleanText(val);
  // Split on commas, semicolons, slashes, spaces, newlines
  const parts = text.split(/[,;\/\s\n\r]+/);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = [];
  for (const part of parts) {
    const cleaned = part.trim().toLowerCase();
    if (cleaned && emailRegex.test(cleaned)) {
      if (!emails.includes(cleaned)) {
        emails.push(cleaned);
      }
    }
  }
  return emails;
}

function cleanPhones(val) {
  if (!val) return [];
  let text = cleanText(val);
  // Split on delimiters if multiple phones in one cell
  const parts = text.split(/[,;\/\n\r\s]+/);
  const phones = [];
  for (const part of parts) {
    let p = part.trim();
    if (p.endsWith('.0')) {
      p = p.slice(0, -2);
    }
    const digits = p.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) {
      if (!phones.includes(digits)) {
        phones.push(digits);
      }
    }
  }
  return phones;
}

function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  const cleaned = cleanText(val);
  if (!cleaned) return null;
  const parsed = new Date(cleaned);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
  return `${maskedLocal}@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return '***';
  const str = String(phone);
  return str.length > 4 ? `${str.slice(0, 2)}******${str.slice(-2)}` : '******';
}

function findHeaderRow(worksheet) {
  let headerRowIndex = 1;
  let bestMatchCount = 0;
  let detectedHeaders = {};

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 20) return; // Only inspect first 20 rows for header
    let matchCount = 0;
    const currentHeaders = {};

    row.eachCell((cell, colNumber) => {
      const headerStr = cleanText(cell.value).toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (!headerStr) return;

      for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
        if (aliases.some(alias => headerStr.includes(alias) || alias.includes(headerStr))) {
          currentHeaders[field] = colNumber;
          matchCount++;
          break;
        }
      }
    });

    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      headerRowIndex = rowNumber;
      detectedHeaders = currentHeaders;
    }
  });

  return { headerRowIndex, detectedHeaders };
}

async function inspectFile(filePath) {
  console.log(`\n================ INSPECTING FILE ================`);
  console.log(`File: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    return;
  }

  const workbook = await loadWorkbook(filePath);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    console.error('Error: No sheets found in workbook.');
    return;
  }

  const { headerRowIndex, detectedHeaders } = findHeaderRow(worksheet);
  console.log(`Detected header row at line ${headerRowIndex}`);
  console.log(`Proposed COLUMN_MAP:`, detectedHeaders);

  const headerRow = worksheet.getRow(headerRowIndex);
  const rawHeaders = [];
  headerRow.eachCell((cell, col) => {
    rawHeaders.push(`Col ${col}: "${cleanText(cell.value)}"`);
  });
  console.log(`Raw Headers:\n`, rawHeaders.join(' | '));

  console.log(`\nFirst 5 data rows (masked PII):`);
  let rowsShown = 0;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowIndex || rowsShown >= 5) return;
    const rowObj = {};
    for (const [field, colNum] of Object.entries(detectedHeaders)) {
      const val = row.getCell(colNum).value;
      if (field === 'emails') {
        rowObj[field] = extractEmails(val).map(maskEmail);
      } else if (field === 'phones') {
        rowObj[field] = cleanPhones(val).map(maskPhone);
      } else {
        rowObj[field] = cleanText(val);
      }
    }
    console.log(`Row ${rowNumber}:`, JSON.stringify(rowObj));
    rowsShown++;
  });
  console.log(`=================================================\n`);
}

async function runImport() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isInspectOnly = args.includes('--inspect');
  const fileArg = args.find(arg => !arg.startsWith('--'));

  const defaultPath = path.join(__dirname, '../data/dealers.xlsx');
  const targetFile = fileArg ? path.resolve(process.cwd(), fileArg) : defaultPath;

  if (!fs.existsSync(targetFile)) {
    console.error(`Target data file does not exist: ${targetFile}`);
    console.error(`Usage: npm run import:dealers -- ./data/<file>.xlsx [--dry-run] [--inspect]`);
    process.exit(1);
  }

  if (isInspectOnly) {
    await inspectFile(targetFile);
    process.exit(0);
  }

  console.log(`Starting Licensed Dealer Import`);
  console.log(`Source File: ${targetFile}`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (No database changes)' : 'LIVE IMPORT'}`);

  const workbook = await loadWorkbook(targetFile);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    console.error('No worksheet found in workbook.');
    process.exit(1);
  }

  const { headerRowIndex, detectedHeaders } = findHeaderRow(worksheet);
  if (!detectedHeaders.licenseNumber) {
    console.error('Could not detect licenseNumber column header in spreadsheet.');
    process.exit(1);
  }

  let mongoConnection = null;
  if (!isDryRun) {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing in .env');
      process.exit(1);
    }
    mongoConnection = await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB database.');
  }

  const summary = {
    totalRowsRead: 0,
    inserted: 0,
    updated: 0,
    skippedBlank: 0,
    skippedNoLicense: 0,
    rowsWithoutEmail: 0,
    errors: 0
  };

  const batchOps = new Map();

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowIndex) return;
    summary.totalRowsRead++;

    const rawLicense = row.getCell(detectedHeaders.licenseNumber).value;
    const normalizedLic = normalizeLicense(cleanText(rawLicense));

    if (!normalizedLic) {
      summary.skippedNoLicense++;
      return;
    }

    const businessName = detectedHeaders.businessName ? cleanText(row.getCell(detectedHeaders.businessName).value) : '';
    const ownerName = detectedHeaders.ownerName ? cleanText(row.getCell(detectedHeaders.ownerName).value) : '';
    const rawEmails = detectedHeaders.emails ? row.getCell(detectedHeaders.emails).value : '';
    const rawPhones = detectedHeaders.phones ? row.getCell(detectedHeaders.phones).value : '';
    const address = detectedHeaders.address ? cleanText(row.getCell(detectedHeaders.address).value) : '';
    const district = detectedHeaders.district ? cleanText(row.getCell(detectedHeaders.district).value) : '';
    const licenseValidUntil = detectedHeaders.licenseValidUntil ? parseDate(row.getCell(detectedHeaders.licenseValidUntil).value) : null;

    const emails = extractEmails(rawEmails);
    const phones = cleanPhones(rawPhones);

    if (emails.length === 0) {
      summary.rowsWithoutEmail++;
    }

    if (batchOps.has(normalizedLic)) {
      const existing = batchOps.get(normalizedLic);
      // Merge unique emails and phones
      emails.forEach(e => { if (!existing.emails.includes(e)) existing.emails.push(e); });
      phones.forEach(p => { if (!existing.phones.includes(p)) existing.phones.push(p); });
      if (!existing.businessName && businessName) existing.businessName = businessName;
      if (!existing.ownerName && ownerName) existing.ownerName = ownerName;
      if (!existing.address && address) existing.address = address;
      if (!existing.district && district) existing.district = district;
      if (!existing.licenseValidUntil && licenseValidUntil) existing.licenseValidUntil = licenseValidUntil;
    } else {
      batchOps.set(normalizedLic, {
        licenseNumber: normalizedLic,
        businessName,
        ownerName,
        emails,
        phones,
        address,
        district,
        state: 'Odisha',
        licenseValidUntil,
        sourceFile: path.basename(targetFile),
        importedAt: new Date()
      });
    }
  });

  console.log(`Parsed ${summary.totalRowsRead} rows. Unique licenses: ${batchOps.size}`);

  if (!isDryRun) {
    for (const record of batchOps.values()) {
      try {
        const existingDoc = await LicensedDealer.findOne({ licenseNumber: record.licenseNumber });
        if (existingDoc) {
          const mergedEmails = Array.from(new Set([...existingDoc.emails, ...record.emails]));
          const mergedPhones = Array.from(new Set([...existingDoc.phones, ...record.phones]));
          await LicensedDealer.updateOne(
            { licenseNumber: record.licenseNumber },
            {
              $set: {
                businessName: record.businessName || existingDoc.businessName,
                ownerName: record.ownerName || existingDoc.ownerName,
                emails: mergedEmails,
                phones: mergedPhones,
                address: record.address || existingDoc.address,
                district: record.district || existingDoc.district,
                licenseValidUntil: record.licenseValidUntil || existingDoc.licenseValidUntil,
                sourceFile: record.sourceFile,
                importedAt: new Date()
              }
            }
          );
          summary.updated++;
        } else {
          await LicensedDealer.create(record);
          summary.inserted++;
        }
      } catch (err) {
        summary.errors++;
      }
    }
  }

  console.log(`\n============== IMPORT SUMMARY ==============`);
  console.log(`Total rows read:        ${summary.totalRowsRead}`);
  console.log(`Unique licenses found:  ${batchOps.size}`);
  if (!isDryRun) {
    console.log(`Records inserted:       ${summary.inserted}`);
    console.log(`Records updated:        ${summary.updated}`);
  } else {
    console.log(`[DRY RUN] Would upsert: ${batchOps.size} records`);
  }
  console.log(`Skipped (no license):   ${summary.skippedNoLicense}`);
  console.log(`Rows without valid email: ${summary.rowsWithoutEmail} (will use admin review)`);
  console.log(`Errors:                 ${summary.errors}`);
  console.log(`============================================\n`);

  if (mongoConnection) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

if (require.main === module) {
  runImport().catch(err => {
    console.error('Fatal import error:', err);
    process.exit(1);
  });
}

module.exports = {
  cleanText,
  extractEmails,
  cleanPhones,
  parseDate,
  COLUMN_MAP,
  findHeaderRow
};
