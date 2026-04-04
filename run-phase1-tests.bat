@echo off
REM ============================================================================
REM Job360 Security Test Suite - Phase 1: Critical Security
REM ============================================================================
REM Purpose: Quick launcher for Phase 1 Critical Security tests
REM Date: April 4, 2026
REM ============================================================================

echo.
echo ================================================================================
echo    Job360 Security Test Suite - Phase 1: Critical Security
echo ================================================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js v18+ from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js detected: 
node --version
echo.

REM Check if test script exists
if not exist "test-phase1-critical-security.js" (
    echo [ERROR] Test script not found: test-phase1-critical-security.js
    echo.
    echo Please ensure you are in the project root directory.
    echo.
    pause
    exit /b 1
)

echo [INFO] Test script found.
echo.

REM Display menu
echo ================================================================================
echo    TEST EXECUTION MENU
echo ================================================================================
echo.
echo    1. Run ALL tests (recommended)
echo    2. Run tests with VERBOSE output
echo    3. Run tests with JSON report
echo    4. Run tests with JSON report + Telegram notification
echo    5. Test C-01: Unauthenticated File Deletion
echo    6. Test C-02: SQL Injection Prevention
echo    7. Test C-03: Error Details Leakage
echo    8. Test C-04: Password Hash Exposure
echo    9. Test C-05: reCAPTCHA Test Key Fallback
echo    10. Run against custom URL
echo    0. Exit
echo.
echo ================================================================================
echo.

set /p CHOICE="Enter your choice (0-10): "

echo.
echo ================================================================================
echo    STARTING TEST EXECUTION
echo ================================================================================
echo.

if "%CHOICE%"=="1" (
    echo Running ALL tests...
    node test-phase1-critical-security.js --verbose
) else if "%CHOICE%"=="2" (
    echo Running ALL tests with VERBOSE output...
    node test-phase1-critical-security.js --verbose
) else if "%CHOICE%"=="3" (
    echo Running ALL tests with JSON report...
    node test-phase1-critical-security.js --verbose --json
) else if "%CHOICE%"=="4" (
    echo Running ALL tests with JSON report + Telegram notification...
    node test-phase1-critical-security.js --verbose --json --telegram
) else if "%CHOICE%"=="5" (
    echo Running C-01: Unauthenticated File Deletion tests...
    node test-phase1-critical-security.js --test C-01 --verbose
) else if "%CHOICE%"=="6" (
    echo Running C-02: SQL Injection Prevention tests...
    node test-phase1-critical-security.js --test C-02 --verbose
) else if "%CHOICE%"=="7" (
    echo Running C-03: Error Details Leakage tests...
    node test-phase1-critical-security.js --test C-03 --verbose
) else if "%CHOICE%"=="8" (
    echo Running C-04: Password Hash Exposure tests...
    node test-phase1-critical-security.js --test C-04 --verbose
) else if "%CHOICE%"=="9" (
    echo Running C-05: reCAPTCHA Test Key Fallback tests...
    node test-phase1-critical-security.js --test C-05 --verbose
) else if "%CHOICE%"=="10" (
    set /p CUSTOM_URL="Enter base URL (e.g., https://staging.example.com): "
    echo Running ALL tests against %CUSTOM_URL%...
    node test-phase1-critical-security.js --base-url %CUSTOM_URL% --verbose --json
) else if "%CHOICE%"=="0" (
    echo Exiting...
    exit /b 0
) else (
    echo [ERROR] Invalid choice. Exiting.
    exit /b 1
)

echo.
echo ================================================================================
echo    TEST EXECUTION COMPLETE
echo ================================================================================
echo.

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] All tests passed!
    echo.
    echo You can proceed to Phase 2: High Priority Security testing.
) else (
    echo [FAILURE] Some tests failed!
    echo.
    echo Please review the test report and fix identified issues before proceeding.
    echo Exit code: %ERRORLEVEL%
)

echo.
pause
