# Design Documentation

## Architecture Overview

The Salesforce Files Export Tool follows a modular architecture with clear separation of concerns. The application is structured into services, utilities, and configuration layers.

## Core Components

### 1. Entry Point (`src/index.js`)

**Purpose:** CLI entry point and application bootstrapping

**Responsibilities:**
- Environment validation
- Error handling and exit codes
- User-facing console output
- Orchestration of the export process

**Design Decisions:**
- Minimal logic to keep the entry point focused
- Comprehensive error handling with proper exit codes
- User-friendly console output

### 2. Services Layer

#### SalesforceService (`src/services/SalesforceService.js`)

**Purpose:** Abstraction layer for all Salesforce operations

**Responsibilities:**
- Salesforce authentication and connection management
- SOQL query execution with pagination
- File content retrieval from ContentVersion records
- Connection state management

**Key Methods:**
- `createConnection()`: Establishes authenticated connection
- `executeQuery(query)`: Executes SOQL with automatic pagination
- `downloadFile(contentVersionId)`: Retrieves binary file content
- `getConnection()`: Provides access to raw connection object

**Design Decisions:**
- Singleton connection pattern (one connection per instance)
- Automatic pagination handling for large datasets
- Binary data handling for file downloads
- Promise-based API for consistency

#### FileExportService (`src/services/FileExportService.js`)

**Purpose:** Orchestrates the file export workflow

**Responsibilities:**
- Export directory management with timestamps
- Batch processing of file downloads
- Progress tracking and reporting
- Error aggregation and reporting
- File saving with duplicate handling

**Key Methods:**
- `initializeExportDirectory()`: Creates timestamped output folder
- `export(customQuery)`: Main export orchestration
- `downloadFiles(records)`: Batch processing coordinator
- `downloadSingleFile(record, index, total)`: Individual file handler

**Design Decisions:**
- Batch processing to control concurrency and memory usage
- Promise.allSettled for parallel downloads with individual error handling
- Timestamped directories to prevent overwrites
- Detailed progress reporting per file and batch

### 3. Utilities Layer

#### date-utils.js (`src/utils/date-utils.js`)

**Purpose:** Date formatting utilities

**Functions:**
- `formatTimestamp(date)`: Creates filesystem-safe timestamps
- `formatDisplayDate(date)`: Formats dates for display

**Design Decisions:**
- Consistent timestamp format: `YYYY-MM-DD_HH-MM-SS`
- No external dependencies (uses native Date)

#### file-utils.js (`src/utils/file-utils.js`)

**Purpose:** File system operations

**Functions:**
- `ensureDirectoryExists(dirPath)`: Creates directories recursively
- `sanitizeFilename(filename)`: Removes invalid characters
- `getUniqueFilename(dirPath, filename)`: Handles duplicates
- `writeBinaryFile(filePath, data)`: Writes binary data

**Design Decisions:**
- Cross-platform filename sanitization
- Automatic duplicate resolution with numeric suffixes
- Synchronous file operations for simplicity

### 4. Configuration Layer

#### config.js

**Purpose:** Centralized configuration management

**Exports:**
- `CONTENT_QUERY`: Default SOQL query
- `SALESFORCE_CONFIG`: Connection parameters
- `EXPORT_CONFIG`: Export behavior settings

**Design Decisions:**
- Single source of truth for configuration
- Environment variable integration via dotenv
- Query customization without code changes
- Sensible defaults with override capability

## Data Flow

```
1. User runs CLI (index.js)
   ↓
2. Validate environment variables
   ↓
3. FileExportService.export()
   ↓
4. Initialize export directory with timestamp
   ↓
5. SalesforceService.createConnection()
   ↓
6. SalesforceService.executeQuery(CONTENT_QUERY)
   ↓ (Returns ContentDocumentLink records)
7. FileExportService.downloadFiles(records)
   ↓
8. Process in batches (default: 10 concurrent)
   ↓
9. For each file:
   - SalesforceService.downloadFile(versionId)
   - Sanitize filename
   - Handle duplicates
   - Write to disk
   ↓
10. Report results and exit
```

## Error Handling Strategy

### Levels of Error Handling

1. **Fatal Errors** (Exit application)
   - Missing credentials
   - Connection failures
   - File system access errors

2. **Recoverable Errors** (Log and continue)
   - Individual file download failures
   - Query result processing errors

3. **Validation Errors** (Exit before processing)
   - Invalid configuration
   - Missing required parameters

### Error Reporting

- Console output with visual indicators (✓, ✗, ⚠)
- Detailed error messages with context
- Stack traces for debugging (fatal errors only)
- Summary report with success/failure counts

## Performance Considerations

### Concurrency Control

- **Batch Size**: Default 10 concurrent downloads
- **Rationale**: Balances speed with API limits and memory usage
- **Configurable**: Adjustable via `EXPORT_CONFIG.batchSize`

### Memory Management

- Stream-based approach for file downloads
- No intermediate storage of file content
- Direct write to disk after download

### API Limits

- Respects Salesforce API limits via jsforce
- Automatic pagination for large result sets
- Configurable `maxRequest` parameter

## Security Considerations

### Credentials Management

- Environment variables via `.env` (gitignored)
- No hardcoded credentials
- Security token concatenation with password

### File Security

- Sanitized filenames prevent directory traversal
- Controlled output directory
- No execution of downloaded content

## Extensibility Points

### Custom Queries

Modify `CONTENT_QUERY` in `config.js` to:
- Change date ranges
- Filter by different criteria
- Include additional fields
- Query different objects

### Custom Processing

Extend `FileExportService.downloadSingleFile()` to:
- Add file metadata logging
- Implement custom naming schemes
- Add post-download processing
- Integrate with other systems

### Output Formats

Modify utilities to:
- Create different directory structures
- Generate reports or manifests
- Compress files
- Upload to cloud storage

## Modular Design Benefits

1. **Testability**: Each module can be unit tested independently
2. **Maintainability**: Clear boundaries and responsibilities
3. **Reusability**: Services can be used in other applications
4. **Scalability**: Easy to add new features without affecting existing code
5. **Readability**: Small, focused files (all under 400 lines)

## File Size Compliance

All files adhere to the 400-line limit:
- `index.js`: ~50 lines
- `SalesforceService.js`: ~120 lines
- `FileExportService.js`: ~200 lines
- `date-utils.js`: ~40 lines
- `file-utils.js`: ~70 lines
- `config.js`: ~60 lines

## Dependencies

### Production Dependencies

- **jsforce**: Official Salesforce JavaScript library
  - Handles authentication
  - Provides SOQL query interface
  - Manages API versioning and limits

- **dotenv**: Environment configuration
  - Loads `.env` file
  - Keeps credentials secure
  - Cross-platform compatibility

### No Additional Dependencies

The application intentionally minimizes dependencies by:
- Using Node.js built-ins (fs, path)
- Implementing custom utilities
- Avoiding unnecessary abstractions

## Future Enhancement Opportunities

1. **CLI Arguments**: Accept query or config file path
2. **Progress Bar**: Visual progress indicator
3. **Retry Logic**: Automatic retry for failed downloads
4. **Metadata Export**: Save file metadata to JSON/CSV
5. **Filtering**: Post-query filtering options
6. **Compression**: Automatic ZIP of export folders
7. **Incremental Export**: Track and skip previously downloaded files
8. **Multiple Queries**: Run multiple queries in sequence

