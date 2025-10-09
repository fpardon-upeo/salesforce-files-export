# Salesforce Files Export Tool

A Node.js CLI application to export files from Salesforce ContentDocument records based on configurable SOQL queries.

## Features

- 🔐 Secure authentication with Salesforce using jsforce
- 📝 Configurable SOQL queries via `config.js`
- 📥 Batch downloading of files with concurrent processing
- 📁 Organized exports in timestamped folders
- ✨ Automatic filename sanitization and duplicate handling
- 🔄 Pagination support for large result sets
- 📊 Detailed progress reporting and error handling

## Prerequisites

- Node.js >= 14.0.0
- Salesforce account with API access
- Security token for your Salesforce user

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure your `.env` file with your Salesforce credentials:
   ```
   SF_LOGIN_URL=https://login.salesforce.com
   SF_USERNAME=your.email@example.com
   SF_PASSWORD=YourPasswordPlusSecurityToken
   SF_API_VERSION=59.0
   EXPORT_BASE_DIR=export_results
   ```

   **Note:** `SF_PASSWORD` should be your password concatenated with your security token.

## Configuration

### Query Configuration

Edit `config.js` to customize the SOQL query for your export needs. The default query retrieves PDF files from WorkOrders:

```javascript
const CONTENT_QUERY = `
  SELECT 
    ContentDocument.LatestPublishedVersionId, 
    ContentDocument.Title,
    ContentDocument.FileType,
    ContentDocument.FileExtension
  FROM ContentDocumentLink 
  WHERE ...
`;
```

### Export Configuration

Adjust export settings in `config.js`:

```javascript
const EXPORT_CONFIG = {
  baseDir: 'export_results',  // Base directory for exports
  batchSize: 10                // Number of concurrent downloads
};
```

## Usage

Run the export tool:

```bash
npm start
```

Or if installed globally:

```bash
sf-export
```

### Output Structure

Files are exported to:
```
export_results/
└── YYYY-MM-DD_HH-MM-SS/
    ├── file1.pdf
    ├── file2.pdf
    └── ...
```

## Project Structure

```
salesforce-files-export/
├── src/
│   ├── index.js                    # CLI entry point
│   ├── services/
│   │   ├── SalesforceService.js    # Salesforce connection and queries
│   │   └── FileExportService.js    # File download and export logic
│   └── utils/
│       ├── date-utils.js           # Date formatting utilities
│       └── file-utils.js           # File system utilities
├── docs/
│   ├── DESIGN.md                   # Architecture and design decisions
│   └── USAGE.md                    # Detailed usage guide
├── config.js                       # Application configuration
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Documentation

- [DESIGN.md](docs/DESIGN.md) - Architecture and design documentation
- [USAGE.md](docs/USAGE.md) - Detailed usage guide with examples

## Error Handling

The application provides detailed error messages for common issues:

- Missing or invalid Salesforce credentials
- Connection failures
- Query errors
- File download failures

Failed downloads are logged but don't stop the entire export process.

## Dependencies

- **jsforce** (^1.11.1) - Salesforce API integration (stable version)
- **dotenv** (^16.3.1) - Environment variable management

> **Note:** We use jsforce 1.x (stable) instead of 2.x (beta) due to known issues with the callback mechanism in the beta version.

## License

ISC

## Support

For issues or questions, please check the documentation in the `docs/` folder or review the inline code comments.

