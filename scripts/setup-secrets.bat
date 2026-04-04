@echo off
REM Helper script to set up Supabase Edge Function secrets (Windows)
REM Usage: setup-secrets.bat

echo.
echo ========================================
echo Supabase Edge Function Secrets Setup
echo ========================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Supabase CLI not found!
    echo Install it: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

echo [OK] Supabase CLI found
echo.

REM Configuration
set PROJECT_REF=xjtiokkxuqukatjdcqzd
set SUPABASE_URL=https://xjtiokkxuqukatjdcqzd.supabase.co

echo Configuration:
echo    Project: %PROJECT_REF%
echo    URL: %SUPABASE_URL%
echo.

REM Prompt for required secrets
set /P SERVICE_ROLE_KEY=Enter SUPABASE_SERVICE_ROLE_KEY: 
if "%SERVICE_ROLE_KEY%"=="" (
    echo [ERROR] Service role key is required!
    pause
    exit /b 1
)

set /P OWNER_EMAIL=Enter OWNER_EMAIL: 
if "%OWNER_EMAIL%"=="" (
    echo [ERROR] Owner email is required!
    pause
    exit /b 1
)

set /P OWNER_PASSWORD=Enter OWNER_PASSWORD (min 8 chars): 
if %OWNER_PASSWORD% LSS 8 (
    echo [ERROR] Password must be at least 8 characters!
    pause
    exit /b 1
)

set /P RECAPTCHA_SECRET=Enter RECAPTCHA_SECRET_KEY: 
if "%RECAPTCHA_SECRET%"=="" (
    echo [WARNING] reCAPTCHA secret is empty - registration will fail captcha verification
    set /P CONTINUE=Continue anyway? (y/N): 
    if /I not "%CONTINUE%"=="y" (
        exit /b 1
    )
)

echo.
echo Setting up secrets...
echo.

REM Set secrets
supabase secrets set ^
    SUPABASE_URL=%SUPABASE_URL% ^
    SUPABASE_SERVICE_ROLE_KEY=%SERVICE_ROLE_KEY% ^
    OWNER_EMAIL=%OWNER_EMAIL% ^
    OWNER_PASSWORD=%OWNER_PASSWORD% ^
    --project-ref %PROJECT_REF%

if not "%RECAPTCHA_SECRET%"=="" (
    supabase secrets set RECAPTCHA_SECRET_KEY=%RECAPTCHA_SECRET% --project-ref %PROJECT_REF%
)

REM Set optional secrets with defaults
supabase secrets set ^
    OWNER_DISPLAY_NAME="Job360 Admin" ^
    ALLOWED_ORIGINS="https://tnsthao94.online,https://www.tnsthao94.online" ^
    --project-ref %PROJECT_REF%

echo.
echo [SUCCESS] Secrets configured successfully!
echo.
echo Next steps:
echo    1. Deploy the function (if not already deployed):
echo       supabase functions deploy server --project-ref %PROJECT_REF%
echo.
echo    2. Test registration
echo.
echo    3. Check logs if needed:
echo       supabase functions logs server --project-ref %PROJECT_REF%
echo.
pause
