/**
 * Trà Đạo Thái Nguyên - Admin Dashboard Controller
 * Handles Navigation Views, Modals, Filters, Data Tables, Charts, and Toast Notifications
 */

// ==================== 0. IMMEDIATE ADMIN AUTH GATEKEEPER ====================
// Bảo vệ Admin Dashboard: Nếu chưa đăng nhập hoặc không phải quyền Admin thì chuyển ngay về auth.html
(function checkImmediateAdminAuth() {
  const isLoggedIn = localStorage.getItem('tra_dao_is_logged_in') === 'true';
  const userRole = localStorage.getItem('tra_dao_user_role');

  if (!isLoggedIn || userRole !== 'admin') {
    window.location.replace('auth.html');
  }
})();

const ADMIN_API_BASE = 'http://localhost:5000/api/v1';
async function adminApi(path, options = {}) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(ADMIN_API_BASE + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Yêu cầu thất bại');
  return payload;
}

let adminOrdersCache;
let adminInventoryCache;
let adminReviewsCache;
const loadAdminOrders = () => adminApi('/admin/orders').then((r) => (adminOrdersCache = r.data));
const loadAdminInventory = () => adminApi('/admin/inventory').then((r) => (adminInventoryCache = r.data));
const loadAdminReviews = () => adminApi('/admin/reviews').then((r) => (adminReviewsCache = r.data));
async function persistReviewStatus(card, status) {
  const id = card?.dataset.reviewId;
  if (!id) throw new Error('Đánh giá mẫu chưa có trong database');
  await adminApi(`/admin/reviews/${id}`, { method: 'PATCH', body: { status } });
  adminReviewsCache = null;
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-view]');
  const views = document.querySelectorAll('.admin-view');
  const pageMainTitle = document.getElementById('pageMainTitle');
  const pageSubTitle = document.getElementById('pageSubTitle');

  // Mobile Sidebar Elements
  const btnHamburger = document.getElementById('btnHamburger');
  const sidebar = document.getElementById('adminSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  // Notification Elements
  const btnNotificationBell = document.getElementById('btnNotificationBell');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');

  // Quick Action Buttons
  const btnViewAllOrders = document.getElementById('btnViewAllOrders');
  const btnOpenAddProduct = document.getElementById('btnOpenAddProduct');
  const btnOpenAddCategory = document.getElementById('btnOpenAddCategory');
  const btnLogout = document.getElementById('btnLogout');

  // Search & Filter Inputs
  const orderSearchInput = document.getElementById('orderSearchInput');
  const orderStatusFilter = document.getElementById('orderStatusFilter');
  const productSearchTableInput = document.getElementById('productSearchTableInput');
  const productCategoryFilter = document.getElementById('productCategoryFilter');

  // Toast
  const adminToast = document.getElementById('adminToast');
  const adminToastText = document.getElementById('adminToastText');

  // --------------------------------------------------------------------------
  // 1. Toast Notification Helper
  // --------------------------------------------------------------------------
  window.showAdminToast = function(message) {
    if (!adminToast) return;
    adminToastText.textContent = message;
    adminToast.classList.add('show');
    setTimeout(() => {
      adminToast.classList.remove('show');
    }, 3200);
  };

  async function hydrateAdminData() {
    try {
      const [dashboard, reviews] = await Promise.all([
        adminApi('/admin/dashboard'), loadAdminReviews(),
      ]);
      const reviewList = document.getElementById('reviewsModList');
      if (reviewList && reviews.length) {
        const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (c) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
        }[c]));
        reviewList.innerHTML = reviews.map((review) => `
          <article class="mod-review-card ${review.status.toLowerCase()}" data-status="${review.status.toLowerCase()}" data-review-id="${review.id}">
            <div class="mod-review-header"><div class="mod-author-info">
              <div class="mod-author-avatar">${escapeHtml(review.authorName.slice(0, 2).toUpperCase())}</div>
              <div><h4 class="mod-author-name">${escapeHtml(review.authorName)}</h4>
              <div class="mod-stars">${'⭐'.repeat(review.rating)} • ${escapeHtml(review.product.name)}</div></div>
            </div><span class="badge-review-status ${review.status.toLowerCase()}">${escapeHtml(review.status)}</span></div>
            <p class="mod-review-content">${escapeHtml(review.content)}</p>
            <div class="mod-review-actions">
              <button onclick="approveReview(this)">Duyệt</button>
              <button onclick="pinReview(this)">Ghim</button>
              <button onclick="hideReview(this)">Ẩn</button>
              <button onclick="openReplyModal('${escapeHtml(review.authorName)}')">Phản hồi</button>
            </div>
          </article>`).join('');
      }
      const data = dashboard.data;
      const pendingEl = document.getElementById('reviewsPendingCount');
      if (pendingEl) pendingEl.textContent = `${data.pendingReviews} Mới`;
    } catch (error) {
      showAdminToast(`Không tải được dữ liệu quản trị: ${error.message}`);
    }
  }
  hydrateAdminData();

  // --------------------------------------------------------------------------
  // 2. View Switching Logic
  // --------------------------------------------------------------------------
  const viewTitles = {
    overview: {
      title: 'Tổng Quan',
      subtitle: 'Theo dõi và phân tích hoạt động kinh doanh cửa hàng'
    },
    orders: {
      title: 'Quản Lý Đơn Hàng',
      subtitle: 'Theo dõi, xác nhận và xử lý đơn đặt trà của khách hàng'
    },
    products: {
      title: 'Quản Lý Sản Phẩm',
      subtitle: 'Quản lý danh sách sản phẩm, giá bán và thông tin chi tiết'
    },
    inventory: {
      title: 'Quản Lý Tồn Kho & Cảnh Báo',
      subtitle: 'Theo dõi số lượng tồn kho từng quy cách, cảnh báo hết hàng và nhật ký mẻ sao'
    },
    analytics: {
      title: 'Thống Kê Sản Phẩm & Phân Tích Chiến Lược',
      subtitle: 'Báo cáo hiệu suất theo chu kỳ giúp chủ doanh nghiệp thúc đẩy hoặc cắt giảm sản phẩm'
    },
    reviews: {
      title: 'Quản Lý Đánh Giá & Phản Hồi',
      subtitle: 'Kiểm duyệt cảm nhận thưởng trà của khách hàng và ghim nổi bật lên trang chủ'
    },
    categories: {
      title: 'Danh Mục Sản Phẩm',
      subtitle: 'Quản lý các nhóm danh mục phân loại trà và trà cụ'
    },
    revenue: {
      title: 'Báo Cáo Doanh Thu',
      subtitle: 'Thống kê chi tiết doanh số bán hàng và tăng trưởng kinh doanh'
    }
  };

  function switchView(targetViewId) {
    // Update sidebar active link
    navLinks.forEach(link => {
      if (link.getAttribute('data-view') === targetViewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update active view
    views.forEach(view => {
      if (view.id === `view${targetViewId.charAt(0).toUpperCase() + targetViewId.slice(1)}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Update Header Titles
    const meta = viewTitles[targetViewId];
    if (meta && pageMainTitle && pageSubTitle) {
      pageMainTitle.textContent = meta.title;
      pageSubTitle.textContent = meta.subtitle;
    }

    // Close mobile sidebar if open
    closeMobileSidebar();
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const viewId = link.getAttribute('data-view');
      switchView(viewId);
    });
  });

  if (btnViewAllOrders) {
    btnViewAllOrders.addEventListener('click', () => switchView('orders'));
  }

  // --------------------------------------------------------------------------
  // 3. Mobile Sidebar Drawer Controls
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 4. Notifications Dropdown
  // --------------------------------------------------------------------------
  if (btnNotificationBell && notificationDropdown) {
    btnNotificationBell.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!notificationDropdown.contains(e.target) && e.target !== btnNotificationBell) {
        notificationDropdown.classList.remove('show');
      }
    });
  }

  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', () => {
      const unreadItems = document.querySelectorAll('.notif-item.unread');
      unreadItems.forEach(item => item.classList.remove('unread'));
      const badge = document.querySelector('.notification-badge');
      if (badge) badge.style.display = 'none';
      showAdminToast('Đã đánh dấu tất cả thông báo là đã đọc.');
    });
  }

  // --------------------------------------------------------------------------
  // 5. Modal Management
  // --------------------------------------------------------------------------
  window.openAdminModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  };

  window.closeAdminModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  // Order Details Modal
  window.openOrderDetail = function(orderCode) {
    const codeEl = document.getElementById('modalOrderCode');
    if (codeEl) codeEl.textContent = `#${orderCode}`;
    openAdminModal('modalOrderDetail');
  };

  window.updateOrderStatus = async function() {
    const select = document.getElementById('modalStatusSelect');
    const statusText = select ? select.options[select.selectedIndex].text : 'Hoàn tất';
    try {
      const code = document.getElementById('modalOrderCode')?.textContent.replace('#', '');
      const orders = adminOrdersCache || await loadAdminOrders();
      const order = orders.find((o) => o.code === code);
      if (!order) throw new Error('Không tìm thấy đơn hàng');
      await adminApi(`/admin/orders/${order.id}/status`, {
        method: 'PATCH', body: { status: select.value, note: statusText },
      });
      showAdminToast(`Cập nhật trạng thái đơn hàng thành: "${statusText}"`);
      closeAdminModal('modalOrderDetail');
      adminOrdersCache = null;
    } catch (error) { showAdminToast(error.message); }
  };

  // Add / Edit Product Modal
  let editingProductId = null;
  if (btnOpenAddProduct) {
    btnOpenAddProduct.addEventListener('click', () => {
      document.getElementById('productModalTitle').textContent = 'Thêm Sản Phẩm Mới';
      document.getElementById('formProductAdmin').reset();
      editingProductId = null;
      openAdminModal('modalProductForm');
    });
  }

  window.openEditProduct = async function(name, sku, price, stock) {
    document.getElementById('productModalTitle').textContent = 'Chỉnh Sửa Sản Phẩm';
    document.getElementById('prodName').value = name;
    document.getElementById('prodSKU').value = sku;
    document.getElementById('prodPrice').value = price;
    document.getElementById('prodStock').value = stock;
    try {
      const products = (await adminApi('/products')).data;
      editingProductId = products.find((p) => p.variants.some((v) => v.sku === sku))?.id || null;
    } catch (_error) { editingProductId = null; }
    openAdminModal('modalProductForm');
  };

  window.handleProductSubmit = async function(e) {
    e.preventDefault();
    const name = document.getElementById('prodName').value;
    try {
      const categories = (await adminApi('/categories')).data;
      const categoryName = document.getElementById('prodCategory').value;
      const category = categories.find((c) => c.name === categoryName) || categories[0];
      const sku = document.getElementById('prodSKU').value;
      const body = {
        categoryId: category.id, name,
        slug: name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        type: categoryName.toLowerCase().includes('trà cụ') ? 'TEAWARE' : 'TEA',
        description: document.getElementById('prodDesc').value,
        sku, unit: 'Sản phẩm', price: Number(document.getElementById('prodPrice').value),
        stock: Number(document.getElementById('prodStock').value),
      };
      await adminApi(editingProductId ? `/admin/products/${editingProductId}` : '/admin/products', {
        method: editingProductId ? 'PUT' : 'POST', body,
      });
      showAdminToast(`Đã lưu thành công sản phẩm: "${name}"`);
      closeAdminModal('modalProductForm');
    } catch (error) { showAdminToast(error.message); }
  };

  // Add Category Modal
  if (btnOpenAddCategory) {
    btnOpenAddCategory.addEventListener('click', () => {
      document.getElementById('formCategoryAdmin').reset();
      openAdminModal('modalCategoryForm');
    });
  }

  window.handleCategorySubmit = async function(e) {
    e.preventDefault();
    const catName = document.getElementById('catNameInput').value;
    try {
      await adminApi('/admin/categories', { method: 'POST', body: {
        name: catName, slug: document.getElementById('catSlugInput').value,
      } });
      showAdminToast(`Đã tạo thành công danh mục: "${catName}"`);
      closeAdminModal('modalCategoryForm');
    } catch (error) { showAdminToast(error.message); }
  };

  // Confirmation Delete Modal
  let deleteCallback = null;

  window.confirmDeleteProduct = function(productName) {
    document.getElementById('deleteTargetText').textContent = `Bạn có chắc chắn muốn xóa sản phẩm "${productName}"? Hành động này không thể hoàn tác.`;
    deleteCallback = () => {
      showAdminToast(`Đã xóa sản phẩm "${productName}" thành công.`);
      closeAdminModal('modalConfirmDelete');
    };
    openAdminModal('modalConfirmDelete');
  };

  window.confirmDeleteCategory = function(catName) {
    document.getElementById('deleteTargetText').textContent = `Bạn có chắc chắn muốn xóa danh mục "${catName}"? Tất cả sản phẩm thuộc danh mục này sẽ được chuyển về nhóm Mặc định.`;
    deleteCallback = () => {
      showAdminToast(`Đã xóa danh mục "${catName}" thành công.`);
      closeAdminModal('modalConfirmDelete');
    };
    openAdminModal('modalConfirmDelete');
  };

  const btnConfirmDeleteAction = document.getElementById('btnConfirmDeleteAction');
  if (btnConfirmDeleteAction) {
    btnConfirmDeleteAction.addEventListener('click', () => {
      if (typeof deleteCallback === 'function') {
        deleteCallback();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. Orders Filtering & Search
  // --------------------------------------------------------------------------
  function filterOrdersTable() {
    const query = (orderSearchInput?.value || '').toLowerCase().trim();
    const status = orderStatusFilter?.value || 'all';
    const rows = document.querySelectorAll('#ordersDataTable tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const rowStatus = row.getAttribute('data-status');

      const matchQuery = !query || text.includes(query);
      const matchStatus = status === 'all' || rowStatus === status;

      if (matchQuery && matchStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (orderSearchInput) orderSearchInput.addEventListener('input', filterOrdersTable);
  if (orderStatusFilter) orderStatusFilter.addEventListener('change', filterOrdersTable);

  // Select all checkboxes in orders table
  const selectAllOrders = document.getElementById('selectAllOrders');
  if (selectAllOrders) {
    selectAllOrders.addEventListener('change', (e) => {
      const checks = document.querySelectorAll('.order-check');
      checks.forEach(c => c.checked = e.target.checked);
    });
  }

  // --------------------------------------------------------------------------
  // 7. Chart Timeframe Switching Simulation
  // --------------------------------------------------------------------------
  const chartFilterButtons = document.querySelectorAll('.chart-filter-btn');
  chartFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.parentElement.querySelectorAll('.chart-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const bars = document.querySelectorAll('.bar-fill');
      bars.forEach(bar => {
        const randomHeight = Math.floor(Math.random() * 60 + 35);
        bar.style.height = `${randomHeight}%`;
      });
      showAdminToast('Đang cập nhật biểu đồ dữ liệu...');
    });
  });

  // --------------------------------------------------------------------------
  // 8. INVENTORY MANAGEMENT (QUẢN LÝ TỒN KHO)
  // --------------------------------------------------------------------------
  window.filterInventoryTable = function(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#inventoryTable tbody tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  };

  window.adjustStock = async function(prodName, amount) {
    const action = amount > 0 ? `+ Nhập thêm ${amount}` : `- Giảm ${Math.abs(amount)}`;
    try {
      const inventory = adminInventoryCache || await loadAdminInventory();
      const row = inventory.find((i) => i.variant.product.name.toLowerCase().includes(prodName.toLowerCase()));
      if (!row) throw new Error('Không tìm thấy sản phẩm trong kho');
      await adminApi(`/admin/inventory/${row.variantId}/adjust`, {
        method: 'POST', body: { quantity: amount, note: 'Điều chỉnh từ Admin Dashboard' },
      });
      showAdminToast(`Đã cập nhật tồn kho "${prodName}": ${action} thành công!`);
      adminInventoryCache = null;
    } catch (error) { showAdminToast(error.message); }
  };

  window.handleBatchSubmit = async function(e) {
    e.preventDefault();
    const batchCode = document.getElementById('batchCode').value;
    const artisanName = document.getElementById('artisanName').value;
    const weight = document.getElementById('batchWeight').value;
    const teaType = document.getElementById('batchTeaType').value;

    try {
      await adminApi('/admin/batches', { method: 'POST', body: {
        code: batchCode.replace('#', ''), roastedAt: document.getElementById('batchDate').value,
        artisanName, teaType, weightKg: weight,
        qualityScore: document.getElementById('batchScore').value,
        notes: document.getElementById('batchNotes').value, items: [],
      } });
      showAdminToast(`Đã ghi nhận nhập kho mẻ sao ${batchCode} (${weight}kg ${teaType} - ${artisanName})!`);
      closeAdminModal('modalBatchEntry');
    } catch (error) { showAdminToast(error.message); }
    closeAdminModal('modalBatchEntry');
    document.getElementById('formBatchEntry').reset();
  };

  // --------------------------------------------------------------------------
  // 9. PRODUCT ANALYTICS & STRATEGIC MATRIX (THỐNG KÊ SẢN PHẨM THEO CHU KỲ)
  // --------------------------------------------------------------------------
  const analyticsDataByPeriod = {
    1: {
      label: 'Hôm Nay (1 Ngày)',
      starProduct: 'Trà Đinh Tân Cương',
      starRevenue: 'Doanh thu: 4.500.000 ₫ (3 hộp)',
      conversion: '16.2% (Trà Đinh)',
      growth: 'Trà Nõn Tôm Thượng Hạng',
      growthRate: '↑ 15% so với hôm qua',
      slowMoving: 'Trà Ướp Sen Phổ Thông',
      tableData: [
        { name: 'Trà Đinh Tân Cương Thượng Hạng', cat: 'Trà Thượng Hạng', views: 85, sold: '3 hộp', rev: '4.500.000 ₫', conv: '16.2%', rating: '5.0 ⭐ (2)', tag: 'tag-promote', action: '🌟 Đang bán rất chạy trong ngày' },
        { name: 'Trà Nõn Tôm Thượng Hạng', cat: 'Trà Đặc Sản', views: 120, sold: '4 hộp', rev: '3.400.000 ₫', conv: '15.0%', rating: '4.9 ⭐ (4)', tag: 'tag-promote', action: '🌟 Giữ vị trí Top đầu đơn hàng' },
        { name: 'Trà Móc Câu Tân Cương', cat: 'Trà Truyền Thống', views: 60, sold: '2 gói', rev: '960.000 ₫', conv: '9.0%', rating: '4.8 ⭐ (1)', tag: 'tag-maintain', action: '🛡️ Doanh số đều đặn' },
        { name: 'Ấm Tử Sa Thạch Biều Nghệ Nhân', cat: 'Trà Cụ Nghệ Nhân', views: 45, sold: '1 bộ', rev: '1.850.000 ₫', conv: '8.5%', rating: '5.0 ⭐ (1)', tag: 'tag-combo', action: '📈 Kích cầu tặng mẫu thử' },
        { name: 'Trà Ướp Sen Phổ Thông', cat: 'Trà Hương Hoa', views: 12, sold: '0 hộp', rev: '0 ₫', conv: '0.0%', rating: '4.2 ⭐ (0)', tag: 'tag-cut', action: '⚠️ Chưa phát sinh đơn trong ngày' }
      ]
    },
    7: {
      label: '7 Ngày Qua',
      starProduct: 'Trà Nõn Tôm Thượng Hạng',
      starRevenue: 'Doanh thu: 14.450.000 ₫ (17 hộp)',
      conversion: '15.4% (Trà Nõn Tôm)',
      growth: 'Ấm Tử Sa Thạch Biều',
      growthRate: '↑ 35% so với tuần trước',
      slowMoving: 'Trà Ướp Sen Phổ Thông',
      tableData: [
        { name: 'Trà Đinh Tân Cương Thượng Hạng', cat: 'Trà Thượng Hạng', views: 420, sold: '9 hộp', rev: '13.500.000 ₫', conv: '13.2%', rating: '5.0 ⭐ (5)', tag: 'tag-promote', action: '🌟 Ưu tiên đẩy mạnh Marketing & Quà biếu' },
        { name: 'Trà Nõn Tôm Thượng Hạng', cat: 'Trà Đặc Sản', views: 610, sold: '17 hộp', rev: '14.450.000 ₫', conv: '15.4%', rating: '4.9 ⭐ (10)', tag: 'tag-promote', action: '🌟 Nhập thêm nguyên liệu, giữ vị trí Top đầu' },
        { name: 'Trà Móc Câu Tân Cương', cat: 'Trà Truyền Thống', views: 310, sold: '11 gói', rev: '5.280.000 ₫', conv: '9.8%', rating: '4.8 ⭐ (3)', tag: 'tag-maintain', action: '🛡️ Duy trì tồn kho đều đặn hàng tuần' },
        { name: 'Ấm Tử Sa Thạch Biều Nghệ Nhân', cat: 'Trà Cụ Nghệ Nhân', views: 240, sold: '3 bộ', rev: '5.550.000 ₫', conv: '11.0%', rating: '5.0 ⭐ (3)', tag: 'tag-combo', action: '📈 Làm Combo kèm trà & Tặng mẫu thử' },
        { name: 'Trà Ướp Sen Phổ Thông', cat: 'Trà Hương Hoa', views: 65, sold: '1 hộp', rev: '350.000 ₫', conv: '2.5%', rating: '4.2 ⭐ (1)', tag: 'tag-cut', action: '⚠️ CẮT GIẢM / Áp dụng Voucher Xả Tồn 20%' }
      ]
    },
    30: {
      label: '30 Ngày Qua',
      starProduct: 'Trà Đinh Tân Cương',
      starRevenue: 'Doanh thu: 48.000.000 ₫ (32 hộp)',
      conversion: '14.8% (Trà Nõn Tôm)',
      growth: 'Ấm Tử Sa Thạch Biều',
      growthRate: '↑ 42.5% so với kỳ trước',
      slowMoving: 'Trà Ướp Sen Phổ Thông',
      tableData: [
        { name: 'Trà Đinh Tân Cương Thượng Hạng', cat: 'Trà Thượng Hạng', views: 1420, sold: '32 hộp', rev: '48.000.000 ₫', conv: '12.5%', rating: '5.0 ⭐ (18)', tag: 'tag-promote', action: '🌟 Ưu tiên đẩy mạnh Marketing & Quà biếu' },
        { name: 'Trà Nõn Tôm Thượng Hạng', cat: 'Trà Đặc Sản', views: 2180, sold: '48 hộp', rev: '40.800.000 ₫', conv: '14.8%', rating: '4.9 ⭐ (36)', tag: 'tag-promote', action: '🌟 Nhập thêm nguyên liệu, giữ vị trí Top đầu' },
        { name: 'Trà Móc Câu Tân Cương', cat: 'Trà Truyền Thống', views: 1150, sold: '38 gói', rev: '18.240.000 ₫', conv: '9.2%', rating: '4.8 ⭐ (14)', tag: 'tag-maintain', action: '🛡️ Duy trì tồn kho đều đặn hàng tuần' },
        { name: 'Ấm Tử Sa Thạch Biều Nghệ Nhân', cat: 'Trà Cụ Nghệ Nhân', views: 860, sold: '8 bộ', rev: '14.800.000 ₫', conv: '10.4%', rating: '5.0 ⭐ (8)', tag: 'tag-combo', action: '📈 Làm Combo kèm trà & Tặng mẫu thử' },
        { name: 'Trà Shan Tuyết Cổ Thụ Hà Giang', cat: 'Trà Cổ Thụ', views: 720, sold: '6 hộp', rev: '7.200.000 ₫', conv: '7.1%', rating: '4.9 ⭐ (5)', tag: 'tag-maintain', action: '🛡️ Nhập số lượng vừa phải theo mùa tuyết' },
        { name: 'Trà Ướp Sen Phổ Thông', cat: 'Trà Hương Hoa', views: 240, sold: '2 hộp', rev: '700.000 ₫', conv: '2.1%', rating: '4.2 ⭐ (2)', tag: 'tag-cut', action: '⚠️ CẮT GIẢM / Áp dụng Voucher Xả Tồn 20%' }
      ]
    },
    90: {
      label: 'Quý Này (90 Ngày)',
      starProduct: 'Trà Đinh Tân Cương',
      starRevenue: 'Doanh thu: 142.000.000 ₫ (95 hộp)',
      conversion: '15.1% (Trà Đinh & Nõn Tôm)',
      growth: 'Bộ Sưu Tập Quà Biếu Tết',
      growthRate: '↑ 58.0% Doanh số quà tặng',
      slowMoving: 'Dụng Cụ Tre Đơn Giản',
      tableData: [
        { name: 'Trà Đinh Tân Cương Thượng Hạng', cat: 'Trà Thượng Hạng', views: 4250, sold: '95 hộp', rev: '142.500.000 ₫', conv: '13.8%', rating: '5.0 ⭐ (52)', tag: 'tag-promote', action: '🌟 Trụ cột doanh thu - Thúc đẩy mạnh quà biếu doanh nghiệp' },
        { name: 'Trà Nõn Tôm Thượng Hạng', cat: 'Trà Đặc Sản', views: 6400, sold: '140 hộp', rev: '119.000.000 ₫', conv: '15.1%', rating: '4.9 ⭐ (88)', tag: 'tag-promote', action: '🌟 Dòng trà chủ lực tiêu thụ thường nhật' },
        { name: 'Trà Móc Câu Tân Cương', cat: 'Trà Truyền Thống', views: 3300, sold: '112 gói', rev: '53.760.000 ₫', conv: '9.5%', rating: '4.8 ⭐ (35)', tag: 'tag-maintain', action: '🛡️ Khách quen mua định kỳ ổn định' },
        { name: 'Ấm Tử Sa Thạch Biều Nghệ Nhân', cat: 'Trà Cụ Nghệ Nhân', views: 2500, sold: '24 bộ', rev: '44.400.000 ₫', conv: '10.8%', rating: '5.0 ⭐ (22)', tag: 'tag-combo', action: '📈 Tiếp tục tạo combo ấm chén + trà' },
        { name: 'Trà Ướp Sen Phổ Thông', cat: 'Trà Hương Hoa', views: 780, sold: '7 hộp', rev: '2.450.000 ₫', conv: '2.4%', rating: '4.2 ⭐ (4)', tag: 'tag-cut', action: '⚠️ Cắt giảm sản lượng sao củi mẻ lớn' }
      ]
    }
  };

  window.filterAnalyticsPeriod = async function(days, btn) {
    const pills = document.querySelectorAll('#analyticsTimeFilters .pill-btn');
    pills.forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');

    try {
      const data = (await adminApi(`/admin/analytics?days=${days}`)).data;
      const rows = data.rows;
      const top = rows[0];
      const slow = [...rows].sort((a, b) => a.sold - b.sold)[0];
      const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
      setText('statStarProduct', top?.name || 'Chưa có dữ liệu');
      setText('statStarRevenue', `Doanh thu: ${Number(top?.revenue || 0).toLocaleString('vi-VN')} ₫`);
      setText('statConversion', `${Number(top?.conversion || 0).toFixed(1)}%`);
      setText('statFastestGrowth', top?.name || 'Chưa có dữ liệu');
      setText('statGrowthRate', 'Dữ liệu thực từ đơn hàng');
      setText('statSlowMoving', slow?.name || 'Chưa có dữ liệu');
      setText('periodTextLabel', `${days} ngày qua`);
      setText('totalRevBadge', `Tổng: ${Number(data.totalRevenue).toLocaleString('vi-VN')} ₫`);
      setText('donutTotalCount', data.totalSold);
      setText('salesVelocityLabel', `Trung bình: ${(data.totalSold / days).toFixed(1)} sản phẩm/ngày`);
      const tbody = document.querySelector('#analyticsTable tbody');
      if (tbody) tbody.innerHTML = rows.map((item) => `
        <tr><td><strong>${item.name}</strong></td><td>${item.category}</td>
        <td class="text-right">${item.views}</td><td class="text-right">${item.sold}</td>
        <td class="text-right">${Number(item.revenue).toLocaleString('vi-VN')} ₫</td>
        <td class="text-center">${item.conversion.toFixed(1)}%</td>
        <td class="text-center">${item.rating} ⭐ (${item.reviewCount})</td>
        <td>Dữ liệu PostgreSQL</td></tr>`).join('');
      showAdminToast(`Đã tải thống kê thật trong ${days} ngày.`);
    } catch (error) { showAdminToast(error.message); }
  };

  window.filterAnalyticsTable = function(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#analyticsTable tbody tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  };

  // --------------------------------------------------------------------------
  // 10. REVIEWS & FEEDBACK MODERATION (KIỂM DUYỆT ĐÁNH GIÁ)
  // --------------------------------------------------------------------------
  window.filterReviewCards = function(filter, btn) {
    const btns = document.querySelectorAll('.review-tab-btn');
    btns.forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const cards = document.querySelectorAll('#reviewsModList .mod-review-card');
    cards.forEach(card => {
      const status = card.getAttribute('data-status');
      if (filter === 'all') {
        card.style.display = '';
      } else if (filter === 'pending') {
        card.style.display = status === 'pending' ? '' : 'none';
      } else if (filter === 'pinned') {
        card.style.display = status === 'pinned' ? '' : 'none';
      } else if (filter === 'approved') {
        card.style.display = (status === 'approved' || status === 'pinned') ? '' : 'none';
      } else if (filter === 'hidden') {
        card.style.display = status === 'hidden' ? '' : 'none';
      }
    });
  };

  window.approveReview = async function(btn) {
    const card = btn.closest('.mod-review-card');
    if (card) {
      try { await persistReviewStatus(card, 'APPROVED'); } catch (error) { showAdminToast(error.message); return; }
      card.setAttribute('data-status', 'approved');
      card.classList.remove('pending');
      const badge = card.querySelector('.badge-review-status');
      if (badge) {
        badge.className = 'badge-review-status approved';
        badge.textContent = '✓ Đã Duyệt Hiển Thị';
      }
      btn.style.display = 'none';
      showAdminToast('Đã duyệt hiển thị đánh giá này lên website!');
    }
  };

  window.pinReview = async function(btn) {
    const card = btn.closest('.mod-review-card');
    if (card) {
      try { await persistReviewStatus(card, 'PINNED'); } catch (error) { showAdminToast(error.message); return; }
      card.setAttribute('data-status', 'pinned');
      card.classList.remove('pending');
      card.classList.add('pinned');
      const badge = card.querySelector('.badge-review-status');
      if (badge) {
        badge.className = 'badge-review-status pinned';
        badge.textContent = '📌 Đang Ghim Trang Chủ';
      }
      btn.style.display = 'none';
      showAdminToast('Đã duyệt và ghim đánh giá nổi bật lên Trang Chủ!');
    }
  };

  window.togglePinReview = async function(btn) {
    const card = btn.closest('.mod-review-card');
    if (card) {
      const isPinned = card.getAttribute('data-status') === 'pinned';
      try { await persistReviewStatus(card, isPinned ? 'APPROVED' : 'PINNED'); } catch (error) { showAdminToast(error.message); return; }
      if (isPinned) {
        card.setAttribute('data-status', 'approved');
        card.classList.remove('pinned');
        const badge = card.querySelector('.badge-review-status');
        if (badge) {
          badge.className = 'badge-review-status approved';
          badge.textContent = '✓ Đã Duyệt';
        }
        btn.textContent = '📌 Ghim lại Trang Chủ';
        showAdminToast('Đã gỡ đánh giá khỏi mục ghim Trang Chủ.');
      } else {
        card.setAttribute('data-status', 'pinned');
        card.classList.add('pinned');
        const badge = card.querySelector('.badge-review-status');
        if (badge) {
          badge.className = 'badge-review-status pinned';
          badge.textContent = '📌 Đang Ghim Trang Chủ';
        }
        btn.textContent = 'Gỡ khỏi Trang Chủ';
        showAdminToast('Đã ghim đánh giá lên Trang Chủ!');
      }
    }
  };

  window.hideReview = async function(btn) {
    const card = btn.closest('.mod-review-card');
    if (card) {
      try { await persistReviewStatus(card, 'HIDDEN'); } catch (error) { showAdminToast(error.message); return; }
      card.setAttribute('data-status', 'hidden');
      card.style.opacity = '0.5';
      showAdminToast('Đã ẩn đánh giá này khỏi website.');
    }
  };

  let targetReplyAuthor = '';
  window.openReplyModal = function(authorName) {
    targetReplyAuthor = authorName;
    const authorEl = document.getElementById('replyTargetAuthor');
    if (authorEl) authorEl.textContent = authorName;
    openAdminModal('modalReplyReview');
  };

  window.handleReviewReplySubmit = async function(e) {
    e.preventDefault();
    const replyText = document.getElementById('replyReviewInput').value;
    try {
      const reviews = adminReviewsCache || await loadAdminReviews();
      const review = reviews.find((r) => r.authorName === targetReplyAuthor);
      if (!review) throw new Error('Không tìm thấy đánh giá');
      await adminApi(`/admin/reviews/${review.id}/replies`, { method: 'POST', body: { content: replyText } });
      showAdminToast(`Đã đăng phản hồi của Shop cho "${targetReplyAuthor}"!`);
      closeAdminModal('modalReplyReview');
      document.getElementById('replyReviewInput').value = '';
    } catch (error) { showAdminToast(error.message); }
  };

  // --------------------------------------------------------------------------
  // 11. Logout: Khi click Đăng Xuất sẽ out ngay về giao diện Đăng Nhập (auth.html)
  // --------------------------------------------------------------------------
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('tra_dao_is_logged_in');
      localStorage.removeItem('tra_dao_user_role');
      localStorage.removeItem('tra_dao_user_name');
      window.location.replace('auth.html');
    });
  }
});
