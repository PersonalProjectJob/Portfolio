# ============================================================================
# Job360 Pre-Commit Test Runner (PowerShell)
# ============================================================================
# Purpose: Easy way to run all pre-commit tests on Windows PowerShell
# Author: Senior QA Automation Engineer
# 
# Usage:
#   .\test-pre-commit.ps1 [options]
# 
# Options:
#   -Verbose     Show detailed output
#   -NoTelegram  Disable Telegram report (enabled by default)
#   -Json        Output results as JSON
#   -Help        Show help message
# ============================================================================

[CmdletBinding()]
param(
    [switch]$Verbose,
    [switch]$NoTelegram,
    [switch]$Json,
    [switch]$Help
)

# Help
if ($Help) {
    Write-Host @"

Job360 Pre-Commit Test Runner (PowerShell)
Senior QA Automation Standards (10+ years experience)

Usage:
  .\test-pre-commit.ps1 [options]

Options:
  -Verbose     Show detailed output
  -NoTelegram  Disable Telegram report (enabled by default)
  -Json        Output results as JSON
  -Help        Show this help message

Exit Codes:
  0 - All tests passed, safe to commit
  1 - Tests failed, DO NOT commit
  2 - Configuration error

Examples:
  .\test-pre-commit.ps1
  .\test-pre-commit.ps1 -Verbose
  .\test-pre-commit.ps1 -Json
  .\test-pre-commit.ps1 -NoTelegram

"@ -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Job360 Pre-Commit Test Runner" -ForegroundColor White
Write-Host "Senior QA Automation Standards (10+ years experience)" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 2
}

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "WARNING: node_modules not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Running npm install..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm install failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
}

# Build arguments
$ArgsList = @()
if ($Verbose) { $ArgsList += "--verbose" }
if ($NoTelegram) { $ArgsList += "--no-telegram" }
if ($Json) { $ArgsList += "--json" }

# Run pre-commit tests
Write-Host "Running pre-commit test suite..." -ForegroundColor Cyan
Write-Host ""

$ProcessArgs = @("test-pre-commit.js") + $ArgsList
& node $ProcessArgs
$ExitCode = $LASTEXITCODE

Write-Host ""
if ($ExitCode -eq 0) {
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host "SUCCESS: All pre-commit tests passed!" -ForegroundColor Green
    Write-Host "You can safely commit your code." -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Green
} elseif ($ExitCode -eq 1) {
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host "FAILURE: Some tests failed!" -ForegroundColor Red
    Write-Host "DO NOT commit until failures are fixed." -ForegroundColor Red
    Write-Host "================================================================================" -ForegroundColor Red
} else {
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host "ERROR: Test runner encountered an error" -ForegroundColor Red
    Write-Host "Exit code: $ExitCode" -ForegroundColor Red
    Write-Host "================================================================================" -ForegroundColor Red
}

Write-Host ""
if (-Not $Json) {
    Read-Host "Press Enter to exit"
}
exit $ExitCode
