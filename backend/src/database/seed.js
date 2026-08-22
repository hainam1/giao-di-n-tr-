import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Trà Thượng Hạng', slug: 'tra-thuong-hang', sortOrder: 1 },
  { name: 'Trà Đặc Sản', slug: 'tra-dac-san', sortOrder: 2 },
  { name: 'Trà Truyền Thống', slug: 'tra-truyen-thong', sortOrder: 3 },
  { name: 'Trà Cổ Thụ', slug: 'tra-co-thu', sortOrder: 4 },
  { name: 'Ấm Tử Sa & Ấm Sứ', slug: 'am-tu-sa-am-su', sortOrder: 5 },
  { name: 'Bộ Chén Trà', slug: 'bo-chen-tra', sortOrder: 6 },
  { name: 'Khay Trà Gỗ Quý', slug: 'khay-tra-go-quy', sortOrder: 7 },
  { name: 'Dụng Cụ Thưởng Trà', slug: 'dung-cu-thuong-tra', sortOrder: 8 },
];

const products = [
  {
    categorySlug: 'tra-thuong-hang', name: 'Trà Đinh Tân Cương Thượng Hạng',
    slug: 'tra-dinh-tan-cuong-thuong-hang', type: 'TEA', sku: 'TD-DINH-500',
    unit: 'Hộp 500g', price: 1500000, weightGrams: 500, stock: 32,
    origin: 'Tân Cương, Thái Nguyên', standard: '1 tôm non sớm mai',
    flavor: 'Hương cốm non, chát dịu, hậu ngọt sâu', packaging: 'Hộp thiếc cao cấp',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'tra-dac-san', name: 'Trà Nõn Tôm Thượng Hạng',
    slug: 'tra-non-tom-thuong-hang', type: 'TEA', sku: 'TD-NONTOM-500',
    unit: 'Hộp 500g', price: 850000, weightGrams: 500, stock: 48,
    origin: 'Tân Cương, Thái Nguyên', standard: '1 tôm 1 lá non',
    flavor: 'Hương mộc thuần khiết, vị đượm đà', packaging: 'Hút chân không, hộp quà',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'tra-truyen-thong', name: 'Trà Móc Câu Hảo Hạng',
    slug: 'tra-moc-cau-hao-hang', type: 'TEA', sku: 'TD-MOCCAU-500',
    unit: 'Hộp 500g', price: 480000, weightGrams: 500, stock: 15,
    origin: 'La Bằng, Thái Nguyên', standard: '1 tôm 2 lá non',
    flavor: 'Hương cốm dịu, hậu ngọt bùi', packaging: 'Hộp giấy thủ công',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'tra-co-thu', name: 'Trà Shan Tuyết Cổ Thụ Hà Giang',
    slug: 'tra-shan-tuyet-co-thu-ha-giang', type: 'TEA', sku: 'TD-SHANTUYET-300',
    unit: 'Hộp 300g', price: 1200000, weightGrams: 300, stock: 8,
    origin: 'Tây Côn Lĩnh, Hà Giang', standard: 'Búp trà cổ thụ',
    flavor: 'Thanh khiết, ngọt mật ong rừng', packaging: 'Hộp gỗ thông',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'am-tu-sa-am-su', name: 'Ấm Tử Sa Thạch Biều Đất Tử Nê',
    slug: 'am-tu-sa-thach-bieu-dat-tu-ne', type: 'TEAWARE', sku: 'TC-TUSA-220',
    unit: 'Chiếc', price: 1850000, volumeMl: 220, stock: 6,
    origin: 'Nghi Hưng', standard: 'Đất Tử Nê nung 1180°C',
    flavor: 'Giữ nhiệt tốt, ngắt nước dứt khoát', packaging: 'Hộp gấm lót lụa',
    image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'bo-chen-tra', name: 'Bộ 6 Chén Sứ Bạch Ngọc Viền Vàng 24K',
    slug: 'bo-6-chen-su-bach-ngoc-vien-vang-24k', type: 'TEAWARE', sku: 'TC-CHEN-24K',
    unit: 'Bộ 6 chén', price: 650000, stock: 7,
    origin: 'Bát Tràng', standard: 'Sứ thấu quang mạ chỉ vàng 24K',
    flavor: 'Lòng chén trắng ngọc', packaging: 'Hộp quà lót lụa',
    image: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'am-tu-sa-am-su', name: 'Ấm Tử Sa Tây Thi Đất Chu Nê',
    slug: 'am-tu-sa-tay-thi-dat-chu-ne', type: 'TEAWARE', sku: 'TC-TAYTHI-180',
    unit: 'Chiếc', price: 1650000, volumeMl: 180, stock: 8,
    origin: 'Triệu Trang', standard: 'Đất Chu Nê thủ công nguyên bản',
    flavor: 'Dòng chảy êm dịu, tôn hương cốm non', packaging: 'Hộp gỗ quà tặng',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'am-tu-sa-am-su', name: 'Ấm Tử Sa Đức Chung Đất Đại Hồng Bào',
    slug: 'am-tu-sa-duc-chung-dat-dai-hong-bao', type: 'TEAWARE', sku: 'TC-DUCHUNG-240',
    unit: 'Chiếc', price: 2200000, volumeMl: 240, stock: 5,
    origin: 'Khoáng đất Đại Hồng Bào', standard: 'Nghệ nhân cao cấp tạo tác',
    flavor: 'Dòng nước mạnh, giữ nhiệt tốt', packaging: 'Hộp gấm thêu rồng',
    image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'am-tu-sa-am-su', name: 'Ấm Sứ Men Lam Cảnh Đức Trấn Vẽ Tay',
    slug: 'am-su-men-lam-canh-duc-tran-ve-tay', type: 'TEAWARE', sku: 'TC-MENLAM-200',
    unit: 'Chiếc', price: 1350000, volumeMl: 200, stock: 9,
    origin: 'Cảnh Đức Trấn', standard: 'Sứ nung củi 1320°C, vẽ tay',
    flavor: 'Lòng men ngọc dễ vệ sinh', packaging: 'Hộp quà truyền thống',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'bo-chen-tra', name: 'Bộ 6 Chén Men Rạn Cổ Bát Tràng',
    slug: 'bo-6-chen-men-ran-co-bat-trang', type: 'TEAWARE', sku: 'TC-CHEN-MENRAN',
    unit: 'Bộ 6 chén', price: 580000, stock: 7,
    origin: 'Bát Tràng', standard: 'Men rạn tam thái truyền thống',
    flavor: 'Giữ nhiệt đầm ấm', packaging: 'Hộp giấy mỹ thuật',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'bo-chen-tra', name: 'Bộ 6 Chén Men Hỏa Biến Thiên Mục Lam',
    slug: 'bo-6-chen-men-hoa-bien-thien-muc-lam', type: 'TEAWARE', sku: 'TC-CHEN-HOABIEN',
    unit: 'Bộ 6 chén', price: 720000, stock: 6,
    origin: 'Nghệ thuật men hỏa biến', standard: 'Màu men biến ảo theo nhiệt độ lò',
    flavor: 'Lòng chén ánh ngọc bích', packaging: 'Hộp chống sốc',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'khay-tra-go-quy', name: 'Khay Trà Gỗ Gụ Khắc Họa Tiết Mây',
    slug: 'khay-tra-go-gu-khac-hoa-tiet-may', type: 'TEAWARE', sku: 'TC-KHAY-GOGU',
    unit: 'Chiếc', price: 1250000, stock: 5,
    origin: 'Đồng Kỵ', standard: 'Gỗ gụ nguyên khối',
    flavor: 'Khay inox hứng nước tháo rời', packaging: 'Thùng gỗ chống sốc',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'khay-tra-go-quy', name: 'Khay Trà Gỗ Mun Hoa Đen Nguyên Khối',
    slug: 'khay-tra-go-mun-hoa-den-nguyen-khoi', type: 'TEAWARE', sku: 'TC-KHAY-GOMUN',
    unit: 'Chiếc', price: 2450000, stock: 3,
    origin: 'Gỗ mun sừng', standard: 'Đục nguyên khối, không chắp ghép',
    flavor: 'Chống thấm, vân hoa đen', packaging: 'Thùng gỗ bảo hộ',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'khay-tra-go-quy', name: 'Khay Trà Tre Tự Nhiên Chống Ẩm Cao Cấp',
    slug: 'khay-tra-tre-tu-nhien-chong-am', type: 'TEAWARE', sku: 'TC-KHAY-TRE',
    unit: 'Chiếc', price: 450000, stock: 12,
    origin: 'Tre già tự nhiên', standard: 'Chống mối mọt, kích thước 38x26cm',
    flavor: 'Thiết kế tối giản phong cách Zen', packaging: 'Hộp carton',
    image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'dung-cu-thuong-tra', name: 'Bộ Dụng Cụ Gắp Trà 6 Món Gỗ Mun',
    slug: 'bo-dung-cu-gap-tra-6-mon-go-mun', type: 'TEAWARE', sku: 'TC-DUNGCU-6MON',
    unit: 'Bộ 6 món', price: 380000, stock: 15,
    origin: 'Thủ công mỹ nghệ truyền thống', standard: 'Gỗ mun tự nhiên',
    flavor: 'Đầy đủ dụng cụ pha trà', packaging: 'Hộp giấy mỹ thuật',
    image: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=600&q=80',
  },
  {
    categorySlug: 'dung-cu-thuong-tra', name: 'Bộ Lọc Trà & Thuyền Trà Bằng Đồng Thủ Công',
    slug: 'bo-loc-tra-thuyen-tra-bang-dong', type: 'TEAWARE', sku: 'TC-LOC-DONG',
    unit: 'Bộ 2 món', price: 320000, stock: 18,
    origin: 'Đồng đỏ nguyên chất', standard: 'Lưới lọc inox 304 siêu mịn',
    flavor: 'Lọc sạch cặn, nước trà trong', packaging: 'Hộp quà thủ công',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
  },
];

async function main() {
  console.log('[Seed] Starting idempotent database seeding...');
  const legalAcceptedAt = new Date('2026-08-22T00:00:00.000Z');

  const [adminPassword, userPassword] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('user123', 10),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tradao.vn' },
    update: { name: 'Quản Trị Viên Trà Đạo', role: 'ADMIN', status: 'ACTIVE', termsAcceptedAt: legalAcceptedAt, privacyAcceptedAt: legalAcceptedAt, termsVersion: '2026-08-22' },
    create: {
      email: 'admin@tradao.vn', password: adminPassword,
      name: 'Quản Trị Viên Trà Đạo', phone: '0988123456', role: 'ADMIN',
      termsAcceptedAt: legalAcceptedAt, privacyAcceptedAt: legalAcceptedAt, termsVersion: '2026-08-22',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'khachhang@gmail.com' },
    update: { name: 'Nguyễn Văn Nam', role: 'USER', status: 'ACTIVE', termsAcceptedAt: legalAcceptedAt, privacyAcceptedAt: legalAcceptedAt, termsVersion: '2026-08-22' },
    create: {
      email: 'khachhang@gmail.com', password: userPassword,
      name: 'Nguyễn Văn Nam', phone: '0912345678', role: 'USER',
      termsAcceptedAt: legalAcceptedAt, privacyAcceptedAt: legalAcceptedAt, termsVersion: '2026-08-22',
    },
  });

  await prisma.address.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001', userId: customer.id,
      label: 'Nhà riêng', recipient: customer.name, phone: '0912345678',
      line1: 'Số 18, Phố Tràng Tiền', district: 'Hoàn Kiếm',
      province: 'Hà Nội', isDefault: true,
    },
  });

  const categoryBySlug = {};
  for (const category of categories) {
    categoryBySlug[category.slug] = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const productBySlug = {};
  const variantBySku = {};
  for (const item of products) {
    const { categorySlug, sku, unit, price, weightGrams, volumeMl, stock, image, ...productData } = item;
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        ...productData, categoryId: categoryBySlug[categorySlug].id,
        status: 'ACTIVE', isFeatured: true,
      },
      create: {
        ...productData, categoryId: categoryBySlug[categorySlug].id,
        status: 'ACTIVE', isFeatured: true, publishedAt: new Date(),
      },
    });
    productBySlug[product.slug] = product;

    const variant = await prisma.productVariant.upsert({
      where: { sku },
      update: { productId: product.id, name: unit, unit, price, weightGrams, volumeMl, isActive: true },
      create: { productId: product.id, sku, name: unit, unit, price, weightGrams, volumeMl },
    });
    variantBySku[sku] = variant;

    await prisma.inventory.upsert({
      where: { variantId: variant.id },
      update: { quantity: stock },
      create: { variantId: variant.id, quantity: stock },
    });

    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id, isPrimary: true },
    });
    if (existingImage) {
      await prisma.productImage.update({ where: { id: existingImage.id }, data: { url: image, altText: product.name } });
    } else {
      await prisma.productImage.create({ data: { productId: product.id, url: image, altText: product.name, isPrimary: true } });
    }
  }

  const standardShipping = await prisma.shippingMethod.upsert({
    where: { code: 'STANDARD' },
    update: {
      name: 'Giao hàng tiêu chuẩn', carrier: 'Đối tác vận chuyển',
      baseFee: 30000, estimatedMinDays: 2, estimatedMaxDays: 4, isActive: true,
    },
    create: {
      code: 'STANDARD', name: 'Giao hàng tiêu chuẩn', carrier: 'Đối tác vận chuyển',
      baseFee: 30000, estimatedMinDays: 2, estimatedMaxDays: 4,
    },
  });

  const clearanceVoucher = await prisma.voucher.upsert({
    where: { code: 'XATON20' },
    update: {
      name: 'Voucher Xả Tồn 20%', discountType: 'PERCENTAGE', discountValue: 20,
      minimumOrderValue: 300000, maximumDiscount: 500000,
      usageLimit: 100, usageLimitPerUser: 1, isActive: true,
    },
    create: {
      code: 'XATON20', name: 'Voucher Xả Tồn 20%',
      description: 'Ưu đãi cho nhóm sản phẩm cần tối ưu tồn kho',
      discountType: 'PERCENTAGE', discountValue: 20,
      minimumOrderValue: 300000, maximumDiscount: 500000,
      usageLimit: 100, usageLimitPerUser: 1,
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      expiresAt: new Date('2026-12-31T23:59:59.000Z'),
    },
  });

  await prisma.voucherCategory.upsert({
    where: {
      voucherId_categoryId: {
        voucherId: clearanceVoucher.id,
        categoryId: categoryBySlug['khay-tra-go-quy'].id,
      },
    },
    update: {},
    create: {
      voucherId: clearanceVoucher.id,
      categoryId: categoryBySlug['khay-tra-go-quy'].id,
    },
  });

  const teaVariant = variantBySku['TD-NONTOM-500'];
  const order = await prisma.order.upsert({
    where: { code: 'ORD-1024' },
    update: {},
    create: {
      code: 'ORD-1024', userId: customer.id, status: 'CONFIRMED',
      customerName: customer.name, customerEmail: customer.email, customerPhone: '0912345678',
      shippingAddress: 'Số 18, Phố Tràng Tiền', shippingDistrict: 'Hoàn Kiếm',
      shippingProvince: 'Hà Nội', subtotal: 1700000, shippingFee: 30000, totalAmount: 1730000,
      items: { create: [{
        variantId: teaVariant.id, productName: 'Trà Nõn Tôm Thượng Hạng',
        sku: teaVariant.sku, unit: teaVariant.unit, unitPrice: 850000, quantity: 2, subtotal: 1700000,
      }] },
      payments: { create: [{ method: 'VIETQR', status: 'PAID', amount: 1730000, paidAt: new Date() }] },
      statusHistory: { create: [
        { status: 'PENDING', note: 'Đơn hàng được tạo thành công' },
        { status: 'CONFIRMED', note: 'Đã xác nhận thanh toán', changedBy: admin.id },
      ] },
    },
  });

  await prisma.shipment.upsert({
    where: { orderId: order.id },
    update: { shippingMethodId: standardShipping.id },
    create: {
      orderId: order.id, shippingMethodId: standardShipping.id,
      carrier: standardShipping.carrier, status: 'PENDING',
      estimatedDelivery: new Date('2026-08-25T00:00:00.000Z'),
    },
  });

  await prisma.productionBatch.upsert({
    where: { code: 'MSC-2026-09' },
    update: {},
    create: {
      code: 'MSC-2026-09', roastedAt: new Date('2026-08-21T00:00:00.000Z'),
      artisanName: 'Nghệ nhân Nguyễn Văn Thái', teaType: 'Trà Nõn Tôm',
      weightKg: 40, qualityScore: 9.8, notes: 'Hương cốm thơm đượm, cánh trà xoăn nhỏ đều',
      items: { create: [{ variantId: teaVariant.id, quantity: 80 }] },
    },
  });

  const reviewProduct = productBySlug['tra-dinh-tan-cuong-thuong-hang'];
  const existingReview = await prisma.review.findFirst({
    where: { productId: reviewProduct.id, userId: customer.id },
  });
  if (!existingReview) {
    await prisma.review.create({
      data: {
        productId: reviewProduct.id, userId: customer.id, authorName: customer.name,
        rating: 5, content: 'Trà thơm hương cốm, hậu ngọt sâu và đóng gói rất cẩn thận.',
        status: 'PINNED', isVerifiedBuyer: true, moderatedBy: admin.id, moderatedAt: new Date(),
        replies: { create: [{ authorId: admin.id, content: 'Cảm ơn quý khách đã tin tưởng Trà Đạo.' }] },
      },
    });
  }

  const testimonialContent = 'Không gian thưởng trà tinh tế, trà thơm và hậu vị rất dễ chịu.';
  const existingTestimonial = await prisma.testimonial.findFirst({
    where: { userId: customer.id, content: testimonialContent },
  });
  if (!existingTestimonial) {
    await prisma.testimonial.create({
      data: {
        userId: customer.id,
        authorName: customer.name,
        content: testimonialContent,
        rating: 5,
        status: 'PINNED',
        isPinned: true,
      },
    });
  }

  await prisma.contactInquiry.upsert({
    where: { id: '00000000-0000-4000-8000-000000000002' },
    update: {
      needType: 'Quà biếu cao cấp',
      productInterest: '5 hộp Trà Đinh lót lụa',
    },
    create: {
      id: '00000000-0000-4000-8000-000000000002', fullName: 'Trần Thị Mai',
      phone: '0903741701', need: 'Tư vấn trà làm quà biếu',
      needType: 'Quà biếu cao cấp', productInterest: '5 hộp Trà Đinh lót lụa',
      status: 'NEW',
    },
  });

  const existingNotification = await prisma.notification.findFirst({
    where: { userId: admin.id, type: 'NEW_ORDER', data: { path: ['orderCode'], equals: order.code } },
  });
  if (!existingNotification) {
    await prisma.notification.create({
      data: {
        userId: admin.id, type: 'NEW_ORDER', title: 'Đơn hàng mới #ORD-1024',
        message: 'Nguyễn Văn Nam vừa đặt 2 hộp Trà Nõn Tôm.',
        data: { orderId: order.id, orderCode: order.code },
      },
    });
  }

  await prisma.sampleItem.upsert({
    where: { id: '00000000-0000-4000-8000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000003',
      title: 'Sản phẩm mẫu', description: 'Giữ tương thích module sample', price: 150000,
    },
  });

  console.log('[Seed] Database seeded successfully.');
  console.log(`[Seed] Admin: ${admin.email} | Customer: ${customer.email}`);
}

main()
  .catch((error) => {
    console.error('[Seed Error]', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
