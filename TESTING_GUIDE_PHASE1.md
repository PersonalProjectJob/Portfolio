# 🧪 Hướng Dẫn Test Phase 1: Critical Fixes

**Ngày tạo:** 4 tháng 4, 2026  
**Mục đích:** Hướng dẫn chi tiết để test 5 lỗ hổng CRITICAL đã sửa  
**Đối tượng:** Senior QA Tester, Security Tester

---

## 📋 Mục Lục

1. [Chuẩn Bị Môi Trường Test](#chuẩn-bị-môi-trường-test)
2. [Test C-01: Unauthenticated File Deletion](#test-c-01-unauthenticated-file-deletion)
3. [Test C-02: SQL Injection via ILIKE](#test-c-02-sql-injection-via-ilike)
4. [Test C-03: Error Details Leakage](#test-c-03-error-details-leakage)
5. [Test C-04: Password Hash Exposure](#test-c-04-password-hash-exposure)
6. [Test C-05: reCAPTCHA Test Key Fallback](#test-c-05-recaptcha-test-key-fallback)
7. [Báo Cáo Kết Quả](#báo-cáo-kết-quả)

---

## Chuẩn Bị Môi Trường Test

### Yêu Cầu
- [ ] Node.js v18+ đã cài
- [ ] curl hoặc Postman/Insomnia
- [ ] Truy cập được vào staging/development server
- [ ] Tài khoản test với các role: user, admin, owner

### Setup
```bash
# 1. Clone repository (nếu chưa có)
cd C:\Users\AD\Downloads\Job360

# 2. Cài đặt dependencies (nếu cần)
npm install

# 3. Chạy automated tests
node test-critical-fixes.js

# 4. Chạy với verbose mode
node test-critical-fixes.js --verbose

# 5. Chạy test cụ thể
node test-critical-fixes.js --test C-01
```

### Variables cần chuẩn bị
```bash
# Thay thế bằng URL thực tế của bạn
BASE_URL="http://localhost:5173"
API_URL="http://localhost:5173"

# Test accounts
TEST_USER_EMAIL="testuser@example.com"
TEST_USER_PASSWORD="Test123!@#"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin123!@#"
OWNER_EMAIL="owner@example.com"
OWNER_PASSWORD="Owner123!@#"
```

---

## Test C-01: Unauthenticated File Deletion

**Mức độ ưu tiên:** 🔴 CRITICAL - CVSS 9.8  
**Mục tiêu:** Xác minh endpoint `/delete-cv` yêu cầu authentication và ownership verification

### Test Case 1.1: Delete CV không có authentication

**Steps:**
```bash
curl -X POST http://localhost:5173/make-server-4ab11b6d/delete-cv \
  -H "Content-Type: application/json" \
  -d '{"publicIds": ["Job360/account/test-user/cv.pdf"]}' \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `401 Unauthorized`
- ✅ Response: `{"error": "Unauthorized"}`
- ✅ KHÔNG có file nào bị xóa

**Pass/Fail:** ☐ PASS / ☐ FAIL

**Notes:**
```
Ghi chú của tester:
```

---

### Test Case 1.2: Delete CV với token không hợp lệ

**Steps:**
```bash
curl -X POST http://localhost:5173/make-server-4ab11b6d/delete-cv \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token-12345" \
  -H "X-CareerAI-Scope-Key: account:test-user" \
  -d '{"publicIds": ["Job360/account/test-user/cv.pdf"]}' \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `401 Unauthorized`
- ✅ Response: `{"error": "Unauthorized"}` hoặc `{"error": "Invalid or expired token"}`

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 1.3: Delete CV của user khác (Ownership Check)

**Pre-condition:** 
- Login với user A
- Lấy session token của user A

**Steps:**
```bash
# 1. Login để lấy token
curl -X POST http://localhost:5173/make-server-4ab11b6d/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userA@example.com",
    "password": "UserA123!@#"
  }'

# 2. Sử dụng token để thử xóa file của user B
curl -X POST http://localhost:5173/make-server-4ab11b6d/delete-cv \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "X-CareerAI-Scope-Key: account:USER_A_ID" \
  -d '{"publicIds": ["Job360/account/USER_B_ID/cv.pdf"]}' \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `403 Forbidden`
- ✅ Response: `{"error": "Unauthorized: cannot delete files owned by other users"}`
- ✅ File của user B KHÔNG bị xóa

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 1.4: Delete CV của chính mình (Positive Test)

**Pre-condition:**
- Login với user A
- User A có file CV đã upload

**Steps:**
```bash
curl -X POST http://localhost:5173/make-server-4ab11b6d/delete-cv \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "X-CareerAI-Scope-Key: account:USER_A_ID" \
  -d '{"publicIds": ["Job360/account/USER_A_ID/2026-04-04/cv.pdf"]}' \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `200 OK`
- ✅ Response: `{"success": true, "results": [...]}`
- ✅ File CV bị xóa thành công

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 1.5: Audit Logging

**Steps:**
1. Thực hiện Test Case 1.1 (unauthenticated delete)
2. Kiểm tra server logs

**Expected Result:**
- ✅ Log có dòng: `[delete-cv] Unauthorized access attempt`
- ✅ Log có dòng: `[delete-cv] Delete request from user: USER_ID` (với authenticated request)
- ✅ Log có dòng: `[delete-cv] User USER_ID deleted X file(s)` (sau khi xóa thành công)

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

## Test C-02: SQL Injection via ILIKE

**Mức độ ưu tiên:** 🔴 CRITICAL - CVSS 8.6  
**Mục tiêu:** Xác minh ký tự wildcard SQL (`%`, `_`) được escape đúng cách

### Test Case 2.1: Search với % wildcard

**Pre-condition:** Login với admin account

**Steps:**
```bash
curl -X GET "http://localhost:5173/make-server-4ab11b6d/admin/users?search=%" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "X-CareerAI-Scope-Key: account:ADMIN_ID" \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `200 OK`
- ✅ Response trả về **KHÔNG** phải tất cả users trong database
- ✅ Chỉ trả về users có email thực sự chứa ký tự `%` (rất hiếm)
- ✅ Query parameter được escape thành `\%` trong SQL

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 2.2: Search với _ wildcard

**Steps:**
```bash
curl -X GET "http://localhost:5173/make-server-4ab11b6d/admin/users?search=___" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "X-CareerAI-Scope-Key: account:ADMIN_ID" \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `200 OK`
- ✅ Response trả về users có email chứa 3 ký tự `_` thực sự
- ✅ KHÔNG trả về tất cả users có email dài 3 ký tự

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 2.3: Complex SQL Injection Attempt

**Steps:**
```bash
curl -X GET "http://localhost:5173/make-server-4ab11b6d/admin/users?search=%admin%27%20OR%201%3D1%20--" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "X-CareerAI-Scope-Key: account:ADMIN_ID" \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `200 OK`
- ✅ KHÔNG có SQL injection thành công
- ✅ Search treats input as literal string, not SQL code
- ✅ Response empty hoặc chỉ có users có email chứa string đó

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 2.4: Jobs Import Search

**Steps:**
```bash
curl -X GET "http://localhost:5173/make-server-4ab11b6d/admin/jobs-import?search=%" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "X-CareerAI-Scope-Key: account:ADMIN_ID" \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `200 OK`
- ✅ Similar to Test Case 2.1 - wildcard được escape

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 2.5: Normal Search Still Works

**Steps:**
```bash
curl -X GET "http://localhost:5173/make-server-4ab11b6d/admin/users?search=john" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "X-CareerAI-Scope-Key: account:ADMIN_ID" \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `200 OK`
- ✅ Trả về users có email/display_name chứa "john"
- ✅ Search hoạt động bình thường với input không có ký tự đặc biệt

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

## Test C-03: Error Details Leakage

**Mức độ ưu tiên:** 🔴 CRITICAL - CVSS 7.5  
**Mục tiêu:** Xác minh internal error messages không bị lộ cho client

### Test Case 3.1: Registration Error

**Steps:**
```bash
curl -X POST http://localhost:5173/make-server-4ab11b6d/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email-format",
    "password": "Test123!@#"
  }' \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `400 Bad Request` hoặc `500 Internal Server Error`
- ✅ Response có field `error` với message thân thiện
- ✅ Response **KHÔNG** có field `details`
- ✅ Response **KHÔNG** có stack trace
- ✅ Response **KHÔNG** có SQL query hay database error

**Sample GOOD response:**
```json
{
  "error": "Registration failed. Please try again."
}
```

**Sample BAD response (FAIL):**
```json
{
  "error": "Registration failed. Please try again.",
  "details": "duplicate key value violates unique constraint \"users_email_key\" in table \"public.users\" (SQL: INSERT INTO users...)"
}
```

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 3.2: Login Error

**Steps:**
```bash
curl -X POST http://localhost:5173/make-server-4ab11b6d/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "wrongpassword"
  }' \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `401 Unauthorized`
- ✅ Response có field `error` 
- ✅ Response **KHÔNG** có field `details`

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 3.3: Server Error Simulation

**Steps:**
1. Tạm thời làm lỗi database (nếu có thể)
2. Hoặc gửi request malformed

```bash
curl -X POST http://localhost:5173/make-server-4ab11b6d/auth/register \
  -H "Content-Type: application/json" \
  -d '{malformed json' \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `400 Bad Request` hoặc `500`
- ✅ Response **KHÔNG** chứa internal paths, variable names, stack traces

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 3.4: Server Logs Verification

**Steps:**
1. Thực hiện Test Case 3.1 để trigger error
2. Kiểm tra server logs

**Expected Result:**
- ✅ Server logs **CÓ** chi tiết lỗi đầy đủ
- ✅ Server logs **CÓ** stack trace
- ✅ Server logs **CÓ** error message gốc
- ✅ Console sử dụng `console.error` (màu đỏ) thay vì `console.log`

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

## Test C-04: Password Hash Exposure

**Mức độ ưu tiên:** 🔴 CRITICAL - CVSS 8.1  
**Mục tiêu:** Xác minh `password_hash` không có trong responses không cần thiết

### Test Case 4.1: Admin User List

**Pre-condition:** Login với admin/owner account

**Steps:**
```bash
curl -X GET "http://localhost:5173/make-server-4ab11b6d/admin/users?limit=10&offset=0" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "X-CareerAI-Scope-Key: account:ADMIN_ID" \
  -v | jq .
```

**Expected Result:**
- ✅ HTTP Status: `200 OK`
- ✅ Response là array của user objects
- ✅ Mỗi user object **KHÔNG** có field `password_hash`
- ✅ Có các fields: `id`, `user_id`, `email`, `display_name`, `role`, `status`, etc.

**Sample GOOD response:**
```json
{
  "users": [
    {
      "id": "1",
      "user_id": "uuid-here",
      "email": "user@example.com",
      "display_name": "Test User",
      "role": "user",
      "status": "active",
      "login_count": 5,
      "last_login_at": "2026-04-04T10:00:00Z"
    }
  ]
}
```

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 4.2: Admin User Detail

**Steps:**
```bash
curl -X GET "http://localhost:5173/make-server-4ab11b6d/admin/users/USER_ID" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "X-CareerAI-Scope-Key: account:ADMIN_ID" \
  -v | jq .
```

**Expected Result:**
- ✅ HTTP Status: `200 OK`
- ✅ User object **KHÔNG** có field `password_hash`

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 4.3: Authentication Still Works

**Steps:**
```bash
# 1. Login với valid credentials
curl -X POST http://localhost:5173/make-server-4ab11b6d/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestUser123!@#"
  }' \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `200 OK`
- ✅ Authentication thành công
- ✅ Response có `sessionToken` và `user` object
- ✅ User có thể access protected resources

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

## Test C-05: reCAPTCHA Test Key Fallback

**Mức độ ưu tiên:** 🔴 CRITICAL - CVSS 9.1  
**Mục tiêu:** Xác minh application ném lỗi khi `RECAPTCHA_SECRET_KEY` không được cấu hình

### Test Case 5.1: Unit Test - Function Behavior

**Automated Test:**
```bash
node test-critical-fixes.js --test C-05
```

**Expected Result:**
- ✅ Function `getRecaptchaSecretKey()` ném error khi key không có
- ✅ Error message: "RECAPTCHA_SECRET_KEY is not configured..."
- ✅ Function trả về key khi key được cung cấp
- ✅ Google test key `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` KHÔNG được sử dụng

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 5.2: Deployment Test (Staging)

**Steps:**
1. Deploy ứng dụng lên staging environment
2. KHÔNG set biến môi trường `RECAPTCHA_SECRET_KEY`
3. Thử trigger captcha verification

```bash
curl -X POST http://staging.example.com/make-server-4ab11b6d/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "password": "Test123!@#",
    "captchaToken": "test-token"
  }' \
  -v
```

**Expected Result:**
- ✅ HTTP Status: `500 Internal Server Error`
- ✅ Response: `{"error": "Captcha is not configured on the server..."}`
- ✅ Application không silently bypass captcha

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

### Test Case 5.3: Production Readiness

**Steps:**
1. Set biến môi trường `RECAPTCHA_SECRET_KEY` với key thật
2. Deploy lại
3. Test registration với captcha

**Expected Result:**
- ✅ Application khởi động thành công
- ✅ Captcha verification hoạt động bình thường
- ✅ Không có fallback nào được sử dụng

**Pass/Fail:** ☐ PASS / ☐ FAIL

---

## Báo Cáo Kết Quả

### Template Báo Cáo

Sau khi hoàn thành tất cả tests, điền vào bảng sau:

| Test ID | Test Case | Status | Notes | Tester | Date |
|---------|-----------|--------|-------|--------|------|
| C-01-1 | Delete CV không auth | ☐ PASS ☐ FAIL | | | |
| C-01-2 | Delete CV với token invalid | ☐ PASS ☐ FAIL | | | |
| C-01-3 | Delete CV user khác | ☐ PASS ☐ FAIL | | | |
| C-01-4 | Delete CV chính mình | ☐ PASS ☐ FAIL | | | |
| C-01-5 | Audit logging | ☐ PASS ☐ FAIL | | | |
| C-02-1 | Search với % | ☐ PASS ☐ FAIL | | | |
| C-02-2 | Search với _ | ☐ PASS ☐ FAIL | | | |
| C-02-3 | Complex SQL injection | ☐ PASS ☐ FAIL | | | |
| C-02-4 | Jobs import search | ☐ PASS ☐ FAIL | | | |
| C-02-5 | Normal search | ☐ PASS ☐ FAIL | | | |
| C-03-1 | Registration error | ☐ PASS ☐ FAIL | | | |
| C-03-2 | Login error | ☐ PASS ☐ FAIL | | | |
| C-03-3 | Server error | ☐ PASS ☐ FAIL | | | |
| C-03-4 | Server logs | ☐ PASS ☐ FAIL | | | |
| C-04-1 | Admin user list | ☐ PASS ☐ FAIL | | | |
| C-04-2 | Admin user detail | ☐ PASS ☐ FAIL | | | |
| C-04-3 | Auth still works | ☐ PASS ☐ FAIL | | | |
| C-05-1 | Unit test function | ☐ PASS ☐ FAIL | | | |
| C-05-2 | Deployment test | ☐ PASS ☐ FAIL | | | |
| C-05-3 | Production readiness | ☐ PASS ☐ FAIL | | | |

### Tổng Kết

```
Total Tests: ___
Passed: ___
Failed: ___
Skipped: ___
Pass Rate: ___%

Issues Found:
1. 
2. 
3. 

Recommendations:
1. 
2. 
3. 

Sign-off: ☐ APPROVED FOR DEPLOYMENT  ☐ NEEDS FIXES
Tester: ___________________
Date: ___________________
```

---

## 🚨 Critical Issues Escalation

Nếu phát hiện bất kỳ issue nào trong quá trình test:

1. **Dừng test** và ghi nhận issue
2. **Chụp màn hình** response/logs
3. **Report ngay** cho development team
4. **Không deploy** cho đến khi issue được resolve
5. **Re-test** sau khi fix

### Contact
- **Dev Lead:** [Tên]
- **Security Lead:** [Tên]  
- **Project Manager:** [Tên]

---

**Good luck with testing! 🔒**
