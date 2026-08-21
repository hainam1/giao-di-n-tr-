/**
 * Trà Đạo Thái Nguyên - Authentication & Role Authorization Controller
 * Handles Tab Switching, Preset Auto-fill, 2s Demo Loading, and Redirection
 */

document.addEventListener('DOMContentLoaded', () => {
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
  // 4. Social Login with 2s Demo Loading Spinner & Redirection
  // --------------------------------------------------------------------------
  function executeSocialLogin(providerName, btnElement) {
    btnElement.classList.add('btn-loading');
    showAuthToast(`Đang kết nối và xác thực tài khoản ${providerName}...`);

    setTimeout(() => {
      btnElement.classList.remove('btn-loading');
      const selectedRole = document.querySelector('input[name="loginRole"]:checked')?.value || 'admin';
      
      localStorage.setItem('tra_dao_user_role', selectedRole);
      localStorage.setItem('tra_dao_user_name', providerName === 'Google' ? 'Nguyễn Văn Nam (Google)' : 'Trần Thị Mai (Facebook)');
      localStorage.setItem('tra_dao_is_logged_in', 'true');

      if (selectedRole === 'admin') {
        showAuthToast(`Đăng nhập ${providerName} thành công! Đang chuyển hướng vào Admin Dashboard...`);
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 700);
      } else {
        showAuthToast(`Đăng nhập ${providerName} thành công! Kính chào quý khách.`);
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 700);
      }
    }, 2000);
  }

  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', () => executeSocialLogin('Google', btnGoogleLogin));
  }
  if (btnFacebookLogin) {
    btnFacebookLogin.addEventListener('click', () => executeSocialLogin('Facebook', btnFacebookLogin));
  }

  // --------------------------------------------------------------------------
  // 5. Form Submit Login (2s Demo Loading & Redirection)
  // --------------------------------------------------------------------------
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = loginEmail.value.trim();
      const password = loginPassword.value.trim();

      if (!email || !password) {
        showAuthToast('Vui lòng nhập đầy đủ Email và Mật khẩu.');
        return;
      }

      btnLoginSubmit.classList.add('btn-loading');
      const selectedRole = document.querySelector('input[name="loginRole"]:checked')?.value || 'admin';

      setTimeout(() => {
        btnLoginSubmit.classList.remove('btn-loading');
        localStorage.setItem('tra_dao_user_role', selectedRole);
        localStorage.setItem('tra_dao_user_name', selectedRole === 'admin' ? 'Quản Trị Viên Thái Nguyên' : (email.split('@')[0] || 'Khách Quý'));
        localStorage.setItem('tra_dao_is_logged_in', 'true');

        if (selectedRole === 'admin') {
          showAuthToast('Xác thực Quản Trị thành công! Đang chuyển vào Admin Dashboard...');
          setTimeout(() => {
            window.location.href = 'admin.html';
          }, 700);
        } else {
          showAuthToast('Đăng nhập thành công! Chúc quý khách một ngày an lạc và thưởng trà ngon.');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 700);
        }
      }, 2000);
    });
  }

  // --------------------------------------------------------------------------
  // 6. Form Submit Register (2s Demo Loading)
  // --------------------------------------------------------------------------
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regFullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();

      if (!fullName || !email) {
        showAuthToast('Vui lòng nhập đầy đủ thông tin đăng ký.');
        return;
      }

      btnRegisterSubmit.classList.add('btn-loading');

      setTimeout(() => {
        btnRegisterSubmit.classList.remove('btn-loading');
        localStorage.setItem('tra_dao_user_role', 'user');
        localStorage.setItem('tra_dao_user_name', fullName);
        localStorage.setItem('tra_dao_is_logged_in', 'true');

        showAuthToast(`Chúc mừng quý khách ${fullName}, đăng ký thành công! Đang chuyển vào trang chủ...`);
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
      }, 2000);
    });
  }
});
