/**
 * Configuration file for Salesforce file export queries
 * 
 * Dependencies: dotenv
 */

require('dotenv').config();

/**
 * Main query to retrieve ContentDocumentLink records
 * This query can be modified for different export requirements
 */
const CONTENT_QUERY = `
  SELECT 
    ContentDocument.LatestPublishedVersionId, 
    ContentDocument.Title,
    ContentDocument.FileType,
    ContentDocument.FileExtension
  FROM ContentDocumentLink 
  WHERE LinkedEntityId IN (
    SELECT Id 
    FROM WorkOrder 
    WHERE Account.ParentId = '001Tt00000KNgLdIAL' 
      AND StartDate > 2025-07-01T00:00:00.000+02:00 
      AND StartDate < 2025-08-01T00:00:00.000+02:00
  ) 
  AND ContentDocument.FileType = 'PDF'
`.trim().replace(/\s+/g, ' ');

/**
 * Salesforce connection configuration
 */
const SALESFORCE_CONFIG = {
  loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
  username: process.env.SF_USERNAME,
  password: process.env.SF_PASSWORD,
  apiVersion: process.env.SF_API_VERSION || '59.0',
  maxRequest: 1000
};

/**
 * Export configuration
 */
const EXPORT_CONFIG = {
  baseDir: process.env.EXPORT_BASE_DIR || 'export_results',
  batchSize: 10 // Number of files to download concurrently
};

module.exports = {
  CONTENT_QUERY,
  SALESFORCE_CONFIG,
  EXPORT_CONFIG
};

