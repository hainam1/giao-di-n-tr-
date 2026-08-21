import { z } from 'zod';

export const createSampleSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Tiêu đề tối thiểu 3 ký tự'),
    description: z.string().optional(),
    price: z.number().min(0, 'Giá tiền không được âm').default(0),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateSampleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID bắt buộc'),
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const getSampleByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID bắt buộc'),
  }),
});
