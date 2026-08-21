import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting Database Seeding...');

  // Xóa sạch dữ liệu cũ
  await prisma.sampleItem.deleteMany();
  await prisma.user.deleteMany();

  // Tạo tài khoản Admin & User mẫu
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@boilerplate.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@boilerplate.com',
      password: userPassword,
      name: 'Demo User',
      role: 'USER',
    },
  });

  // Tạo dữ liệu mẫu cho SampleItem
  await prisma.sampleItem.createMany({
    data: [
      { title: 'Sản phẩm mẫu A', description: 'Mô tả chi tiết sản phẩm mẫu A', price: 150000, status: 'active' },
      { title: 'Sản phẩm mẫu B', description: 'Mô tả chi tiết sản phẩm mẫu B', price: 250000, status: 'active' },
      { title: 'Sản phẩm mẫu C', description: 'Mô tả chi tiết sản phẩm mẫu C', price: 350000, status: 'inactive' },
    ],
  });

  console.log('[Seed] Database seeded successfully!');
  console.log(`[Seed] Admin Email: ${admin.email}`);
  console.log(`[Seed] User Email: ${user.email}`);
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
