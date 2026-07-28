---
name: /ship
description: "Execute the approved plan and write production-ready code."
---

# Lệnh: `/ship`

**Mục tiêu:** Chuyển từ trạng thái Planning sang trạng thái Thực thi (Execution).

Khi người dùng gọi lệnh này, AI sẽ:
1. Kết thúc các cuộc thảo luận chiến lược/thiết kế.
2. Dựa vào bản `implementation_plan.md` đã được duyệt để bắt đầu sửa code thực tế.
3. Liên tục cập nhật `task.md` và tuân thủ các quy tắc Frontend Code Standards.
