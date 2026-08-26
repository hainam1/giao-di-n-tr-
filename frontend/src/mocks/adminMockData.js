/**
 * Mock Data for Admin & Mobile Companion (Phase 1)
 * Designed for immediate client-side rendering & seamless Phase 2 backend integration.
 * Includes 2-Tier Master-Detail Voucher Architecture (PN- / PX-) with Line Items & Batch Tracking.
 */

export const mockDashboardData = {
  summary: {
    totalRevenue: 128500000,
    totalOrders: 342,
    totalCustomers: 215,
    lowStockCount: 3,
    pendingOrdersCount: 5,
    revenueGrowth: "+14.2%"
  },
  recentOrders: [
    {
      id: "ORD-9821",
      customerName: "Nguyễn Văn An",
      customerPhone: "0912345678",
      shippingAddress: "Số 45 Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội",
      totalAmount: 1450000,
      status: "PENDING",
      createdAt: "2026-08-23T14:30:00Z",
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      items: [
        { productId: "TD-TC-100", productName: "Trà Đinh Tân Cương (100g)", price: 350000, quantity: 2 },
        { productId: "AT-TC-01", productName: "Bộ Ấm Trà Tử Châu Bát Tràng", price: 750000, quantity: 1 }
      ]
    },
    {
      id: "ORD-9820",
      customerName: "Trần Thị Bình",
      customerPhone: "0987654321",
      shippingAddress: "Số 12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      totalAmount: 980000,
      status: "PROCESSING",
      createdAt: "2026-08-23T11:15:00Z",
      paymentMethod: "BANK_TRANSFER",
      paymentStatus: "PAID",
      items: [
        { productId: "NT-TC-200", productName: "Trà Nõn Tôm Đặc Sản (200g)", price: 490000, quantity: 2 }
      ]
    },
    {
      id: "ORD-9819",
      customerName: "Lê Hoàng Nam",
      customerPhone: "0905123456",
      shippingAddress: "Số 88 Trần Phú, Q. Hải Châu, Đà Nẵng",
      totalAmount: 2100000,
      status: "SHIPPING",
      createdAt: "2026-08-22T16:45:00Z",
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      items: [
        { productId: "MC-DT-500", productName: "Trà Móc Cầu Truyền Thống (500g)", price: 700000, quantity: 3 }
      ]
    },
    {
      id: "ORD-9818",
      customerName: "Phạm Thị Hương",
      customerPhone: "0934888999",
      shippingAddress: "Số 56 Lê Lợi, TP. Thái Nguyên",
      totalAmount: 1750000,
      status: "COMPLETED",
      createdAt: "2026-08-22T09:20:00Z",
      paymentMethod: "BANK_TRANSFER",
      paymentStatus: "PAID",
      items: [
        { productId: "TD-TC-100", productName: "Trà Đinh Tân Cương (100g)", price: 350000, quantity: 5 }
      ]
    }
  ]
};

export const mockOrders = mockDashboardData.recentOrders;

export const mockProducts = [
  {
    id: "PROD-01",
    name: "Trà Đinh Tân Cương Thượng Hạng (100g)",
    sku: "TD-TC-100",
    category: "Trà Đinh",
    price: 350000,
    costPrice: 220000,
    stock: 28,
    soldQuantity: 142,
    unit: "Gói",
    weight: "100g",
    status: "ACTIVE",
    isWebOnline: true,
    description: "Thu hái 1 tôm 1 lá tự tay từ vùng chè Tân Cương Thái Nguyên. Hương thơm cốm nếp, nước trà xanh sánh dịu.",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80"
  },
  {
    id: "PROD-02",
    name: "Trà Nõn Tôm Đặc Sản (200g)",
    sku: "NT-TC-200",
    category: "Trà Nõn Tôm",
    price: 490000,
    costPrice: 310000,
    stock: 8,
    soldQuantity: 98,
    unit: "Gói",
    weight: "200g",
    status: "ACTIVE",
    isWebOnline: true,
    description: "Tuyển chọn nõn trà tôm tươi ngon mùa thu. Vị chát dịu nhẹ, hậu ngọt sâu kéo dài.",
    imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&q=80"
  },
  {
    id: "PROD-03",
    name: "Bộ Ấm Trà Tử Châu Bát Tràng (Bộ 6 Chén)",
    sku: "AT-TC-01",
    category: "Trà Cụ",
    price: 750000,
    costPrice: 480000,
    stock: 12,
    soldQuantity: 45,
    unit: "Bộ",
    weight: "Bộ 6 chén",
    status: "ACTIVE",
    isWebOnline: true,
    description: "Ấm gốm Tử Châu thủ công Bát Tràng gia công nhiệt độ cao, giữ trọn hương vị trà đạo.",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&q=80"
  },
  {
    id: "PROD-04",
    name: "Trà Móc Cầu Truyền Thống (500g)",
    sku: "MC-DT-500",
    category: "Trà Móc Cầu",
    price: 700000,
    costPrice: 450000,
    stock: 3,
    soldQuantity: 64,
    unit: "Gói",
    weight: "500g",
    status: "ACTIVE",
    isWebOnline: true,
    description: "Cánh trà xoăn chặt như móc câu, nước trà đậm đà truyền thống chuẩn vị Thái Nguyên.",
    imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&q=80"
  }
];

export const mockInventory = [
  {
    variantId: "TD-TC-100",
    productId: "PROD-01",
    productName: "Trà Đinh Tân Cương (100g)",
    sku: "TD-TC-100",
    category: "TEA", // 'TEA' | 'TEAWARE'
    supplierName: "Xưởng Trà Tân Cương Thái Nguyên",
    location: "Kho A - Xưởng Tân Cương",
    currentStock: 28,
    reservedStock: 3,
    minThreshold: 10,
    unit: "Gói",
    status: "NORMAL"
  },
  {
    variantId: "NT-TC-200",
    productId: "PROD-02",
    productName: "Trà Nõn Tôm Đặc Sản (200g)",
    sku: "NT-TC-200",
    category: "TEA",
    supplierName: "Xưởng Trà Tân Cương Thái Nguyên",
    location: "Kho B - Showroom Hà Nội",
    currentStock: 8, // Medium level (5 < Stock <= 10)
    reservedStock: 1,
    minThreshold: 8,
    unit: "Gói",
    status: "MEDIUM_STOCK"
  },
  {
    variantId: "AT-TC-01",
    productId: "PROD-03",
    productName: "Bộ Ấm Trà Tử Châu Bát Tràng",
    sku: "AT-TC-01",
    category: "TEAWARE",
    supplierName: "Xưởng Gốm Sứ Bát Tràng",
    location: "Kho B - Showroom Hà Nội",
    currentStock: 12,
    reservedStock: 0,
    minThreshold: 5,
    unit: "Bộ",
    status: "NORMAL"
  },
  {
    variantId: "MC-DT-500",
    productId: "PROD-04",
    productName: "Trà Móc Cầu Truyền Thống (500g)",
    sku: "MC-DT-500",
    category: "TEA",
    supplierName: "Nông Trường Chè Đại Từ",
    location: "Kho A - Xưởng Tân Cương",
    currentStock: 3, // Low level (Stock <= 5)
    reservedStock: 2,
    minThreshold: 10,
    unit: "Gói",
    status: "CRITICAL"
  }
];

// 2-Tier Master-Detail Vouchers / Receipts Data Architecture
export const mockVouchers = [
  {
    id: "PN-20260822-01",
    voucherType: "IMPORT", // IMPORT (Nhập Kho) | EXPORT (Xuất Kho)
    subType: "PURCHASE", // PURCHASE (Mua hàng) | RETURN (Trả hàng) | DAMAGE (Phế phẩm)
    partnerName: "Xưởng Trà Tân Cương Thái Nguyên",
    partnerPhone: "0912345678",
    creator: "Trần Văn Kho",
    approver: "Quản Lý Nguyễn Văn Trà",
    createdAt: "2026-08-22T14:30:00Z",
    status: "COMPLETED", // DRAFT | PENDING | APPROVED | COMPLETED | CANCELLED
    paymentStatus: "PAID", // PAID (Đã thanh toán) | DEBT (Còn nợ)
    paymentAmount: 6600000,
    totalQuantity: 50,
    totalAmount: 6600000,
    note: "Nhập đợt chè búp Tân Cương mới sấy khô đợt 2 tháng 8",
    lineItems: [
      {
        sku: "TD-TC-100",
        productName: "Trà Đinh Tân Cương (100g)",
        unit: "Gói",
        weight: "100g",
        quantity: 20,
        unitPrice: 120000,
        totalAmount: 2400000,
        batchCode: "BATCH-2026-08A",
        expiryDate: "2027-08-20",
        location: "Kho A - Xưởng Tân Cương",
        stockBefore: 8,
        stockAfter: 28
      },
      {
        sku: "NT-TC-200",
        productName: "Trà Nõn Tôm Đặc Sản (200g)",
        unit: "Gói",
        weight: "200g",
        quantity: 30,
        unitPrice: 140000,
        totalAmount: 4200000,
        batchCode: "BATCH-2026-08B",
        expiryDate: "2027-08-22",
        location: "Kho B - Showroom Hà Nội",
        stockBefore: 5,
        stockAfter: 35
      }
    ]
  },
  {
    id: "PX-20260821-01",
    voucherType: "EXPORT",
    subType: "DAMAGE",
    partnerName: "Nội Bộ Cửa Hàng - Hàng Hư Hỏng",
    partnerPhone: "0900000000",
    creator: "Nguyễn Văn An",
    approver: "Quản Lý Nguyễn Văn Trà",
    createdAt: "2026-08-21T10:15:00Z",
    status: "COMPLETED",
    paymentStatus: "N/A",
    paymentAmount: 0,
    totalQuantity: 3,
    totalAmount: 1350000,
    note: "Hàng hư rách bao bì khi vận chuyển đường xa",
    lineItems: [
      {
        sku: "MC-DT-500",
        productName: "Trà Móc Cầu Truyền Thống (500g)",
        unit: "Gói",
        weight: "500g",
        quantity: -3,
        unitPrice: 450000,
        totalAmount: 1350000,
        batchCode: "BATCH-2026-07C",
        expiryDate: "2027-07-15",
        location: "Kho A - Xưởng Tân Cương",
        stockBefore: 5,
        stockAfter: 2
      }
    ]
  },
  {
    id: "PN-20260820-02",
    voucherType: "IMPORT",
    subType: "ADJUSTMENT",
    partnerName: "Xưởng Gốm Sứ Bát Tràng",
    partnerPhone: "0988777666",
    creator: "Trần Văn Kho",
    approver: "Quản Lý Nguyễn Văn Trà",
    createdAt: "2026-08-20T16:00:00Z",
    status: "COMPLETED",
    paymentStatus: "PAID",
    paymentAmount: 2400000,
    totalQuantity: 5,
    totalAmount: 2400000,
    note: "Kiểm kê bổ sung từ xưởng Bát Tràng về kho Hà Nội",
    lineItems: [
      {
        sku: "AT-TC-01",
        productName: "Bộ Ấm Trà Tử Châu Bát Tràng",
        unit: "Bộ",
        weight: "Bộ 6 chén",
        quantity: 5,
        unitPrice: 480000,
        totalAmount: 2400000,
        batchCode: "BATCH-BT-2026-01",
        expiryDate: "Không hạn",
        location: "Kho B - Showroom Hà Nội",
        stockBefore: 7,
        stockAfter: 12
      }
    ]
  }
];

export const mockInventoryLogs = [
  {
    id: "LOG-101",
    voucherId: "PN-20260822-01",
    productName: "Trà Đinh Tân Cương (100g)",
    sku: "TD-TC-100",
    type: "IMPORT",
    amount: 20,
    reason: "Nhập thành phẩm mẻ BATCH-2026-08A",
    operator: "Trần Văn Kho",
    createdAt: "2026-08-22T14:30:00Z"
  },
  {
    id: "LOG-102",
    voucherId: "PX-20260821-01",
    productName: "Trà Móc Cầu Truyền Thống (500g)",
    sku: "MC-DT-500",
    type: "DAMAGE",
    amount: -3,
    reason: "Hàng hư rách bao bì khi vận chuyển",
    operator: "Nguyễn Văn An",
    createdAt: "2026-08-21T10:15:00Z"
  },
  {
    id: "LOG-103",
    voucherId: "PN-20260820-02",
    productName: "Bộ Ấm Trà Tử Châu Bát Tràng",
    sku: "AT-TC-01",
    type: "ADJUSTMENT",
    amount: 5,
    reason: "Kiểm kê bổ sung từ xưởng Bát Tràng",
    operator: "Trần Văn Kho",
    createdAt: "2026-08-20T16:00:00Z"
  }
];

export const mockTeaBatches = [
  {
    id: "BATCH-2026-08A",
    name: "Mẻ Trà Đinh Tân Cương #08A",
    pickDate: "2026-08-20",
    rawLeafKg: 120,
    finishedTeaKg: 22,
    yieldRatio: "18.3%",
    artisan: "Nghệ nhân Nguyễn Văn Trà",
    status: "COMPLETED"
  },
  {
    id: "BATCH-2026-08B",
    name: "Mẻ Trà Nõn Tôm Sớm Mai #08B",
    pickDate: "2026-08-22",
    rawLeafKg: 180,
    finishedTeaKg: 35,
    yieldRatio: "19.4%",
    artisan: "Nghệ nhân Trần Thị Nõn",
    status: "PROCESSING"
  }
];

export const mockReviews = [
  {
    id: "REV-101",
    authorName: "Đặng Tiến Dũng",
    rating: 5,
    comment: "Trà Đinh thơm nức tiếng, nước trà xanh sánh dịu. Đóng gói rất cẩn thận!",
    status: "APPROVED",
    createdAt: "2026-08-21T15:20:00Z"
  },
  {
    id: "REV-102",
    authorName: "Vũ Thanh Hằng",
    rating: 5,
    comment: "Bộ ấm Tử Châu pha trà giữ nhiệt rất tốt. Shop tư vấn chu đáo.",
    status: "PENDING",
    createdAt: "2026-08-22T08:10:00Z"
  }
];

export const mockAnalytics = {
  topSellingProducts: [
    { name: "Trà Đinh Tân Cương (100g)", sales: 142 },
    { name: "Trà Nõn Tôm Đặc Sản (200g)", sales: 98 },
    { name: "Bộ Ấm Trà Tử Châu Bát Tràng", sales: 45 }
  ],
  revenueByMonth: [
    { month: "Tháng 5", revenue: 85000000 },
    { month: "Tháng 6", revenue: 98000000 },
    { month: "Tháng 7", revenue: 112000000 },
    { month: "Tháng 8", revenue: 128500000 }
  ]
};

export const mockMobileData = {
  user: {
    name: "Nguyễn Văn Trà",
    role: "Quản Trị Viên & Khách Hàng Thân Thiết",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
  },
  quickStats: {
    pendingOrders: 2,
    shippingOrders: 1,
    completedOrders: 4
  }
};
