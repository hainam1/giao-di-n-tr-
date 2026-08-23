# Checklist kiểm thử tích hợp

## Hạ tầng

- [ ] `docker compose config` hợp lệ.
- [ ] PostgreSQL có trạng thái `healthy`.
- [ ] Backend có trạng thái `healthy` và `/health` trả HTTP 200.
- [ ] Frontend có trạng thái `healthy` và trang chủ trả HTTP 200.
- [ ] `scripts/health-check.ps1` chạy thành công.

## Xác thực

- [ ] Đăng ký tài khoản hợp lệ.
- [ ] Email sai định dạng hoặc mật khẩu quá ngắn trả HTTP 400.
- [ ] Đăng nhập trả access token và refresh token.
- [ ] Access token dùng được với `/auth/profile`.
- [ ] Refresh token cấp token mới.
- [ ] Logout thu hồi phiên hiện tại.
- [ ] Không có token hoặc token sai trả HTTP 401.
- [ ] User thường gọi API admin trả HTTP 403.

## Storefront và thương mại

- [ ] Lấy danh sách và chi tiết sản phẩm.
- [ ] ID sản phẩm không tồn tại trả HTTP 404.
- [ ] Thêm, cập nhật và xóa sản phẩm trong giỏ.
- [ ] Refresh trang không làm sai trạng thái giỏ hàng.
- [ ] Checkout chỉ tạo một đơn khi người dùng bấm hai lần.
- [ ] Đơn vừa tạo xuất hiện trong lịch sử của khách và trang Admin.
- [ ] Giao diện xử lý được API rỗng, mất mạng và lỗi HTTP 500.

## PWA

- [ ] Manifest hợp lệ và có icon 192x192, 512x512.
- [ ] Service Worker được cài và kích hoạt.
- [ ] Cài được từ Chrome Android.
- [ ] Cài được từ Safari iOS qua Add to Home Screen.
- [ ] Chạy ở chế độ standalone.
- [ ] Có phản hồi phù hợp khi offline.
- [ ] Lighthouse không có lỗi PWA nghiêm trọng.

## Bằng chứng nghiệm thu

- [ ] Export Postman Collection và Environment không chứa secret thật.
- [ ] Lưu ảnh kiểm thử Android/iOS trong `docs/pwa/`.
- [ ] Lưu báo cáo Lighthouse trong `docs/pwa/`.
- [ ] Ghi tài khoản demo và kịch bản demo vào README khi nhóm chốt.
