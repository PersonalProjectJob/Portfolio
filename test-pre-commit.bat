@echo off
REM ============================================================================
REM Job360 Pre-Commit Test Runner (Windows Batch)
REM ============================================================================
REM Purpose: Easy way to run all pre-commit tests on Windows
REM Author: Senior QA Automation Engineer
REM 
REM Usage:
REM   test-pre-commit.bat [options]
REM 
REM Options:
REM   --verbose    Show detailed output
REM   --no-telegram Disable Telegram report (enabled by default)
REM   --json       Output results as JSON
REM   --help       Show help message
REM ============================================================================

echo.
echo ================================================================================
echo Job360 Pre-Commit Test Runner
echo Senior QA Automation Standards (10+ years experience)
echo ================================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 2
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo WARNING: node_modules not found
    echo.
    echo Running npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
    echo.
)

REM Parse arguments
set "ARGS=%*"
if "%ARGS%"=="" (
    set "ARGS="
)

REM Run pre-commit tests
echo Running pre-commit test suite...
echo.
node test-pre-commit.js %ARGS%
set EXIT_CODE=%errorlevel%

echo.
if %EXIT_CODE% equ 0 (
    echo ================================================================================
    echo SUCCESS: All pre-commit tests passed!
    echo You can safely commit your code.
    echo ================================================================================
) else if %EXIT_CODE% equ 1 (
    echo ================================================================================
    echo FAILURE: Some tests failed!
    echo DO NOT commit until failures are fixed.
    echo ================================================================================
) else (
    echo ================================================================================
    echo ERROR: Test runner encountered an error
    echo Exit code: %EXIT_CODE%
    echo ================================================================================
)

echo.
pause
exit /b %EXIT_CODE%
