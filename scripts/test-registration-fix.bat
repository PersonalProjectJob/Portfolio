@echo off
REM Test script to verify the registration fix (Windows)
REM Run this AFTER setting up secrets to verify they work

set PROJECT_ID=xjtiokkxuqukatjdcqzd
set BASE_URL=https://%PROJECT_ID%.supabase.co/functions/v1/make-server-4ab11b6d

echo.
echo ======================================
echo Testing Registration Endpoint Fix
echo ======================================
echo.

REM Test 1: Health check
echo Test 1: Checking health endpoint...
curl -s -o NUL -w "HTTP Status: %%{http_code}\n" "%BASE_URL%/health" > test_health.tmp
set /p HEALTH_RESULT=<test_health.tmp
echo %HEALTH_RESULT%
del test_health.tmp

echo.
echo Test 2: Testing registration (expecting captcha error, not 500)...
echo.

REM Test 2: Registration without captcha
curl -s -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -H "Origin: https://tnsthao94.online" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@gmail.com\",\"password\":\"TestPass123\"}" > test_register.tmp

echo Response saved to test_register.tmp
echo.
echo Check the response:
type test_register.tmp
echo.

del test_register.tmp

echo.
echo ======================================
echo If you see a captcha error or validation error (not 500), the fix worked!
echo ======================================
echo.
pause
