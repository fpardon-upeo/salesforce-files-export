#!/usr/bin/env node

/**
 * Salesforce Files Export CLI
 * Main entry point for the application
 * 
 * Dependencies: FileExportService, dotenv
 */

require('dotenv').config();
const FileExportService = require('./services/FileExportService');

/**
 * Main function to run the export
 */
async function main() {
  console.log('='.repeat(50));
  console.log('Salesforce Files Export Tool');
  console.log('='.repeat(50));
  
  // Validate environment variables
  if (!process.env.SF_USERNAME || !process.env.SF_PASSWORD) {
    console.error('\n❌ Error: Missing required environment variables');
    console.error('Please ensure SF_USERNAME and SF_PASSWORD are set in your .env file');
    console.error('See .env.example for reference');
    process.exit(1);
  }
  
  try {
    const exportService = new FileExportService();
    await exportService.export();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the application
main();

