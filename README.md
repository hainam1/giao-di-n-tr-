# 🚀 Boilerplate Full-Stack (Node.js Express + Vite + PostgreSQL)

Khung dự án (Boilerplate) chuẩn Full-Stack được thiết kế tái sử dụng cho nhiều dự án website khác nhau. Khung tách biệt hoàn toàn giữa hạ tầng `core/` độc lập và phần nghiệp vụ/giao diện linh hoạt.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Backend**: Node.js, Express.js (Module architecture, ES Modules).
- **Frontend**: Vite + HTML5 / Pure CSS3 / Modern JS (Design Tokens CSS variables, HMR).
- **Database & ORM**: PostgreSQL + Prisma ORM (Migration & Auto-seeding).
- **Validation**: Zod schema validation middleware.
- **Authentication**: JWT (JSON Web Token) & bcryptjs hashing.
- **DevOps**: Docker, `docker-compose.yml`, Vitest testing suite.

---

## 📁 Cấu Trúc Dự Án (Directory Structure)

```text
c:/A_Khungbandau/
├── 📁 backend/                  # RESTful API Service (Express.js)
│   ├── 📁 src/
│   │   ├── 📁 config/           # Cấu hình môi trường tập trung (app.config.js)
│   │   ├── 📁 core/             # Hạ tầng cốt lõi (KHÔNG sửa đổi giữa các dự án)
│   │   │   ├── responseHandler.js  # Format API Output chuẩn: { success, data, error }
│   │   │   ├── errorHandler.js     # Class AppError & Catch lỗi tập trung
│   │   │   ├── authMiddleware.js   # Middleware JWT & Phân quyền Role
│   │   │   └── validateMiddleware.js # Middleware validate schema bằng Zod
│   │   ├── 📁 database/         # Prisma Schema & Seed Script
│   │   └── 📁 modules/          # Các module nghiệp vụ (Tự do thêm/sửa/xóa)
│   │       ├── 📁 auth/         # Module Đăng nhập & Xác thực
│   │       └── 📁 sample/       # Module Mẫu chuẩn CRUD
│   └── 📁 tests/                # Unit Tests (Vitest)
│
├── 📁 frontend/                 # Vite Build Tool & Single/Multi-Page Web UI
│   ├── 📁 src/
│   │   ├── 📁 config/           # Cấu hình site tập trung (site.config.js)
│   │   ├── 📁 core/             # HTTP ApiClient wrapper (api.js)
│   │   └── 📁 styles/           # Design Tokens tập trung (variables.css)
│   └── index.html               # Vite Multi-page HTML pages
│
├── 📄 docker-compose.yml        # Chạy toàn bộ hệ thống bằng Docker
└── 📄 README.md                 # Hướng dẫn chi tiết
```

---

## ⚙️ Hướng Dẫn Khởi Chạy (Getting Started)

### Cách 1: Chạy trực tiếp trong môi trường Dev (Local Dev)

#### 1. Chạy Backend Express
```bash
cd backend
npm install
npm run dev
```
- Backend API chạy tại: `http://localhost:5000`
- API Health Check: `http://localhost:5000/health`

#### 2. Chạy Frontend Vite
```bash
cd frontend
npm install
npm run dev
```
- Frontend Web App chạy tại: `http://localhost:3000`

#### 3. Chạy Unit Test Backend
```bash
cd backend
npm test
```

---

### Cách 2: Khởi chạy bằng Docker (Full System)

Khởi chạy đồng thời 3 container (PostgreSQL, Backend Express, Frontend Vite/Nginx):
```bash
docker-compose up -d --build
```
Dừng hệ thống:
```bash
docker-compose down
```

---

## 📖 Hướng Dẫn Mở Rộng Dự Án Mới (Developer Blueprint)

### 1. Cách Thêm Module Backend Mới (Ví dụ: Module `product`)

1. Tạo thư mục `backend/src/modules/product/`.
2. Tạo 4 tệp theo chuẩn mẫu:
   - `product.validation.js`: Khai báo Zod Schema.
   - `product.service.js`: Truy vấn dữ liệu DB / logic nghiệp vụ.
   - `product.controller.js`: Tiếp nhận request & trả lời response.
   - `product.routes.js`: Định tuyến tuyến đường API & gắn middleware `validate()` / `authenticateJWT`.
3. Đăng ký router mới vào `backend/src/app.js`:
   ```javascript
   import productRoutes from './modules/product/product.routes.js';
   app.use('/api/v1/products', productRoutes);
   ```

---

### 2. Cách Đổi Theme & Thương Hiệu (Theme & Brand Customization)

1. **Thay đổi Màu sắc, Font chữ, Spacing**:
   Mở tệp [frontend/src/styles/variables.css](file:///c:/A_Khungbandau/frontend/src/styles/variables.css) và sửa đổi biến CSS `:root`:
   ```css
   :root {
     --primary-color: #2e7d32; /* Đổi màu chủ đạo toàn bộ website */
     --font-family-base: 'Roboto', sans-serif;
   }
   ```
2. **Thay đổi Thông tin Thương Hiệu, Logo, SĐT, Email**:
   Mở tệp [frontend/src/config/site.config.js](file:///c:/A_Khungbandau/frontend/src/config/site.config.js) để cập nhật.

---

## 📌 Báo Cáo Nghiệm Thu Khung Dự Án

### Những Việc Đã Hoàn Thành (Completed):
- [x] Thiết lập cấu trúc phân chia tách biệt `core/` độc lập với `modules/` nghiệp vụ.
- [x] Tạo Backend Express với JWT Auth, Zod Validation, Response Formatter & Centralized Error Handler.
- [x] Xây dựng Module mẫu `sample` và `auth` chuẩn CRUD.
- [x] Thiết lập Frontend Vite với CSS Design Tokens tập trung (`variables.css`) & HTTP `ApiClient` wrapper (`api.js`).
- [x] Tạo `docker-compose.yml` & `Dockerfile` sẵn sàng chạy container hóa.
- [x] Thêm unit test mẫu với Vitest cho lớp Core.

### Lưu Ý / Tùy Chọn Phát Triển Thêm (Future Recommendations):
- Trường hợp triển khai DB thật production trên Postgres, chạy `npx prisma migrate dev` trong `backend/` để sinh migrations tự động.

---

## Tài liệu vận hành và kiểm thử

- Hướng dẫn cấu hình, chạy local và Docker: `docs/DEVOPS-RUNBOOK.md`.
- Checklist kiểm thử tích hợp và PWA: `docs/TEST-CHECKLIST.md`.
- Postman Collection và môi trường local: `docs/postman/`.
- Kiểm tra nhanh frontend/backend bằng PowerShell: `scripts/health-check.ps1`.
- Hướng dẫn setup, kiểm thử và kịch bản demo hoàn chỉnh: `README_BOILERPLATE.md`.
