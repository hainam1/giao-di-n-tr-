/**
 * Trà Đạo Thái Nguyên - Authentication & Role Authorization Controller
 * Handles Tab Switching, Preset Auto-fill, 2s Demo Loading, and Redirection
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://localhost:5000/api/v1';
  async function apiRequest(path, options = {}) {
    const response = await fetch(API_BASE + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Yêu cầu thất bại');
    return payload;
  }
  function persistAuth(data) {
    localStorage.setItem('auth_token', data.token);
    if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('tra_dao_user_role', data.user.role.toLowerCase());
    localStorage.setItem('tra_dao_user_name', data.user.name);
    localStorage.setItem('tra_dao_user_email', data.user.email);
    if (data.user.phone) localStorage.setItem('tra_dao_user_phone', data.user.phone);
    localStorage.setItem('tra_dao_is_logged_in', 'true');
  }
  // Elements
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const socialAuthSection = document.getElementById('socialAuthSection');

  // Buttons
  const btnGoogleLogin = document.getElementById('btnGoogleLogin');
  const btnFacebookLogin = document.getElementById('btnFacebookLogin');
  const btnLoginSubmit = document.getElementById('btnLoginSubmit');
  const btnRegisterSubmit = document.getElementById('btnRegisterSubmit');
  const toggleLoginPwd = document.getElementById('toggleLoginPwd');

  // Presets & Inputs
  const presetAdminBtn = document.getElementById('presetAdminBtn');
  const presetUserBtn = document.getElementById('presetUserBtn');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const roleAdmin = document.getElementById('roleAdmin');
  const roleUser = document.getElementById('roleUser');

  // Toast Element
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');

  function showAuthToast(message) {
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // 1. Password Visibility Toggle
  // --------------------------------------------------------------------------
  if (toggleLoginPwd && loginPassword) {
    toggleLoginPwd.addEventListener('click', () => {
      const isPassword = loginPassword.type === 'password';
      loginPassword.type = isPassword ? 'text' : 'password';
      toggleLoginPwd.style.color = isPassword ? '#dfba73' : 'var(--color-gold-med)';
    });
  }

  // --------------------------------------------------------------------------
  // 2. Tab Switching (Login vs Register)
  // --------------------------------------------------------------------------
  if (tabLogin && tabRegister && formLogin && formRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.add('active');
      formRegister.classList.remove('active');
      if (socialAuthSection) socialAuthSection.style.display = 'block';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.add('active');
      formLogin.classList.remove('active');
      if (socialAuthSection) socialAuthSection.style.display = 'none';
    });
  }

  // --------------------------------------------------------------------------
  // 3. Preset 1-Click Fill
  // --------------------------------------------------------------------------
  if (presetAdminBtn) {
    presetAdminBtn.addEventListener('click', () => {
      loginEmail.value = 'admin@tradao.vn';
      loginPassword.value = 'admin123';
      if (roleAdmin) roleAdmin.checked = true;
      showAuthToast('Đã chọn mẫu: Quản Trị Viên (Admin)');
    });
  }

  if (presetUserBtn) {
    presetUserBtn.addEventListener('click', () => {
      loginEmail.value = 'khachhang@gmail.com';
      loginPassword.value = 'user123';
      if (roleUser) roleUser.checked = true;
      showAuthToast('Đã chọn mẫu: Khách Hàng (User)');
    });
  }

  // --------------------------------------------------------------------------
  // 4. Social Login
  // --------------------------------------------------------------------------
  function executeSocialLogin(providerName, btnElement) {
    btnElement?.classList.add('btn-loading');
    window.location.href = `${API_BASE}/auth/oauth/${providerName.toLowerCase()}`;
  }

  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', () => executeSocialLogin('Google', btnGoogleLogin));
  }
  if (btnFacebookLogin) {
    btnFacebookLogin.addEventListener('click', () => executeSocialLogin('Facebook', btnFacebookLogin));
  }

  const oauthResult = new URLSearchParams(window.location.hash.slice(1));
  const oauthToken = oauthResult.get('oauth_token');
  const oauthError = oauthResult.get('oauth_error');
  if (oauthToken || oauthError) history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  if (oauthError) showAuthToast(oauthError);
  if (oauthToken) {
    apiRequest('/auth/profile', { headers: { Authorization: `Bearer ${oauthToken}` } })
      .then((response) => {
        persistAuth({ token: oauthToken, user: response.data.user });
        showAuthToast('Đăng nhập OAuth thành công!');
        setTimeout(() => {
          window.location.href = response.data.user.role === 'ADMIN' ? 'admin.html' : 'index.html';
        }, 500);
      })
      .catch((error) => showAuthToast(error.message));
  }

  // --------------------------------------------------------------------------
  // 5. Form Submit Login (2s Demo Loading & Redirection)
  // --------------------------------------------------------------------------
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = loginEmail.value.trim();
      const password = loginPassword.value.trim();

      if (!email || !password) {
        showAuthToast('Vui lòng nhập đầy đủ Email và Mật khẩu.');
        return;
      }

      btnLoginSubmit.classList.add('btn-loading');
      try {
        const response = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
        persistAuth(response.data);
        btnLoginSubmit.classList.remove('btn-loading');
        if (response.data.user.role === 'ADMIN') {
          showAuthToast('Xác thực Quản Trị thành công! Đang chuyển vào Admin Dashboard...');
          setTimeout(() => { window.location.href = 'admin.html'; }, 500);
        } else {
          showAuthToast('Đăng nhập thành công!');
          setTimeout(() => { window.location.href = 'index.html'; }, 500);
        }
      } catch (error) {
        btnLoginSubmit.classList.remove('btn-loading');
        showAuthToast(error.message);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. Form Submit Register (2s Demo Loading)
  // --------------------------------------------------------------------------
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regFullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const password = document.getElementById('regPassword').value;
      const agreed = document.getElementById('agreeTerms')?.checked === true;

      if (!fullName || !email || !phone || !password) {
        showAuthToast('Vui lòng nhập đầy đủ thông tin đăng ký.');
        return;
      }
      if (!agreed) {
        showAuthToast('Vui lòng đồng ý điều khoản dịch vụ và chính sách bảo mật.');
        return;
      }

      btnRegisterSubmit.classList.add('btn-loading');

      try {
        const response = await apiRequest('/auth/register', {
          method: 'POST',
          body: {
            name: fullName,
            email,
            phone,
            password,
            acceptTerms: agreed,
            acceptPrivacy: agreed,
            termsVersion: '2026-08-22',
          },
        });
        persistAuth(response.data);
        btnRegisterSubmit.classList.remove('btn-loading');
        showAuthToast(`Chúc mừng quý khách ${fullName}, đăng ký thành công! Đang chuyển vào trang chủ...`);
        setTimeout(() => { window.location.href = 'index.html'; }, 500);
      } catch (error) {
        btnRegisterSubmit.classList.remove('btn-loading');
        showAuthToast(error.message);
      }
    });
  }
});
