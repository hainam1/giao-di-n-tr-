/**
 * Mobile Companion Web App Controller (Phase 1)
 * 100% Dedicated Internal Operations App for Shop Staff & Manager
 * Reverse-Engineered from Admin Panel Capabilities
 */

import { adminService } from './src/services/adminService.js';

document.addEventListener('DOMContentLoaded', async () => {
  let currentTab = 'adminOverview';
  let currentInvSubtab = 'stock';
  let currentApprovedSubtab = 'shipping'; // 'shipping' | 'completed'
  let currentInvCategoryFilter = 'ALL'; // 'ALL' | 'TEA' | 'TEAWARE'
  let currentLogTimePreset = 'ALL'; // 'ALL' | 'TODAY' | '1W' | '1M' | '3M' | '6M'
  let availableInventoryItems = [];

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Global Toast Helper for Mobile
  window.showMobileToast = function(msg) {
    const toast = document.getElementById('mToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  };

  // Dynamic Multi-Line Item Generator for 2-Tier Master Import Voucher (PN-)
  window.addImportLineItem = function(defaultVariantId = '', defaultQty = 20, defaultPrice = 120000) {
    const container = document.getElementById('mImportItemsContainer');
    if (!container) return;

    const rowId = `importRow_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const optionsHtml = availableInventoryItems.map(item => `
      <option value="${item.variantId}" ${item.variantId === defaultVariantId ? 'selected' : ''}>
        ${item.productName} (SKU: ${item.sku}) - Tồn: ${item.currentStock} ${item.unit}
      </option>
    `).join('');

    const rowDiv = document.createElement('div');
    rowDiv.className = 'm-import-line-row';
    rowDiv.id = rowId;
    rowDiv.style.cssText = 'background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; margin-bottom:8px; position:relative;';

    rowDiv.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-size:0.8rem; font-weight:700; color:#334155;">📦 Dòng sản phẩm</span>
        ${container.children.length > 0 ? `
          <button type="button" style="background:none; border:none; color:#dc2626; font-size:1.1rem; cursor:pointer; padding:0 4px;" onclick="removeImportLineItem('${rowId}')" title="Xóa dòng này">&times;</button>
        ` : ''}
      </div>

      <div class="m-form-group" style="margin-bottom:6px;">
        <select class="m-form-select m-import-prod-select" required>
          ${optionsHtml}
        </select>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label class="m-form-label" style="font-size:0.75rem;">Số lượng (Gói/Bộ)</label>
          <input type="number" class="m-form-input m-import-qty-input" value="${defaultQty}" min="1" required oninput="updateImportTotalCostPreview()">
        </div>
        <div>
          <label class="m-form-label" style="font-size:0.75rem;">Đơn giá nhập (VNĐ)</label>
          <input type="number" class="m-form-input m-import-price-input" value="${defaultPrice}" min="1000" step="5000" required oninput="updateImportTotalCostPreview()">
        </div>
      </div>
    `;

    container.appendChild(rowDiv);
    updateImportTotalCostPreview();
  };

  window.removeImportLineItem = function(rowId) {
    const rowEl = document.getElementById(rowId);
    if (rowEl) {
      rowEl.remove();
      updateImportTotalCostPreview();
    }
  };

  // Recalculate Grand Total Cost for Multi-Line Items
  window.updateImportTotalCostPreview = function() {
    const container = document.getElementById('mImportItemsContainer');
    const previewEl = document.getElementById('mImportTotalCostPreview');
    if (!container || !previewEl) return;

    let grandTotal = 0;
    const rows = container.querySelectorAll('.m-import-line-row');

    rows.forEach(row => {
      const qty = parseInt(row.querySelector('.m-import-qty-input')?.value, 10) || 0;
      const price = parseInt(row.querySelector('.m-import-price-input')?.value, 10) || 0;
      grandTotal += (qty * price);
    });

    previewEl.textContent = formatCurrency(grandTotal);
  };

  // Select Preset Product Image Thumbnail in Publish Modal
  window.selectWebImagePreset = function(src) {
    const input = document.getElementById('mWebProdImage');
    if (input) input.value = src;
    showMobileToast('📸 Đã chọn hình ảnh sản phẩm!');
  };

  // View & Tab Switcher with FAB Visibility Toggle
  window.switchMobileTab = function(tabName) {
    currentTab = tabName;
    const tabs = document.querySelectorAll('.nav-tab-btn');
    const views = document.querySelectorAll('.mobile-view');
    const fabBtn = document.getElementById('btnMobileFabImport');

    tabs.forEach(t => {
      if (t.getAttribute('data-tab') === tabName) t.classList.add('active');
      else t.classList.remove('active');
    });

    views.forEach(v => {
      const viewIdName = `mView${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
      if (v.id === viewIdName) v.classList.add('active');
      else v.classList.remove('active');
    });

    // Show FAB "+" only when in Admin Inventory view
    if (fabBtn) {
      if (tabName === 'adminInventory') fabBtn.style.display = 'flex';
      else fabBtn.style.display = 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Live Search in Approved Orders
  window.handleApprovedOrdersSearch = function() {
    refreshOrdersView();
  };

  // Switch Sub-Tabs in Approved Orders (Đang Giao | Đã Giao)
  window.switchApprovedSubtab = function(subtab) {
    currentApprovedSubtab = subtab;
    const btnShipping = document.getElementById('btnApprovedSubtabShipping');
    const btnCompleted = document.getElementById('btnApprovedSubtabCompleted');

    if (subtab === 'completed') {
      btnCompleted?.classList.add('active');
      btnShipping?.classList.remove('active');
    } else {
      btnShipping?.classList.add('active');
      btnCompleted?.classList.remove('active');
    }
    refreshOrdersView();
  };

  // Inventory Sub-Tab Switcher (Stock | Logs)
  window.switchInventorySubtab = function(subtab) {
    currentInvSubtab = subtab;
    const btnStock = document.getElementById('btnSubtabStock');
    const btnLogs = document.getElementById('btnSubtabLogs');

    const cStock = document.getElementById('mInvStockContainer');
    const cLogs = document.getElementById('mInvLogsContainer');

    [btnStock, btnLogs].forEach(b => b?.classList.remove('active'));

    if (subtab === 'logs') {
      btnLogs?.classList.add('active');
      if (cStock) cStock.style.display = 'none';
      if (cLogs) cLogs.style.display = 'block';
    } else {
      btnStock?.classList.add('active');
      if (cStock) cStock.style.display = 'block';
      if (cLogs) cLogs.style.display = 'none';
    }
  };

  // Switch Inventory Category Filter (ALL | TEA | TEAWARE)
  window.switchInventoryCategory = function(category) {
    currentInvCategoryFilter = category;
    const btnAll = document.getElementById('btnCatFilterAll');
    const btnTea = document.getElementById('btnCatFilterTea');
    const btnWare = document.getElementById('btnCatFilterTeaware');

    [btnAll, btnTea, btnWare].forEach(b => b?.classList.remove('active'));

    if (category === 'TEA') btnTea?.classList.add('active');
    else if (category === 'TEAWARE') btnWare?.classList.add('active');
    else btnAll?.classList.add('active');

    refreshAdminInventoryView();
  };

  // Set Quick Preset Time Filter for Inventory Logs
  window.setLogTimePreset = async function(preset) {
    currentLogTimePreset = preset;
    const btnAll = document.getElementById('btnLogPresetAll');
    const btnToday = document.getElementById('btnLogPresetToday');
    const btn1W = document.getElementById('btnLogPreset1W');
    const btn1M = document.getElementById('btnLogPreset1M');
    const btn3M = document.getElementById('btnLogPreset3M');
    const btn6M = document.getElementById('btnLogPreset6M');

    [btnAll, btnToday, btn1W, btn1M, btn3M, btn6M].forEach(b => b?.classList.remove('active'));

    const startDateInput = document.getElementById('mLogStartDate');
    const endDateInput = document.getElementById('mLogEndDate');

    const now = new Date();
    let startDate = '';
    let endDate = now.toISOString().slice(0, 10);

    if (preset === 'TODAY') {
      btnToday?.classList.add('active');
      startDate = endDate;
    } else if (preset === '1W') {
      btn1W?.classList.add('active');
      const past = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      startDate = past.toISOString().slice(0, 10);
    } else if (preset === '1M') {
      btn1M?.classList.add('active');
      const past = new Date(now);
      past.setMonth(past.getMonth() - 1);
      startDate = past.toISOString().slice(0, 10);
    } else if (preset === '3M') {
      btn3M?.classList.add('active');
      const past = new Date(now);
      past.setMonth(past.getMonth() - 3);
      startDate = past.toISOString().slice(0, 10);
    } else if (preset === '6M') {
      btn6M?.classList.add('active');
      const past = new Date(now);
      past.setMonth(past.getMonth() - 6);
      startDate = past.toISOString().slice(0, 10);
    } else {
      btnAll?.classList.add('active');
      startDate = '';
      endDate = '';
    }

    if (startDateInput) startDateInput.value = startDate;
    if (endDateInput) endDateInput.value = endDate;

    const res = await adminService.getVouchers(startDate, endDate);
    if (res.success && res.data) {
      renderMobileInventoryLogs(res.data);
      if (preset !== 'ALL') showMobileToast(`Đã lọc phiếu kho: ${preset}`);
    }
  };

  // Web Catalog Control: Toggle Product Online/Offline Status from Mobile
  window.toggleProductWebStatus = async function(productId) {
    const res = await adminService.toggleProductWebStatus(productId);
    if (res.success) {
      showMobileToast(res.message);
      await refreshAdminWebCatalogView();
    }
  };

  // Open Detailed Web Product Spec Sheet & Sold Volume Analytics
  window.openMobileWebProductDetailModal = async function(productId) {
    const res = await adminService.getProducts();
    if (res.success && res.data) {
      const p = res.data.find(prod => prod.id === productId || prod.sku === productId);
      if (!p) return;

      const titleEl = document.getElementById('mWebDetailTitle');
      const bodyEl = document.getElementById('mWebDetailBody');

      if (titleEl) titleEl.textContent = `${p.name}`;

      const isOnline = p.isWebOnline !== false;
      const webBadge = isOnline ? 'badge-completed' : 'badge-cancelled';
      const webText = isOnline ? '🌐 ĐANG BÁN WEB' : '⚪ ĐÃ ẨN WEB';
      const soldQty = p.soldQuantity || 120;
      const totalRevenueGenerated = soldQty * p.price;

      if (bodyEl) {
        bodyEl.innerHTML = `
          <div style="margin-bottom: 12px;">
            <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80'}" alt="${p.name}" style="width:100%; height:160px; object-fit:cover; border-radius:12px; margin-bottom:12px; border:1px solid #e5e7eb;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span class="m-order-badge ${webBadge}">${webText}</span>
              <span style="font-size:0.8rem; color:#6b7280;">SKU: <code>${p.sku}</code></span>
            </div>

            <!-- 📈 Market Demand Analytics Box (Số Lượng Đã Bán) -->
            <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:12px; padding:12px; margin-bottom:12px;">
              <div style="font-weight:800; font-size:0.95rem; color:#047857; margin-bottom:6px;">📈 Chỉ Số Thị Trường & Doanh Thu Web</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; text-align:center;">
                <div style="background:white; padding:8px; border-radius:8px; border:1px solid #d1d5db;">
                  <div style="font-size:1.15rem; font-weight:800; color:#059669;">${soldQty} Gói</div>
                  <div style="font-size:0.75rem; color:#6b7280;">🔥 Tổng Số Lượng Đã Bán</div>
                </div>
                <div style="background:white; padding:8px; border-radius:8px; border:1px solid #d1d5db;">
                  <div style="font-size:1.1rem; font-weight:800; color:#b45309;">${formatCurrency(totalRevenueGenerated)}</div>
                  <div style="font-size:0.75rem; color:#6b7280;">💰 Doanh Thu Sản Phẩm</div>
                </div>
              </div>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:12px;">
              <div style="font-size:0.88rem; color:#1f2937; margin-bottom:4px;">🏷️ <strong>Giá bán lẻ Web:</strong> <strong style="color:#059669; font-size:1rem;">${formatCurrency(p.price)}</strong></div>
              <div style="font-size:0.83rem; color:#4b5563; margin-bottom:4px;">⚖️ <strong>Quy cách đóng gói:</strong> ${p.weight || '200g'} / ${p.unit || 'Gói'}</div>
              <div style="font-size:0.83rem; color:#4b5563;">📦 <strong>Tồn kho hiện tại:</strong> <strong>${p.stock} Gói</strong></div>
            </div>

            ${p.description ? `
              <div style="background:white; border:1px solid #e5e7eb; border-radius:10px; padding:10px; font-size:0.82rem; color:#475569; font-style:italic;">
                📝 <strong>Mô tả Web:</strong> "${p.description}"
              </div>
            ` : ''}
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="btn-m-action btn-m-detail" onclick="closeMobileWebProductDetailModal()">Đóng</button>
            <button class="btn-m-action ${isOnline ? 'btn-m-stock' : 'btn-m-approve'}" style="font-size:0.85rem; padding:10px;" onclick="window.toggleProductWebStatus('${p.id}'); closeMobileWebProductDetailModal();">
              ${isOnline ? '⚪ Ẩn Khỏi Website' : '🌐 Đẩy Bán Online Web'}
            </button>
          </div>
        `;
      }

      const modal = document.getElementById('mModalWebProductDetail');
      if (modal) modal.classList.add('active');
    }
  };

  window.closeMobileWebProductDetailModal = function() {
    const modal = document.getElementById('mModalWebProductDetail');
    if (modal) modal.classList.remove('active');
  };

  // Open Publish Product to Web Modal
  window.openMobilePublishWebModal = function() {
    const modal = document.getElementById('mModalPublishWebProduct');
    if (modal) modal.classList.add('active');
  };

  window.closeMobilePublishWebModal = function() {
    const modal = document.getElementById('mModalPublishWebProduct');
    if (modal) modal.classList.remove('active');
  };

  // Handle Publish New Product to Web Submit Form
  window.handleMobilePublishWebSubmit = async function(e) {
    e.preventDefault();
    const name = document.getElementById('mWebProdName')?.value;
    const sku = document.getElementById('mWebProdSku')?.value;
    const weight = document.getElementById('mWebProdWeight')?.value || '200g';
    const price = document.getElementById('mWebProdPrice')?.value;
    const stock = document.getElementById('mWebProdStock')?.value;
    const imageUrl = document.getElementById('mWebProdImage')?.value || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80';
    const description = document.getElementById('mWebProdDesc')?.value;

    if (!name || !price || !stock) {
      showMobileToast('Vui lòng điền đầy đủ tên trà và giá bán');
      return;
    }

    const res = await adminService.publishProductToWeb({
      name,
      sku,
      weight,
      price,
      stock,
      imageUrl,
      description
    });

    if (res.success) {
      closeMobilePublishWebModal();
      showMobileToast(`🚀 Đã đăng bán ${name} lên Website!`);
      await refreshAdminWebCatalogView();
      await refreshAdminInventoryView();
    }
  };

  // Open Synchronized Multi-Line Item 2-Tier Master Voucher Creation Modal (FAB + Action)
  window.openMobileQuickImportModal = async function() {
    const res = await adminService.getInventory();
    if (res.success && res.data) {
      availableInventoryItems = res.data;
    }

    // Reset items container & add initial line item
    const container = document.getElementById('mImportItemsContainer');
    if (container) {
      container.innerHTML = '';
      addImportLineItem('', 20, 120000);
    }

    // Auto-set Expiry Date to 1 Year ahead
    const dateInput = document.getElementById('mImportExpiryDate');
    if (dateInput) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      dateInput.value = nextYear.toISOString().split('T')[0];
    }

    const modal = document.getElementById('mModalQuickImport');
    if (modal) modal.classList.add('active');
  };

  window.closeMobileQuickImportModal = function() {
    const modal = document.getElementById('mModalQuickImport');
    if (modal) modal.classList.remove('active');
  };

  // Submit Synchronized Multi-Line Item 2-Tier Master Voucher Creation Form (PN-)
  window.handleMobileQuickImportSubmit = async function(e) {
    e.preventDefault();
    const partnerName = document.getElementById('mImportPartner')?.value || 'Xưởng Trà Tân Cương Thái Nguyên';
    const partnerPhone = document.getElementById('mImportPartnerPhone')?.value || '0912345678';
    const batchCode = document.getElementById('mImportBatchCode')?.value || 'BATCH-2026-08D';
    const expiryDate = document.getElementById('mImportExpiryDate')?.value || '2027-08-24';
    const reason = document.getElementById('mImportReason')?.value || 'Nhập đợt chè búp Tân Cương mới sấy';

    const container = document.getElementById('mImportItemsContainer');
    const rowEls = container ? container.querySelectorAll('.m-import-line-row') : [];

    if (rowEls.length === 0) {
      showMobileToast('Vui lòng thêm ít nhất 1 dòng sản phẩm nhập kho');
      return;
    }

    const items = [];
    rowEls.forEach(row => {
      const variantId = row.querySelector('.m-import-prod-select')?.value;
      const quantity = parseInt(row.querySelector('.m-import-qty-input')?.value, 10);
      const unitPrice = parseInt(row.querySelector('.m-import-price-input')?.value, 10);
      if (variantId && !isNaN(quantity) && quantity > 0) {
        items.push({ variantId, quantity, unitPrice });
      }
    });

    if (items.length === 0) {
      showMobileToast('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ');
      return;
    }

    const res = await adminService.recordMultiItemVoucherTransaction({
      partnerName,
      partnerPhone,
      batchCode,
      expiryDate,
      note: reason,
      items
    });

    if (res.success && res.data) {
      closeMobileQuickImportModal();
      showMobileToast(res.message);
      await refreshAdminInventoryView();
      await refreshAdminOverview();
    }
  };

  // Open Detailed Stock Spec Sheet for a Stock Item
  window.openMobileStockDetailModal = async function(variantId) {
    const res = await adminService.getInventory();
    if (res.success && res.data) {
      const item = res.data.find(i => i.variantId === variantId);
      if (!item) return;

      const titleEl = document.getElementById('mStockDetailTitle');
      const bodyEl = document.getElementById('mStockDetailBody');

      if (titleEl) titleEl.textContent = `${item.productName}`;

      let weightPerUnit = '200g';
      let categoryName = 'Trà Thái Nguyên Thượng Hạng';
      if (item.productName.includes('100g')) weightPerUnit = '100g';
      else if (item.productName.includes('200g')) weightPerUnit = '200g';
      else if (item.productName.includes('500g')) weightPerUnit = '500g';
      else if (item.productName.includes('Ấm') || item.category === 'TEAWARE') { weightPerUnit = 'Bộ 6 Chén'; categoryName = 'Dụng Cụ Trà Đạo'; }

      const totalKg = (item.currentStock * (parseInt(weightPerUnit) || 200) / 1000).toFixed(1);

      let badgeText = '🟢 An toàn';
      let badgeClass = 'badge-completed';
      if (item.currentStock <= 5) { badgeText = '🔴 Cảnh báo hết'; badgeClass = 'badge-cancelled'; }
      else if (item.currentStock <= 10) { badgeText = '🟡 Trung bình'; badgeClass = 'badge-pending'; }

      if (bodyEl) {
        bodyEl.innerHTML = `
          <div style="margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span class="m-order-badge ${badgeClass}">${badgeText}</span>
              <span style="font-size:0.8rem; color:#6b7280;">Mã SKU: <code>${item.sku}</code></span>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:12px;">
              <div style="font-weight:700; font-size:0.95rem; color:#1f2937; margin-bottom:4px;">🍃 Phân loại: ${categoryName}</div>
              <div style="font-size:0.85rem; color:#4b5563; margin-bottom:3px;">
                🏭 <strong>Nhà Cung Cấp:</strong> ${item.supplierName || 'Xưởng Trà Tân Cương Thái Nguyên'}
              </div>
              <div style="font-size:0.85rem; color:#4b5563; margin-bottom:3px;">
                ⚖️ <strong>Quy cách đóng gói:</strong> ${weightPerUnit} / ${item.unit}
              </div>
              <div style="font-size:0.85rem; color:#047857; font-weight:700; margin-bottom:3px;">
                📦 <strong>Tồn kho thực tế:</strong> ${item.currentStock} ${item.unit} ${item.unit === 'Gói' ? `(~${totalKg} kg)` : ''}
              </div>
              <div style="font-size:0.82rem; color:#6b7280;">
                🔒 Tạm giữ đơn hàng: ${item.reservedStock} ${item.unit}
              </div>
            </div>

            <div style="background:white; border:1px solid #e5e7eb; border-radius:10px; padding:10px; font-size:0.83rem; color:#374151; margin-bottom:12px;">
              <div>🏬 <strong>Vị trí lưu kho:</strong> ${item.location}</div>
              <div style="margin-top:4px;">🏷️ <strong>Mã Lô Nhập Gần Nhất:</strong> <code>BATCH-2026-08A</code></div>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="btn-m-action btn-m-detail" onclick="closeMobileStockDetailModal()">Đóng</button>
            <a href="tel:0912345678" class="btn-m-action btn-m-approve" style="text-decoration:none; padding:10px; font-size:0.85rem; display:inline-flex; align-items:center; justify-content:center;">
              📞 Gọi Nhà Cung Cấp
            </a>
          </div>
        `;
      }

      const modal = document.getElementById('mModalStockDetail');
      if (modal) modal.classList.add('active');
    }
  };

  window.closeMobileStockDetailModal = function() {
    const modal = document.getElementById('mModalStockDetail');
    if (modal) modal.classList.remove('active');
  };

  // Open 2-Tier Master Voucher Detail Sheet (Xem Chi Tiết Phiếu Nhập PN- / Phiếu Xuất PX-)
  window.openMobileVoucherDetailModal = async function(voucherId) {
    const res = await adminService.getVoucherById(voucherId);
    if (res.success && res.data) {
      const v = res.data;
      const titleEl = document.getElementById('mVoucherDetailTitle');
      const bodyEl = document.getElementById('mVoucherDetailBody');

      if (titleEl) titleEl.textContent = `Chi Tiết Phiếu ${v.id}`;

      const isImport = v.voucherType === 'IMPORT';
      const badgeClass = isImport ? 'badge-completed' : 'badge-cancelled';
      const typeText = isImport ? '🟢 PHIẾU NHẬP KHO' : '🔴 PHIẾU XUẤT KHO';

      if (bodyEl) {
        bodyEl.innerHTML = `
          <div style="margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span class="m-order-badge ${badgeClass}">${typeText}</span>
              <span style="font-size:0.8rem; color:#6b7280;">Trạng thái: <strong>${v.status === 'COMPLETED' ? 'Đã Hoàn Tất' : v.status}</strong></span>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; margin-bottom:10px;">
              <div style="font-weight:700; font-size:0.92rem; color:#1f2937;">🏭 Đối tác: ${v.partnerName}</div>
              <div style="font-size:0.83rem; color:#4b5563; margin-top:3px; display:flex; align-items:center; gap:8px;">
                📞 ${v.partnerPhone}
                <a href="tel:${v.partnerPhone}" class="btn-call-phone">Gọi Đối Tác</a>
              </div>
              <div style="font-size:0.82rem; color:#4b5563; margin-top:4px;">
                📅 Ngày lập: ${new Date(v.createdAt).toLocaleDateString('vi-VN')} • Người lập: <strong>${v.creator}</strong>
              </div>
              <div style="font-size:0.82rem; color:#047857; margin-top:2px;">
                💳 Công nợ: <strong>${v.paymentStatus === 'PAID' ? '🟢 Đã Thanh Toán Đủ' : '🟡 Còn Nợ'}</strong>
              </div>
            </div>

            <div style="font-weight:700; font-size:0.9rem; margin-bottom:6px;">📋 Danh Sách Dòng Hàng Chi Tiết (${v.lineItems.length} sản phẩm):</div>
            
            ${v.lineItems.map(item => `
              <div style="background:white; border:1px solid #e5e7eb; border-radius:10px; padding:10px; margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-weight:700; font-size:0.88rem; color:#111827;">
                  <span>${item.productName}</span>
                  <span style="color:${item.quantity > 0 ? '#047857' : '#b91c1c'}">${item.quantity > 0 ? '+' + item.quantity : item.quantity} ${item.unit}</span>
                </div>
                <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">
                  Mã SKU: <code>${item.sku}</code> • Quy cách: <strong>${item.weight}</strong>
                </div>
                <div style="font-size:0.82rem; color:#334155; margin-top:4px; display:flex; justify-content:space-between;">
                  <span>Đơn giá: ${formatCurrency(item.unitPrice)}</span>
                  <span>Thành tiền: <strong>${formatCurrency(item.totalAmount)}</strong></span>
                </div>
                <div style="background:#f1f5f9; padding:6px; border-radius:6px; margin-top:6px; font-size:0.78rem; color:#475569; display:flex; justify-content:space-between;">
                  <span>🏷️ Mã lô: <code>${item.batchCode}</code> (HSD: ${item.expiryDate})</span>
                  <span>Tồn: <strong>${item.stockBefore} ➔ ${item.stockAfter}</strong></span>
                </div>
              </div>
            `).join('')}

            <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.05rem; color:#059669; margin-top:10px; border-top:1px solid #e5e7eb; padding-top:8px;">
              <span>Tổng Số Lượng / Giá Trị:</span>
              <span>${v.totalQuantity} Gói | ${formatCurrency(v.totalAmount)}</span>
            </div>
            ${v.note ? `<div style="font-size:0.8rem; color:#475569; font-style:italic; margin-top:4px;">📝 Ghi chú: "${v.note}"</div>` : ''}
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="btn-m-action btn-m-detail" onclick="closeMobileVoucherDetailModal()">Đóng</button>
            <a href="tel:${v.partnerPhone}" class="btn-m-action btn-m-approve" style="text-decoration:none; padding:10px; font-size:0.85rem; display:inline-flex; align-items:center; justify-content:center;">
              📞 Liên Hệ Đối Tác
            </a>
          </div>
        `;
      }

      const modal = document.getElementById('mModalVoucherDetail');
      if (modal) modal.classList.add('active');
    }
  };

  window.closeMobileVoucherDetailModal = function() {
    const modal = document.getElementById('mModalVoucherDetail');
    if (modal) modal.classList.remove('active');
  };

  // Data Hydration Logic for Dedicated 100% Internal Operations Mobile App
  async function hydrateMobileApp() {
    try {
      await refreshOrdersView();
      await refreshAdminOverview();
      await refreshAdminInventoryView();
      await refreshAdminWebCatalogView();
      await refreshAdminReviewsView();
    } catch (err) {
      console.error('Error hydrating mobile internal app:', err);
    }
  }

  async function refreshOrdersView() {
    const ordersRes = await adminService.getOrders();
    if (ordersRes.success && ordersRes.data) {
      renderMobileAdminApprovedOrders(ordersRes.data);
    }
  }

  async function refreshAdminOverview() {
    const dashRes = await adminService.getDashboardData();
    if (dashRes.success && dashRes.data) {
      const { summary, recentOrders } = dashRes.data;
      const revEl = document.getElementById('mAdmRevenue');
      if (revEl) revEl.textContent = `${(summary.totalRevenue / 1000000).toFixed(1)}M`;

      const pendEl = document.getElementById('mAdmPending');
      if (pendEl) pendEl.textContent = recentOrders.filter(o => o.status === 'PENDING').length;

      const stockEl = document.getElementById('mAdmLowStock');
      if (stockEl) stockEl.textContent = summary.lowStockCount;

      renderMobileAdminUrgentActions(recentOrders);
    }
  }

  async function refreshAdminInventoryView() {
    const [invRes, voucherRes] = await Promise.all([
      adminService.getInventory(),
      adminService.getVouchers()
    ]);

    if (invRes.success && invRes.data) {
      availableInventoryItems = invRes.data;
      renderMobileAdminInventory(invRes.data);
    }
    if (voucherRes.success && voucherRes.data) renderMobileInventoryLogs(voucherRes.data);
  }

  async function refreshAdminWebCatalogView() {
    const prodRes = await adminService.getProducts();
    if (prodRes.success && prodRes.data) {
      renderMobileAdminWebCatalog(prodRes.data);
    }
  }

  async function refreshAdminReviewsView() {
    const revRes = await adminService.getReviews();
    if (revRes.success && revRes.data) {
      renderMobileAdminReviews(revRes.data);
    }
  }

  // Render Functions
  function renderMobileAdminUrgentActions(orders) {
    const container = document.getElementById('mAdminUrgentActionContainer');
    if (!container) return;

    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    if (pendingOrders.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#6b7280; background:white; border-radius:12px;">✅ Tất cả đơn hàng mới đã được duyệt hết!</div>`;
      return;
    }

    container.innerHTML = pendingOrders.slice(0, 4).map(o => `
      <div class="m-order-card" style="border-left: 4px solid #d97706;">
        <div class="m-order-header">
          <span class="m-order-id">#${o.id} - ${o.customerName}</span>
          <span class="m-order-badge badge-pending">Chờ Duyệt</span>
        </div>
        <div style="font-size: 0.85rem; color: #4b5563; margin-bottom: 6px;">
          SĐT: ${o.customerPhone} • Tổng: <strong>${formatCurrency(o.totalAmount)}</strong>
        </div>
        <div class="m-action-bar">
          <button class="btn-m-action btn-m-detail" onclick="window.openMobileOrderDetailModal('${o.id}')">🔍 Xem Chi Tiết</button>
          <button class="btn-m-action btn-m-approve" onclick="window.mobileApproveOrderAndRedirect('${o.id}')">✓ DUYỆT ĐƠN</button>
        </div>
      </div>
    `).join('');
  }

  function renderMobileAdminApprovedOrders(orders) {
    const container = document.getElementById('mAdminApprovedOrdersListContainer');
    if (!container) return;

    const searchKeyword = (document.getElementById('mSearchApprovedOrders')?.value || '').toLowerCase().trim();

    let filteredOrders = [];
    if (currentApprovedSubtab === 'completed') {
      filteredOrders = orders.filter(o => o.status === 'COMPLETED');
    } else {
      filteredOrders = orders.filter(o => o.status === 'SHIPPING' || o.status === 'PROCESSING');
    }

    if (searchKeyword) {
      filteredOrders = filteredOrders.filter(o => 
        o.id.toLowerCase().includes(searchKeyword) ||
        o.customerName.toLowerCase().includes(searchKeyword) ||
        o.customerPhone.includes(searchKeyword)
      );
    }

    if (filteredOrders.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#6b7280; background:white; border-radius:12px;">Không tìm thấy đơn hàng phù hợp với từ khóa "${searchKeyword}".</div>`;
      return;
    }

    container.innerHTML = filteredOrders.map(o => `
      <div class="m-order-card" style="border-left: 4px solid ${o.status === 'COMPLETED' ? '#059669' : '#2563eb'};">
        <div class="m-order-header">
          <span class="m-order-id">#${o.id} - ${o.customerName}</span>
          <span class="m-order-badge ${o.status === 'COMPLETED' ? 'badge-completed' : 'badge-shipping'}">
            ${o.status === 'COMPLETED' ? '🟢 Đã Giao' : '🔵 Đang Giao'}
          </span>
        </div>
        <div style="font-size: 0.85rem; color: #4b5563; margin-bottom: 6px; display:flex; justify-content:space-between; align-items:center;">
          <span>SĐT: <strong>${o.customerPhone}</strong></span>
          <a href="tel:${o.customerPhone}" class="btn-call-phone">📞 Gọi</a>
        </div>
        <div style="font-size: 0.9rem; font-weight: 700; color: #059669; margin-bottom: 8px;">
          Tổng tiền: ${formatCurrency(o.totalAmount)}
        </div>
        <div class="m-action-bar">
          <button class="btn-m-action btn-m-detail" onclick="window.openMobileOrderDetailModal('${o.id}')">🔍 Xem Chi Tiết</button>
          ${o.status !== 'COMPLETED' ? `
            <button class="btn-m-action btn-m-approve" onclick="window.mobileCompleteOrder('${o.id}')">✓ Đã Giao Xong</button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // Quản Lý Kho Mobile (Phân loại Trà vs Trà Cụ, 3 Mức Cảnh Báo Kho: Xanh / Vàng / Đỏ, Hiển Thị Nhà Cung Cấp)
  function renderMobileAdminInventory(inventoryItems) {
    const container = document.getElementById('mStockItemsListBody');
    if (!container) return;

    let itemsToRender = [...inventoryItems];

    // Filter by Category (TEA | TEAWARE)
    if (currentInvCategoryFilter === 'TEA') {
      itemsToRender = itemsToRender.filter(i => i.category === 'TEA' || i.productName.toLowerCase().includes('trà') && !i.productName.toLowerCase().includes('ấm'));
    } else if (currentInvCategoryFilter === 'TEAWARE') {
      itemsToRender = itemsToRender.filter(i => i.category === 'TEAWARE' || i.productName.toLowerCase().includes('ấm') || i.productName.toLowerCase().includes('chén'));
    }

    if (itemsToRender.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#6b7280; background:white; border-radius:10px;">Không tìm thấy mặt hàng nào trong phân loại này.</div>`;
      return;
    }

    container.innerHTML = itemsToRender.map(item => {
      // 3 Alert Levels: Green (> 10) | Yellow (5 < Stock <= 10) | Red (<= 5)
      let badgeText = '🟢 An toàn';
      let badgeClass = 'badge-completed';
      let borderLeftColor = '#059669';

      if (item.currentStock <= 5) {
        badgeText = '🔴 Cảnh báo cạn';
        badgeClass = 'badge-cancelled';
        borderLeftColor = '#dc2626';
      } else if (item.currentStock <= 10) {
        badgeText = '🟡 Trung bình';
        badgeClass = 'badge-pending';
        borderLeftColor = '#d97706';
      }

      return `
        <div class="m-order-card" style="border-left: 4px solid ${borderLeftColor};">
          <div class="m-order-header">
            <span class="m-order-id" style="font-size: 0.95rem;">${item.productName}</span>
            <span class="m-order-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div style="font-size: 0.83rem; color: #4b5563; margin-bottom: 4px;">
            Mã SKU: <code>${item.sku}</code> • ${item.location}
          </div>
          <!-- 🏭 Hiển thị Nhà Cung Cấp Trực Tiếp Trên Thẻ -->
          <div style="font-size: 0.83rem; color: #374151; font-weight: 600; margin-bottom: 6px;">
            🏭 NCC: <span style="color: #047857;">${item.supplierName || 'Xưởng Trà Tân Cương Thái Nguyên'}</span>
          </div>
          <div style="font-size: 0.92rem; color: #111827; margin-bottom: 10px;">
            Tồn kho thực tế: <strong style="color: ${borderLeftColor}; font-size: 1.05rem;">${item.currentStock} ${item.unit}</strong>
          </div>
          <div class="m-action-bar">
            <button class="btn-m-action btn-m-detail" onclick="window.openMobileStockDetailModal('${item.variantId}')">🔍 Xem Chi Tiết</button>
            <a href="tel:0912345678" class="btn-m-action btn-m-approve" style="text-decoration:none; padding:8px 6px; font-size:0.78rem; display:inline-flex; align-items:center; justify-content:center;">
              📞 Gọi Nhà Cung Cấp
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Quản Lý Sản Phẩm Web (Cho phép bật/tắt hiển thị online & xem chi tiết phân tích số lượng đã bán)
  function renderMobileAdminWebCatalog(products) {
    const container = document.getElementById('mAdminWebProductsListContainer');
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#6b7280; background:white; border-radius:10px;">Chưa có sản phẩm nào trên hệ thống.</div>`;
      return;
    }

    container.innerHTML = products.map(p => {
      const isOnline = p.isWebOnline !== false;
      const webBadge = isOnline ? 'badge-completed' : 'badge-cancelled';
      const webText = isOnline ? '🌐 ĐANG BÁN WEB' : '⚪ ĐÃ ẨN WEB';

      return `
        <div class="m-order-card" style="border-left: 4px solid ${isOnline ? '#059669' : '#9ca3af'};">
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
            <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80'}" alt="${p.name}" style="width:54px; height:54px; object-fit:cover; border-radius:8px; border:1px solid #e5e7eb;">
            <div style="flex:1;">
              <div style="font-weight:700; font-size:0.92rem; color:#111827; line-height:1.3;">${p.name}</div>
              <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">
                SKU: <code>${p.sku}</code> • Quy cách: <strong>${p.weight || '200g'}</strong>
              </div>
            </div>
            <span class="m-order-badge ${webBadge}" style="white-space:nowrap;">${webText}</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size: 0.9rem; margin-bottom: 8px; background:#f8fafc; padding:6px 8px; border-radius:6px;">
            <span style="font-weight: 800; color: #059669;">Giá bán Web: ${formatCurrency(p.price)}</span>
            <span style="color: #047857; font-size: 0.82rem; font-weight:700;">🔥 Đã bán: ${p.soldQuantity || 120} Gói</span>
          </div>

          <div class="m-action-bar">
            <button class="btn-m-action btn-m-detail" style="font-size:0.78rem;" onclick="window.openMobileWebProductDetailModal('${p.id}')">🔍 Xem Chi Tiết Web</button>
            <button class="btn-m-action ${isOnline ? 'btn-m-stock' : 'btn-m-approve'}" style="font-size:0.78rem;" onclick="window.toggleProductWebStatus('${p.id}')">
              ${isOnline ? '⚪ Ẩn Web' : '🌐 Đẩy Bán Online'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Nhật Ký Phiếu Nhập/Xuất 2 Cấp (Master-Detail Vouchers PN- / PX-)
  function renderMobileInventoryLogs(vouchers) {
    const container = document.getElementById('mLogsListBody');
    if (!container) return;

    if (!vouchers || vouchers.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#6b7280; background:white; border-radius:10px;">Không tìm thấy phiếu kho trong khoảng thời gian chọn.</div>`;
      return;
    }

    container.innerHTML = vouchers.map(v => {
      const isImport = v.voucherType === 'IMPORT';
      const amountBadge = isImport 
        ? `<span class="m-log-badge-plus">+${v.totalQuantity} Gói</span>`
        : `<span class="m-log-badge-minus">-${v.totalQuantity} Gói</span>`;
      
      const typeText = isImport ? '🟢 PHIẾU NHẬP KHO' : '🔴 PHIẾU XUẤT KHO';
      const dateFormatted = new Date(v.createdAt).toLocaleDateString('vi-VN');

      return `
        <div class="m-log-card" style="border-left: 4px solid ${isImport ? '#059669' : '#dc2626'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 0.95rem; color: #111827;">${v.id}</span>
            ${amountBadge}
          </div>
          <div style="font-size: 0.82rem; color: #334155; margin-bottom: 4px;">
            <strong>${typeText}</strong> • <span style="color:#64748b;">${dateFormatted}</span>
          </div>
          <div style="font-size: 0.83rem; color: #475569; margin-bottom: 6px;">
            🏭 Đối tác: <strong>${v.partnerName}</strong> (${v.partnerPhone || 'N/A'})
          </div>
          <div class="m-log-reason-box">
            💬 <strong>Ghi chú:</strong> "${v.note}" <br>
            <span style="color: #64748b; font-size: 0.75rem;">(Tổng tiền: ${formatCurrency(v.totalAmount)} • ${v.lineItems.length} sản phẩm)</span>
          </div>
          <div class="m-action-bar" style="margin-top: 8px;">
            <button class="btn-m-action btn-m-detail" onclick="window.openMobileVoucherDetailModal('${v.id}')">🔍 Xem Chi Tiết Phiếu & Lô</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderMobileAdminReviews(reviews) {
    const container = document.getElementById('mAdminReviewsListContainer');
    if (!container) return;

    if (!reviews || reviews.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#6b7280; background:white; border-radius:10px;">Không có đánh giá mới cần duyệt.</div>`;
      return;
    }

    container.innerHTML = reviews.map(r => `
      <div class="m-order-card" style="border-left: 4px solid ${r.status === 'APPROVED' ? '#059669' : '#d97706'};">
        <div class="m-order-header">
          <span class="m-order-id">${r.authorName}</span>
          <span class="m-order-badge ${r.status === 'APPROVED' ? 'badge-completed' : 'badge-pending'}">${r.status === 'APPROVED' ? '🟢 Đã Duyệt' : '🟡 Chờ Duyệt'}</span>
        </div>
        <div style="color: #d97706; font-weight: 700; margin-bottom: 4px;">
          ${'⭐'.repeat(r.rating)} (${r.rating}/5)
        </div>
        <div style="font-size: 0.85rem; color: #374151; margin-bottom: 6px; font-style: italic;">
          "${r.comment}"
        </div>
        ${r.status !== 'APPROVED' ? `
          <div class="m-action-bar">
            <button class="btn-m-action btn-m-approve" onclick="window.mobileQuickApproveReview('${r.id}')">✓ DUYỆT ĐÁNH GIÁ NÀY</button>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // Filter Inventory Logs by Date Range Custom
  window.applyInventoryLogFilter = async function() {
    const startDate = document.getElementById('mLogStartDate')?.value;
    const endDate = document.getElementById('mLogEndDate')?.value;
    const res = await adminService.getVouchers(startDate, endDate);
    if (res.success && res.data) {
      renderMobileInventoryLogs(res.data);
      showMobileToast(`Đã lọc ${res.data.length} phiếu kho`);
    }
  };

  // Open Order Detail Modal with Live Stock Info
  window.openMobileOrderDetailModal = async function(orderId) {
    const res = await adminService.getOrderDetailWithStock(orderId);
    if (res.success && res.data) {
      const o = res.data;
      const titleEl = document.getElementById('mOrderDetailCode');
      const bodyEl = document.getElementById('mOrderDetailBody');

      if (titleEl) titleEl.textContent = `Chi Tiết Đơn #${o.id}`;

      if (bodyEl) {
        bodyEl.innerHTML = `
          <div style="margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="m-order-badge badge-${o.status.toLowerCase()}">${o.status === 'COMPLETED' ? '🟢 Đã Giao' : o.status === 'PENDING' ? '🟡 Chờ Duyệt' : '🔵 Đang Giao'}</span>
              <span style="font-size:0.8rem; color:#6b7280;">Thanh toán: <strong>${o.paymentMethod || 'COD'}</strong> (${o.paymentStatus || 'PENDING'})</span>
            </div>
            
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; margin-bottom:10px;">
              <div style="font-weight:700; font-size:0.92rem; color:#1f2937;">👤 ${o.customerName}</div>
              <div style="font-size:0.83rem; color:#4b5563; margin-top:3px; display:flex; align-items:center; gap:8px;">
                📞 ${o.customerPhone}
                <a href="tel:${o.customerPhone}" class="btn-call-phone">Gọi Ngay</a>
              </div>
              <div style="font-size:0.83rem; color:#4b5563; margin-top:3px;">
                📍 ${o.shippingAddress || 'Chưa cập nhật địa chỉ'}
              </div>
              ${o.note ? `<div style="font-size:0.8rem; color:#b45309; margin-top:4px;">📝 Ghi chú: ${o.note}</div>` : ''}
            </div>

            <div style="font-weight:700; font-size:0.9rem; margin-bottom:6px;">📦 Sản Phẩm & Tồn Kho Thực Tế:</div>
            ${(o.itemsWithStock || []).map(item => `
              <div style="background:white; border:1px solid #e5e7eb; border-radius:8px; padding:8px; margin-bottom:6px;">
                <div style="font-weight:600; font-size:0.85rem;">${item.productName}</div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#4b5563; margin-top:2px;">
                  <span>Mã/SKU: <code>${item.productId}</code></span>
                  <span>SL mua: <strong>${item.quantity}</strong></span>
                </div>
                <div class="m-stock-info-box">
                  🏪 <strong>Tồn kho thực tế:</strong> ${item.currentStock} ${item.unit} (Vị trí: ${item.location})
                </div>
              </div>
            `).join('')}

            <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.05rem; color:#059669; margin-top:12px; border-top:1px solid #e5e7eb; padding-top:8px;">
              <span>Tổng Tiền Đơn:</span>
              <span>${formatCurrency(o.totalAmount)}</span>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="btn-m-action btn-m-detail" onclick="closeMobileOrderDetailModal()">Đóng</button>
            ${o.status === 'PENDING' ? `
              <button class="btn-m-action btn-m-approve" style="font-size:0.85rem; padding:10px;" onclick="window.mobileApproveOrderAndRedirect('${o.id}')">✓ DUYỆT ĐƠN & GIAO HÀNG</button>
            ` : o.status !== 'COMPLETED' ? `
              <button class="btn-m-action btn-m-approve" style="font-size:0.85rem; padding:10px;" onclick="window.mobileCompleteOrder('${o.id}')">✓ XÁC NHẬN ĐÃ GIAO XONG</button>
            ` : ''}
          </div>
        `;
      }

      const modal = document.getElementById('mModalOrderDetail');
      if (modal) modal.classList.add('active');
    }
  };

  window.closeMobileOrderDetailModal = function() {
    const modal = document.getElementById('mModalOrderDetail');
    if (modal) modal.classList.remove('active');
  };

  // Approve Order inside Detail Modal and Redirect to Approved Orders Tab
  window.mobileApproveOrderAndRedirect = async function(orderId) {
    const res = await adminService.updateOrderStatus(orderId, 'SHIPPING');
    if (res.success) {
      closeMobileOrderDetailModal();
      showMobileToast(`Đã duyệt đơn #${orderId}! Đang chuyển sang trang Đơn Đã Duyệt...`);
      await refreshOrdersView();
      await refreshAdminOverview();
      setTimeout(() => switchMobileTab('adminApprovedOrders'), 300);
    }
  };

  // Complete Order (1-Touch transitions to COMPLETED)
  window.mobileCompleteOrder = async function(orderId) {
    const res = await adminService.updateOrderStatus(orderId, 'COMPLETED');
    if (res.success) {
      closeMobileOrderDetailModal();
      showMobileToast(`Đã hoàn tất đơn #${orderId} (Đã Giao)!`);
      await refreshOrdersView();
      await refreshAdminOverview();
    }
  };

  window.mobileQuickApproveReview = async function(reviewId) {
    const res = await adminService.moderateReview(reviewId, 'APPROVED');
    if (res.success) {
      showMobileToast(res.message);
      await refreshAdminReviewsView();
    }
  };

  // Initial App Setup - Starts directly in Admin Overview mode
  await hydrateMobileApp();
});
