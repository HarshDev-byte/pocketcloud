#!/bin/bash

# GitHub Repository Refresh Script
# Completely replaces the GitHub repository with new organized structure

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/HarshDev-byte/Pocketcloud.git"
BACKUP_BRANCH="backup-old-structure"

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║           🔄 GitHub Repository Refresh Script 🔄             ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_git_repo() {
    print_step "Checking if we're in a git repository..."
    
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository!"
        echo "Please run this script from your PocketCloud project directory."
        exit 1
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin >/dev/null 2>&1; then
        print_error "No git remote 'origin' found!"
        echo "Please add your GitHub repository as origin:"
        echo "git remote add origin $REPO_URL"
        exit 1
    fi
    
    CURRENT_REMOTE=$(git remote get-url origin)
    print_success "Git repository detected: $CURRENT_REMOTE"
}

check_working_directory() {
    print_step "Checking working directory status..."
    
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes!"
        echo "Current changes:"
        git status --short
        echo
        read -p "Do you want to continue? This will lose uncommitted changes. (yes/no): " CONFIRM
        if [ "$CONFIRM" != "yes" ]; then
            echo "Aborted."
            exit 0
        fi
    fi
    
    print_success "Working directory checked"
}

create_backup() {
    print_step "Creating backup branch (optional)..."
    
    read -p "Create backup branch '$BACKUP_BRANCH'? (y/n): " CREATE_BACKUP
    
    if [ "$CREATE_BACKUP" = "y" ] || [ "$CREATE_BACKUP" = "Y" ]; then
        # Check if backup branch already exists
        if git show-ref --verify --quiet refs/heads/$BACKUP_BRANCH; then
            print_warning "Backup branch '$BACKUP_BRANCH' already exists"
            read -p "Overwrite it? (y/n): " OVERWRITE
            if [ "$OVERWRITE" = "y" ] || [ "$OVERWRITE" = "Y" ]; then
                git branch -D $BACKUP_BRANCH
            else
                BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"
                print_warning "Using new backup branch name: $BACKUP_BRANCH"
            fi
        fi
        
        git checkout -b $BACKUP_BRANCH
        git push origin $BACKUP_BRANCH
        git checkout main
        
        print_success "Backup created: $BACKUP_BRANCH"
    else
        print_warning "Skipping backup creation"
    fi
}

confirm_destruction() {
    echo
    print_warning "⚠️  DESTRUCTIVE OPERATION WARNING ⚠️"
    echo
    echo "This will:"
    echo "  • Remove ALL existing files from the repository"
    echo "  • Replace with the current organized structure"
    echo "  • Force push to GitHub (overwrites history)"
    echo
    echo "Repository: $(git remote get-url origin)"
    echo "Current branch: $(git branch --show-current)"
    echo
    read -p "Are you absolutely sure you want to continue? (type 'YES' to confirm): " FINAL_CONFIRM
    
    if [ "$FINAL_CONFIRM" != "YES" ]; then
        echo "Operation cancelled."
        exit 0
    fi
}

remove_old_files() {
    print_step "Removing old files from git tracking..."
    
    # Remove all files from git index
    git rm -rf . 2>/dev/null || true
    
    # Remove all files except .git and .kiro
    find . -maxdepth 1 -not -name '.git*' -not -name '.kiro' -not -name '.' -exec rm -rf {} + 2>/dev/null || true
    
    print_success "Old files removed"
}

verify_new_structure() {
    print_step "Verifying new structure is in place..."
    
    # Check for key directories and files
    REQUIRED_ITEMS=(
        "backend"
        "frontend" 
        "README.md"
        "setup-pocketcloud.sh"
        "setup-usb-drive.sh"
    )
    
    MISSING_ITEMS=()
    for item in "${REQUIRED_ITEMS[@]}"; do
        if [ ! -e "$item" ]; then
            MISSING_ITEMS+=("$item")
        fi
    done
    
    if [ ${#MISSING_ITEMS[@]} -gt 0 ]; then
        print_error "Missing required items:"
        for item in "${MISSING_ITEMS[@]}"; do
            echo "  • $item"
        done
        echo
        echo "Please ensure your new PocketCloud structure is in the current directory."
        exit 1
    fi
    
    print_success "New structure verified"
}

add_and_commit() {
    print_step "Adding new files and committing..."
    
    # Add all new files
    git add .
    
    # Check if there are files to commit
    if [ -z "$(git diff --cached --name-only)" ]; then
        print_error "No files to commit!"
        echo "Please ensure your new PocketCloud files are in the current directory."
        exit 1
    fi
    
    # Show what will be committed
    echo "Files to be committed:"
    git diff --cached --name-only | head -20
    if [ $(git diff --cached --name-only | wc -l) -gt 20 ]; then
        echo "... and $(( $(git diff --cached --name-only | wc -l) - 20 )) more files"
    fi
    echo
    
    # Create comprehensive commit message
    COMMIT_MSG="🚀 Complete PocketCloud restructure

✨ New Features:
- Organized backend services into 5 domain categories (core, media, security, monitoring, automation)
- Simplified development-focused structure (removed Docker complexity)
- Added comprehensive Raspberry Pi setup scripts
- Created detailed documentation and setup guides
- Implemented Phase 9 UX enhancements specification

📁 New Structure:
- backend/ - Organized Node.js backend with 42 services
- frontend/ - React + TypeScript frontend
- docs/ - Essential documentation
- Setup scripts for USB drive and complete project deployment
- Monitoring and maintenance tools

🎯 Ready for:
- Phase 9 UX enhancements implementation
- Raspberry Pi deployment
- Development workflow

89% complete - Final phase ready for implementation!"
    
    git commit -m "$COMMIT_MSG"
    
    print_success "Changes committed"
}

push_to_github() {
    print_step "Pushing to GitHub..."
    
    print_warning "About to force push to GitHub..."
    read -p "Continue with force push? (yes/no): " PUSH_CONFIRM
    
    if [ "$PUSH_CONFIRM" != "yes" ]; then
        echo "Push cancelled. You can push manually later with:"
        echo "git push origin main --force"
        exit 0
    fi
    
    # Force push to replace everything
    git push origin main --force
    
    print_success "Successfully pushed to GitHub!"
}

print_summary() {
    echo
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║                 🎉 REFRESH COMPLETE! 🎉                     ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo "📊 Repository Refresh Summary:"
    echo "  • Repository: $(git remote get-url origin)"
    echo "  • Branch: $(git branch --show-current)"
    echo "  • Commit: $(git rev-parse --short HEAD)"
    if [ "$CREATE_BACKUP" = "y" ] || [ "$CREATE_BACKUP" = "Y" ]; then
        echo "  • Backup branch: $BACKUP_BRANCH"
    fi
    echo
    echo "📁 New Structure:"
    echo "  • backend/ - Organized Node.js backend"
    echo "  • frontend/ - React + TypeScript frontend"
    echo "  • Setup scripts for Raspberry Pi"
    echo "  • Comprehensive documentation"
    echo "  • Phase 9 UX enhancement specs"
    echo
    echo "🌐 GitHub Repository:"
    echo "  • https://github.com/HarshDev-byte/Pocketcloud"
    echo
    echo "🎯 Next Steps:"
    echo "  1. Verify repository on GitHub"
    echo "  2. Clone fresh copy to test"
    echo "  3. Start Phase 9 implementation"
    echo "  4. Deploy to Raspberry Pi with setup scripts"
    echo
    echo "🎉 Your repository is now clean and organized!"
}

# Main execution
main() {
    print_header
    
    check_git_repo
    check_working_directory
    create_backup
    confirm_destruction
    remove_old_files
    verify_new_structure
    add_and_commit
    push_to_github
    print_summary
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "GitHub Repository Refresh Script"
        echo ""
        echo "This script completely replaces your GitHub repository with"
        echo "the new organized PocketCloud structure."
        echo ""
        echo "Usage:"
        echo "  $0              Run interactive refresh"
        echo "  $0 --help       Show this help"
        echo ""
        echo "⚠️  WARNING: This is a destructive operation!"
        echo "   It will remove all existing files from your repository."
        ;;
    *)
        main
        ;;
esac