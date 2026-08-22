import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(9).max(15),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Bạn phải đồng ý điều khoản dịch vụ' }),
    }),
    acceptPrivacy: z.literal(true, {
      errorMap: () => ({ message: 'Bạn phải đồng ý chính sách bảo mật' }),
    }),
    termsVersion: z.string().min(1).default('2026-08-22'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(9).max(15).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    note: z.string().max(1000).nullable().optional(),
    address: z.object({
      recipient: z.string().min(2),
      phone: z.string().min(9).max(15),
      line1: z.string().min(3),
      ward: z.string().nullable().optional(),
      district: z.string().nullable().optional(),
      province: z.string().min(2),
    }).optional(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({ refreshToken: z.string().min(32) }),
});

export const logoutSchema = refreshTokenSchema;

const addressBody = z.object({
  label: z.string().max(100).nullable().optional(),
  recipient: z.string().min(2).max(150),
  phone: z.string().min(9).max(15),
  line1: z.string().min(3).max(300),
  ward: z.string().max(150).nullable().optional(),
  district: z.string().max(150).nullable().optional(),
  province: z.string().min(2).max(150),
  postalCode: z.string().max(20).nullable().optional(),
  isDefault: z.boolean().optional(),
});

export const createAddressSchema = z.object({ body: addressBody });
export const updateAddressSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: addressBody.partial().refine((data) => Object.keys(data).length > 0, 'Không có dữ liệu cập nhật'),
});
export const addressIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
