# DevOps runbook

## Yêu cầu

- Docker Desktop đang ở trạng thái Engine running.
- Hoặc Node.js 20 và PostgreSQL 15 nếu chạy trực tiếp.

## Cấu hình

Sao chép các file mẫu và thay secret dùng riêng trên máy:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Không commit các file `.env`.

## Chạy bằng Docker

```powershell
docker compose config
docker compose up -d --build
docker compose ps
powershell -ExecutionPolicy Bypass -File scripts/health-check.ps1
```

Các địa chỉ local:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

Xem log:

```powershell
docker compose logs --tail 100
docker compose logs -f backend
```

Dừng hệ thống nhưng giữ dữ liệu PostgreSQL:

```powershell
docker compose down
```

Chỉ dùng `docker compose down -v` khi chủ động muốn xóa toàn bộ dữ liệu database local.

## Chạy trực tiếp

Terminal backend:

```powershell
cd backend
npm ci
npm run prisma:generate
npm run dev
```

Terminal frontend:

```powershell
cd frontend
npm ci
npm run dev
```

## Kiểm thử

```powershell
cd backend
npm test

cd ../frontend
npm run build
```

Import hai file trong `docs/postman/` vào Postman để kiểm tra API. Cập nhật request body theo contract cuối cùng của backend trước vòng nghiệm thu.
