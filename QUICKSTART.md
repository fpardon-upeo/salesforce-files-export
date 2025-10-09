# Quick Start Guide

Get up and running in 3 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Credentials

Create a `.env` file:

```bash
cp sample.env .env
```

Edit `.env` and add your Salesforce credentials:

```env
SF_LOGIN_URL=https://login.salesforce.com
SF_USERNAME=your.email@example.com
SF_PASSWORD=YourPasswordYourSecurityToken
SF_API_VERSION=59.0
EXPORT_BASE_DIR=export_results
```

**Important:** `SF_PASSWORD` = Your password + Security token (no space)

## 3. Customize Query (Optional)

Edit `config.js` to change the SOQL query:

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
`;
```

## 4. Run Export

```bash
npm start
```

## Output

Files will be exported to:
```
export_results/YYYY-MM-DD_HH-MM-SS/
```

## Next Steps

- See [README.md](README.md) for full documentation
- See [docs/USAGE.md](docs/USAGE.md) for examples and troubleshooting
- See [docs/DESIGN.md](docs/DESIGN.md) for architecture details

## Common Issues

### "Missing required environment variables"
→ Make sure you created `.env` file with your credentials

### "Salesforce connection failed: invalid_grant"
→ Check password includes security token

### "No records found"
→ Verify your query criteria matches existing data

