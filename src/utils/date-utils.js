/**
 * Date utility functions for formatting timestamps
 * 
 * Dependencies: None
 */

/**
 * Format a date as YYYY-MM-DD_HH-MM-SS for use in folder names
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatTimestamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

/**
 * Format a date for display in logs
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDisplayDate(date = new Date()) {
  return date.toISOString();
}

module.exports = {
  formatTimestamp,
  formatDisplayDate
};

