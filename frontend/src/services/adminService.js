/**
 * Admin & Mobile Data Service (Phase 1 & Phase 2 Ready)
 * Abstracted data layer that switches between Mock Data (Phase 1)
 * and Real API Backend calls (Phase 2).
 */

import {
  mockDashboardData,
  mockOrders,
  mockProducts,
  mockInventory,
  mockTeaBatches,
  mockInventoryLogs,
  mockVouchers,
  mockAnalytics,
  mockReviews,
  mockMobileData
} from '../mocks/adminMockData.js';

import { ApiClient } from '../core/api.js';

// Configuration toggle (Set to false for Real API endpoints)
export const USE_MOCK = false;


// Helper to simulate network latency for realistic loading UI behavior in Phase 1
const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

export const adminService = {
  /**
   * Get Dashboard Summary & Overview Stats
   */
  async getDashboardData() {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, data: mockDashboardData };
    }
    return await ApiClient.get('/admin/dashboard');
  },

  /**
   * Get Orders List with Optional Status Filter
   */
  async getOrders(statusFilter = 'ALL') {
    if (USE_MOCK) {
      await delay(250);
      let orders = [...mockOrders];
      if (statusFilter !== 'ALL') {
        orders = orders.filter(o => o.status === statusFilter);
      }
      return { success: true, data: orders };
    }
    const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
    return await ApiClient.get(`/admin/orders${query}`);
  },

  /**
   * Get Order Detail joined with current inventory stock info
   */
  async getOrderDetailWithStock(orderId) {
    if (USE_MOCK) {
      await delay(200);
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) return { success: false, error: 'Không tìm thấy đơn hàng' };

      const itemsWithStock = (order.items || []).map(item => {
        const invItem = mockInventory.find(i => i.productName.includes(item.productName) || item.productName.includes(i.productName));
        return {
          ...item,
          currentStock: invItem ? invItem.currentStock : 20,
          location: invItem ? invItem.location : 'Kho A',
          unit: invItem ? invItem.unit : 'Gói'
        };
      });

      return {
        success: true,
        data: {
          ...order,
          itemsWithStock
        }
      };
    }
    return await ApiClient.get(`/admin/orders/${orderId}`);
  },

  /**
   * Update Order Status
   */
  async updateOrderStatus(orderId, newStatus) {
    if (USE_MOCK) {
      await delay(300);
      const targetOrder = mockOrders.find(o => o.id === orderId);
      if (targetOrder) {
        targetOrder.status = newStatus;
        return { success: true, data: targetOrder, message: `Đã duyệt và cập nhật đơn ${orderId} sang ${newStatus}` };
      }
      return { success: false, error: "Đơn hàng không tồn tại" };
    }
    return await ApiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
  },

  /**
   * Get Products List with Web Visibility Status
   */
  async getProducts(searchQuery = '') {
    if (USE_MOCK) {
      await delay(200);
      let products = mockProducts.map(p => ({
        ...p,
        isWebOnline: p.isWebOnline !== undefined ? p.isWebOnline : true
      }));
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      }
      return { success: true, data: products };
    }
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    return await ApiClient.get(`/admin/products${query}`);
  },

  /**
   * Toggle Product Online/Offline Status on Website from Mobile
   */
  async toggleProductWebStatus(productId) {
    if (USE_MOCK) {
      await delay(200);
      const p = mockProducts.find(prod => prod.id === productId || prod.sku === productId);
      if (p) {
        p.isWebOnline = !(p.isWebOnline !== undefined ? p.isWebOnline : true);
        const statusMsg = p.isWebOnline ? '🟢 Đã đẩy lên Website bán online' : '⚪ Đã ẩn khỏi Website';
        return { success: true, data: p, isWebOnline: p.isWebOnline, message: `${statusMsg} cho ${p.name}` };
      }
      return { success: false, error: 'Không tìm thấy sản phẩm' };
    }
    return await ApiClient.patch(`/admin/products/${productId}/web-status`);
  },

  /**
   * Publish New Product to Website from Mobile App
   */
  async publishProductToWeb(productData) {
    if (USE_MOCK) {
      await delay(300);
      const newId = `PROD-0${mockProducts.length + 1}`;
      const newProd = {
        id: newId,
        name: productData.name,
        sku: productData.sku || `SKU-${Date.now().toString().slice(-4)}`,
        category: productData.category || 'Trà Đặc Sản',
        price: Number(productData.price) || 350000,
        costPrice: Number(productData.costPrice) || 200000,
        stock: Number(productData.stock) || 20,
        soldQuantity: 0,
        unit: 'Gói',
        weight: productData.weight || '200g',
        status: 'ACTIVE',
        isWebOnline: true,
        imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80',
        description: productData.description || 'Trà sạch thượng hạng Tân Cương Thái Nguyên'
      };
      mockProducts.unshift(newProd);

      // Add to mock inventory
      mockInventory.unshift({
        variantId: newProd.sku,
        productId: newProd.id,
        productName: newProd.name,
        sku: newProd.sku,
        category: 'TEA',
        supplierName: 'Xưởng Trà Tân Cương Thái Nguyên',
        location: 'Kho A - Xưởng Tân Cương',
        currentStock: newProd.stock,
        reservedStock: 0,
        minThreshold: 5,
        unit: 'Gói',
        status: 'NORMAL'
      });

      return { success: true, data: newProd, message: `🚀 Đã đăng bán thành công ${newProd.name} lên Website!` };
    }
    return await ApiClient.post('/admin/products/publish', productData);
  },

  /**
   * Get Inventory Stock Items & Alerts
   */
  async getInventory() {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, data: mockInventory };
    }
    return await ApiClient.get('/admin/inventory');
  },

  /**
   * Record Synchronized Multi-Line Item 2-Tier Master Voucher Transaction (PN- / PX-)
   */
  async recordMultiItemVoucherTransaction(voucherData) {
    if (USE_MOCK) {
      await delay(350);
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const voucherId = `PN-${todayStr}-${String(mockVouchers.length + 1).padStart(2, '0')}`;
      const partnerName = voucherData.partnerName || 'Xưởng Trà Tân Cương Thái Nguyên';
      const partnerPhone = voucherData.partnerPhone || '0912345678';
      const batchCode = voucherData.batchCode || 'BATCH-2026-08D';
      const expiryDate = voucherData.expiryDate || '2027-08-24';
      const note = voucherData.note || 'Nhập kho từ xưởng sản xuất';

      let totalVoucherAmount = 0;
      let totalVoucherQty = 0;
      const processedLineItems = [];

      for (const itemInput of voucherData.items) {
        const invItem = mockInventory.find(i => i.variantId === itemInput.variantId);
        if (invItem) {
          const stockBefore = invItem.currentStock;
          const qty = Number(itemInput.quantity);
          const price = Number(itemInput.unitPrice);
          const lineTotal = qty * price;

          invItem.currentStock += qty;
          if (invItem.currentStock <= 5) invItem.status = 'CRITICAL';
          else if (invItem.currentStock <= 10) invItem.status = 'MEDIUM_STOCK';
          else invItem.status = 'NORMAL';

          totalVoucherAmount += lineTotal;
          totalVoucherQty += qty;

          let weightStr = '200g';
          if (invItem.productName.includes('100g')) weightStr = '100g';
          else if (invItem.productName.includes('500g')) weightStr = '500g';
          else if (invItem.productName.includes('Ấm')) weightStr = 'Bộ 6 Chén';

          processedLineItems.push({
            sku: invItem.sku,
            productName: invItem.productName,
            unit: invItem.unit,
            weight: weightStr,
            quantity: qty,
            unitPrice: price,
            totalAmount: lineTotal,
            batchCode,
            expiryDate,
            location: invItem.location,
            stockBefore,
            stockAfter: invItem.currentStock
          });

          // Add to inventory logs
          mockInventoryLogs.unshift({
            id: `LOG-${mockInventoryLogs.length + 101}`,
            voucherId,
            productName: invItem.productName,
            sku: invItem.sku,
            type: 'IMPORT',
            amount: qty,
            reason: note,
            operator: 'Quản Trị Viên Mobile',
            createdAt: new Date().toISOString()
          });
        }
      }

      const newVoucher = {
        id: voucherId,
        voucherType: 'IMPORT',
        subType: 'PURCHASE',
        partnerName,
        partnerPhone,
        creator: 'Trần Văn Kho',
        approver: 'Quản Lý Nguyễn Văn Trà',
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentAmount: totalVoucherAmount,
        totalQuantity: totalVoucherQty,
        totalAmount: totalVoucherAmount,
        note,
        lineItems: processedLineItems
      };

      mockVouchers.unshift(newVoucher);
      return { success: true, data: newVoucher, message: `✅ Đã tạo thành công Phiếu Nhập Kho ${voucherId} (${processedLineItems.length} sản phẩm)!` };
    }
    return await ApiClient.post('/admin/vouchers/multi-item', voucherData);
  },

  /**
   * Get 2-Tier Master Vouchers List (Phiếu Nhập PN- / Phiếu Xuất PX-)
   */
  async getVouchers(startDate = '', endDate = '') {
    if (USE_MOCK) {
      await delay(200);
      let vouchers = [...mockVouchers];
      if (startDate) {
        const start = new Date(startDate).getTime();
        vouchers = vouchers.filter(v => new Date(v.createdAt).getTime() >= start);
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000);
        vouchers = vouchers.filter(v => new Date(v.createdAt).getTime() <= end);
      }
      return { success: true, data: vouchers };
    }
    return await ApiClient.get('/admin/vouchers');
  },

  /**
   * Get Voucher Detail by ID
   */
  async getVoucherById(voucherId) {
    if (USE_MOCK) {
      await delay(200);
      const voucher = mockVouchers.find(v => v.id === voucherId);
      if (!voucher) return { success: false, error: 'Không tìm thấy phiếu' };
      return { success: true, data: voucher };
    }
    return await ApiClient.get(`/admin/vouchers/${voucherId}`);
  },

  /**
   * Get Tea Batches
   */
  async getTeaBatches() {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, data: mockTeaBatches };
    }
    return await ApiClient.get('/admin/batches');
  },

  /**
   * Get Inventory Transaction Logs with Date Filtering
   */
  async getInventoryLogs(startDate = '', endDate = '') {
    if (USE_MOCK) {
      await delay(200);
      let logs = [...mockInventoryLogs];
      if (startDate) {
        const start = new Date(startDate).getTime();
        logs = logs.filter(l => new Date(l.createdAt).getTime() >= start);
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000);
        logs = logs.filter(l => new Date(l.createdAt).getTime() <= end);
      }
      return { success: true, data: logs };
    }
    const query = (startDate || endDate) ? `?startDate=${startDate}&endDate=${endDate}` : '';
    return await ApiClient.get(`/admin/inventory/logs${query}`);
  },

  /**
   * Get Business Analytics
   */
  async getAnalytics() {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, data: mockAnalytics };
    }
    return await ApiClient.get('/admin/analytics');
  },

  /**
   * Get Customer Reviews
   */
  async getReviews() {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, data: mockReviews };
    }
    return await ApiClient.get('/admin/reviews');
  },

  /**
   * Moderate Review (Approve/Reject)
   */
  async moderateReview(reviewId, status) {
    if (USE_MOCK) {
      await delay(200);
      const rev = mockReviews.find(r => r.id === reviewId);
      if (rev) {
        rev.status = status;
        return { success: true, data: rev, message: `Đã duyệt đánh giá ${reviewId}` };
      }
      return { success: false, error: "Đánh giá không tồn tại" };
    }
    return await ApiClient.patch(`/admin/reviews/${reviewId}`, { status });
  },

  /**
   * Mobile App Home & User Data
   */
  async getMobileHomeData() {
    if (USE_MOCK) {
      await delay(200);
      return {
        success: true,
        data: {
          ...mockMobileData,
          featuredProducts: mockProducts.slice(0, 4),
          recentOrders: mockOrders.slice(0, 2)
        }
      };
    }
    return await ApiClient.get('/mobile/home');
  }
};
