# FortisBudget - Issue #5 Installation Script
# Adds archived transactions management to Settings

Write-Host "FortisBudget - Archive Feature Installation" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Update SettingsPage.tsx (add Archived Transactions section)" -ForegroundColor White
Write-Host "  2. Guide you through updating App.tsx (add handlers)" -ForegroundColor White
Write-Host "  3. Guide you through updating ExpenseTracking.tsx (better message)" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Continue? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Starting installation..." -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
$settingsPath = "frontend\src\components\SettingsPage.tsx"

if (-not (Test-Path $settingsPath)) {
    Write-Host "Error: Cannot find $settingsPath" -ForegroundColor Red
    Write-Host "Make sure you're in the project root directory" -ForegroundColor Yellow
    exit 1
}

# Update SettingsPage.tsx
Write-Host "Step 1: Updating SettingsPage.tsx..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "outputs\SettingsPage.tsx") {
    # Backup the old file
    $backupPath = "frontend\src\components\SettingsPage.tsx.backup"
    Copy-Item -Path $settingsPath -Destination $backupPath -Force
    Write-Host "  Created backup: SettingsPage.tsx.backup" -ForegroundColor Gray
    
    # Copy the new file
    Copy-Item -Path "outputs\SettingsPage.tsx" -Destination $settingsPath -Force
    Write-Host "  Updated SettingsPage.tsx" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "  Error: outputs\SettingsPage.tsx not found" -ForegroundColor Red
    exit 1
}

# Guide for App.tsx
Write-Host "Step 2: App.tsx Updates Required" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need to manually add two handler functions to App.tsx" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option A - Quick Method:" -ForegroundColor White
Write-Host "  1. Open outputs\App_Transaction_Handlers.tsx" -ForegroundColor Gray
Write-Host "  2. Copy the two handler functions" -ForegroundColor Gray
Write-Host "  3. Paste into your App.tsx component" -ForegroundColor Gray
Write-Host "  4. Add the handlers to SettingsPage props" -ForegroundColor Gray
Write-Host ""
Write-Host "Option B - Manual Method:" -ForegroundColor White
Write-Host "  See ISSUE_5_IMPLEMENTATION.md for detailed instructions" -ForegroundColor Gray
Write-Host ""

$appConfirm = Read-Host "Have you updated App.tsx? (y/n)"
if ($appConfirm -ne 'y') {
    Write-Host ""
    Write-Host "Installation paused." -ForegroundColor Yellow
    Write-Host "Please update App.tsx, then run this script again" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Guide for ExpenseTracking.tsx
Write-Host ""
Write-Host "Step 3: ExpenseTracking.tsx Message Update" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need to update the archive confirmation message:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Open frontend\src\components\ExpenseTracking.tsx" -ForegroundColor Gray
Write-Host "  2. Find the handleArchiveOld function" -ForegroundColor Gray
Write-Host "  3. Replace the old confirm message with the new one" -ForegroundColor Gray
Write-Host "  4. See outputs\ExpenseTracking_Archive_Update.tsx for the code" -ForegroundColor Gray
Write-Host ""

$expenseConfirm = Read-Host "Have you updated ExpenseTracking.tsx? (y/n)"

# Completion
Write-Host ""
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Files Updated:" -ForegroundColor Cyan
Write-Host "  SettingsPage.tsx (archived section added)" -ForegroundColor Green

if ($appConfirm -eq 'y') {
    Write-Host "  App.tsx (handlers added)" -ForegroundColor Green
} else {
    Write-Host "  App.tsx (manual update required)" -ForegroundColor Yellow
}

if ($expenseConfirm -eq 'y') {
    Write-Host "  ExpenseTracking.tsx (message updated)" -ForegroundColor Green
} else {
    Write-Host "  ExpenseTracking.tsx (manual update required)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test the app: npm run dev" -ForegroundColor White
Write-Host "2. Archive some transactions in Expenses" -ForegroundColor White
Write-Host "3. Go to Settings and check Archived Transactions section" -ForegroundColor White
Write-Host "4. Test Restore and Delete functions" -ForegroundColor White
Write-Host ""
Write-Host "Commit:" -ForegroundColor Cyan
Write-Host "  git add frontend/src/components/" -ForegroundColor Gray
Write-Host "  git commit -m 'feat: add archived transactions management'" -ForegroundColor Gray
Write-Host "  git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "Restore backup if needed:" -ForegroundColor Yellow
Write-Host "  Copy-Item frontend\src\components\SettingsPage.tsx.backup frontend\src\components\SettingsPage.tsx -Force" -ForegroundColor Gray
Write-Host ""