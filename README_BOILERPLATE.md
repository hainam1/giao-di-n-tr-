# Trà Đạo Thái Nguyên - Setup, kiểm thử và demo

## Yêu cầu

- Node.js 20 trở lên.
- PostgreSQL 15–17 và pgAdmin 4.
- Cổng local: PostgreSQL `5432`, Backend `5000`, Frontend `3000`.

## Cài dependency

```powershell
cd backend
npm ci
npm run prisma:generate

cd ../frontend
npm ci
```

## PostgreSQL local

Tạo database `boilerplate_db`, sau đó tạo `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:MAT_KHAU@localhost:5432/boilerplate_db?schema=public"
JWT_SECRET=thay_bang_chuoi_bi_mat_khi_trien_khai
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

Không commit file `.env`.

Đồng bộ schema và seed:

```powershell
cd backend
npx prisma db push --schema=src/database/prisma/schema.prisma
npm run prisma:seed
```

Seed hiện tạo 32 bảng cùng dữ liệu sản phẩm, kho, voucher, đơn hàng và tài khoản demo.

## Chạy trực tiếp

Terminal 1:

```powershell
cd backend
npm run dev
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

Truy cập:

- Storefront: http://localhost:3000
- Đăng nhập: http://localhost:3000/auth.html
- Admin: http://localhost:3000/admin.html
- Mobile nội bộ: http://localhost:3000/mobile.html
- Backend health: http://localhost:5000/health

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@tradao.vn` | `admin123` |
| Khách hàng | `khachhang@gmail.com` | `user123` |

Voucher demo: `XATON20`.

## Kiểm thử

```powershell
cd backend
npm run prisma:generate
npm test

cd ..
powershell -ExecutionPolicy Bypass -File scripts/api-smoke-test.ps1

cd frontend
npm run build
npm run test:e2e
```

Kết quả chuẩn ngày 2026-08-26:

- Backend: 20/20 test đạt.
- API smoke test: 39/39 kiểm tra đạt.
- Frontend production build: thành công.
- Frontend Playwright E2E: 7/7 luồng đạt trên Chrome headless.

Import Postman:

- `docs/postman/Tra-Thai-Nguyen.postman_collection.json`
- `docs/postman/Local.postman_environment.json`

## Prisma Studio

```powershell
cd backend
npx prisma studio
```

Mở http://localhost:5555.

## Kịch bản demo

1. Mở `/health` và cho xem PostgreSQL có 32 bảng.
2. Chạy 20 test backend và smoke test API.
3. Đăng nhập khách hàng, xem sản phẩm và thêm vào giỏ.
4. Áp voucher `XATON20`, chọn COD hoặc VietQR và tạo đơn.
5. Đăng nhập Admin, xem đơn và chuyển trạng thái.
6. Tạo vận đơn, sau đó kiểm tra lịch sử đơn phía khách hàng.
7. Mở giao diện Mobile nội bộ.
8. Trình diễn cài đặt/offline sau khi Manifest và Service Worker được bàn giao.

## Trạng thái PWA

PWA chưa thể nghiệm thu vì repository hiện chưa có Manifest, Service Worker và bộ icon cài đặt. Người phụ trách PWA cần bàn giao các thành phần này trước khi Người 4 test Android/iOS và Lighthouse.

## Lưu ý

- Không chạy PostgreSQL Docker trên cổng `5432` cùng lúc với PostgreSQL local.
- Không chạy `npm audit fix --force` nếu chưa kiểm tra breaking change.
- Xem checklist nghiệm thu tại `docs/TEST-CHECKLIST.md`.
