/**
 * Normalize a license number by converting to uppercase and stripping
 * spaces, hyphens, slashes, and backslashes.
 *
 * @param {string} license
 * @returns {string}
 */
function normalizeLicense(license) {
    if (!license) return '';
    return license.toString().toUpperCase().replace(/[\s\-\/\\]/g, '').trim();
}

module.exports = { normalizeLicense };
