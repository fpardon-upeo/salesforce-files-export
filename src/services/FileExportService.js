/**
 * File Export Service - Handles downloading and saving files from Salesforce
 * 
 * Dependencies: SalesforceService, file-utils, date-utils, path, config
 */

const path = require('path');
const SalesforceService = require('./SalesforceService');
const { ensureDirectoryExists, sanitizeFilename, getUniqueFilename, writeBinaryFile } = require('../utils/file-utils');
const { formatTimestamp } = require('../utils/date-utils');
const { EXPORT_CONFIG, CONTENT_QUERY } = require('../../config');

class FileExportService {
  constructor() {
    this.salesforceService = new SalesforceService();
    this.exportDir = null;
  }

  /**
   * Initialize the export directory with timestamp
   * @returns {string} Path to the export directory
   */
  initializeExportDirectory() {
    const timestamp = formatTimestamp();
    this.exportDir = path.join(EXPORT_CONFIG.baseDir, timestamp);
    ensureDirectoryExists(this.exportDir);
    console.log(`\n✓ Export directory created: ${this.exportDir}`);
    return this.exportDir;
  }

  /**
   * Execute the export process
   * @param {string} customQuery - Optional custom query (uses config if not provided)
   * @returns {Promise<Object>} Export results
   */
  async export(customQuery = null) {
    try {
      const startTime = Date.now();
      
      // Initialize export directory
      this.initializeExportDirectory();
      
      // Connect to Salesforce
      console.log('\n🔌 Connecting to Salesforce...');
      await this.salesforceService.createConnection();
      
      // Execute query
      const query = customQuery || CONTENT_QUERY;
      const records = await this.salesforceService.executeQuery(query);
      
      if (records.length === 0) {
        console.log('\n⚠ No records found matching the query.');
        return { success: 0, failed: 0, total: 0 };
      }
      
      // Download files
      console.log(`\n📥 Starting download of ${records.length} files...`);
      const results = await this.downloadFiles(records);
      
      // Summary
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n' + '='.repeat(50));
      console.log('Export Complete!');
      console.log('='.repeat(50));
      console.log(`✓ Successfully downloaded: ${results.success}`);
      console.log(`✗ Failed: ${results.failed}`);
      console.log(`Total: ${results.total}`);
      console.log(`Duration: ${duration}s`);
      console.log(`Export location: ${this.exportDir}`);
      console.log('='.repeat(50));
      
      return results;
    } catch (error) {
      console.error('\n❌ Export failed:', error.message);
      throw error;
    }
  }

  /**
   * Download files from Salesforce in batches
   * @param {Array} records - Array of ContentDocumentLink records
   * @returns {Promise<Object>} Download results
   */
  async downloadFiles(records) {
    const results = {
      success: 0,
      failed: 0,
      total: records.length,
      errors: []
    };

    const batchSize = EXPORT_CONFIG.batchSize;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(records.length / batchSize);
      
      console.log(`\nProcessing batch ${batchNum}/${totalBatches}...`);
      
      const promises = batch.map((record, index) => 
        this.downloadSingleFile(record, i + index + 1, records.length)
      );
      
      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          results.success++;
        } else {
          results.failed++;
          const error = result.status === 'rejected' ? result.reason : result.value.error;
          results.errors.push({
            record: batch[index],
            error: error
          });
        }
      });
    }
    
    return results;
  }

  /**
   * Download a single file and save it to disk
   * @param {Object} record - ContentDocumentLink record
   * @param {number} currentIndex - Current file index
   * @param {number} totalFiles - Total number of files
   * @returns {Promise<Object>} Download result
   */
  async downloadSingleFile(record, currentIndex, totalFiles) {
    try {
      const contentVersionId = record.ContentDocument.LatestPublishedVersionId;
      const title = record.ContentDocument.Title;
      const fileExtension = record.ContentDocument.FileExtension || 'pdf';
      
      console.log(`  [${currentIndex}/${totalFiles}] Downloading: ${title}`);
      
      // Download file content
      const fileContent = await this.salesforceService.downloadFile(contentVersionId);
      
      // Prepare filename
      const baseFilename = sanitizeFilename(title);
      const filename = `${baseFilename}.${fileExtension}`;
      const uniqueFilename = getUniqueFilename(this.exportDir, filename);
      
      // Save to disk
      const filePath = path.join(this.exportDir, uniqueFilename);
      writeBinaryFile(filePath, fileContent);
      
      console.log(`  ✓ Saved: ${uniqueFilename} (${fileContent.length} bytes)`);
      
      return { success: true, filename: uniqueFilename };
    } catch (error) {
      console.error(`  ✗ Failed: ${record.ContentDocument.Title} - ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = FileExportService;

