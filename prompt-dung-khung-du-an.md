# Prompt Dựng Khung Dự Án Full-Stack Tái Sử Dụng

Dùng prompt này đưa cho agent (Claude Code hoặc tương đương) trong IDE để nó tự dựng khung dự án.

---

```
Vai trò: Bạn là kỹ sư kiến trúc phần mềm. Nhiệm vụ: dựng một KHUNG DỰ ÁN (boilerplate)
full-stack dùng lại được cho nhiều website khác nhau trong tương lai — không phải một
dự án cụ thể, mà là một cái nền để sau này chỉ cần đổi phần giao diện + nghiệp vụ,
không phải viết lại hạ tầng.

STACK:
- Backend: Node.js + Express
- Frontend: HTML/CSS/JS (dùng Vite làm build tool để có dev server nhanh, hot reload,
  bundle tối ưu cho production)
- Database: [điền loại DB, ví dụ PostgreSQL/MongoDB — nếu chưa quyết, dùng PostgreSQL
  làm mặc định và giải thích ngắn vì sao]

NGUYÊN TẮC KIẾN TRÚC BẮT BUỘC:
1. Tách rõ `core/` (logic dùng chung, KHÔNG đổi giữa các dự án) khỏi phần nghiệp vụ/
   giao diện (ĐỔI theo từng dự án). Không được để logic nghiệp vụ lẫn vào core, và
   không được hardcode giá trị đặc thù dự án (tên site, màu, API key...) trong core.
2. Mọi giá trị có thể thay đổi giữa các dự án (tên site, theme màu, font, API base URL,
   thông tin liên hệ, feature flag) PHẢI nằm trong file config tập trung, không rải
   rác trong code.
3. Backend tổ chức theo module (model – controller – routes riêng cho từng nghiệp vụ),
   để thêm/bớt module không ảnh hưởng module khác.
4. Frontend: component tái sử dụng (Button, Card, Modal, Header, Footer...) phải nhận
   style qua design tokens (biến CSS), không hardcode màu/kích thước trong từng
   component.
5. Không thêm tính năng/thư viện không được yêu cầu. Nếu thấy cần thêm gì để khung
   chạy đúng, hãy nêu lý do và hỏi trước, không tự ý bổ sung.

YÊU CẦU BẮT BUỘC ĐỂ DÙNG ĐƯỢC THỰC TẾ (không chỉ là thư mục rỗng):
- Server Express phải khởi động chạy được thật (`npm run dev`), có kết nối DB thật.
- Có sẵn 1 module mẫu đầy đủ (model – controller – route – validation) làm ví dụ mẫu
  cho các module sau này copy theo.
- Có middleware xác thực (JWT hoặc tương đương), middleware xử lý lỗi tập trung,
  chuẩn hóa format response (success/error) thống nhất cho toàn bộ API.
- Có validation schema (Joi hoặc Zod) áp dụng ở tầng middleware, không validate
  rải rác trong controller.
- Có cấu hình CORS, rate limiting cơ bản, biến môi trường qua `.env` (kèm
  `.env.example`), không hardcode secret.
- Có hệ thống migration cho DB (không tạo bảng thủ công), kèm 1 seed mẫu.
- Frontend dùng Vite: có dev server, build production tối ưu (code splitting,
  minify), theme đổi được chỉ qua 1 file biến CSS.
- Có `docker-compose.yml` chạy được thật (backend + frontend + DB) để clone về là
  chạy ngay, không cần cài thủ công từng phần.
- Có README hướng dẫn: cách chạy dev, cách thêm module mới (backend) và thêm trang
  mới (frontend) theo đúng cấu trúc, để lần sau tạo dự án khác chỉ việc làm theo.
- Có test mẫu tối thiểu (1 unit test backend) làm khuôn cho các test sau.

TIÊU CHÍ NGHIỆM THU (khung chỉ được coi là xong khi):
- `docker-compose up` (hoặc `npm run dev` ở cả 2 phía) chạy được ngay từ lần clone
  đầu tiên, không lỗi.
- Tạo được 1 module backend mới và 1 trang frontend mới CHỈ bằng cách copy theo mẫu
  có sẵn, không phải sửa code trong `core/`.
- Đổi theme (màu/logo/tên site) chỉ bằng cách sửa 1-2 file config, không phải sửa
  từng component.

Sau khi dựng xong, liệt kê rõ: những gì đã làm, những gì còn thiếu/cần quyết định
thêm (ví dụ: chọn DB cụ thể, chọn thư viện auth cụ thể), và không tự quyết thay tôi
ở những chỗ ảnh hưởng lớn đến kiến trúc.
```

---

## Vì sao prompt này đủ để dùng lâu dài

| Yêu cầu trong prompt | Giải quyết vấn đề gì đã nêu trước đó |
|---|---|
| Vite cho frontend | Thiếu build tool → giờ có dev server + tối ưu tốc độ thật |
| Migration + seed | Trước chỉ có `db.config.js` rỗng, giờ có cách quản lý schema qua nhiều dự án |
| Validation schema, CORS, rate limiting | Trước chỉ ghi tên file, giờ bắt buộc có nội dung logic |
| `docker-compose.yml` chạy thật | Trước chỉ ghi "(tùy chọn)", giờ là điều kiện nghiệm thu |
| 1 module mẫu đầy đủ + README hướng dẫn thêm module | Đảm bảo tính tái sử dụng thật — lần sau chỉ copy theo mẫu |
| Tiêu chí nghiệm thu rõ ràng | Tránh agent dừng lại ở mức "thư mục rỗng mang tính học thuật" như bản trước |
