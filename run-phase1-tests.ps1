# ============================================================================
# Job360 Security Test Suite - Phase 1: Critical Security
# ============================================================================
# Purpose: PowerShell test runner with enhanced reporting
# Date: April 4, 2026
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "C-01", "C-02", "C-03", "C-04", "C-05")]
    [string]$Test = "all",
    
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:5173",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose,
    
    [Parameter(Mandatory=$false)]
    [switch]$Json,
    
    [Parameter(Mandatory=$false)]
    [switch]$Telegram,
    
    [Parameter(Mandatory=$false)]
    [switch]$QuickTest
)

# ============================================================================
# Helper Functions
# ============================================================================

function Write-TestHeader {
    param([string]$Text)
    Write-Host "`n" + ("=" * 80) -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan -BackgroundColor DarkCyan
    Write-Host ("=" * 80) + "`n" -ForegroundColor Cyan
}

function Write-TestSuccess {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-TestFailure {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

function Write-TestWarning {
    param([string]$Text)
    Write-Host "⚠ $Text" -ForegroundColor Yellow
}

function Write-TestInfo {
    param([string]$Text)
    Write-Host "ℹ $Text" -ForegroundColor Blue
}

function Check-Prerequisites {
    Write-TestInfo "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-TestSuccess "Node.js detected: $nodeVersion"
        } else {
            Write-TestFailure "Node.js not found in PATH"
            Write-Host "  Please install Node.js v18+ from: https://nodejs.org/" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-TestFailure "Node.js is not installed"
        exit 1
    }
    
    # Check test script
    $testScript = Join-Path $PSScriptRoot "test-phase1-critical-security.js"
    if (Test-Path $testScript) {
        Write-TestSuccess "Test script found: test-phase1-critical-security.js"
    } else {
        Write-TestFailure "Test script not found: test-phase1-critical-security.js"
        Write-Host "  Please ensure you are in the project root directory." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
}

function Show-TestMenu {
    Write-TestHeader "PHASE 1: CRITICAL SECURITY - TEST MENU"
    
    Write-Host "Test Options:" -ForegroundColor Cyan
    Write-Host "  1. Run ALL tests (recommended)" -ForegroundColor White
    Write-Host "  2. Run tests with VERBOSE output" -ForegroundColor White
    Write-Host "  3. Run tests with JSON report" -ForegroundColor White
    Write-Host "  4. Run tests with JSON report + Telegram notification" -ForegroundColor White
    Write-Host "  5. Test C-01: Unauthenticated File Deletion (CVSS 9.8)" -ForegroundColor White
    Write-Host "  6. Test C-02: SQL Injection Prevention (CVSS 8.6)" -ForegroundColor White
    Write-Host "  7. Test C-03: Error Details Leakage (CVSS 7.5)" -ForegroundColor White
    Write-Host "  8. Test C-04: Password Hash Exposure (CVSS 8.1)" -ForegroundColor White
    Write-Host "  9. Test C-05: reCAPTCHA Test Key Fallback (CVSS 9.1)" -ForegroundColor White
    Write-Host "  10. Quick test (sanity check only)" -ForegroundColor White
    Write-Host "  0. Exit" -ForegroundColor White
    Write-Host ""
}

function Run-Tests {
    param(
        [string]$TestParam,
        [string]$BaseUrl,
        [switch]$Verbose,
        [switch]$Json,
        [switch]$Telegram
    )
    
    $arguments = @()
    
    if ($TestParam -ne "all") {
        $arguments += "--test", $TestParam
    }
    
    if ($BaseUrl -ne "http://localhost:5173") {
        $arguments += "--base-url", $BaseUrl
    }
    
    if ($Verbose) {
        $arguments += "--verbose"
    }
    
    if ($Json) {
        $arguments += "--json"
    }
    
    if ($Telegram) {
        $arguments += "--telegram"
    }
    
    $testScript = Join-Path $PSScriptRoot "test-phase1-critical-security.js"
    
    Write-TestInfo "Executing: node $testScript $($arguments -join ' ')"
    Write-Host ""
    
    # Run the test
    $processStartInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processStartInfo.FileName = "node"
    $processStartInfo.Arguments = "$testScript $($arguments -join ' ')"
    $processStartInfo.RedirectStandardOutput = $true
    $processStartInfo.RedirectStandardError = $true
    $processStartInfo.UseShellExecute = $false
    $processStartInfo.CreateNoWindow = $false
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processStartInfo
    $process.Start() | Out-Null
    $process.WaitForExit()
    
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    
    Write-Host $stdout
    if ($stderr) {
        Write-Host $stderr -ForegroundColor Red
    }
    
    return $process.ExitCode
}

function Show-QuickTestResults {
    Write-TestHeader "QUICK TEST RESULTS SUMMARY"
    
    $reportFiles = Get-ChildItem -Path $PSScriptRoot -Filter "test-report-phase1-*.json" -ErrorAction SilentlyContinue
    
    if ($reportFiles.Count -gt 0) {
        $latestReport = $reportFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        Write-TestInfo "Latest report: $($latestReport.Name)"
        
        $report = Get-Content $latestReport.FullName | ConvertFrom-Json
        
        Write-Host ""
        Write-Host "Test Results:" -ForegroundColor Cyan
        Write-Host "  Total Tests: $($report.total)" -ForegroundColor White
        Write-Host "  Passed: $($report.passed)" -ForegroundColor Green
        Write-Host "  Failed: $($report.failed)" -ForegroundColor $(if ($report.failed -gt 0) { "Red" } else { "Green" })
        Write-Host "  Skipped: $($report.skipped)" -ForegroundColor Yellow
        
        if ($report.summary) {
            Write-Host ""
            Write-Host "Pass Rate: $($report.summary.passRate)%" -ForegroundColor $(
                if ([double]$report.summary.passRate -eq 100) { "Green" } else { "Yellow" }
            )
            Write-Host "Status: $($report.summary.readinessAssessment)" -ForegroundColor $(
                if ($report.summary.readinessAssessment -eq "READY_FOR_DEPLOYMENT") { "Green" } else { "Red" }
            )
        }
    } else {
        Write-TestWarning "No test reports found. Run tests first to generate reports."
    }
    
    Write-Host ""
}

# ============================================================================
# Main Execution
# ============================================================================

Clear-Host

Write-TestHeader "Job360 Security Test Suite - Phase 1: Critical Security"

Check-Prerequisites

# If QuickTest switch is set, show results and exit
if ($QuickTest) {
    Show-QuickTestResults
    exit 0
}

# If running interactively, show menu
if (-not $PSBoundParameters.ContainsKey('Test')) {
    Show-TestMenu
    
    $choice = Read-Host "Enter your choice (0-10)"
    
    switch ($choice) {
        "1" { $testSelection = "all" }
        "2" { $testSelection = "all"; $Verbose = $true }
        "3" { $testSelection = "all"; $Json = $true }
        "4" { $testSelection = "all"; $Json = $true; $Telegram = $true }
        "5" { $testSelection = "C-01" }
        "6" { $testSelection = "C-02" }
        "7" { $testSelection = "C-03" }
        "8" { $testSelection = "C-04" }
        "9" { $testSelection = "C-05" }
        "10" {
            Write-Host ""
            Write-TestInfo "Running quick sanity test..."
            $testSelection = "all"
            $Verbose = $false
        }
        "0" {
            Write-Host "Exiting..." -ForegroundColor Yellow
            exit 0
        }
        default {
            Write-TestFailure "Invalid choice. Exiting."
            exit 1
        }
    }
    
    $Test = $testSelection
}

# Run the tests
$exitCode = Run-Tests -TestParam $Test -BaseUrl $BaseUrl -Verbose:$Verbose -Json:$Json

Write-Host ""
Write-TestHeader "TEST EXECUTION COMPLETE"

if ($exitCode -eq 0) {
    Write-TestSuccess "All tests passed!"
    Write-Host ""
    Write-Host "You can proceed to Phase 2: High Priority Security testing." -ForegroundColor Green
} else {
    Write-TestFailure "Some tests failed! (Exit code: $exitCode)"
    Write-Host ""
    Write-Host "Please review the test report and fix identified issues before proceeding." -ForegroundColor Red
}

# Check for JSON reports
$reportFiles = Get-ChildItem -Path $PSScriptRoot -Filter "test-report-phase1-*.json" -ErrorAction SilentlyContinue
if ($reportFiles.Count -gt 0) {
    Write-Host ""
    Write-TestInfo "Test reports generated:"
    foreach ($report in $reportFiles) {
        Write-Host "  - $($report.Name)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
