# Usage Guide

## Getting Started

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your Salesforce credentials:

```env
SF_LOGIN_URL=https://login.salesforce.com
SF_USERNAME=your.email@example.com
SF_PASSWORD=YourPasswordYourSecurityToken
SF_API_VERSION=59.0
EXPORT_BASE_DIR=export_results
```

**Important:** The `SF_PASSWORD` must be your Salesforce password followed immediately by your security token (no space or separator).

#### Getting Your Security Token

1. Log into Salesforce
2. Go to Settings → My Personal Information → Reset My Security Token
3. Check your email for the new token
4. Append it to your password in the `.env` file

### Step 3: Configure Query

Edit `config.js` to customize the SOQL query:

```javascript
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
```

### Step 4: Run Export

```bash
npm start
```

## Example Output

```
==================================================
Salesforce Files Export Tool
==================================================

✓ Export directory created: export_results/2025-10-09_14-30-25

✓ Salesforce connection successful
  User ID: 005xx000001X8UzAAK
  Organization ID: 00Dxx0000001gEREAY

Executing query...
Query: SELECT ContentDocument.LatestPublishedVersionId ...
Total records found: 25
✓ Retrieved all 25 records

📥 Starting download of 25 files...

Processing batch 1/3...
  [1/25] Downloading: WorkOrder_12345_Report
  ✓ Saved: WorkOrder_12345_Report.pdf (245678 bytes)
  [2/25] Downloading: Invoice_67890
  ✓ Saved: Invoice_67890.pdf (123456 bytes)
  ...

Processing batch 2/3...
  ...

Processing batch 3/3...
  ...

==================================================
Export Complete!
==================================================
✓ Successfully downloaded: 24
✗ Failed: 1
Total: 25
Duration: 12.45s
Export location: export_results/2025-10-09_14-30-25
==================================================
```

## Common Use Cases

### 1. Exporting PDFs from Work Orders

Default configuration - modify dates and Account ID as needed.

### 2. Exporting All File Types

Modify the query to remove the file type filter:

```javascript
const CONTENT_QUERY = `
  SELECT 
    ContentDocument.LatestPublishedVersionId, 
    ContentDocument.Title,
    ContentDocument.FileType,
    ContentDocument.FileExtension
  FROM ContentDocumentLink 
  WHERE LinkedEntityId IN (...)
`;
```

### 3. Exporting Files from Cases

Change the subquery to reference Cases:

```javascript
const CONTENT_QUERY = `
  SELECT 
    ContentDocument.LatestPublishedVersionId, 
    ContentDocument.Title,
    ContentDocument.FileType,
    ContentDocument.FileExtension
  FROM ContentDocumentLink 
  WHERE LinkedEntityId IN (
    SELECT Id 
    FROM Case 
    WHERE Status = 'Closed'
      AND ClosedDate = THIS_MONTH
  )
  AND ContentDocument.FileType = 'PDF'
`;
```

### 4. Exporting Files from Specific Records

Use a direct list of IDs:

```javascript
const CONTENT_QUERY = `
  SELECT 
    ContentDocument.LatestPublishedVersionId, 
    ContentDocument.Title,
    ContentDocument.FileType,
    ContentDocument.FileExtension
  FROM ContentDocumentLink 
  WHERE LinkedEntityId IN (
    '001Tt00000KNgLdIAL',
    '001Tt00000KNgLeIAL',
    '001Tt00000KNgLfIAL'
  )
`;
```

## Configuration Options

### Batch Size

Adjust concurrent downloads in `config.js`:

```javascript
const EXPORT_CONFIG = {
  baseDir: 'export_results',
  batchSize: 10  // Increase for faster downloads, decrease if hitting rate limits
};
```

**Recommendations:**
- Small files: 20-30
- Large files: 5-10
- Rate limit issues: 3-5

### Export Directory

Change the base export directory:

```javascript
const EXPORT_CONFIG = {
  baseDir: '/path/to/custom/exports',
  batchSize: 10
};
```

Or via environment variable:

```env
EXPORT_BASE_DIR=/path/to/custom/exports
```

### Salesforce API Version

Update in `.env`:

```env
SF_API_VERSION=60.0
```

### Login URL

For sandbox environments:

```env
SF_LOGIN_URL=https://test.salesforce.com
```

## Query Guidelines

### Required Fields

Always include these fields in your query:

```sql
ContentDocument.LatestPublishedVersionId  -- Required for downloading
ContentDocument.Title                     -- Used for filename
ContentDocument.FileExtension             -- Used for file extension
```

### Optional Fields

Additional fields for filtering:

```sql
ContentDocument.FileType                  -- PDF, PNG, EXCEL, etc.
ContentDocument.ContentSize               -- File size in bytes
ContentDocument.CreatedDate               -- When uploaded
```

### Query Performance

For large datasets:
- Use indexed fields in WHERE clauses
- Limit results with date ranges
- Avoid complex subqueries if possible

## Troubleshooting

### Connection Errors

**Error:** "Salesforce connection failed: invalid_grant"

**Solution:** 
- Verify username and password
- Ensure security token is appended to password
- Check if password has changed (requires new token)

### Query Errors

**Error:** "sObject type 'ContentDocumentLink' is not supported"

**Solution:**
- Verify API version supports ContentDocumentLink
- Check user has permission to query ContentDocument objects

### File Download Errors

**Error:** "Error downloading file: Request failed with status code 404"

**Solution:**
- ContentVersion may have been deleted
- User may not have access to the file
- Check if ContentVersionId is valid

### API Limit Errors

**Error:** "REQUEST_LIMIT_EXCEEDED"

**Solution:**
- Reduce batch size in config
- Add delays between batches
- Check API limits in Salesforce Setup

### File System Errors

**Error:** "EACCES: permission denied"

**Solution:**
- Check directory permissions
- Ensure export directory is writable
- Avoid using system-protected directories

## Advanced Usage

### Programmatic Usage

Import and use the service in your own code:

```javascript
const FileExportService = require('./src/services/FileExportService');

async function customExport() {
  const exportService = new FileExportService();
  
  const customQuery = `
    SELECT ContentDocument.LatestPublishedVersionId, 
           ContentDocument.Title
    FROM ContentDocumentLink 
    WHERE ...
  `;
  
  const results = await exportService.export(customQuery);
  console.log(`Downloaded ${results.success} files`);
}
```

### Multiple Queries

Run multiple exports sequentially:

```javascript
const queries = [
  'SELECT ... FROM ContentDocumentLink WHERE ...',
  'SELECT ... FROM ContentDocumentLink WHERE ...'
];

for (const query of queries) {
  await exportService.export(query);
}
```

### Custom File Processing

Extend `FileExportService` to add custom processing:

```javascript
class CustomExportService extends FileExportService {
  async downloadSingleFile(record, currentIndex, totalFiles) {
    const result = await super.downloadSingleFile(record, currentIndex, totalFiles);
    
    // Add custom processing here
    if (result.success) {
      console.log(`Custom processing for ${result.filename}`);
    }
    
    return result;
  }
}
```

## Best Practices

1. **Test with Small Datasets**: Run with limited results first
2. **Monitor API Usage**: Check Salesforce API limits regularly
3. **Backup Queries**: Save working queries before modifications
4. **Version Control**: Track configuration changes
5. **Regular Cleanup**: Archive or delete old export folders
6. **Log Review**: Check output for errors or warnings
7. **Credential Security**: Never commit `.env` file

## Performance Tips

1. **Optimize Queries**: Use indexed fields and date ranges
2. **Adjust Batch Size**: Balance speed vs. rate limits
3. **Off-Peak Hours**: Run large exports during low-usage times
4. **Parallel Instances**: Run multiple instances with different queries (be mindful of API limits)

## Support

For issues not covered in this guide:

1. Check `DESIGN.md` for architectural details
2. Review inline code comments
3. Enable debug logging by checking jsforce documentation
4. Check Salesforce API documentation for query syntax

