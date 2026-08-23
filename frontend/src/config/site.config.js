/**
 * TẬP TRUNG CẤU HÌNH SITE (CONFIG TẬP TRUNG CHO DỰ ÁN)
 * Đổi tên website, logo, thông tin liên hệ, API endpoint ở đây mà không cần sửa code giao diện
 */

export const siteConfig = {
  name: 'Trà Đạo Thái Nguyên',
  shortName: 'Trà Đạo',
  slogan: 'Tinh Hoa Trà Việt - Đậm Đà Hương Vị Quê Hương',
  logo: '/assets/logo.png',
  contact: {
    phone: '0988 123 456',
    email: 'lienhe@tradaothainguyen.vn',
    address: 'Số 123, Đường Tân Cương, TP. Thái Nguyên',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },
  social: {
    facebook: 'https://facebook.com/tradaothainguyen',
    zalo: 'https://zalo.me/0988123456',
  },
  theme: {
    defaultMode: 'light',
  },
};
