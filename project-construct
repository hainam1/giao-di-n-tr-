# Cấu Trúc Dự Án Full-Stack: (giao-di-n-tr-)

Cập nhật lần cuối: 2026-08-21

---

## 📁 Sơ Đồ Cấu Trúc Thư Mục & File Chuẩn

```text
c:/A_Khungbandau/
├── 📁 backend/                  # RESTful API Service (Express.js + Node.js)
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
│   ├── 📁 tests/                # Unit Tests (Vitest)
│   ├── .env.example             # Cấu hình biến môi trường backend mẫu
│   ├── Dockerfile               # Container build file cho backend
│   └── package.json
│
├── 📁 frontend/                 # Web Application Frontend (Vite Build Tool)
│   ├── 📁 src/
│   │   ├── 📁 config/           # Cấu hình site tập trung (site.config.js)
│   │   ├── 📁 core/             # HTTP ApiClient wrapper (api.js)
│   │   └── 📁 styles/           # Design Tokens tập trung (variables.css)
│   ├── 📄 index.html            # Trang chủ
│   ├── 📄 products.html         # Danh sách sản phẩm
│   ├── 📄 product-detail.html   # Chi tiết sản phẩm
│   ├── 📄 teaware.html          # Dụng cụ trà
│   ├── 📄 story.html            # Câu chuyện thương hiệu
│   ├── 📄 contact.html          # Liên hệ
│   ├── 📄 auth.html             # Đăng nhập / Đăng ký
│   ├── 📄 admin.html            # Admin Dashboard
│   ├── Dockerfile               # Container build file cho frontend
│   ├── vite.config.js           # Cấu hình Vite multi-page & proxy server
│   └── package.json
│
├── 📄 docker-compose.yml        # Docker orchestration (PostgreSQL + Backend + Frontend)
├── 📄 README.md                 # Hướng dẫn chi tiết cách chạy & mở rộng dự án
├── 📄 prompt-dung-khung-du-an.md# Yêu cầu prompt gốc
└── 📄 project-construct.md      # Sơ đồ cấu trúc dự án
```

---

## 📋 Chi Tiết Danh Sách Thư Mục & Tệp Cốt Lõi

| Thành Phần | Đường Dẫn | Chức Năng Chính |
|---|---|---|
| **Backend Core** | `backend/src/core/` | Middleware tập trung: Auth JWT, Validation Zod, Catch Error, Response Formatter |
| **Backend Modules** | `backend/src/modules/` | Mô-đun nghiệp vụ (Auth, Sample CRUD...) |
| **Backend Database** | `backend/src/database/` | Prisma ORM Schema & Database Seed Script |
| **Frontend Core** | `frontend/src/core/` | Wrapper API Client kết nối HTTP |
| **Frontend Tokens** | `frontend/src/styles/` | Biến CSS Design Tokens đổi theme toàn website |
| **Frontend Web App** | `frontend/*.html` | Giao diện các trang web chạy trên Vite Dev Server |
| **DevOps** | `docker-compose.yml` | Khởi chạy toàn bộ hệ thống bằng Docker container |
| **Tài liệu** | `README.md` | Hướng dẫn phát triển & mở rộng dự án |
