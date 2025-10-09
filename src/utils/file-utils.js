/**
 * File system utility functions
 * 
 * Dependencies: fs, path
 */

const fs = require('fs');
const path = require('path');

/**
 * Ensure a directory exists, creating it if necessary
 * @param {string} dirPath - Path to the directory
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Sanitize a filename by removing invalid characters
 * @param {string} filename - The filename to sanitize
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  // Remove or replace characters that are invalid in filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * Get a unique filename if the file already exists
 * @param {string} dirPath - Directory path
 * @param {string} filename - Desired filename
 * @returns {string} Unique filename
 */
function getUniqueFilename(dirPath, filename) {
  let counter = 1;
  let uniqueFilename = filename;
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  
  while (fs.existsSync(path.join(dirPath, uniqueFilename))) {
    uniqueFilename = `${basename}_${counter}${ext}`;
    counter++;
  }
  
  return uniqueFilename;
}

/**
 * Write binary data to a file
 * @param {string} filePath - Full path to the file
 * @param {Buffer} data - Binary data to write
 */
function writeBinaryFile(filePath, data) {
  fs.writeFileSync(filePath, data);
}

module.exports = {
  ensureDirectoryExists,
  sanitizeFilename,
  getUniqueFilename,
  writeBinaryFile
};

