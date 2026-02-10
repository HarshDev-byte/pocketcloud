# PocketCloud Backend

Personal encrypted cloud storage backend built with Node.js and Express.

## Directory Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── core/          # Core services (user, storage, crypto, backup)
│   │   ├── media/         # Media services (video, photo, music, thumbnails)
│   │   ├── security/      # Security services (2FA, sessions, audit logs)
│   │   ├── monitoring/    # Monitoring services (performance, health, analytics)
│   │   └── automation/    # Automation services (scheduler, notifications, websocket)
│   ├── routes/            # Express route handlers
│   ├── middleware/        # Express middleware (auth, validation, rate limiting)
│   ├── config/            # Configuration files
│   └── utils/             # Utility functions
├── scripts/
│   ├── maintenance/ # Cleanup, migration, integrity checks
│   └── testing/     # Test scripts
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── tools/                # System tools and utilities
└── server.js             # Main server entry point
```

## Services Organization

### Core Services (`src/services/core/`)
- **userService.js** - User management
- **storageService.js** - File storage operations
- **cryptoService.js** - Encryption/decryption
- **identityService.js** - Device identity management
- **searchService.js** - File search functionality
- **trashService.js** - Trash/recycle bin
- **duplicateService.js** - Duplicate file detection
- **backupService.js** - Backup operations
- **restoreService.js** - Restore operations
- **cloudBackupService.js** - Cloud backup integration
- **collaborationService.js** - File sharing and collaboration
- **pluginService.js** - Plugin system

### Media Services (`src/services/media/`)
- **videoStreamingService.js** - Video streaming with transcoding
- **photoGalleryService.js** - Photo albums and EXIF data
- **musicPlayerService.js** - Audio streaming and playlists
- **thumbnailService.js** - Thumbnail generation
- **filePreviewService.js** - File preview for multiple formats

### Security Services (`src/services/security/`)
- **twoFactorService.js** - Two-factor authentication (TOTP)
- **sessionService.js** - Session management
- **securityService.js** - Brute force protection, IP filtering
- **auditLogService.js** - Activity logging and audit trails

### Monitoring Services (`src/services/monitoring/`)
- **performanceMonitorService.js** - Performance metrics tracking
- **errorTrackerService.js** - Error tracking and aggregation
- **healthCheckService.js** - System health checks
- **bandwidthMonitorService.js** - Bandwidth monitoring
- **systemMonitorService.js** - CPU, memory, disk monitoring
- **analyticsService.js** - Analytics and metrics

### Automation Services (`src/services/automation/`)
- **schedulerService.js** - Task scheduling
- **automationService.js** - Automation rules
- **taggingService.js** - Auto-tagging
- **notificationService.js** - Notifications (in-app, push, email)
- **realtimeSyncService.js** - Real-time file sync
- **websocketService.js** - WebSocket server
- **jobScheduler.js** - Background job management

## Scripts

### Maintenance (`scripts/maintenance/`)
- **migrate-encryption.js** - Encryption migration
- **startup-cleanup.js** - Startup cleanup tasks
- **check-file-integrity.js** - File integrity verification
- **scan-corruption.js** - Corruption detection
- **validate-boundaries.js** - Product boundary validation
- **status.js** - System status check

### Testing (`scripts/testing/`)
- **test-encryption.js** - Encryption tests
- **test-failure-scenarios.js** - Failure scenario tests
- **test-streaming.js** - Streaming tests

## Getting Started

### Prerequisites
- Node.js 18+
- SQLite3
- FFmpeg (for media processing)

### Installation

```bash
cd backend
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp ../.env.example ../.env
```

### Running

```bash
# Development
npm run dev

# Production
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## License

Private - Personal Use Only
