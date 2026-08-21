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

  window.updateOrderStatus = function() {
    const select = document.getElementById('modalStatusSelect');
    const statusText = select ? select.options[select.selectedIndex].text : 'Hoàn tất';
    showAdminToast(`Cập nhật trạng thái đơn hàng thành: "${statusText}"`);
    closeAdminModal('modalOrderDetail');
  };

  // Add / Edit Product Modal
  if (btnOpenAddProduct) {
    btnOpenAddProduct.addEventListener('click', () => {
      document.getElementById('productModalTitle').textContent = 'Thêm Sản Phẩm Mới';
      document.getElementById('formProductAdmin').reset();
      openAdminModal('modalProductForm');
    });
  }

  window.openEditProduct = function(name, sku, price, stock) {
    document.getElementById('productModalTitle').textContent = 'Chỉnh Sửa Sản Phẩm';
    document.getElementById('prodName').value = name;
    document.getElementById('prodSKU').value = sku;
    document.getElementById('prodPrice').value = price;
    document.getElementById('prodStock').value = stock;
    openAdminModal('modalProductForm');
  };

  window.handleProductSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('prodName').value;
    showAdminToast(`Đã lưu thành công sản phẩm: "${name}"`);
    closeAdminModal('modalProductForm');
  };

  // Add Category Modal
  if (btnOpenAddCategory) {
    btnOpenAddCategory.addEventListener('click', () => {
      document.getElementById('formCategoryAdmin').reset();
      openAdminModal('modalCategoryForm');
    });
  }

  window.handleCategorySubmit = function(e) {
    e.preventDefault();
    const catName = document.getElementById('catNameInput').value;
    showAdminToast(`Đã tạo thành công danh mục: "${catName}"`);
    closeAdminModal('modalCategoryForm');
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

  window.adjustStock = function(prodName, amount) {
    const action = amount > 0 ? `+ Nhập thêm ${amount}` : `- Giảm ${Math.abs(amount)}`;
    showAdminToast(`Đã cập nhật tồn kho "${prodName}": ${action} thành công!`);
  };

  window.handleBatchSubmit = function(e) {
    e.preventDefault();
    const batchCode = document.getElementById('batchCode').value;
    const artisanName = document.getElementById('artisanName').value;
    const weight = document.getElementById('batchWeight').value;
    const teaType = document.getElementById('batchTeaType').value;

    showAdminToast(`Đã ghi nhận nhập kho mẻ sao ${batchCode} (${weight}kg ${teaType} - ${artisanName})!`);
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

  window.filterAnalyticsPeriod = function(days, btn) {
    const pills = document.querySelectorAll('#analyticsTimeFilters .pill-btn');
    pills.forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const data = analyticsDataByPeriod[days] || analyticsDataByPeriod[30];

    // Update KPI Card values
    const statStarProduct = document.getElementById('statStarProduct');
    const statStarRevenue = document.getElementById('statStarRevenue');
    const statConversion = document.getElementById('statConversion');
    const statFastestGrowth = document.getElementById('statFastestGrowth');
    const statGrowthRate = document.getElementById('statGrowthRate');
    const statSlowMoving = document.getElementById('statSlowMoving');
    const periodTextLabel = document.getElementById('periodTextLabel');

    if (statStarProduct) statStarProduct.textContent = data.starProduct;
    if (statStarRevenue) statStarRevenue.textContent = data.starRevenue;
    if (statConversion) statConversion.textContent = data.conversion;
    if (statFastestGrowth) statFastestGrowth.textContent = data.growth;
    if (statGrowthRate) statGrowthRate.textContent = data.growthRate;
    if (statSlowMoving) statSlowMoving.textContent = data.slowMoving;
    if (periodTextLabel) periodTextLabel.textContent = data.label;

    // Update Total Revenue Badge & Donut Center
    const totalRevBadge = document.getElementById('totalRevBadge');
    const donutTotalCount = document.getElementById('donutTotalCount');
    const velocityLabel = document.getElementById('salesVelocityLabel');

    if (days === 1) {
      if (totalRevBadge) totalRevBadge.textContent = 'Tổng: 10.710.000 ₫ (Hôm nay)';
      if (donutTotalCount) donutTotalCount.textContent = '10';
      if (velocityLabel) velocityLabel.textContent = 'Hôm nay: 10 hộp/bộ đã xuất kho';
    } else if (days === 7) {
      if (totalRevBadge) totalRevBadge.textContent = 'Tổng: 39.080.000 ₫ (7 Ngày)';
      if (donutTotalCount) donutTotalCount.textContent = '124';
      if (velocityLabel) velocityLabel.textContent = 'Trung bình: 17.7 hộp/ngày';
    } else if (days === 30) {
      if (totalRevBadge) totalRevBadge.textContent = 'Tổng: 128.540.000 ₫ (30 Ngày)';
      if (donutTotalCount) donutTotalCount.textContent = '724';
      if (velocityLabel) velocityLabel.textContent = 'Trung bình: 24.1 hộp/ngày';
    } else if (days === 90) {
      if (totalRevBadge) totalRevBadge.textContent = 'Tổng: 362.470.000 ₫ (Quý này)';
      if (donutTotalCount) donutTotalCount.textContent = '1.890';
      if (velocityLabel) velocityLabel.textContent = 'Trung bình: 21.0 hộp/ngày';
    }

    // Animate Trend Bars
    const trendBars = document.querySelectorAll('#trendBarsTimeline .trend-bar-fill');
    trendBars.forEach(bar => {
      const randomH = Math.floor(Math.random() * 45 + 50);
      bar.style.height = `${randomH}%`;
    });

    // Render table rows
    const tbody = document.querySelector('#analyticsTable tbody');
    if (tbody) {
      tbody.innerHTML = data.tableData.map(item => `
        <tr class="${item.tag === 'tag-promote' ? 'row-star-product' : (item.tag === 'tag-cut' ? 'row-slow-product' : '')}">
          <td>
            <strong>${item.name}</strong>
            <small class="product-sub">${item.action.split('-')[0]}</small>
          </td>
          <td>${item.cat}</td>
          <td class="text-right">${item.views}</td>
          <td class="text-right font-bold text-emerald">${item.sold}</td>
          <td class="text-right font-bold text-emerald">${item.rev}</td>
          <td class="text-center"><span class="badge-pill-status ${item.conv.includes('1') ? 'active' : ''}">${item.conv}</span></td>
          <td class="text-center font-bold text-gold">${item.rating}</td>
          <td><span class="action-tag ${item.tag}">${item.action}</span></td>
        </tr>
      `).join('');
    }

    showAdminToast(`Đã cập nhật toàn bộ biểu đồ & chỉ số theo chu kỳ: ${data.label}`);
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

  window.approveReview = function(btn) {
    const card = btn.closest('.mod-review-card');
    if (card) {
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

  window.pinReview = function(btn) {
    const card = btn.closest('.mod-review-card');
    if (card) {
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

  window.togglePinReview = function(btn) {
    const card = btn.closest('.mod-review-card');
    if (card) {
      const isPinned = card.getAttribute('data-status') === 'pinned';
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

  window.hideReview = function(btn) {
    const card = btn.closest('.mod-review-card');
    if (card) {
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

  window.handleReviewReplySubmit = function(e) {
    e.preventDefault();
    const replyText = document.getElementById('replyReviewInput').value;
    showAdminToast(`Đã đăng phản hồi của Shop cho "${targetReplyAuthor}"!`);
    closeAdminModal('modalReplyReview');
    document.getElementById('replyReviewInput').value = '';
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
