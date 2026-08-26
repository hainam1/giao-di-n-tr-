/**
 * Trà Đạo Thái Nguyên - Admin Dashboard Controller (Phase 1)
 * Integrated with adminService (Mock Data in Phase 1 & Real API in Phase 2)
 */

import { adminService } from './src/services/adminService.js';

// ==================== 0. DEV AUTH SEED & GATEKEEPER ====================
(function checkAdminAuth() {
  const isLoggedIn = localStorage.getItem('tra_dao_is_logged_in');
  if (!isLoggedIn) {
    // Seed default admin session for dev convenience
    localStorage.setItem('tra_dao_is_logged_in', 'true');
    localStorage.setItem('tra_dao_user_role', 'admin');
    localStorage.setItem('tra_dao_user_name', 'Quản Trị Viên');
  }
})();

document.addEventListener('DOMContentLoaded', async () => {
  // Navigation & Views
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-view]');
  const views = document.querySelectorAll('.admin-view');
  const pageMainTitle = document.getElementById('pageMainTitle');
  const pageSubTitle = document.getElementById('pageSubTitle');

  // Mobile Sidebar Elements
  const btnHamburger = document.getElementById('btnHamburger');
  const sidebar = document.getElementById('adminSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  // Notifications & Quick Actions
  const btnNotificationBell = document.getElementById('btnNotificationBell');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');
  const btnViewAllOrders = document.getElementById('btnViewAllOrders');
  const btnOpenAddProduct = document.getElementById('btnOpenAddProduct');
  const btnLogout = document.getElementById('btnLogout');

  // Filters & Controls
  const orderStatusFilter = document.getElementById('orderStatusFilter');
  const orderSearchInput = document.getElementById('orderSearchInput');
  const productSearchInput = document.getElementById('productSearchTableInput');

  // Toast Element
  const adminToast = document.getElementById('adminToast');
  const adminToastText = document.getElementById('adminToastText');

  // Global Toast Helper
  window.showAdminToast = function(message) {
    if (!adminToast || !adminToastText) return;
    adminToastText.textContent = message;
    adminToast.classList.add('show');
    setTimeout(() => {
      adminToast.classList.remove('show');
    }, 3200);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // --------------------------------------------------------------------------
  // 1. DATA HYDRATION (Phase 1 Mock Data via adminService)
  // --------------------------------------------------------------------------
  async function loadDashboard() {
    try {
      const res = await adminService.getDashboardData();
      if (res.success && res.data) {
        const { summary, recentOrders } = res.data;
        // Render Dashboard Stats
        const revEl = document.getElementById('statTotalRevenue');
        if (revEl) revEl.textContent = formatCurrency(summary.totalRevenue);

        const ordEl = document.getElementById('statTotalOrders');
        if (ordEl) ordEl.textContent = summary.totalOrders.toLocaleString();

        const prodEl = document.getElementById('statTotalProducts');
        if (prodEl) prodEl.textContent = summary.totalProducts.toLocaleString();

        const custEl = document.getElementById('statTotalCustomers');
        if (custEl) custEl.textContent = summary.totalCustomers.toLocaleString();

        // Render Recent Orders Table
        renderOrdersTable(recentOrders, 'dashboardOrdersTableBody');
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  }

  async function loadOrders(status = 'ALL') {
    try {
      const res = await adminService.getOrders(status);
      if (res.success && res.data) {
        renderOrdersTable(res.data, 'mainOrdersTableBody');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  }

  function renderOrdersTable(orders, tableBodyId) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">Không tìm thấy đơn hàng phù hợp</td></tr>`;
      return;
    }

    const getBadgeClass = (st) => {
      switch (st) {
        case 'COMPLETED': return 'badge-success';
        case 'PROCESSING': return 'badge-info';
        case 'SHIPPING': return 'badge-primary';
        case 'CANCELLED': return 'badge-danger';
        default: return 'badge-warning';
      }
    };

    const getStatusText = (st) => {
      switch (st) {
        case 'PENDING': return 'Chờ xử lý';
        case 'PROCESSING': return 'Đang đóng gói';
        case 'SHIPPING': return 'Đang giao hàng';
        case 'COMPLETED': return 'Hoàn tất';
        case 'CANCELLED': return 'Đã hủy';
        default: return st;
      }
    };

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${o.customerName}</div>
          <div style="font-size: 0.8rem; color: #6b7280;">${o.customerPhone}</div>
        </td>
        <td>${o.itemsCount || (o.items ? o.items.length : 1)} món</td>
        <td><strong>${formatCurrency(o.totalAmount)}</strong></td>
        <td><span class="badge ${getBadgeClass(o.status)}">${getStatusText(o.status)}</span></td>
        <td style="font-size: 0.85rem; color: #6b7280;">${new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
        <td>
          <button class="btn-action-sm btn-edit" onclick="window.openOrderDetail('${o.id}')">Chi tiết</button>
          <button class="btn-action-sm" style="background:#059669; color:#fff;" onclick="window.openShipmentModal('${o.id}')">Vận chuyển</button>
        </td>
      </tr>
    `).join('');
  }


  async function loadProducts(search = '') {
    try {
      const res = await adminService.getProducts(search);
      if (res.success && res.data) {
        renderProductsTable(res.data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${p.imageUrl}" alt="${p.name}" style="width: 42px; height: 42px; object-fit: cover; border-radius: 8px;">
            <div>
              <div style="font-weight: 600;">${p.name}</div>
              <div style="font-size: 0.8rem; color: #6b7280;">${p.origin || 'Thái Nguyên'} • ${p.weight || ''}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-outline">${p.category}</span></td>
        <td><strong>${formatCurrency(p.price)}</strong></td>
        <td>
          <span style="font-weight: 600; color: ${p.stock <= 5 ? '#dc2626' : '#059669'};">
            ${p.stock} sản phẩm
          </span>
        </td>
        <td><span class="badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}">${p.status === 'ACTIVE' ? 'Đang bán' : 'Tạm ẩn'}</span></td>
        <td>
          <button class="btn-action-sm btn-edit" onclick="window.openEditProductModal('${p.id}')">Sửa</button>
        </td>
      </tr>
    `).join('');
  }

  async function loadInventory() {
    try {
      const res = await adminService.getInventory();
      if (res.success && res.data) {
        renderInventoryTable(res.data);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    }
  }

  function renderInventoryTable(inventoryItems) {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = inventoryItems.map(item => `
      <tr>
        <td>
          <div style="font-weight: 600;">${item.productName}</div>
          <div style="font-size: 0.8rem; color: #6b7280;">SKU: ${item.sku}</div>
        </td>
        <td><strong>${item.currentStock} ${item.unit}</strong></td>
        <td>${item.reservedStock} ${item.unit}</td>
        <td>${item.minThreshold} ${item.unit}</td>
        <td><span class="badge ${item.status === 'NORMAL' ? 'badge-success' : item.status === 'LOW_STOCK' ? 'badge-warning' : 'badge-danger'}">${item.status}</span></td>
        <td>
          <button class="btn-action-sm btn-edit" onclick="window.adjustStockPrompt('${item.variantId}')">Điều chỉnh</button>
        </td>
      </tr>
    `).join('');
  }

  async function loadReviews() {
    try {
      const res = await adminService.getReviews();
      if (res.success && res.data) {
        renderReviewsList(res.data);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  }

  function renderReviewsList(reviews) {
    const container = document.getElementById('reviewsModList');
    if (!container) return;

    container.innerHTML = reviews.map(r => `
      <article class="mod-review-card ${r.status.toLowerCase()}" style="background: white; border: 1px solid #e5e7eb; padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div>
            <strong style="font-size: 1rem;">${r.authorName}</strong>
            <span style="color: #d97706; margin-left: 0.5rem;">${'★'.repeat(r.rating)}</span>
            <div style="font-size: 0.85rem; color: #6b7280;">Sản phẩm: ${r.productName}</div>
          </div>
          <span class="badge ${r.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}">${r.status}</span>
        </div>
        <p style="color: #374151; margin-bottom: 0.75rem;">"${r.comment}"</p>
        <div style="display: flex; gap: 0.5rem;">
          ${r.status !== 'APPROVED' ? `<button class="btn-action-sm btn-edit" onclick="window.approveReviewAction('${r.id}')">Duyệt Đánh Giá</button>` : ''}
          <button class="btn-action-sm" onclick="window.showAdminToast('Đã lưu phản hồi cho ${r.authorName}')">Phản hồi</button>
        </div>
      </article>
    `).join('');
  }

  // Initial Data Load
  await Promise.all([
    loadDashboard(),
    loadOrders(),
    loadProducts(),
    loadInventory(),
    loadReviews()
  ]);

  // --------------------------------------------------------------------------
  // 2. VIEW SWITCHING & NAVIGATION
  // --------------------------------------------------------------------------
  const viewTitles = {
    overview: { title: 'Tổng Quan', subtitle: 'Theo dõi và phân tích hoạt động kinh doanh cửa hàng' },
    orders: { title: 'Quản Lý Đơn Hàng', subtitle: 'Theo dõi, xác nhận và xử lý đơn đặt trà của khách hàng' },
    products: { title: 'Quản Lý Sản Phẩm', subtitle: 'Quản lý danh sách sản phẩm, giá bán và thông tin chi tiết' },
    inventory: { title: 'Quản Lý Tồn Kho & Cảnh Báo', subtitle: 'Theo dõi số lượng tồn kho từng quy cách và cảnh báo hết hàng' },
    analytics: { title: 'Thống Kê & Phân Tích', subtitle: 'Báo cáo hiệu suất bán hàng và sản phẩm bán chạy' },
    reviews: { title: 'Quản Lý Đánh Giá & Phản Hồi', subtitle: 'Kiểm duyệt ý kiến khách hàng và quản lý tương tác' }
  };

  function switchView(targetViewId) {
    navLinks.forEach(link => {
      if (link.getAttribute('data-view') === targetViewId) link.classList.add('active');
      else link.classList.remove('active');
    });

    views.forEach(v => {
      const vId = v.id.toLowerCase().replace('view', '');
      if (vId === targetViewId.toLowerCase()) v.classList.add('active');
      else v.classList.remove('active');
    });

    const meta = viewTitles[targetViewId];
    if (meta && pageMainTitle && pageSubTitle) {
      pageMainTitle.textContent = meta.title;
      pageSubTitle.textContent = meta.subtitle;
    }

    closeMobileSidebar();
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => switchView(link.getAttribute('data-view')));
  });

  if (btnViewAllOrders) btnViewAllOrders.addEventListener('click', () => switchView('orders'));

  // Mobile sidebar controls
  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
  }
  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  }
  if (btnHamburger) btnHamburger.addEventListener('click', openMobileSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // Logout Button
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('tra_dao_is_logged_in');
      showAdminToast('Đã đăng xuất tài khoản quản trị.');
      setTimeout(() => window.location.href = 'auth.html', 1000);
    });
  }

  // Filters & Event Listeners
  if (orderStatusFilter) {
    orderStatusFilter.addEventListener('change', (e) => loadOrders(e.target.value));
  }

  if (productSearchInput) {
    let timeout;
    productSearchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => loadProducts(e.target.value), 300);
    });
  }

  // Global Actions attached to window for inline HTML onclick handlers
  window.openOrderDetail = async function(orderId) {
    const res = await adminService.getOrders();
    if (res.success && res.data) {
      const order = res.data.find(o => o.id === orderId);
      if (order) {
        alert(`CHI TIẾT ĐƠN HÀNG #${order.id}\n-----------------------------------\nKhách hàng: ${order.customerName} (${order.customerPhone})\nĐịa chỉ: ${order.shippingAddress || 'N/A'}\nTổng tiền: ${formatCurrency(order.totalAmount)}\nTrạng thái: ${order.status}`);
      }
    }
  };

  window.adjustStockPrompt = async function(variantId) {
    const val = prompt('Nhập số lượng điều chỉnh kho (+ tăng, - giảm):', '5');
    if (val && !isNaN(val)) {
      const amount = parseInt(val, 10);
      const res = await adminService.adjustInventory(variantId, amount);
      if (res.success) {
        showAdminToast(res.message);
        loadInventory();
      }
    }
  };

  window.approveReviewAction = async function(reviewId) {
    const res = await adminService.moderateReview(reviewId, 'APPROVED');
    if (res.success) {
      showAdminToast(res.message);
      loadReviews();
    }
  };

  window.openShipmentModal = async function(orderId) {
    const carrier = prompt('Nhập đơn vị vận chuyển (VD: ViettelPost, GHTK, GHN, VNPost):', 'ViettelPost');
    if (!carrier) return;
    const trackingCode = prompt('Nhập mã vận đơn (Tracking Code):', `VTP-${Date.now().toString().slice(-6)}`);
    if (!trackingCode) return;
    try {
      const res = await adminService.updateOrderStatus(orderId, 'SHIPPING');
      showAdminToast(`🚚 Đã cập nhật đơn #${orderId} sang Đang Giao qua ${carrier} (Mã VĐ: ${trackingCode})`);
      loadOrders();
    } catch (e) {
      showAdminToast(`❌ Error: ${e.message}`);
    }
  };
});

