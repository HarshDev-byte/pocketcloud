# PocketCloud Project Restructuring Plan

## Current Problems
1. **Duplicate directories**: Both `backend/src/` and root-level `routes/`, `services/`, `middleware/` exist
2. **Mixed concerns**: Setup scripts, app code, docs all at root level
3. **Inconsistent entry points**: package.json points to root `server.js` but organized code is in `backend/`
4. **Scattered configuration**: Config files in multiple locations

## Target Structure

```
pocketcloud/
├── README.md                   # Main project documentation
├── package.json               # Root package.json (workspace manager)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── setup.sh                   # Main setup script
├── check-pocketcloud.sh       # Quick health check
│
├── backend/                   # Backend application
│   ├── package.json          # Backend dependencies
│   ├── server.js             # Application entry point
│   ├── src/                  # Source code
│   │   ├── config/           # Configuration
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (organized by domain)
│   │   └── utils/            # Utilities
│   ├── scripts/              # Backend scripts
│   ├── tests/                # Test suites
│   └── tools/                # Backend tools
│
├── frontend/                  # Frontend application (already organized)
│   ├── package.json          # Frontend dependencies
│   ├── src/                  # React source code
│   └── ...
│
├── setup/                     # Installation scripts
│   ├── check-requirements.sh
│   ├── setup-usb-storage.sh
│   └── install.sh
│
├── tools/                     # System management tools
│   ├── backup-pocketcloud.sh
│   ├── system-status.sh
│   └── ...
│
├── docs/                      # Documentation
│   ├── setup/                # Setup guides
│   ├── api/                  # API documentation
│   └── troubleshooting/      # Troubleshooting guides
│
├── config/                    # System configuration
│   ├── systemd/              # Service files
│   └── nginx/                # Web server config
│
└── data/                      # Runtime data (symlinked to USB)
    ├── database/
    └── storage/
```

## Migration Steps

### Phase 1: Clean Root Directory
- Move duplicate directories to backup
- Keep only essential root files
- Update package.json to workspace manager

### Phase 2: Organize Backend
- Ensure backend/ has complete, working code
- Update all import paths
- Create backend/package.json

### Phase 3: Organize Setup & Tools
- Move setup scripts to setup/
- Move management tools to tools/
- Update script paths in documentation

### Phase 4: Organize Documentation
- Consolidate docs/ directory
- Remove redundant documentation
- Create clear navigation

### Phase 5: Update Configuration
- Update package.json scripts
- Fix import paths
- Update systemd service files

## Benefits
1. **Clear separation** of concerns
2. **No duplicate code** or confusion
3. **Professional structure** following industry standards
4. **Easy navigation** and maintenance
5. **Scalable architecture** for future growth