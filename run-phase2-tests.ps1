# ============================================================================
# Job360 - Phase 2: High Priority Security Test Runner (PowerShell)
# ============================================================================
# Purpose: Enhanced PowerShell runner for Phase 2 security tests
# Date: April 4, 2026
# ============================================================================

param(
    [string]$BaseUrl = "http://localhost:5173",
    [string]$Test = "all",
    [switch]$Verbose,
    [switch]$Json,
    [switch]$Telegram
)

# Colors and formatting
$script:SuccessColor = "Green"
$script:ErrorColor = "Red"
$script:WarningColor = "Yellow"
$script:InfoColor = "Cyan"

function Write-Header {
    param([string]$Text)
    Write-Host "`n================================================================================" -ForegroundColor White
    Write-Host "  $Text" -ForegroundColor White -Bold
    Write-Host "================================================================================`n" -ForegroundColor White
}

function Write-TestResult {
    param(
        [int]$ExitCode,
        [string]$Phase = "Phase 2: High Priority Security"
    )
    
    Write-Host "`n================================================================================" -ForegroundColor White
    
    if ($ExitCode -eq 0) {
        Write-Host "  ✅ $Phase - ALL TESTS PASSED" -ForegroundColor Green -Bold
        Write-Host "`n  You can proceed to Phase 3: Medium Priority Security testing." -ForegroundColor Green
    } else {
        Write-Host "  ❌ $Phase - TESTS FAILED" -ForegroundColor Red -Bold
        Write-Host "`n  Failed tests indicate HIGH severity security vulnerabilities." -ForegroundColor Red
        Write-Host "  Please review results and fix issues before proceeding." -ForegroundColor Yellow
    }
    
    Write-Host "================================================================================`n" -ForegroundColor White
}

function Show-Menu {
    Clear-Host
    
    Write-Header "Job360 - Phase 2: High Priority Security Test Suite"
    
    Write-Host "Current Settings:" -ForegroundColor Cyan
    Write-Host "  Base URL: $BaseUrl" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Select Test Option:" -ForegroundColor Yellow
    Write-Host "================================================================================" -ForegroundColor White
    Write-Host ""
    Write-Host "  1. Run ALL Phase 2 High Security Tests" -ForegroundColor White
    Write-Host "  2. Run ALL with verbose output" -ForegroundColor White
    Write-Host "  3. Run ALL and export JSON report" -ForegroundColor White
    Write-Host "  4. Run ALL and send Telegram report" -ForegroundColor White
    Write-Host "  5. Run ALL with verbose + JSON + Telegram" -ForegroundColor White
    Write-Host ""
    Write-Host "  Individual Tests:" -ForegroundColor Yellow
    Write-Host "  6.  H-01: PII Sent to Telegram Without Consent" -ForegroundColor White
    Write-Host "  7.  H-02: Registration Does Not Record User Consent" -ForegroundColor White
    Write-Host "  8.  H-03: CV Upload Consent Is Implicit/Automatic" -ForegroundColor White
    Write-Host "  9.  H-04: Full CV Content Sent to Third-Party AI" -ForegroundColor White
    Write-Host "  10. H-05: No Row Level Security (RLS) Policies" -ForegroundColor White
    Write-Host "  11. H-06: XSS Vulnerability in Chart Component" -ForegroundColor White
    Write-Host "  12. H-07: Browser Fingerprinting Without Disclosure" -ForegroundColor White
    Write-Host ""
    Write-Host "  13. Set custom base URL (current: $BaseUrl)" -ForegroundColor White
    Write-Host "  14. Back to Phase 1 Tests" -ForegroundColor White
    Write-Host "  0. Exit" -ForegroundColor White
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor White
}

function Invoke-Phase2Test {
    param(
        [string]$TestId,
        [string]$TestName,
        [bool]$IncludeVerbose = $false,
        [bool]$IncludeJson = $false,
        [bool]$IncludeTelegram = $false
    )
    
    Write-Host "`n▶ Running: $TestName" -ForegroundColor Cyan -Bold
    
    $arguments = @("test-phase2-high-security.js", "--base-url", $BaseUrl)
    
    if ($TestId -ne "all") {
        $arguments += @("--test", $TestId)
    }
    
    if ($IncludeVerbose) {
        $arguments += "--verbose"
    }
    
    if ($IncludeJson) {
        $arguments += "--json"
    }
    
    if ($IncludeTelegram) {
        $arguments += "--telegram"
    }
    
    & node $arguments
    $exitCode = $LASTEXITCODE
    
    return $exitCode
}

# Main execution
$script:TestFileExists = Test-Path "test-phase2-high-security.js"

if (-not $script:TestFileExists) {
    Write-Host "ERROR: test-phase2-high-security.js not found!" -ForegroundColor Red
    Write-Host "Please ensure the Phase 2 test file is in the project root directory." -ForegroundColor Yellow
    exit 1
}

# If command-line parameters are provided, run directly
if ($PSBoundParameters.ContainsKey('Test') -or $PSBoundParameters.ContainsKey('Verbose') -or $PSBoundParameters.ContainsKey('Json') -or $PSBoundParameters.ContainsKey('Telegram')) {
    $exitCode = Invoke-Phase2Test -TestId $Test -TestName "Phase 2 High Security Tests" -IncludeVerbose $Verbose -IncludeJson $Json -IncludeTelegram $Telegram
    Write-TestResult -ExitCode $exitCode
    exit $exitCode
}

# Interactive menu
do {
    Show-Menu
    
    $choice = Read-Host "Enter your choice (0-14)"
    
    $exitCode = -1
    
    switch ($choice) {
        "0" { exit 0 }
        "1" { $exitCode = Invoke-Phase2Test -TestId "all" -TestName "ALL Phase 2 High Security Tests" }
        "2" { $exitCode = Invoke-Phase2Test -TestId "all" -TestName "ALL Phase 2 High Security Tests (verbose)" -IncludeVerbose $true }
        "3" { $exitCode = Invoke-Phase2Test -TestId "all" -TestName "ALL Phase 2 High Security Tests (JSON)" -IncludeJson $true }
        "4" { $exitCode = Invoke-Phase2Test -TestId "all" -TestName "ALL Phase 2 High Security Tests (Telegram)" -IncludeTelegram $true }
        "5" { $exitCode = Invoke-Phase2Test -TestId "all" -TestName "ALL Phase 2 High Security Tests (full)" -IncludeVerbose $true -IncludeJson $true -IncludeTelegram $true }
        "6" { $exitCode = Invoke-Phase2Test -TestId "H-01" -TestName "H-01: PII Sent to Telegram" -IncludeVerbose $true }
        "7" { $exitCode = Invoke-Phase2Test -TestId "H-02" -TestName "H-02: Registration Consent" -IncludeVerbose $true }
        "8" { $exitCode = Invoke-Phase2Test -TestId "H-03" -TestName "H-03: CV Upload Consent" -IncludeVerbose $true }
        "9" { $exitCode = Invoke-Phase2Test -TestId "H-04" -TestName "H-04: Third-Party AI Disclosure" -IncludeVerbose $true }
        "10" { $exitCode = Invoke-Phase2Test -TestId "H-05" -TestName "H-05: RLS Policies" -IncludeVerbose $true }
        "11" { $exitCode = Invoke-Phase2Test -TestId "H-06" -TestName "H-06: XSS in Chart Component" -IncludeVerbose $true }
        "12" { $exitCode = Invoke-Phase2Test -TestId "H-07" -TestName "H-07: Browser Fingerprinting" -IncludeVerbose $true }
        "13" {
            Write-Host ""
            $newUrl = Read-Host "Enter base URL (default: http://localhost:5173)"
            if ($newUrl) {
                $script:BaseUrl = $newUrl
                $BaseUrl = $newUrl
            }
            Write-Host "Base URL set to: $BaseUrl" -ForegroundColor Green
            Start-Sleep -Seconds 1
        }
        "14" {
            Write-Host "`nLaunching Phase 1 Test Suite..." -ForegroundColor Cyan
            & cmd /c "run-phase1-tests.bat"
            exit
        }
        default {
            Write-Host "Invalid choice!" -ForegroundColor Red
            Start-Sleep -Seconds 1
            continue
        }
    }
    
    if ($exitCode -ge 0) {
        Write-TestResult -ExitCode $exitCode
        Write-Host "Press any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    
} while ($choice -ne "0")
