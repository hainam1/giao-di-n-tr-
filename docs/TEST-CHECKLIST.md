# Checklist kiểm thử tích hợp

## Hạ tầng

- [ ] `docker compose config` hợp lệ.
- [ ] PostgreSQL có trạng thái `healthy`.
- [x] Backend `/health` trả HTTP 200 và trạng thái `UP` (2026-08-26).
- [x] Frontend trang chủ trả HTTP 200 (2026-08-26).
- [x] PostgreSQL local có 32 bảng và integration test kết nối thành công (2026-08-26).

## Xác thực

- [x] Đăng ký tài khoản hợp lệ.
- [x] Email sai định dạng hoặc mật khẩu quá ngắn trả HTTP 400.
- [x] Đăng nhập trả access token và refresh token.
- [x] Access token dùng được với `/auth/profile`.
- [x] Refresh token cấp token mới.
- [x] Logout thu hồi phiên hiện tại; refresh token cũ trả HTTP 401.
- [x] Không có token trả HTTP 401.
- [x] User thường gọi API admin trả HTTP 403.

## Storefront và thương mại

- [x] Lấy danh sách và chi tiết sản phẩm.
- [x] ID sản phẩm không tồn tại trả HTTP 404.
- [x] Thêm, cập nhật và xóa sản phẩm trong giỏ.
- [x] Refresh trang không làm sai trạng thái giỏ hàng.
- [x] Hai checkout đồng thời chỉ tạo một đơn; request còn lại trả HTTP 400/409.
- [x] Đơn vừa tạo xuất hiện trong lịch sử của khách và trang Admin.
- [x] Voucher `XATON20` trả kết quả hợp lệ; voucher sai trả HTTP 404.
- [x] Admin xác nhận đơn và tạo vận đơn thành công.
- [x] Playwright xác nhận khách đăng nhập và mở Storefront/Products/Teaware/Story/Contact.
- [x] Playwright xác nhận Admin đăng nhập và mở Desktop/Mobile không có page error.
- [x] Giao diện xử lý được API rỗng, mất mạng và lỗi HTTP 500.

## PWA

- [ ] Manifest hợp lệ và có icon 192x192, 512x512.
- [ ] Service Worker được cài và kích hoạt.
- [ ] Cài được từ Chrome Android.
- [ ] Cài được từ Safari iOS qua Add to Home Screen.
- [ ] Chạy ở chế độ standalone.
- [ ] Có phản hồi phù hợp khi offline.
- [ ] Lighthouse không có lỗi PWA nghiêm trọng.

## Bằng chứng nghiệm thu

- [x] Export Postman Collection và Environment không chứa secret thật.
- [ ] Lưu ảnh kiểm thử Android/iOS trong `docs/pwa/`.
- [ ] Lưu báo cáo Lighthouse trong `docs/pwa/`.
- [x] Ghi tài khoản demo và kịch bản demo vào README.

## Báo cáo smoke test 2026-08-26

- Script: `scripts/api-smoke-test.ps1`.
- Kết quả cuối: 23 passed, 0 failed.
- Đã phát hiện và sửa lỗi Voucher trả HTTP 500 do CommerceService gọi sai interface repository.
- Smoke test tạo đơn demo, cập nhật đơn sang `CONFIRMED`, sau đó tạo vận đơn `TEST-CARRIER`.
- Backend Vitest: 20 passed, 0 failed.
- Frontend production build: thành công; lỗi cú pháp CSS đã được sửa. Vite chỉ còn thông báo các script classic không được bundle.
- Frontend Playwright E2E: 2 passed, 0 failed trên Chrome headless.

## Báo cáo hoàn tất Giai đoạn 2 - 2026-08-27

- API smoke test mở rộng: 39 passed, 0 failed.
- Bổ sung API thật cho Admin Products, Order Detail, Batches, Inventory Logs, Phiếu kho và Mobile Home.
- Chuẩn hóa response Product, Inventory và Review theo đúng dữ liệu UI sử dụng.
- Checkout đã chống tạo đơn trùng khi nhận hai request đồng thời.
- Playwright kiểm tra giỏ hàng qua reload, tăng/giảm/xóa, API rỗng, HTTP 500 và backend mất kết nối.
- Kết quả Playwright cuối: 7 passed, 0 failed.
- Backend Vitest: 20 passed, 0 failed; frontend production build thành công.
