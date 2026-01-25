# Git Safe Push Script - Simplified Version
# Avoids Chinese path encoding issues by not using Set-Location
# Ignores Git warnings about line endings

# Temporarily disable error stopping for the entire script
$ErrorActionPreference = 'Continue'

Write-Host "==== Git Safe Push ====" -ForegroundColor Cyan

# 0. Check current branch
Write-Host "`n0. Checking current branch..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
if (-not $currentBranch) {
    Write-Host "Error: Not in a git repository" -ForegroundColor Red
    exit 1
}
Write-Host "Current branch: $currentBranch" -ForegroundColor Green

if ($currentBranch -ne "main") {
    Write-Host "Warning: Not on main branch, automatically switching to main branch" -ForegroundColor Red
    git checkout main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to switch branch" -ForegroundColor Red
        exit 1
    }
    $currentBranch = "main"
}

# 1. Check for changes
Write-Host "`n1. Checking local changes..." -ForegroundColor Yellow
$status = git status --short 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error running git status" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes to commit" -ForegroundColor Green
    exit 0
}

Write-Host "Found changes:" -ForegroundColor Green
Write-Host $status

# 2. Add all changes
Write-Host "`n2. Adding all changes..." -ForegroundColor Yellow
# Ignore warnings about line endings by redirecting stderr to stdout and filtering out warnings
git add -A 2>&1 | ForEach-Object { $_ } | Where-Object { $_ -notmatch 'warning:.*LF will be replaced by CRLF' } | Out-Null
# Check the exit code manually
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to add files" -ForegroundColor Red
    exit 1
}

# 3. Generate commit message
Write-Host "`n3. Generating commit message..." -ForegroundColor Yellow
$commitMsg = "Auto update - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "Commit message: $commitMsg" -ForegroundColor Green

# 4. Commit
Write-Host "`n4. Committing changes..." -ForegroundColor Yellow
git commit -m $commitMsg 2>&1 | ForEach-Object { $_ } | Where-Object { $_ -notmatch 'warning:.*LF will be replaced by CRLF' } | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to commit" -ForegroundColor Red
    exit 1
}

# 5. Pull (with retry)
Write-Host "`n5. Pulling remote changes..." -ForegroundColor Yellow
$pullSuccess = $false
for ($i = 0; $i -lt 3; $i++) {
    git pull --no-rebase origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $pullSuccess = $true
        Write-Host "Pull successful" -ForegroundColor Green
        break
    }
    Write-Host "Pull attempt $($i+1) failed, retrying in 2 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

# 6. Push
Write-Host "`n6. Pushing to remote..." -ForegroundColor Yellow
git push origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==== Done! ====" -ForegroundColor Green
    Write-Host "Code pushed to GitHub successfully" -ForegroundColor Green
} else {
    Write-Host "`nPush failed" -ForegroundColor Red
    exit 1
}