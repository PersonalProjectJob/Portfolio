@echo off
REM ============================================================================
REM Job360 - Phase 2: High Priority Security Test Runner (Windows Batch)
REM ============================================================================
REM Purpose: Interactive menu to run Phase 2 security tests
REM Date: April 4, 2026
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ================================================================================
echo   Job360 - Phase 2: High Priority Security Test Suite
echo ================================================================================
echo.

REM Check if test file exists
if not exist "test-phase2-high-security.js" (
    echo ERROR: test-phase2-high-security.js not found!
    echo Please ensure the Phase 2 test file is in the project root directory.
    echo.
    pause
    exit /b 1
)

REM Default base URL
set BASE_URL=http://localhost:5173

:MENU
echo.
echo ================================================================================
echo   Select Test Option:
echo ================================================================================
echo.
echo   1. Run ALL Phase 2 High Security Tests
echo   2. Run ALL with verbose output
echo   3. Run ALL and export JSON report
echo   4. Run ALL and send Telegram report
echo   5. Run ALL with verbose + JSON + Telegram
echo.
echo   Individual Tests:
echo   6.  H-01: PII Sent to Telegram Without Consent
echo   7.  H-02: Registration Does Not Record User Consent
echo   8.  H-03: CV Upload Consent Is Implicit/Automatic
echo   9.  H-04: Full CV Content Sent to Third-Party AI
echo   10. H-05: No Row Level Security (RLS) Policies
echo   11. H-06: XSS Vulnerability in Chart Component
echo   12. H-07: Browser Fingerprinting Without Disclosure
echo.
echo   13. Set custom base URL (current: %BASE_URL%)
echo   14. Back to Phase 1 Tests
echo   0. Exit
echo.
echo ================================================================================
echo.

set /p CHOICE="Enter your choice (0-14): "

if "%CHOICE%"=="0" exit /b
if "%CHOICE%"=="1" goto RUN_ALL
if "%CHOICE%"=="2" goto RUN_ALL_VERBOSE
if "%CHOICE%"=="3" goto RUN_ALL_JSON
if "%CHOICE%"=="4" goto RUN_ALL_TELEGRAM
if "%CHOICE%"=="5" goto RUN_ALL_FULL
if "%CHOICE%"=="6" goto RUN_H01
if "%CHOICE%"=="7" goto RUN_H02
if "%CHOICE%"=="8" goto RUN_H03
if "%CHOICE%"=="9" goto RUN_H04
if "%CHOICE%"=="10" goto RUN_H05
if "%CHOICE%"=="11" goto RUN_H06
if "%CHOICE%"=="12" goto RUN_H07
if "%CHOICE%"=="13" goto SET_URL
if "%CHOICE%"=="14" goto PHASE1
echo Invalid choice! & pause & cls & goto MENU

:RUN_ALL
echo.
echo Running ALL Phase 2 High Security Tests...
node test-phase2-high-security.js --base-url %BASE_URL%
goto END

:RUN_ALL_VERBOSE
echo.
echo Running ALL Phase 2 High Security Tests (verbose)...
node test-phase2-high-security.js --base-url %BASE_URL% --verbose
goto END

:RUN_ALL_JSON
echo.
echo Running ALL Phase 2 High Security Tests (with JSON report)...
node test-phase2-high-security.js --base-url %BASE_URL% --json
goto END

:RUN_ALL_TELEGRAM
echo.
echo Running ALL Phase 2 High Security Tests (with Telegram report)...
node test-phase2-high-security.js --base-url %BASE_URL% --telegram
goto END

:RUN_ALL_FULL
echo.
echo Running ALL Phase 2 High Security Tests (verbose + JSON + Telegram)...
node test-phase2-high-security.js --base-url %BASE_URL% --verbose --json --telegram
goto END

:RUN_H01
echo.
echo Running H-01: PII Sent to Telegram Without Consent...
node test-phase2-high-security.js --base-url %BASE_URL% --test H-01 --verbose
goto END

:RUN_H02
echo.
echo Running H-02: Registration Does Not Record User Consent...
node test-phase2-high-security.js --base-url %BASE_URL% --test H-02 --verbose
goto END

:RUN_H03
echo.
echo Running H-03: CV Upload Consent Is Implicit/Automatic...
node test-phase2-high-security.js --base-url %BASE_URL% --test H-03 --verbose
goto END

:RUN_H04
echo.
echo Running H-04: Full CV Content Sent to Third-Party AI...
node test-phase2-high-security.js --base-url %BASE_URL% --test H-04 --verbose
goto END

:RUN_H05
echo.
echo Running H-05: No Row Level Security (RLS) Policies...
node test-phase2-high-security.js --base-url %BASE_URL% --test H-05 --verbose
goto END

:RUN_H06
echo.
echo Running H-06: XSS Vulnerability in Chart Component...
node test-phase2-high-security.js --base-url %BASE_URL% --test H-06 --verbose
goto END

:RUN_H07
echo.
echo Running H-07: Browser Fingerprinting Without Disclosure...
node test-phase2-high-security.js --base-url %BASE_URL% --test H-07 --verbose
goto END

:SET_URL
echo.
set /p BASE_URL="Enter base URL (default: http://localhost:5173): "
if "%BASE_URL%"=="" set BASE_URL=http://localhost:5173
echo Base URL set to: %BASE_URL%
pause
cls
goto MENU

:PHASE1
cls
echo Launching Phase 1 Test Suite...
call run-phase1-tests.bat
exit /b

:END
echo.
echo ================================================================================
if %ERRORLEVEL% EQU 0 (
    echo   ✅ All tests completed successfully!
    echo.
    echo   You can proceed to Phase 3: Medium Priority Security testing.
) else (
    echo   ❌ Some tests failed. Please review the results and fix the issues.
    echo.
    echo   Failed tests indicate HIGH severity security vulnerabilities.
)
echo ================================================================================
echo.
pause
cls
goto MENU
