/**
 * Salesforce Service - Handles connection and queries to Salesforce
 * 
 * Dependencies: jsforce, config
 */

const jsforce = require('jsforce');
const { SALESFORCE_CONFIG } = require('../../config');

class SalesforceService {
  constructor() {
    this.conn = null;
  }

  /**
   * Create and authenticate a Salesforce connection
   * @returns {Promise<Connection>} Authenticated jsforce connection
   */
  async createConnection() {
    return new Promise((resolve, reject) => {
      // Set a timeout to catch hanging connections
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout after 30 seconds. Check your network and credentials.'));
      }, 30000);
      
      this.conn = new jsforce.Connection({
        loginUrl: SALESFORCE_CONFIG.loginUrl,
        version: SALESFORCE_CONFIG.apiVersion,
        maxRequest: SALESFORCE_CONFIG.maxRequest
      });

      this.conn.login(
        SALESFORCE_CONFIG.username,
        SALESFORCE_CONFIG.password,
        (err, userInfo) => {
          clearTimeout(timeout);
          
          if (err) {
            console.error('❌ Salesforce connection failed:', err.message);
            reject(err);
          } else {
            console.log('✓ Salesforce connection successful');
            console.log('  User ID:', userInfo.id);
            console.log('  Organization ID:', userInfo.organizationId);
            resolve(this.conn);
          }
        }
      );
    });
  }

  /**
   * Execute a SOQL query and handle pagination
   * @param {string} query - SOQL query string
   * @returns {Promise<Array>} Array of records
   */
  async executeQuery(query) {
    if (!this.conn) {
      await this.createConnection();
    }

    try {
      console.log('\nExecuting query...');
      console.log('Query:', query);

      const records = [];
      let result = await this.conn.query(query);
      console.log(`Total records found: ${result.totalSize}`);

      records.push(...result.records);

      // Handle pagination if there are more records
      while (!result.done) {
        console.log(
          `Retrieved ${records.length} of ${result.totalSize} records, fetching more...`
        );
        result = await this.conn.queryMore(result.nextRecordsUrl);
        records.push(...result.records);
      }

      console.log(`✓ Retrieved all ${records.length} records`);
      return records;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  /**
   * Download file content from Salesforce ContentVersion
   * @param {string} contentVersionId - ID of the ContentVersion record
   * @returns {Promise<Buffer>} File content as Buffer
   */
  async downloadFile(contentVersionId) {
    if (!this.conn) {
      await this.createConnection();
    }

    try {
      // Get the VersionData (binary content) from ContentVersion
      const url = `${this.conn.instanceUrl}/services/data/v${SALESFORCE_CONFIG.apiVersion}/sobjects/ContentVersion/${contentVersionId}/VersionData`;
      
      const response = await this.conn.request({
        method: 'GET',
        url: url,
        encoding: null // Important: return binary data
      });

      return Buffer.from(response);
    } catch (error) {
      console.error(`Error downloading file ${contentVersionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get the connection instance
   * @returns {Connection} jsforce connection
   */
  getConnection() {
    return this.conn;
  }
}

module.exports = SalesforceService;

