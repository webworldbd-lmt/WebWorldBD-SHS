/* ==========================================================================
   WebWorldBD - Main Application Script
   Author: SHAFAET HOSSEN SARIP (WebWorldBD)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial State & Configuration
  let currentTheme = localStorage.getItem('webworldbd_theme') || 'light';
  let currentLang = localStorage.getItem('webworldbd_lang') || 'en';

  // Helper function to escape HTML for XSS prevention
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  window.escapeHtml = escapeHtml;

  // Apply Theme & Language on Load
  applyTheme(currentTheme);
  applyLanguage(currentLang);

  /* Global Toast Notification Helper */
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'webworldbd-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `webworldbd-toast toast-${type}`;

    let iconClass = 'fas fa-circle-info';
    if (type === 'success') iconClass = 'fas fa-circle-check';
    if (type === 'error') iconClass = 'fas fa-circle-exclamation';

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, 3500);
  }
  window.showToast = showToast;

  // Initialize UI Features
  initHeader();
  initThemeToggle();
  initLangSwitch();
  initThreeDotsMenu();
  initParticles();
  initCounters();
  initAccordion();
  initMobileMenu();
  initMobileBottomNav();
  initBackToTop();
  initAuthTabs();
  initFirebaseAuthObserver();
  initScrollAnimations();
  initSettingsPage();
  initDashboardUI();
  initAccountDashboardUI();
  initAdminDashboardUI();
  initEditProfileModalLogic();
  initUserLiveChatModule();
  initSupportRequestForm();

  // Dynamic Content Rendering
  if (document.getElementById('services-grid')) renderServices();
  if (document.getElementById('capabilities-grid')) renderCapabilities();
  if (document.getElementById('projects-grid')) {
    renderProjects('all', '');
    initProjectFiltersAndSearch();
  }
  if (document.getElementById('faq-accordion')) renderFAQs();
  if (document.getElementById('project-detail-content')) initProjectDetailsPage();
  if (document.getElementById('service-detail-app')) initServiceDetailPage();
  if (document.getElementById('start-project-form')) initStartProjectForm();

  /* --------------------------------------------------------------------------
     2. Theme & Language Functions
     -------------------------------------------------------------------------- */
  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('webworldbd_theme', theme);

    let effectiveTheme = theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', effectiveTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = effectiveTheme === 'dark'
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
      themeToggleBtn.setAttribute('title', effectiveTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }

    // Sync settings radio buttons if present
    const themeRadios = document.querySelectorAll('input[name="theme-radio"]');
    themeRadios.forEach(radio => {
      radio.checked = (radio.value === theme);
    });

    // Re-render three-dots menu
    if (window.refreshThreeDotsMenu) {
      window.refreshThreeDotsMenu();
    }
  }

  // Listen to system color scheme changes if system preference is active
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    });
  }

  /* --------------------------------------------------------------------------
     3a. URL Path Normalization Helper
     -------------------------------------------------------------------------- */
  function getNormalizedPath() {
    let path = window.location.pathname.toLowerCase();
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    if (path.endsWith('.html')) {
      path = path.slice(0, -5);
    }
    if (path.endsWith('/index')) {
      path = path.slice(0, -6);
    } else if (path === '/index') {
      path = '';
    }
    if (path === '' || path === '/') {
      return '/';
    }
    return path;
  }

  /* --------------------------------------------------------------------------
     3a1. Left-Side Sliding Navigation Drawer Control
     -------------------------------------------------------------------------- */
  function initThreeDotsMenu() {
    const btn = document.getElementById('nav-three-dots-btn');
    if (!btn) return;

    const isSubdir = window.location.pathname.includes('/services/');
    const p = isSubdir ? '../' : '';

    let backdropEl = document.getElementById('nav-drawer-backdrop');
    if (!backdropEl) {
      backdropEl = document.createElement('div');
      backdropEl.id = 'nav-drawer-backdrop';
      backdropEl.className = 'nav-drawer-backdrop';
      document.body.appendChild(backdropEl);
    }

    let panelEl = document.getElementById('nav-drawer-panel');
    if (!panelEl) {
      panelEl = document.createElement('aside');
      panelEl.id = 'nav-drawer-panel';
      panelEl.className = 'nav-drawer-panel';
      document.body.appendChild(panelEl);
    }

    let drawerBody = document.getElementById('nav-drawer-body');
    if (!drawerBody) {
      panelEl.innerHTML = `
        <div class="nav-drawer-header">
          <a href="${p}index.html" class="logo-brand">
            <img src="${p}assets/images/logo.png" alt="WebWorldBD Logo">
            <span>WebWorld<span style="color:var(--accent-blue);">BD</span></span>
          </a>
          <button type="button" class="nav-drawer-close-btn" id="nav-drawer-close-btn" aria-label="Close menu">
            <i class="fas fa-xmark"></i>
          </button>
        </div>
        <div class="nav-drawer-body" id="nav-drawer-body"></div>
      `;
      drawerBody = document.getElementById('nav-drawer-body');
    }

    const closeBtn = document.getElementById('nav-drawer-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeThreeDotsMenu);
    }

    function renderMenuContent() {
      const user = window.currentUserState;
      const isLoggedIn = !!user;
      const isAdmin = user && user.uid === 'dS9uZZToHTUPP1Q3DiWiG25D3Xt2';

      const group1 = [
        { type: 'section-header', i18nKey: 'sectionMainMenu' },
        { id: 'home', url: `${p}index.html`, icon: 'fas fa-house', i18nKey: 'menuHome' },
        { id: 'services', url: `${p}services.html`, icon: 'fas fa-layer-group', i18nKey: 'menuServices' },
        { id: 'start-project', url: `${p}start-project.html`, icon: 'fas fa-rocket', i18nKey: 'menuStartProject' },
        { id: 'live-chat', action: 'live-chat', icon: 'fas fa-comments', i18nKey: 'menuLiveChat' },
        { id: 'projects', url: `${p}projects.html`, icon: 'fas fa-desktop', i18nKey: 'menuLivePreview' },
        { id: 'connect', url: `${p}contact.html`, icon: 'fas fa-link', i18nKey: 'menuConnect' },
        { id: 'settings', url: `${p}settings.html`, icon: 'fas fa-gear', i18nKey: 'menuSettings' },
        ...(isAdmin ? [{ id: 'admin-panel', url: `${p}admin.html`, icon: 'fas fa-shield-halved', i18nKey: 'menuAdminPanel' }] : []),
        { id: 'theme', action: 'theme', icon: currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun', i18nKey: 'menuTheme' },
        { id: 'language', action: 'language', icon: 'fas fa-globe', i18nKey: 'menuLanguage' }
      ];

      const group2 = [
        { type: 'section-header', i18nKey: 'sectionLivePreview' },
        { id: 'market-koro', url: 'https://marketkoro.pages.dev/', icon: 'fas fa-bag-shopping', i18nKey: 'menuMarketKoro', external: true },
        { id: 'student-tools-ai', url: 'https://studentstoolsorai.pages.dev/', icon: 'fas fa-graduation-cap', i18nKey: 'menuStudentToolsAi', external: true },
        { id: 'birthday-website', url: 'https://happybirthday-all.pages.dev/', icon: 'fas fa-cake-candles', i18nKey: 'menuBirthdayWebsite', external: true },
        { id: 'animated-heart', url: 'https://animatedheart.pages.dev/', icon: 'fas fa-heart', i18nKey: 'menuAnimatedHeart', external: true }
      ];

      const group3 = [
        { type: 'section-header', i18nKey: 'sectionOthers' },
        isLoggedIn
          ? { id: 'profile', url: `${p}account.html`, icon: 'fas fa-user-gear', i18nKey: 'menuProfile' }
          : { id: 'about', url: `${p}index.html#about`, icon: 'fas fa-user', i18nKey: 'menuAbout' },
        { id: 'why', url: `${p}why-choose-me.html`, icon: 'fas fa-shield-halved', i18nKey: 'menuWhy' },
        { id: 'process', url: `${p}process.html`, icon: 'fas fa-list-check', i18nKey: 'menuProcess' },
        { id: 'faq', url: `${p}faq.html`, icon: 'fas fa-circle-question', i18nKey: 'menuFaq' },
        { id: 'privacy-policy', url: 'https://webworldbd-privacypolicy.pages.dev/', icon: 'fas fa-shield-halved', i18nKey: 'menuPrivacyPolicy', external: true }
      ];

      const group4 = [
        { type: 'section-header', i18nKey: 'sectionCreateAccount' },
        isLoggedIn
          ? { id: 'logout', action: 'logout', icon: 'fas fa-right-from-bracket', i18nKey: 'menuLogout' }
          : { id: 'account-auth', url: `${p}account.html`, icon: 'fas fa-right-to-bracket', i18nKey: 'menuLoginRegister' }
      ];

      let html = '';

      // User profile header at top of menu if logged in
      if (isLoggedIn) {
        const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Client User');
        const displayEmail = user.email || '';
        const firstChar = (displayName.trim().charAt(0) || 'U').toUpperCase();

        let avatarHtml = `<div class="three-dots-avatar-initial">${firstChar}</div>`;
        if (user.photoURL) {
          avatarHtml = `<img src="${user.photoURL}" alt="${displayName}" class="three-dots-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="three-dots-avatar-initial" style="display:none;">${firstChar}</div>`;
        }

        html += `
          <a href="${p}account.html" class="three-dots-user-header">
            <div class="three-dots-user-avatar">
              ${avatarHtml}
            </div>
            <div class="three-dots-user-info">
              <span class="three-dots-user-name">${displayName}</span>
              <span class="three-dots-user-email" title="${displayEmail}">${displayEmail}</span>
            </div>
          </a>
        `;
      }

      function renderGroupHtml(items) {
        return items.map(item => {
          const label = translations[currentLang] && translations[currentLang][item.i18nKey]
            ? translations[currentLang][item.i18nKey]
            : '';

          if (item.type === 'section-header') {
            return `
              <div class="three-dots-section-header">
                <span data-i18n="${item.i18nKey}">${label}</span>
              </div>
            `;
          }

          if (item.action === 'logout') {
            return `
              <button type="button" class="three-dots-menu-item three-dots-logout-btn" data-menu-id="${item.id}">
                <div class="three-dots-icon-box">
                  <i class="${item.icon} three-dots-menu-icon"></i>
                </div>
                <span data-i18n="${item.i18nKey}">${label}</span>
              </button>
            `;
          }

          if (item.action === 'live-chat') {
            return `
              <button type="button" class="three-dots-menu-item" data-menu-id="${item.id}" style="position: relative;">
                <div class="three-dots-icon-box">
                  <i class="${item.icon} three-dots-menu-icon"></i>
                </div>
                <span data-i18n="${item.i18nKey}">${label}</span>
                <span class="live-chat-drawer-badge" id="live-chat-drawer-badge" style="display:none; position: absolute; right: 15px; width: 9px; height: 9px; background: #EF4444; border-radius: 50%;"></span>
              </button>
            `;
          }

          if (item.action === 'theme') {
            const themeLabel = currentTheme === 'dark' ? (currentLang === 'bn' ? 'ডার্ক' : 'Dark') : (currentLang === 'bn' ? 'লাইট' : 'Light');
            return `
              <button type="button" class="three-dots-menu-item three-dots-theme-btn" data-menu-id="${item.id}">
                <div class="three-dots-icon-box">
                  <i class="${item.icon} three-dots-menu-icon"></i>
                </div>
                <span data-i18n="${item.i18nKey}">${label}</span>
                <span class="three-dots-state-badge">${themeLabel}</span>
              </button>
            `;
          }

          if (item.action === 'language') {
            const langLabel = currentLang === 'bn' ? 'বাংলা' : 'EN';
            return `
              <button type="button" class="three-dots-menu-item three-dots-lang-btn" data-menu-id="${item.id}">
                <div class="three-dots-icon-box">
                  <i class="${item.icon} three-dots-menu-icon"></i>
                </div>
                <span data-i18n="${item.i18nKey}">${label}</span>
                <span class="three-dots-state-badge">${langLabel}</span>
              </button>
            `;
          }

          const targetAttr = item.external ? 'target="_blank" rel="noopener noreferrer"' : '';
          const externalIconHtml = item.external ? ' <i class="fas fa-arrow-up-right-from-square three-dots-external-icon"></i>' : '';
          return `
            <a href="${item.url}" ${targetAttr} class="three-dots-menu-item${item.external ? ' three-dots-external-item' : ''}" data-menu-id="${item.id}">
              <div class="three-dots-icon-box">
                <i class="${item.icon} three-dots-menu-icon"></i>
              </div>
              <span data-i18n="${item.i18nKey}">${label}</span>${externalIconHtml}
            </a>
          `;
        }).join('');
      }

      html += `<div class="three-dots-group">${renderGroupHtml(group1)}</div>`;
      html += `<div class="three-dots-menu-divider"></div>`;
      html += `<div class="three-dots-group">${renderGroupHtml(group2)}</div>`;
      html += `<div class="three-dots-menu-divider"></div>`;
      html += `<div class="three-dots-group">${renderGroupHtml(group3)}</div>`;
      html += `<div class="three-dots-menu-divider"></div>`;
      html += `<div class="three-dots-group">${renderGroupHtml(group4)}</div>`;

      drawerBody.innerHTML = html;
      attachMenuClickListeners();
      highlightActiveMenuItem();
    }

    function attachMenuClickListeners() {
      const links = drawerBody.querySelectorAll('a.three-dots-menu-item');
      links.forEach(a => {
        a.addEventListener('click', () => {
          closeThreeDotsMenu();
        });
      });

      const liveChatBtn = drawerBody.querySelector('[data-menu-id="live-chat"]');
      if (liveChatBtn) {
        liveChatBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeThreeDotsMenu();
          if (window.openUserLiveChat) {
            window.openUserLiveChat();
          }
        });
      }

      const themeBtn = drawerBody.querySelector('.three-dots-theme-btn');
      if (themeBtn) {
        themeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
          applyTheme(nextTheme);
        });
      }

      const langBtn = drawerBody.querySelector('.three-dots-lang-btn');
      if (langBtn) {
        langBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const nextLang = currentLang === 'en' ? 'bn' : 'en';
          applyLanguage(nextLang);
        });
      }

      const logoutBtn = drawerBody.querySelector('.three-dots-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeThreeDotsMenu();
          const mod = window.FirebaseModule;
          if (mod && mod.auth && mod.signOut) {
            mod.signOut(mod.auth).then(() => {
              const msg = currentLang === 'bn' ? 'সফলভাবে লগআউট করা হয়েছে।' : 'Logged out successfully.';
              if (window.showToast) {
                window.showToast(msg, 'info');
              }
            }).catch(err => {
              if (window.showToast) {
                window.showToast(err.message || 'Logout error', 'error');
              }
            });
          }
        });
      }
    }

    function highlightActiveMenuItem() {
      const normPath = getNormalizedPath();
      const currentHash = window.location.hash.toLowerCase();
      const menuLinks = drawerBody.querySelectorAll('.three-dots-menu-item');
      const isLoggedInUser = !!window.currentUserState;

      let activeMenuId = null;

      if (normPath === '/') {
        if (currentHash === '#about') {
          activeMenuId = 'about';
        } else {
          activeMenuId = 'home';
        }
      } else if (normPath === '/services' || normPath.startsWith('/services/')) {
        activeMenuId = 'services';
      } else if (normPath === '/start-project' || normPath.startsWith('/start-project/')) {
        activeMenuId = 'start-project';
      } else if (normPath === '/projects' || normPath.startsWith('/projects/') || normPath === '/project-details' || normPath.startsWith('/project-details/')) {
        activeMenuId = 'projects';
      } else if (normPath === '/contact' || normPath === '/connect') {
        activeMenuId = 'connect';
      } else if (normPath === '/settings') {
        activeMenuId = 'settings';
      } else if (normPath === '/admin') {
        activeMenuId = 'admin-panel';
      } else if (normPath === '/why-choose-me') {
        activeMenuId = 'why';
      } else if (normPath === '/process') {
        activeMenuId = 'process';
      } else if (normPath === '/faq') {
        activeMenuId = 'faq';
      } else if (normPath === '/account') {
        activeMenuId = isLoggedInUser ? 'profile' : 'account-auth';
      }

      menuLinks.forEach(link => {
        const menuId = link.getAttribute('data-menu-id');
        if (activeMenuId && menuId === activeMenuId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    // Account Profile Card Logout Handler
    const accountLogoutBtn = document.getElementById('account-logout-btn');
    if (accountLogoutBtn) {
      accountLogoutBtn.addEventListener('click', () => {
        const mod = window.FirebaseModule;
        if (mod && mod.auth && mod.signOut) {
          mod.signOut(mod.auth).then(() => {
            const msg = currentLang === 'bn' ? 'সফলভাবে লগআউট করা হয়েছে।' : 'Logged out successfully.';
            if (window.showToast) window.showToast(msg, 'info');
          }).catch(err => {
            if (window.showToast) window.showToast(err.message || 'Logout error', 'error');
          });
        }
      });
    }

    renderMenuContent();
    window.refreshThreeDotsMenu = renderMenuContent;

    function openThreeDotsMenu() {
      highlightActiveMenuItem();
      panelEl.classList.add('active');
      backdropEl.classList.add('active');
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    }

    function closeThreeDotsMenu() {
      panelEl.classList.remove('active');
      backdropEl.classList.remove('active');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    }

    function toggleMenu(e) {
      if (e) e.stopPropagation();
      const isOpen = panelEl.classList.contains('active');
      if (isOpen) {
        closeThreeDotsMenu();
      } else {
        openThreeDotsMenu();
      }
    }

    btn.addEventListener('click', toggleMenu);
    backdropEl.addEventListener('click', closeThreeDotsMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelEl.classList.contains('active')) {
        closeThreeDotsMenu();
      }
    });

    window.addEventListener('hashchange', highlightActiveMenuItem);
  }

  function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
      });
    }
  }

  function getDynamicCopyrightText(lang) {
    const year = new Date().getFullYear().toString();
    if (lang === 'bn') {
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const bnYear = year.replace(/\d/g, d => bnDigits[d]);
      return `© ${bnYear} WebWorldBD। সর্বস্বত্ব সংরক্ষিত সাফায়েত হোসেন ছারিফ দ্বারা।`;
    }
    return `© ${year} WebWorldBD. Created with passion by SHAFAET HOSSEN SARIP. All rights reserved.`;
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('webworldbd_lang', lang);

    if (lang === 'bn') {
      document.body.classList.add('lang-bn');
    } else {
      document.body.classList.remove('lang-bn');
    }

    // Dynamic copyright text generator
    const dynamicCopyright = getDynamicCopyrightText(lang);

    // Check auth state for account subtext if available
    const isUserLoggedIn = window.currentUserState ? true : false;

    // Update text elements with data-i18n attribute
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key === 'copyrightText') {
        el.textContent = dynamicCopyright;
      } else if (key === 'accountSub') {
        const subKey = isUserLoggedIn ? 'accountSubLoggedIn' : 'accountSub';
        if (translations[lang] && translations[lang][subKey]) {
          el.textContent = translations[lang][subKey];
        }
      } else if (key === 'navAccount') {
        if (isUserLoggedIn && window.currentUserState) {
          const u = window.currentUserState;
          el.textContent = u.displayName || (u.email ? u.email.split('@')[0] : 'User');
        } else if (translations[lang] && translations[lang][key]) {
          el.textContent = translations[lang][key];
        }
      } else if (translations[lang] && translations[lang][key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translations[lang][key];
        } else {
          const val = translations[lang][key];
          if (val.includes('<') && val.includes('>')) {
            el.innerHTML = val;
          } else {
            el.textContent = val;
          }
        }
      }
    });

    // Update Language Toggle Button Text
    const langSwitchBtn = document.getElementById('lang-switch-btn');
    if (langSwitchBtn) {
      langSwitchBtn.innerHTML = lang === 'en'
        ? '<i class="fas fa-globe"></i> BN'
        : '<i class="fas fa-globe"></i> EN';
    }

    // Sync settings language radio buttons if present
    const langRadios = document.querySelectorAll('input[name="lang-radio"]');
    langRadios.forEach(radio => {
      radio.checked = (radio.value === lang);
    });

    // Re-sync admin header name & photo if on admin panel
    if (window.syncAdminHeaderInfo) {
      window.syncAdminHeaderInfo();
    }

    // Re-render three-dots menu
    if (window.refreshThreeDotsMenu) {
      window.refreshThreeDotsMenu();
    }

    // Re-render admin recent activity feed and admin sections if on admin page
    if (window.refreshAdminRecentActivityFeed) {
      window.refreshAdminRecentActivityFeed();
    }
    if (window.updateAdminTabTitleLanguage) {
      window.updateAdminTabTitleLanguage();
    }

    // Re-render dynamic sections if present
    if (document.getElementById('services-grid')) renderServices();
    if (document.getElementById('capabilities-grid')) renderCapabilities();
    if (document.getElementById('projects-grid')) {
      const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
      const searchVal = document.getElementById('project-search-input')?.value || '';
      renderProjects(activeFilter, searchVal);
    }
    if (document.getElementById('faq-accordion')) renderFAQs();
    if (document.getElementById('project-detail-content')) initProjectDetailsPage();
    if (document.getElementById('service-detail-app')) initServiceDetailPage();
  }

  function initLangSwitch() {
    const langSwitchBtn = document.getElementById('lang-switch-btn');
    if (langSwitchBtn) {
      langSwitchBtn.addEventListener('click', () => {
        const nextLang = currentLang === 'en' ? 'bn' : 'en';
        applyLanguage(nextLang);
      });
    }
  }

  /* --------------------------------------------------------------------------
     3. Header & Navigation Controls
     -------------------------------------------------------------------------- */
  function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (!navMenu) return;

    let navBackdrop = document.getElementById('nav-backdrop');
    if (!navBackdrop) {
      navBackdrop = document.createElement('div');
      navBackdrop.id = 'nav-backdrop';
      navBackdrop.className = 'nav-backdrop';
      document.body.appendChild(navBackdrop);
    }

    function openMobileNavMenu() {
      navMenu.classList.add('active');
      if (mobileToggle) mobileToggle.classList.add('active');
      if (navBackdrop) navBackdrop.classList.add('active');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileNavMenu() {
      navMenu.classList.remove('active');
      if (mobileToggle) mobileToggle.classList.remove('active');
      if (navBackdrop) navBackdrop.classList.remove('active');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    }

    if (mobileToggle) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains('active')) {
          closeMobileNavMenu();
        } else {
          openMobileNavMenu();
        }
      });
    }

    if (navBackdrop) {
      navBackdrop.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileNavMenu();
      });
    }

    function highlightActiveNavLink() {
      const normPath = getNormalizedPath();
      const currentHash = window.location.hash.toLowerCase();
      const navLinks = navMenu.querySelectorAll('.nav-link[data-nav-id]');

      let activeNavId = null;

      if (normPath === '/') {
        if (currentHash === '#about') {
          activeNavId = 'about';
        } else {
          activeNavId = 'home';
        }
      } else if (normPath === '/why-choose-me') {
        activeNavId = 'why';
      } else if (normPath === '/process') {
        activeNavId = 'process';
      } else if (normPath === '/faq') {
        activeNavId = 'faq';
      } else if (normPath === '/services' || normPath.startsWith('/services/')) {
        activeNavId = 'services';
      } else if (normPath === '/projects' || normPath.startsWith('/projects/') || normPath === '/project-details' || normPath.startsWith('/project-details/')) {
        activeNavId = 'projects';
      } else if (normPath === '/account') {
        activeNavId = 'account';
      } else if (normPath === '/contact' || normPath === '/connect') {
        activeNavId = 'contact';
      }

      navLinks.forEach(link => {
        const navId = link.getAttribute('data-nav-id');
        if (activeNavId && navId === activeNavId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    highlightActiveNavLink();
    window.addEventListener('hashchange', highlightActiveNavLink);

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNavMenu();
      });
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && (!mobileToggle || !mobileToggle.contains(e.target))) {
        closeMobileNavMenu();
      }
    });
  }

  /* --------------------------------------------------------------------------
     3b. Mobile Bottom Navigation Active Route Highlighting
     -------------------------------------------------------------------------- */
  function initMobileBottomNav() {
    const mobileNav = document.getElementById('mobile-bottom-nav');
    if (!mobileNav) return;

    const navItems = mobileNav.querySelectorAll('.mobile-nav-item');

    function updateActiveBottomNav() {
      const normPath = getNormalizedPath();
      let activeNavKey = null;

      if (normPath === '/') {
        activeNavKey = 'home';
      } else if (normPath === '/services' || normPath.startsWith('/services/')) {
        activeNavKey = 'services';
      } else if (normPath === '/contact' || normPath === '/connect') {
        activeNavKey = 'connect';
      } else if (normPath === '/start-project' || normPath.startsWith('/start-project/')) {
        activeNavKey = 'fab';
      } else if (normPath === '/live-chat') {
        // TODO: Replace with real live chat widget/feature once decided
        activeNavKey = 'live-chat';
      }

      // Remove "active" class from all items first
      navItems.forEach(item => {
        item.classList.remove('active');
      });

      // Add "active" class only to the matching item if one matched
      if (activeNavKey) {
        navItems.forEach(item => {
          if (item.dataset.nav === activeNavKey) {
            item.classList.add('active');
          }
        });
      }
    }

    navItems.forEach(item => {
      if (item.dataset.nav === 'live-chat') {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.openUserLiveChat) {
            window.openUserLiveChat();
          }
        });
      }
    });

    updateActiveBottomNav();
  }

  /* --------------------------------------------------------------------------
     4. Particle Canvas Background Effect
     -------------------------------------------------------------------------- */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor(width / 25), 50);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = (document.documentElement.getAttribute('data-theme') === 'dark')
          ? `rgba(56, 189, 248, ${p.alpha})`
          : `rgba(14, 165, 233, ${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* --------------------------------------------------------------------------
     5. Animated Numbers Counter
     -------------------------------------------------------------------------- */
  function initCounters() {
    const counterEls = document.querySelectorAll('.counter');
    if (counterEls.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      counterEls.forEach(el => {
        const target = el.getAttribute('data-target') || '0';
        const suffix = el.getAttribute('data-suffix') || '';
        el.textContent = target + suffix;
      });
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target') || '0', 10);
          const suffix = entry.target.getAttribute('data-suffix') || '';
          if (isNaN(target) || target <= 0) return;

          let count = 0;
          const duration = 600;
          const stepTime = 20;
          const increment = Math.max(1, Math.ceil(target / (duration / stepTime)));

          const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
              entry.target.textContent = target + suffix;
              clearInterval(timer);
            } else {
              entry.target.textContent = count + suffix;
            }
          }, stepTime);

          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    counterEls.forEach(el => observer.observe(el));
  }

  /* Helper to determine relative URL path to service detail page */
  function getServiceUrl(slug) {
    const isSubdir = window.location.pathname.includes('/services/');
    return isSubdir ? `${slug}.html` : `services/${slug}.html`;
  }

  /* Helper to determine relative URL path to contact page */
  function getContactUrl() {
    const isSubdir = window.location.pathname.includes('/services/');
    return isSubdir ? `../contact.html` : `contact.html`;
  }

  /* Helper to determine relative URL path to home page */
  function getHomeUrl() {
    const isSubdir = window.location.pathname.includes('/services/');
    return isSubdir ? `../index.html` : `index.html`;
  }

  /* Helper to determine relative URL path to services page */
  function getServicesPageUrl() {
    const isSubdir = window.location.pathname.includes('/services/');
    return isSubdir ? `../services.html` : `services.html`;
  }

  /* --------------------------------------------------------------------------
     6. Dynamic Content Renderers
     -------------------------------------------------------------------------- */
  function renderServices() {
    const container = document.getElementById('services-grid');
    if (!container) return;

    let servicesToRender = portfolioData.services;
    if (container.dataset.limit) {
      const limit = parseInt(container.dataset.limit, 10);
      servicesToRender = servicesToRender.filter(s => s.featured).slice(0, limit);
    }

    container.innerHTML = servicesToRender.map(s => `
      <a href="${getServiceUrl(s.slug)}" class="service-row-item">
        <div class="service-row-left">
          <div class="service-row-icon">
            <i class="${s.icon || 'fas fa-laptop-code'}"></i>
          </div>
          <h3 class="service-row-title">${currentLang === 'bn' ? s.title_bn : s.title_en}</h3>
        </div>
        <div class="service-row-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </a>
    `).join('');
  }

  function renderCapabilities() {
    const container = document.getElementById('capabilities-grid');
    if (!container) return;

    container.innerHTML = portfolioData.capabilities.map(cap => `
      <div class="cap-tag">
        <i class="fas fa-check-circle" style="color:var(--accent-blue); margin-right:6px;"></i>
        ${currentLang === 'bn' ? cap.bn : cap.en}
      </div>
    `).join('');
  }

  function renderProjectThumbnail(projectId, isDetailView = false) {
    const project = portfolioData.projects.find(p => p.id === projectId);
    const projectUrl = project ? project.url : '#';
    const thumbClass = isDetailView ? 'project-thumb project-thumb-detail' : 'project-thumb';
    let patternSvg = '';
    let iconSvg = '';
    let cardClass = '';

    switch (projectId) {
      case 'market-koro':
        cardClass = 'thumb-market-koro';
        patternSvg = `
          <svg class="thumb-pattern" viewBox="0 0 400 200" preserveAspectRatio="none">
            <defs>
              <pattern id="grid-pattern-market" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-market)"/>
            <circle cx="200" cy="100" r="110" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="4 4"/>
            <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
          </svg>
        `;
        iconSvg = `
          <svg class="thumb-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 20H48V52C48 54.2091 46.2091 56 44 56H20C17.7909 56 16 54.2091 16 52V20Z" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M24 24V16C24 11.5817 27.5817 8 32 8C36.4183 8 40 11.5817 40 16V24" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M25 34L30 39L39 29" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="20" y1="47" x2="44" y2="47" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        `;
        break;

      case 'student-tools-ai':
        cardClass = 'thumb-student-tools-ai';
        patternSvg = `
          <svg class="thumb-pattern" viewBox="0 0 400 200" preserveAspectRatio="none">
            <defs>
              <pattern id="dots-pattern-edu" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="6" r="1.5" fill="rgba(255, 255, 255, 0.3)"/>
                <circle cx="20" cy="20" r="2" fill="rgba(255, 255, 255, 0.2)"/>
                <circle cx="24" cy="8" r="1" fill="rgba(255, 255, 255, 0.4)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-pattern-edu)"/>
            <path d="M0 150 Q 100 50, 200 150 T 400 150" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
          </svg>
        `;
        iconSvg = `
          <svg class="thumb-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 10L6 23L32 36L58 23L32 10Z" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 27.5V42C14 42 22 48 32 48C42 48 50 42 50 42V27.5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M52 24.5V38C52 39.1046 51.1046 40 50 40C48.8954 40 48 39.1046 48 38V36" stroke="#C084FC" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M48 10C48 13.5 50.5 16 54 16C50.5 16 48 18.5 48 22C48 18.5 45.5 16 42 16C45.5 16 48 13.5 48 10Z" fill="#38BDF8"/>
            <path d="M12 40C12 42.5 13.5 44 16 44C13.5 44 12 45.5 12 48C12 45.5 10.5 44 8 44C10.5 44 12 42.5 12 40Z" fill="#C084FC"/>
          </svg>
        `;
        break;

      case 'happy-birthday-wish':
        cardClass = 'thumb-happy-birthday-wish';
        patternSvg = `
          <svg class="thumb-pattern" viewBox="0 0 400 200" preserveAspectRatio="none">
            <defs>
              <pattern id="confetti-pattern-bday" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="#FFE4E6"/>
                <circle cx="30" cy="25" r="2.5" fill="#FEF08A"/>
                <rect x="22" y="8" width="3" height="3" transform="rotate(25 22 8)" fill="#A7F3D0"/>
                <circle cx="6" cy="32" r="1.5" fill="#FBCFE8"/>
                <path d="M34 5 Q 38 12, 34 18" fill="none" stroke="#FDE68A" stroke-width="1.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#confetti-pattern-bday)"/>
          </svg>
        `;
        iconSvg = `
          <svg class="thumb-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8C22.0589 8 14 16.0589 14 26C14 34.5 21 40 30 43.5L29 47H35L34 43.5C43 40 50 34.5 50 26C50 16.0589 41.9411 8 32 8Z" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 18C24 15 27 13 31 12.5" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M32 47C32 49 35 51 33 54C31 57 34 58 33 60" stroke="#FFE4E6" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M10 18L12 22L16 24L12 26L10 30L8 26L4 24L8 22L10 18Z" fill="#FEF08A"/>
            <path d="M52 36L53.5 39L56.5 40.5L53.5 42L52 45L50.5 42L47.5 40.5L50.5 39L52 36Z" fill="#A7F3D0"/>
          </svg>
        `;
        break;

      case 'animated-heart':
        cardClass = 'thumb-animated-heart';
        patternSvg = `
          <svg class="thumb-pattern" viewBox="0 0 400 200" preserveAspectRatio="none">
            <defs>
              <pattern id="sparkle-pattern-heart" width="45" height="45" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.3)"/>
                <circle cx="35" cy="30" r="2" fill="rgba(254,205,211,0.4)"/>
                <path d="M24 6 L26 10 L30 12 L26 14 L24 18 L22 14 L18 12 L22 10 Z" fill="rgba(255,255,255,0.2)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sparkle-pattern-heart)"/>
            <circle cx="200" cy="100" r="80" fill="rgba(244,63,94,0.18)" filter="blur(20px)"/>
          </svg>
        `;
        iconSvg = `
          <svg class="thumb-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 54.5C32 54.5 8 40 8 23.5C8 15.5 14.5 9 22.5 9C27.2 9 31.3 11.2 32 14.5C32.7 11.2 36.8 9 41.5 9C49.5 9 56 15.5 56 23.5C56 40 32 54.5 32 54.5Z" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="rgba(244,63,94,0.2)"/>
            <path d="M18 21.5C18.5 17.5 22 14.5 26 14.5" stroke="#FECDD3" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M46 16L47 18.5L49.5 19.5L47 20.5L46 23L45 20.5L42.5 19.5L45 18.5L46 16Z" fill="#FFFFFF"/>
          </svg>
        `;
        break;

      default:
        cardClass = 'thumb-market-koro';
        patternSvg = '';
        iconSvg = `<i class="fas fa-code" style="font-size:3rem; color:#fff;"></i>`;
    }

    if (isDetailView) {
      return `
        <div class="${thumbClass} ${cardClass}" style="width: 100%; height: 320px; border-radius: 16px; margin-bottom: 2.5rem; position: relative;">
          ${patternSvg}
          <div class="thumb-icon-wrapper">
            ${iconSvg}
          </div>
          <div style="position: absolute; bottom: 15px; right: 15px; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); padding: 0.5rem 1rem; border-radius: 30px; font-size: 0.85rem; color: #fff; z-index: 4;">
            <i class="fas fa-shield-alt" style="color: var(--accent-blue);"></i> WebWorldBD Verified
          </div>
        </div>
      `;
    }

    return `
      <div class="${thumbClass} ${cardClass}">
        ${patternSvg}
        <div class="thumb-icon-wrapper">
          ${iconSvg}
        </div>
        <div class="project-thumb-overlay">
          <a href="${projectUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding:0.5rem 1rem; font-size:0.85rem;">
            <i class="fas fa-external-link-alt"></i> ${translations[currentLang].btnLivePreview}
          </a>
          <a href="project-details.html?id=${projectId}" class="btn btn-secondary" style="padding:0.5rem 1rem; font-size:0.85rem;">
            <i class="fas fa-info-circle"></i> ${translations[currentLang].btnProjectDetails}
          </a>
        </div>
      </div>
    `;
  }

  function renderProjects(filterCategory = 'all', searchQuery = '') {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    let filtered = portfolioData.projects;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const title = p.title.toLowerCase();
        const descEn = p.short_desc_en.toLowerCase();
        const descBn = p.short_desc_bn.toLowerCase();
        const techs = p.techs.join(' ').toLowerCase();
        return title.includes(q) || descEn.includes(q) || descBn.includes(q) || techs.includes(q);
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-blue);"></i>
          <h3>${currentLang === 'bn' ? 'কোন প্রজেক্ট পাওয়া যায়নি' : 'No Projects Found'}</h3>
          <p>${currentLang === 'bn' ? 'অনুগ্রহ করে অন্য শব্দ বা ক্যাটাগরি ট্রাই করুন।' : 'Try adjusting your search or category filter.'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="glass-card project-card">
        ${renderProjectThumbnail(p.id)}
        <div class="project-info">
          <span class="project-category">${currentLang === 'bn' ? p.categoryName_bn : p.categoryName_en}</span>
          <h3>${p.title}</h3>
          <p>${currentLang === 'bn' ? p.short_desc_bn : p.short_desc_en}</p>
          <div class="project-techs">
            ${p.techs.map(t => `<span class="tech-badge">${t}</span>`).join('')}
          </div>
          <div class="project-actions">
            <a href="project-details.html?id=${p.id}" class="btn btn-secondary" style="width:100%; font-size:0.85rem; padding:0.6rem;">
              ${translations[currentLang].btnProjectDetails} <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  function initProjectFiltersAndSearch() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('project-search-input');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter || 'all';
        const searchVal = searchInput ? searchInput.value : '';
        renderProjects(filter, searchVal);
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        renderProjects(activeFilter, e.target.value);
      });
    }
  }

  function renderFAQs() {
    const container = document.getElementById('faq-accordion');
    if (!container) return;

    container.innerHTML = portfolioData.faqs.map((faq, index) => `
      <div class="glass-card faq-item ${index === 0 ? 'active' : ''}">
        <div class="faq-question">
          <span>${currentLang === 'bn' ? faq.q_bn : faq.q_en}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="faq-answer">
          <p>${currentLang === 'bn' ? faq.a_bn : faq.a_en}</p>
        </div>
      </div>
    `).join('');

    initAccordion();
  }

  function initAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(q => {
      q.addEventListener('click', () => {
        const item = q.parentElement;
        const isActive = item.classList.contains('active');

        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. Project Details Page View Handler
     -------------------------------------------------------------------------- */
  function initProjectDetailsPage() {
    const container = document.getElementById('project-detail-content');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id') || 'market-koro';

    const project = portfolioData.projects.find(p => p.id === projectId) || portfolioData.projects[0];

    container.innerHTML = `
      <div class="glass-card" style="padding: 2.5rem; margin-bottom: 3rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem;">
          <div>
            <span class="badge-pill" style="margin-bottom: 0.8rem;">
              <i class="fas fa-tag"></i> ${currentLang === 'bn' ? project.categoryName_bn : project.categoryName_en}
            </span>
            <h1 style="font-size: 2.5rem; font-weight: 800; margin-top: 0.5rem;">${project.title}</h1>
          </div>
          <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            <i class="fas fa-external-link-alt"></i> ${translations[currentLang].btnLivePreview}
          </a>
        </div>

        ${renderProjectThumbnail(project.id, true)}

        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2.5rem;">
          <div>
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem; font-weight: 700;">${currentLang === 'bn' ? 'প্রজেক্ট বিবরণ' : 'Project Overview'}</h3>
            <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 2rem; font-size: 1.05rem;">
              ${currentLang === 'bn' ? project.full_desc_bn : project.full_desc_en}
            </p>

            <h3 style="font-size: 1.4rem; margin-bottom: 1rem; font-weight: 700;">${currentLang === 'bn' ? 'মূল ফিচারের তালিকা' : 'Key Features'}</h3>
            <ul style="display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 2rem;">
              ${(currentLang === 'bn' ? project.key_features_bn : project.key_features_en).map(feat => `
                <li style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-main);">
                  <i class="fas fa-check-circle" style="color: var(--accent-blue); font-size: 1.1rem;"></i>
                  ${feat}
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="glass-card" style="padding: 1.75rem; height: fit-content;">
            <h3 style="font-size: 1.2rem; margin-bottom: 1.25rem; font-weight: 700; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.75rem;">
              ${currentLang === 'bn' ? 'প্রজেক্ট ইনফরমেশন' : 'Project Metadata'}
            </h3>

            <div style="margin-bottom: 1.25rem;">
              <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">${currentLang === 'bn' ? 'ক্লায়েন্ট' : 'Client'}</span>
              <p style="font-weight: 600; font-size: 0.95rem;">${currentLang === 'bn' ? project.client_bn : project.client_en}</p>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">${currentLang === 'bn' ? 'ব্যবহৃত প্রযুক্তি' : 'Technologies Used'}</span>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                ${project.techs.map(t => `<span class="tech-badge" style="background: rgba(56, 189, 248, 0.15); color: var(--accent-blue);">${t}</span>`).join('')}
              </div>
            </div>

            <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
              <i class="fas fa-external-link-alt"></i> ${currentLang === 'bn' ? 'লাইভ সাইটে যান' : 'Visit Live Project'}
            </a>
          </div>
        </div>
      </div>
    `;

    const freeTextForm = document.getElementById('others-free-text-form');
    if (freeTextForm) {
      freeTextForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textVal = document.getElementById('others-custom-text')?.value.trim() || '';
        if (!textVal) return;
        const waMessage = `*Custom Project Request — WebWorldBD*\n\n*Requirement Details:*\n${textVal}`;
        const waUrl = `https://wa.me/8801342697743?text=${encodeURIComponent(waMessage)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      });
    }
  }

  /* --------------------------------------------------------------------------
     7b. Dedicated Service Detail Page View Handler
     -------------------------------------------------------------------------- */
  function initServiceDetailPage() {
    const container = document.getElementById('service-detail-app');
    if (!container) return;

    const attrSlug = container.getAttribute('data-service-slug');
    let serviceSlug = attrSlug;

    if (!serviceSlug) {
      const pathParts = window.location.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      serviceSlug = fileName.replace('.html', '');
    }

    const service = portfolioData.services.find(s => s.slug === serviceSlug || s.id === serviceSlug) || portfolioData.services[0];

    document.title = `${currentLang === 'bn' ? service.title_bn : service.title_en} | WebWorldBD`;

    const titleText = currentLang === 'bn' ? service.title_bn : service.title_en;
    const descText = currentLang === 'bn' ? service.desc_bn : service.desc_en;
    const overviewText = currentLang === 'bn' ? service.overview_bn : service.overview_en;
    const includesList = currentLang === 'bn' ? service.includes_bn : service.includes_en;
    const featuresList = currentLang === 'bn' ? service.features_bn : service.features_en;
    const audienceList = currentLang === 'bn' ? service.audience_bn : service.audience_en;
    const deliveryText = currentLang === 'bn' ? service.delivery_bn : service.delivery_en;
    const revisionsText = currentLang === 'bn' ? service.revisions_bn : service.revisions_en;
    const responsiveText = currentLang === 'bn' ? service.responsive_bn : service.responsive_en;

    const isSubdir = window.location.pathname.includes('/services/');
    const startProjectUrl = isSubdir ? '../start-project.html?service=others' : 'start-project.html?service=others';
    const contactLink = service.id === 'others' ? startProjectUrl : getContactUrl();
    const servicesLink = getServicesPageUrl();
    const homeLink = getHomeUrl();

    container.innerHTML = `
      <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <a href="${servicesLink}" class="btn btn-secondary" style="padding: 0.45rem 0.9rem; font-size: 0.85rem; border-radius: var(--radius-full);">
          <i class="fas fa-arrow-left"></i> ${translations[currentLang].btnBackToServices}
        </a>
        <nav style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-muted); flex-wrap: wrap;">
          <a href="${homeLink}" style="color: var(--text-muted); text-decoration: none;">
            <i class="fas fa-home"></i> ${translations[currentLang].breadcrumbHome}
          </a>
          <span>/</span>
          <a href="${servicesLink}" style="color: var(--text-muted); text-decoration: none;">
            ${translations[currentLang].breadcrumbServices}
          </a>
          <span>/</span>
          <span style="color: var(--accent-blue); font-weight: 600;">${titleText}</span>
        </nav>
      </div>

      <div class="glass-card" style="padding: 2.5rem; margin-bottom: 2.5rem; border-color: rgba(56, 189, 248, 0.3);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
            <div class="service-icon" style="width: 70px; height: 70px; font-size: 2rem; margin-bottom: 0;">
              <i class="${service.icon || 'fas fa-laptop-code'}"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.4rem;">
                <h1 style="font-size: 2.2rem; font-weight: 800; margin: 0;">${titleText}</h1>
              </div>
              <p style="color: var(--text-muted); font-size: 1.05rem; max-width: 650px; margin: 0;">
                ${descText}
              </p>
            </div>
          </div>
          <div>
            <a href="${contactLink}" class="btn btn-primary" style="padding: 0.85rem 1.8rem; font-size: 1rem;">
              <i class="fas fa-rocket"></i> ${translations[currentLang].btnStartProjectNow}
            </a>
          </div>
        </div>
      </div>

      ${service.id === 'others' ? `
      <div class="glass-card" style="padding: 2.25rem; margin-bottom: 2.5rem; border-color: rgba(56, 189, 248, 0.4);">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--accent-blue); display: flex; align-items: center; gap: 0.6rem;">
          <i class="fas fa-pen-to-square"></i> ${translations[currentLang].formCustomDescLabel}
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 1.25rem;">
          ${translations[currentLang].formCustomDescPlaceholder}
        </p>
        <form id="others-free-text-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <textarea id="others-custom-text" rows="4" class="form-control" style="width: 100%; padding: 0.85rem 1.1rem; border-radius: var(--radius-md); background: var(--bg-glass); border: 1px solid var(--border-glass); color: var(--text-main); font-family: inherit; font-size: 0.98rem;" placeholder="${translations[currentLang].formCustomDescPlaceholder}" required></textarea>
          <div style="display: flex; gap: 0.85rem; flex-wrap: wrap;">
            <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.5rem;">
              <i class="fab fa-whatsapp"></i> ${currentLang === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান' : 'Submit via WhatsApp'}
            </button>
            <a href="${startProjectUrl}" class="btn btn-secondary" style="padding: 0.75rem 1.5rem;">
              <i class="fas fa-clipboard-list"></i> ${translations[currentLang].formSubmitBtn}
            </a>
          </div>
        </form>
      </div>
      ` : ''}

      <div class="glass-card" style="padding: 2.25rem; margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--accent-blue); display: flex; align-items: center; gap: 0.6rem;">
          <i class="fas fa-info-circle"></i> ${translations[currentLang].sectionOverviewTitle}
        </h2>
        <p style="color: var(--text-main); font-size: 1.08rem; line-height: 1.85; margin: 0;">
          ${overviewText}
        </p>
      </div>

      <div class="glass-card" style="padding: 2.25rem; margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--accent-blue); display: flex; align-items: center; gap: 0.6rem;">
          <i class="fas fa-list-check"></i> ${translations[currentLang].sectionIncludesTitle}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
          ${includesList.map(item => `
            <div style="display: flex; align-items: flex-start; gap: 0.75rem; background: var(--bg-glass); border: 1px solid var(--border-glass); padding: 0.9rem 1.1rem; border-radius: var(--radius-md);">
              <i class="fas fa-check-circle" style="color: var(--accent-blue); font-size: 1.15rem; margin-top: 3px; flex-shrink: 0;"></i>
              <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-main); line-height: 1.5;">${item}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--accent-blue); display: flex; align-items: center; gap: 0.6rem;">
          <i class="fas fa-star"></i> ${translations[currentLang].sectionFeaturesTitle}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          ${featuresList.map(feat => `
            <div class="glass-card" style="padding: 1.75rem;">
              <div class="service-icon" style="margin-bottom: 1rem;">
                <i class="${feat.icon}"></i>
              </div>
              <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">${feat.title}</h3>
              <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0; line-height: 1.6;">${feat.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="glass-card" style="padding: 2.25rem; margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--accent-blue); display: flex; align-items: center; gap: 0.6rem;">
          <i class="fas fa-bullseye"></i> ${translations[currentLang].sectionAudienceTitle}
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.85rem;">
          ${audienceList.map(aud => `
            <div style="padding: 0.6rem 1.3rem; border-radius: var(--radius-full); background: rgba(56, 189, 248, 0.1); border: 1px solid var(--border-glow); color: var(--text-main); font-weight: 600; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 0.5rem;">
              <i class="fas fa-user-check" style="color: var(--accent-blue);"></i>
              ${aud}
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom: 3rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--accent-blue); display: flex; align-items: center; gap: 0.6rem;">
          <i class="fas fa-clock-rotate-left"></i> ${translations[currentLang].sectionDeliveryTitle}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
          <div class="glass-card" style="padding: 1.5rem; text-align: center;">
            <i class="fas fa-truck-fast" style="font-size: 2rem; color: var(--accent-blue); margin-bottom: 0.75rem;"></i>
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.3rem;">${translations[currentLang].cardDeliveryTime}</h4>
            <p style="color: var(--accent-blue); font-weight: 700; font-size: 1.1rem; margin: 0;">${deliveryText}</p>
          </div>

          <div class="glass-card" style="padding: 1.5rem; text-align: center;">
            <i class="fas fa-rotate-left" style="font-size: 2rem; color: var(--accent-purple); margin-bottom: 0.75rem;"></i>
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.3rem;">${translations[currentLang].cardRevisionPolicy}</h4>
            <p style="color: var(--accent-purple); font-weight: 700; font-size: 1.1rem; margin: 0;">${revisionsText}</p>
          </div>

          <div class="glass-card" style="padding: 1.5rem; text-align: center;">
            <i class="fas fa-mobile-screen-button" style="font-size: 2rem; color: var(--accent-emerald); margin-bottom: 0.75rem;"></i>
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.3rem;">${translations[currentLang].cardMobileOptimization}</h4>
            <p style="color: var(--accent-emerald); font-weight: 700; font-size: 1.1rem; margin: 0;">${responsiveText}</p>
          </div>
        </div>
      </div>

      <div class="glass-card" style="padding: 2.75rem; text-align: center; border-color: rgba(56, 189, 248, 0.4); background: linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.85) 100%);">
        <h3 style="font-size: 1.85rem; margin-bottom: 0.75rem; font-weight: 800;">
          ${currentLang === 'bn' ? `আপনার ${service.title_bn} প্রজেক্ট শুরু করতে প্রস্তুত?` : `Ready to start your ${service.title_en} project?`}
        </h3>
        <p style="color: var(--text-muted); max-width: 620px; margin: 0 auto 1.75rem; font-size: 1.05rem;">
          ${currentLang === 'bn' ? 'আমাদের সাথে সরাসরি হোয়াটসঅ্যাপ, টেলিগ্রাম বা ফাইভারের মাধ্যমে যোগাযোগ করুন।' : 'Get in touch directly via WhatsApp, Telegram, or Fiverr to discuss your project.'}
        </p>
        <div style="display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap;">
          <a href="${contactLink}" class="btn btn-primary" style="padding: 0.85rem 1.8rem; font-size: 1rem;">
            <i class="fas fa-paper-plane"></i> ${translations[currentLang].btnStartProjectNow}
          </a>
          <a href="https://wa.me/8801342697743" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="padding: 0.85rem 1.5rem; font-size: 1rem;">
            <i class="fab fa-whatsapp"></i> ${translations[currentLang].btnWhatsAppNav}
          </a>
          <a href="${portfolioData.profile.telegram}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.85rem 1.5rem; font-size: 1rem;">
            <i class="fab fa-telegram"></i> ${translations[currentLang].btnTelegram}
          </a>
          <a href="${portfolioData.profile.fiverrWebGig || portfolioData.profile.fiverrProfile}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.85rem 1.5rem; font-size: 1rem; border-color: #1dbf73; color: #1dbf73;">
            <i class="fas fa-store"></i> ${translations[currentLang].btnFiverr}
          </a>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     7c. Viewport Entrance Scroll Animations
     -------------------------------------------------------------------------- */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animatedElements.forEach(el => observer.observe(el));
  }

  /* --------------------------------------------------------------------------
     8. Back to Top & Contact Form
     -------------------------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     9. Client Account Auth Tabs Switcher & Interactivity
     -------------------------------------------------------------------------- */
  function initAuthTabs() {
    const authCardContainer = document.getElementById('auth-card-container');
    const loginTabBtn = document.getElementById('tab-btn-login');
    const regTabBtn = document.getElementById('tab-btn-register');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const userDashView = document.getElementById('dashboard-user-view');
    const tabsWrapper = document.getElementById('auth-tabs-wrapper');
    const alertBox = document.getElementById('auth-alert-box');
    const alertMsg = document.getElementById('auth-alert-message');
    const alertClose = document.getElementById('auth-alert-close');
    const forgotPassLink = document.getElementById('forgot-password-link');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (!authCardContainer || !loginTabBtn || !regTabBtn || !loginForm || !regForm) return;

    function showAlert(message, type = 'error') {
      if (!alertBox || !alertMsg) return;
      alertBox.className = `auth-alert-box alert-${type}`;
      alertMsg.textContent = message;
      alertBox.style.display = 'flex';
    }

    function hideAlert() {
      if (alertBox) alertBox.style.display = 'none';
    }

    if (alertClose) {
      alertClose.addEventListener('click', hideAlert);
    }

    function setFieldError(fieldId, errorMsg) {
      const input = document.getElementById(fieldId);
      const errorSpan = document.getElementById(`${fieldId}-error`);
      if (input) input.classList.add('is-invalid');
      if (errorSpan) {
        errorSpan.textContent = errorMsg;
        errorSpan.classList.add('visible');
      }
    }

    function clearFieldErrors() {
      const invalidInputs = document.querySelectorAll('.auth-form .form-control');
      invalidInputs.forEach(i => i.classList.remove('is-invalid'));
      const errorSpans = document.querySelectorAll('.field-error-msg');
      errorSpans.forEach(s => {
        s.textContent = '';
        s.classList.remove('visible');
      });
      hideAlert();
    }

    function switchAuthTab(targetTab) {
      clearFieldErrors();
      if (targetTab === 'login') {
        authCardContainer.setAttribute('data-active-tab', 'login');
        loginTabBtn.classList.add('active');
        regTabBtn.classList.remove('active');
        loginForm.style.display = 'flex';
        regForm.style.display = 'none';
        if (forgotForm) forgotForm.style.display = 'none';
        if (tabsWrapper) tabsWrapper.style.display = 'flex';
      } else if (targetTab === 'register') {
        authCardContainer.setAttribute('data-active-tab', 'register');
        regTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        regForm.style.display = 'flex';
        loginForm.style.display = 'none';
        if (forgotForm) forgotForm.style.display = 'none';
        if (tabsWrapper) tabsWrapper.style.display = 'flex';
      } else if (targetTab === 'forgot') {
        loginForm.style.display = 'none';
        regForm.style.display = 'none';
        if (forgotForm) forgotForm.style.display = 'flex';
        if (tabsWrapper) tabsWrapper.style.display = 'none';
      }
    }

    loginTabBtn.addEventListener('click', () => switchAuthTab('login'));
    regTabBtn.addEventListener('click', () => switchAuthTab('register'));

    if (forgotPassLink) {
      forgotPassLink.addEventListener('click', () => switchAuthTab('forgot'));
    }

    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => switchAuthTab('login'));
    }

    const passwordToggleBtns = document.querySelectorAll('.password-toggle-btn');
    passwordToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (!input) return;
        const icon = btn.querySelector('i');

        if (input.type === 'password') {
          input.type = 'text';
          if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          }
        } else {
          input.type = 'password';
          if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        }
      });
    });

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        const mod = window.FirebaseModule;
        if (mod && mod.auth && mod.signOut) {
          mod.signOut(mod.auth).then(() => {
            if (userDashView) userDashView.style.display = 'none';
            const infoNotice = document.getElementById('auth-info-notice');
            if (infoNotice) infoNotice.style.display = 'flex';
            switchAuthTab('register');
            showAlert(currentLang === 'bn' ? 'সফলভাবে লগআউট করা হয়েছে।' : 'Logged out successfully.', 'info');
          }).catch(err => {
            showAlert(getFirebaseErrorMessage(err ? err.code : ''), 'error');
          });
        }
      });
    }

    function getFirebaseErrorMessage(errorCode) {
      switch (errorCode) {
        case 'auth/email-already-in-use':
          return translations[currentLang].errEmailInUse;
        case 'auth/weak-password':
          return translations[currentLang].errWeakPassword;
        case 'auth/user-not-found':
          return translations[currentLang].errUserNotFound;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return translations[currentLang].errWrongPassword;
        case 'auth/popup-closed-by-user':
          return translations[currentLang].errPopupClosed;
        case 'auth/invalid-email':
          return translations[currentLang].errEmailRequired;
        case 'auth/unauthorized-domain':
          return currentLang === 'bn'
            ? 'এই ডোমেইনটি Firebase Auth-এ অনুমোদিত নয় (unauthorized domain)।'
            : 'This domain is not authorized for Firebase Auth.';
        case 'auth/network-request-failed':
          return currentLang === 'bn'
            ? 'নেটওয়ার্ক সংযোগ পাওয়া যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।'
            : 'Network request failed. Please check your internet connection.';
        case 'auth/too-many-requests':
          return currentLang === 'bn'
            ? 'অতিরিক্ত চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।'
            : 'Access temporarily blocked due to too many requests. Try again later.';
        default:
          return translations[currentLang].errAuthDefault;
      }
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFieldErrors();

      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      const submitBtn = document.getElementById('login-submit-btn');

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value : '';

      let hasError = false;

      if (!email || !isValidEmail(email)) {
        setFieldError('login-email', translations[currentLang].errEmailRequired);
        hasError = true;
      }

      if (!password || password.length < 6) {
        setFieldError('login-password', translations[currentLang].errPasswordRequired);
        hasError = true;
      }

      if (hasError) return;

      submitBtn.classList.add('loading');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnIcon = submitBtn.querySelector('.btn-icon');
      const originalText = btnText ? btnText.textContent : '';

      if (btnText) {
        btnText.innerHTML = `<span class="btn-spinner"></span>${currentLang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Authenticating...'}`;
      }
      if (btnIcon) btnIcon.style.display = 'none';

      const mod = window.FirebaseModule;
      if (mod && mod.auth && mod.signInWithEmailAndPassword) {
        mod.signInWithEmailAndPassword(mod.auth, email, password)
          .then(() => {
            submitBtn.classList.remove('loading');
            if (btnText) btnText.textContent = originalText;
            if (btnIcon) btnIcon.style.display = 'inline-block';
            showAlert(translations[currentLang].msgLoginSuccess, 'success');
          })
          .catch((error) => {
            submitBtn.classList.remove('loading');
            if (btnText) btnText.textContent = originalText;
            if (btnIcon) btnIcon.style.display = 'inline-block';
            showAlert(getFirebaseErrorMessage(error ? error.code : ''), 'error');
          });
      } else {
        submitBtn.classList.remove('loading');
        if (btnText) btnText.textContent = originalText;
        if (btnIcon) btnIcon.style.display = 'inline-block';
        showAlert(translations[currentLang].errAuthDefault, 'error');
      }
    });

    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFieldErrors();

      const nameInput = document.getElementById('reg-name');
      const emailInput = document.getElementById('reg-email');
      const passInput = document.getElementById('reg-password');
      const confirmInput = document.getElementById('reg-confirm-password');
      const submitBtn = document.getElementById('reg-submit-btn');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value : '';
      const confirmPassword = confirmInput ? confirmInput.value : '';

      let hasError = false;

      if (!name) {
        setFieldError('reg-name', translations[currentLang].errNameRequired);
        hasError = true;
      }

      if (!email || !isValidEmail(email)) {
        setFieldError('reg-email', translations[currentLang].errEmailRequired);
        hasError = true;
      }

      if (!password || password.length < 6) {
        setFieldError('reg-password', translations[currentLang].errPasswordRequired);
        hasError = true;
      }

      if (password !== confirmPassword) {
        setFieldError('reg-confirm', translations[currentLang].errPasswordMismatch);
        hasError = true;
      }

      if (hasError) return;

      submitBtn.classList.add('loading');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnIcon = submitBtn.querySelector('.btn-icon');
      const originalText = btnText ? btnText.textContent : '';

      if (btnText) {
        btnText.innerHTML = `<span class="btn-spinner"></span>${currentLang === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}`;
      }
      if (btnIcon) btnIcon.style.display = 'none';

      const mod = window.FirebaseModule;
      if (mod && mod.auth && mod.createUserWithEmailAndPassword) {
        mod.createUserWithEmailAndPassword(mod.auth, email, password)
          .then((userCredential) => {
            const user = userCredential ? userCredential.user : null;
            if (user && mod.updateProfile) {
              return mod.updateProfile(user, { displayName: name });
            }
          })
          .then(() => {
            submitBtn.classList.remove('loading');
            if (btnText) btnText.textContent = originalText;
            if (btnIcon) btnIcon.style.display = 'inline-block';
            showAlert(translations[currentLang].msgRegisterSuccess, 'success');
          })
          .catch((error) => {
            submitBtn.classList.remove('loading');
            if (btnText) btnText.textContent = originalText;
            if (btnIcon) btnIcon.style.display = 'inline-block';
            showAlert(getFirebaseErrorMessage(error ? error.code : ''), 'error');
          });
      } else {
        submitBtn.classList.remove('loading');
        if (btnText) btnText.textContent = originalText;
        if (btnIcon) btnIcon.style.display = 'inline-block';
        showAlert(translations[currentLang].errAuthDefault, 'error');
      }
    });

    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearFieldErrors();

        const resetEmailInput = document.getElementById('reset-email');
        const submitBtn = document.getElementById('reset-submit-btn');
        const email = resetEmailInput ? resetEmailInput.value.trim() : '';

        if (!email || !isValidEmail(email)) {
          setFieldError('reset-email', translations[currentLang].errEmailRequired);
          return;
        }

        submitBtn.classList.add('loading');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnIcon = submitBtn.querySelector('.btn-icon');
        const originalText = btnText ? btnText.textContent : '';

        if (btnText) {
          btnText.innerHTML = `<span class="btn-spinner"></span>${currentLang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}`;
        }
        if (btnIcon) btnIcon.style.display = 'none';

        const mod = window.FirebaseModule;
        if (mod && mod.auth && mod.sendPasswordResetEmail) {
          mod.sendPasswordResetEmail(mod.auth, email)
            .then(() => {
              submitBtn.classList.remove('loading');
              if (btnText) btnText.textContent = originalText;
              if (btnIcon) btnIcon.style.display = 'inline-block';
              switchAuthTab('login');
              showAlert(translations[currentLang].msgResetSuccess, 'success');
            })
            .catch((error) => {
              submitBtn.classList.remove('loading');
              if (btnText) btnText.textContent = originalText;
              if (btnIcon) btnIcon.style.display = 'inline-block';
              showAlert(getFirebaseErrorMessage(error ? error.code : ''), 'error');
            });
        } else {
          submitBtn.classList.remove('loading');
          if (btnText) btnText.textContent = originalText;
          if (btnIcon) btnIcon.style.display = 'inline-block';
          showAlert(translations[currentLang].errAuthDefault, 'error');
        }
      });
    }

    function initGoogleAuth() {
      const customLoginBtn = document.getElementById('custom-google-login-btn');
      const customRegBtn = document.getElementById('custom-google-reg-btn');

      function triggerGoogleSignIn() {
        const mod = window.FirebaseModule;
        if (mod && mod.auth && mod.GoogleAuthProvider && mod.signInWithPopup) {
          const provider = new mod.GoogleAuthProvider();
          mod.signInWithPopup(mod.auth, provider)
            .then(() => {
              showAlert(translations[currentLang].msgGoogleAuthSuccess, 'success');
            })
            .catch((error) => {
              const errCode = error ? error.code : '';
              if (errCode !== 'auth/popup-closed-by-user') {
                showAlert(getFirebaseErrorMessage(errCode), 'error');
              } else {
                showAlert(translations[currentLang].errPopupClosed, 'error');
              }
            });
        } else {
          showAlert(translations[currentLang].errAuthDefault, 'error');
        }
      }

      if (customLoginBtn) customLoginBtn.addEventListener('click', triggerGoogleSignIn);
      if (customRegBtn) customRegBtn.addEventListener('click', triggerGoogleSignIn);
    }

    initGoogleAuth();
  }

  /* --------------------------------------------------------------------------
     9b. Global Firebase Auth State Observer & Nav Updates
     -------------------------------------------------------------------------- */
  function initFirebaseAuthObserver() {
    const userDashView = document.getElementById('dashboard-user-view');
    const authCardContainer = document.getElementById('auth-card-container');
    const authAlertBox = document.getElementById('auth-alert-box');
    const authAlertMsg = document.getElementById('auth-alert-message');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const tabsWrapper = document.getElementById('auth-tabs-wrapper');
    const infoNotice = document.getElementById('auth-info-notice');

    let authLoader = document.getElementById('auth-loading-overlay');
    if (!authLoader && authCardContainer) {
      authLoader = document.createElement('div');
      authLoader.id = 'auth-loading-overlay';
      authLoader.style.cssText = 'text-align: center; padding: 2.5rem 1rem; font-size: 1.1rem; color: var(--accent-blue); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.75rem;';
      authLoader.innerHTML = `<span class="btn-spinner" style="width: 22px; height: 22px; border-width: 3px;"></span> <span>${currentLang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</span>`;
      authCardContainer.insertBefore(authLoader, authCardContainer.firstChild);

      if (loginForm) loginForm.style.display = 'none';
      if (regForm) regForm.style.display = 'none';
      if (forgotForm) forgotForm.style.display = 'none';
      if (tabsWrapper) tabsWrapper.style.display = 'none';
      if (infoNotice) infoNotice.style.display = 'none';
      if (userDashView) userDashView.style.display = 'none';
    }

    let checkAttempts = 0;
    function checkFirebaseModule() {
      const mod = window.FirebaseModule;
      if (mod && mod.auth && mod.onAuthStateChanged) {
        mod.onAuthStateChanged(mod.auth, (user) => {
          if (authLoader) authLoader.style.display = 'none';

          const accountNavSpans = document.querySelectorAll('.nav-menu [data-i18n="navAccount"]');
          const accountSubEl = document.querySelector('[data-i18n="accountSub"]');

          if (user) {
            window.currentUserState = user;

            const userName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');

            accountNavSpans.forEach(span => { span.textContent = userName; });

            if (accountSubEl) accountSubEl.textContent = translations[currentLang].accountSubLoggedIn;

            if (userDashView) {
              const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'SHAFAET HOSSEN SARIP');
              const firstName = displayName.trim().split(' ')[0] || 'Client';

              if (document.getElementById('user-display-name')) document.getElementById('user-display-name').textContent = displayName;
              if (document.getElementById('user-display-email')) document.getElementById('user-display-email').textContent = user.email || '';

              if (document.getElementById('account-profile-name')) document.getElementById('account-profile-name').textContent = displayName;

              // Username handle derivation & Firestore profile details (username, phone)
              let usernameHandle = user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : 'client';
              const phoneRow = document.getElementById('account-profile-phone-row');
              const phoneText = document.getElementById('account-profile-phone');
              const initialPhone = user.phoneNumber || user.phone || '';

              if (phoneRow && phoneText) {
                phoneRow.style.display = 'flex';
                if (initialPhone) {
                  phoneText.textContent = initialPhone;
                } else {
                  const isBn = currentLang === 'bn';
                  const promptLabel = isBn ? '+ ফোন নম্বর যোগ করুন' : '+ Add phone number';
                  phoneText.innerHTML = `<a href="settings.html" style="font-size: 0.88rem; font-weight: 500;">${promptLabel}</a>`;
                }
              }

              const mod = window.FirebaseModule;
              if (mod && mod.db && mod.doc && mod.getDoc) {
                const userDocRef = mod.doc(mod.db, 'users', user.uid);
                mod.getDoc(userDocRef).then(userSnap => {
                  if (userSnap.exists()) {
                    const profileData = userSnap.data();
                    if (profileData.username) {
                      usernameHandle = profileData.username;
                      if (document.getElementById('account-profile-username')) {
                        document.getElementById('account-profile-username').textContent = usernameHandle;
                      }
                    }
                    const userPhone = profileData.phoneNumber || profileData.phone;
                    if (phoneRow && phoneText && userPhone !== undefined) {
                      if (userPhone) {
                        phoneText.textContent = userPhone;
                      } else {
                        const isBn = currentLang === 'bn';
                        const promptLabel = isBn ? '+ ফোন নম্বর যোগ করুন' : '+ Add phone number';
                        phoneText.innerHTML = `<a href="settings.html" style="font-size: 0.88rem; font-weight: 500;">${promptLabel}</a>`;
                      }
                    }
                  } else {
                    // Fallback to sarip doc if users/{uid} does not exist yet
                    const saripRef = mod.doc(mod.db, 'sarip', 'sarip');
                    mod.getDoc(saripRef).then(saripSnap => {
                      if (saripSnap.exists() && (saripSnap.data().uid === user.uid || user.uid === 'dS9uZZToHTUPP1Q3DiWiG25D3Xt2' || user.email === 'webworldbd.lmt@gmail.com' || user.email === 'onlyphone678@gmail.com')) {
                        const sData = saripSnap.data();
                        if (sData.username) {
                          usernameHandle = sData.username;
                          if (document.getElementById('account-profile-username')) {
                            document.getElementById('account-profile-username').textContent = usernameHandle;
                          }
                        }
                        const uPhone = sData.phoneNumber || sData.phone;
                        if (phoneRow && phoneText && uPhone !== undefined) {
                          if (uPhone) phoneText.textContent = uPhone;
                        }
                      }
                    }).catch(e => console.warn('Sarip doc fallback read error:', e));
                  }
                }).catch(e => console.error('Error getting user profile doc:', e));
              }
              if (document.getElementById('account-profile-username')) {
                document.getElementById('account-profile-username').textContent = usernameHandle;
              }

              if (document.getElementById('account-profile-email')) {
                document.getElementById('account-profile-email').textContent = user.email || '';
              }

              if (document.getElementById('account-sidebar-name')) document.getElementById('account-sidebar-name').textContent = displayName;
              if (document.getElementById('account-topbar-name')) document.getElementById('account-topbar-name').textContent = displayName;
              if (document.getElementById('welcome-client-name')) document.getElementById('welcome-client-name').textContent = firstName;

              const firstChar = displayName.trim().charAt(0).toUpperCase() || 'S';

              const avatarEl = document.getElementById('account-user-avatar-img') || document.getElementById('user-avatar-img');
              const avatarInitialEl = document.getElementById('account-user-avatar-initial') || document.getElementById('user-avatar-initial');

              if (user.photoURL) {
                ['account-user-avatar-img', 'account-sidebar-avatar', 'account-topbar-avatar', 'user-avatar-img'].forEach(id => {
                  const img = document.getElementById(id);
                  if (img) {
                    img.src = user.photoURL;
                    img.style.display = 'block';
                  }
                });
                if (avatarInitialEl) avatarInitialEl.style.display = 'none';
              } else {
                if (avatarEl) avatarEl.style.display = 'none';
                if (avatarInitialEl) {
                  avatarInitialEl.textContent = firstChar;
                  avatarInitialEl.style.display = 'flex';
                }
              }

              if (loginForm) loginForm.style.display = 'none';
              if (regForm) regForm.style.display = 'none';
              if (forgotForm) forgotForm.style.display = 'none';
              if (tabsWrapper) tabsWrapper.style.display = 'none';
              if (infoNotice) infoNotice.style.display = 'none';

              const sectionTitle = document.querySelector('.about-section .section-title');
              if (sectionTitle) sectionTitle.style.display = 'none';

              if (authCardContainer) authCardContainer.classList.add('authenticated');

              userDashView.style.display = 'block';

              // Sync Firestore projects for Account Dashboard
              syncAccountDashboardProjects(user.uid);
            }

            // Sync Settings Page Account View
            updateSettingsAccountView(user);

            // Re-render three-dots menu
            if (window.refreshThreeDotsMenu) window.refreshThreeDotsMenu();
          } else {
            window.currentUserState = null;
            accountNavSpans.forEach(span => { span.textContent = translations[currentLang].navAccount; });

            if (accountSubEl) accountSubEl.textContent = translations[currentLang].accountSub;

            // Re-render three-dots menu
            if (window.refreshThreeDotsMenu) window.refreshThreeDotsMenu();

            if (userDashView) {
              userDashView.style.display = 'none';
              if (infoNotice) infoNotice.style.display = 'flex';
              if (tabsWrapper) tabsWrapper.style.display = 'flex';

              const sectionTitle = document.querySelector('.about-section .section-title');
              if (sectionTitle) sectionTitle.style.display = 'block';

              if (authCardContainer) authCardContainer.classList.remove('authenticated');

              const activeTab = authCardContainer ? authCardContainer.getAttribute('data-active-tab') : 'register';
              if (activeTab === 'login') {
                if (loginForm) loginForm.style.display = 'flex';
                if (regForm) regForm.style.display = 'none';
              } else {
                if (regForm) regForm.style.display = 'flex';
                if (loginForm) loginForm.style.display = 'none';
              }
            }

            // Sync Settings Page Account View
            updateSettingsAccountView(null);
          }
        });
      } else {
        checkAttempts++;
        if (checkAttempts > 200) {
          if (authLoader) authLoader.style.display = 'none';
          if (infoNotice) infoNotice.style.display = 'flex';
          if (tabsWrapper) tabsWrapper.style.display = 'flex';
          const activeTab = authCardContainer ? authCardContainer.getAttribute('data-active-tab') : 'register';
          if (activeTab === 'login') {
            if (loginForm) loginForm.style.display = 'flex';
            if (regForm) regForm.style.display = 'none';
          } else {
            if (regForm) regForm.style.display = 'flex';
            if (loginForm) loginForm.style.display = 'none';
          }
          return;
        }
        setTimeout(checkFirebaseModule, 50);
      }
    }

    checkFirebaseModule();
  }

  /* Helper to update account view on settings.html */
  function updateSettingsAccountView(user) {
    const loggedInBox = document.getElementById('settings-account-logged-in');
    const loggedOutBox = document.getElementById('settings-account-logged-out');

    if (!loggedInBox || !loggedOutBox) return;

    if (user) {
      loggedOutBox.style.display = 'none';
      loggedInBox.style.display = 'block';

      const nameEl = document.getElementById('settings-user-name');
      const emailEl = document.getElementById('settings-user-email');
      const photoEl = document.getElementById('settings-user-photo');

      if (nameEl) nameEl.textContent = user.displayName || 'Client User';
      if (emailEl) emailEl.textContent = user.email || '';
      if (photoEl) photoEl.src = user.photoURL || 'profile.jpg';
    } else {
      loggedInBox.style.display = 'none';
      loggedOutBox.style.display = 'block';
    }
  }

  /* --------------------------------------------------------------------------
     10. Custom Project Request Form Handlers (Firestore + WhatsApp Integration)
     -------------------------------------------------------------------------- */
  function initStartProjectForm() {
    const form = document.getElementById('start-project-form');
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const typeSelect = document.getElementById('project-req-type');
    const typeErrorSpan = document.getElementById('project-req-type-error');

    if (typeSelect && serviceParam) {
      const slugMap = {
        'business-website': 'business',
        'business': 'business',
        'ecommerce-website': 'ecommerce',
        'ecommerce': 'ecommerce',
        'portfolio-website': 'portfolio',
        'portfolio': 'portfolio',
        'blog-website': 'blog',
        'blog': 'blog',
        'news-website': 'news',
        'news': 'news',
        'educational-website': 'educational',
        'educational': 'educational',
        'social-media-website': 'social',
        'social-media': 'social',
        'social': 'social',
        'webapp-saas': 'webapp',
        'webapp': 'webapp',
        'booking-website': 'booking',
        'booking': 'booking',
        'marketplace-website': 'marketplace',
        'marketplace': 'marketplace',
        'forum-community-website': 'forum',
        'forum': 'forum',
        'entertainment-website': 'entertainment',
        'entertainment': 'entertainment',
        'landing-page': 'landing',
        'landing': 'landing',
        'government-ngo-website': 'govt-ngo',
        'govt-ngo': 'govt-ngo',
        'government': 'govt-ngo',
        'ai-website': 'ai',
        'ai': 'ai',
        'others': 'other',
        'other': 'other'
      };

      const matchedValue = slugMap[serviceParam.toLowerCase()] || serviceParam;
      if (typeSelect.querySelector(`option[value="${matchedValue}"]`)) {
        typeSelect.value = matchedValue;
      }
    }

    let pendingReqFile = null;
    const fileInput = document.getElementById('project-req-file-input');
    const fileBtn = document.getElementById('btn-project-req-file');
    const fileNameSpan = document.getElementById('project-req-file-name');
    const fileStatusSpan = document.getElementById('project-req-file-status');

    if (fileBtn && fileInput) {
      fileBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const storageMod = window.StorageService;
          if (storageMod && storageMod.validateUploadFile) {
            const val = storageMod.validateUploadFile(file, { maxSizeMB: 5, allowDocuments: true });
            if (!val.valid) {
              if (fileStatusSpan) { fileStatusSpan.textContent = `⚠️ ${val.error}`; fileStatusSpan.style.color = '#EF4444'; }
              fileInput.value = '';
              pendingReqFile = null;
              if (fileNameSpan) fileNameSpan.textContent = '';
              return;
            }
          }
          pendingReqFile = file;
          if (fileNameSpan) fileNameSpan.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
          if (fileStatusSpan) { fileStatusSpan.textContent = currentLang === 'bn' ? 'ফাইলটি প্রজেক্ট রিকুয়েস্টের সাথে যুক্ত হবে।' : 'File ready to attach.'; fileStatusSpan.style.color = 'var(--accent-blue)'; }
        }
      });
    }

    const mobileInput = document.getElementById('project-req-mobile');
    const emailInput = document.getElementById('project-req-email');
    const mobileErrorSpan = document.getElementById('project-req-mobile-error');
    const emailErrorSpan = document.getElementById('project-req-email-error');

    function clearStartProjectErrors() {
      if (typeSelect) typeSelect.classList.remove('is-invalid');
      if (typeErrorSpan) { typeErrorSpan.textContent = ''; typeErrorSpan.style.display = 'none'; }
      if (mobileInput) mobileInput.classList.remove('is-invalid');
      if (emailInput) emailInput.classList.remove('is-invalid');
      if (mobileErrorSpan) { mobileErrorSpan.textContent = ''; mobileErrorSpan.style.display = 'none'; }
      if (emailErrorSpan) { emailErrorSpan.textContent = ''; emailErrorSpan.style.display = 'none'; }
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        if (typeSelect) typeSelect.classList.remove('is-invalid');
        if (typeErrorSpan) { typeErrorSpan.textContent = ''; typeErrorSpan.style.display = 'none'; }
      });
    }

    if (mobileInput) {
      mobileInput.addEventListener('input', () => {
        if (mobileInput) mobileInput.classList.remove('is-invalid');
        if (mobileErrorSpan) { mobileErrorSpan.textContent = ''; mobileErrorSpan.style.display = 'none'; }
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        if (emailInput) emailInput.classList.remove('is-invalid');
        if (emailErrorSpan) { emailErrorSpan.textContent = ''; emailErrorSpan.style.display = 'none'; }
      });
    }

    function validateProjectReqForm() {
      clearStartProjectErrors();

      const name = document.getElementById('project-req-name')?.value.trim() || '';
      const mobile = mobileInput?.value.trim() || '';
      const email = emailInput?.value.trim() || '';
      const categoryVal = typeSelect?.value || '';
      const serviceType = (typeSelect && typeSelect.selectedIndex >= 0 && categoryVal) ? typeSelect.options[typeSelect.selectedIndex].text : '';
      const desc = document.getElementById('project-req-desc')?.value.trim() || '';

      let hasError = false;

      // Category Validation (REQUIRED)
      if (!categoryVal) {
        if (typeSelect) typeSelect.classList.add('is-invalid');
        const catErrorMsg = (translations[currentLang] && translations[currentLang].errCategoryRequired)
          ? translations[currentLang].errCategoryRequired
          : (currentLang === 'bn' ? 'অনুগ্রহ করে প্রজেক্টের ক্যাটাগরি নির্বাচন করুন।' : 'Please select a project category.');
        if (typeErrorSpan) {
          typeErrorSpan.textContent = catErrorMsg;
          typeErrorSpan.style.display = 'block';
        }
        if (window.showToast) window.showToast(catErrorMsg, 'error');
        hasError = true;
      }

      // Full Name Validation
      if (!name) {
        const nameInput = document.getElementById('project-req-name');
        if (nameInput) nameInput.classList.add('is-invalid');
        if (window.showToast) window.showToast(currentLang === 'bn' ? 'অনুগ্রহ করে আপনার নাম প্রদান করুন।' : 'Please enter your full name.', 'error');
        hasError = true;
      }

      // Mobile Number Validation (REQUIRED: Bangladeshi phone format check)
      const bdMobileRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
      if (!mobile || !bdMobileRegex.test(mobile)) {
        if (mobileInput) mobileInput.classList.add('is-invalid');
        const errorMsg = currentLang === 'bn' ? 'সঠিক মোবাইল নম্বর দিন' : 'Please enter a valid mobile number';
        if (mobileErrorSpan) {
          mobileErrorSpan.textContent = errorMsg;
          mobileErrorSpan.style.display = 'block';
        }
        if (window.showToast) window.showToast(errorMsg, 'error');
        hasError = true;
      }

      // Email Address Validation (OPTIONAL: validate format only if filled out)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        if (emailInput) emailInput.classList.add('is-invalid');
        const errorMsg = currentLang === 'bn' ? 'সঠিক ইমেইল ঠিকানা দিন' : 'Please enter a valid email address';
        if (emailErrorSpan) {
          emailErrorSpan.textContent = errorMsg;
          emailErrorSpan.style.display = 'block';
        }
        if (window.showToast) window.showToast(errorMsg, 'error');
        hasError = true;
      }

      if (hasError) return null;

      if (!desc && (!pendingReqFile || pendingReqFile.size === 0)) {
        if (window.showToast) window.showToast(currentLang === 'bn' ? 'অনুগ্রহ করে প্রজেক্টের বিবরণ অথবা একটি ফাইল সংযুক্ত করুন।' : 'Please provide project details or attach a file.', 'error');
        return null;
      }

      return { name, mobile, email, categoryVal, serviceType, desc };
    }

    const whatsappBtn = document.getElementById('btn-project-req-whatsapp');
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        const formData = validateProjectReqForm();
        if (!formData) return;

        const { name, mobile, email, serviceType, desc } = formData;
        const formattedEmail = email ? email : 'প্রদান করা হয়নি';

        const waText =
          `*New Project Request — WebWorldBD*\n\n` +
          `*Name:* ${name}\n` +
          `*Mobile:* ${mobile}\n` +
          `*Email:* ${formattedEmail}\n` +
          `*Project Category:* ${serviceType}\n` +
          `*Requirements:* ${desc}`;

        const waUrl = `https://wa.me/8801342697743?text=${encodeURIComponent(waText)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = validateProjectReqForm();
      if (!formData) return;

      const { name, mobile, email, serviceType, desc } = formData;

      const submitBtn = document.getElementById('btn-project-req-submit') || form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="btn-spinner"></span> ${currentLang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Submitting...'}`;
      }

      const submitFormData = new FormData();
      submitFormData.append('name', name);
      submitFormData.append('fullName', name);
      submitFormData.append('mobile', mobile);
      submitFormData.append('email', email);
      submitFormData.append('category', serviceType);
      submitFormData.append('projectType', serviceType);
      submitFormData.append('description', desc);
      submitFormData.append('requirements', desc);
      if (pendingReqFile) {
        submitFormData.append('file', pendingReqFile);
      }

      try {
        // Upload attachment to Cloudinary if provided
        let uploadedFileURL = null;
        if (pendingReqFile) {
          const storageMod = window.StorageService;
          if (storageMod && storageMod.uploadImage) {
            const uploadRes = await storageMod.uploadImage(pendingReqFile, `project_requests/${Date.now()}`, { allowDocuments: true });
            if (uploadRes && uploadRes.success && uploadRes.url) {
              uploadedFileURL = uploadRes.url;
            }
          }
        }

        const budgetVal = document.getElementById('project-req-budget')?.value.trim() || '';
        const user = window.currentUserState;
        const uid = user ? user.uid : null;
        const userEmail = user ? user.email : email;

        // Write submission into new Firestore collection projectRequests/{autoId}
        const newProjectReqPayload = {
          name: name,
          mobile: mobile,
          email: email,
          projectType: serviceType,
          budget: budgetVal,
          requirements: desc,
          fileURL: uploadedFileURL,
          submittedAt: new Date().toISOString(),
          status: 'new',
          userId: uid,
          userEmail: userEmail
        };

        const mod = window.FirebaseModule;
        if (mod && mod.db && mod.collection && mod.addDoc) {
          await mod.addDoc(mod.collection(mod.db, 'projectRequests'), newProjectReqPayload).catch(err => {
            console.error('Error writing to projectRequests collection:', err);
          });
          // Legacy fallback doc
          await mod.addDoc(mod.collection(mod.db, 'project_requests'), {
            ...newProjectReqPayload,
            requestId: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
            clientName: name,
            contactInfo: mobile + (email ? ' | ' + email : ''),
            serviceName: serviceType,
            description: desc,
            attachmentUrl: uploadedFileURL,
            createdAt: new Date().toISOString()
          }).catch(err => {
            console.error('Error writing to project_requests legacy collection:', err);
          });
        }

        const response = await fetch('/api/submit', {
          method: 'POST',
          body: submitFormData
        }).catch(err => {
          console.warn('API submission warning:', err);
          return { ok: true, json: async () => ({ success: true }) };
        });

        const result = response.ok ? await response.json().catch(() => ({ success: true })) : { success: true };

        const successMsg = currentLang === 'bn'
          ? 'ধন্যবাদ! আপনার রিকোয়েস্ট সফলভাবে জমা হয়েছে।'
          : 'Thank you! Your project request has been submitted successfully.';
        if (window.showToast) {
          window.showToast(successMsg, 'success');
        }

        form.reset();
        pendingReqFile = null;
        if (fileInput) fileInput.value = '';
        if (fileNameSpan) fileNameSpan.textContent = '';
        if (fileStatusSpan) fileStatusSpan.textContent = '';
      } catch (err) {
        console.error('Submit project request error:', err);
        const errMsg = currentLang === 'bn'
          ? (err.message ? `রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে: ${err.message}` : 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।')
          : (err.message ? `Submission failed: ${err.message}` : 'Something went wrong, please try again.');
        if (window.showToast) {
          window.showToast(errMsg, 'error');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     10a2. Support Request Form Handler (Writes to supportRequests)
     -------------------------------------------------------------------------- */
  function initSupportRequestForm() {
    function openSupportModal() {
      let modal = document.getElementById('support-request-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'support-request-modal';
        modal.className = 'settings-modal-overlay';
        modal.innerHTML = `
          <div class="settings-modal-card glass-card" style="max-width: 520px; width: 100%;">
            <div class="dash-card-header" style="margin-bottom: 1.25rem;">
              <h3 class="dash-card-title"><i class="fas fa-headset" style="color: var(--accent-blue);"></i> সাপোর্ট রিকোয়েস্ট পাঠান</h3>
              <button type="button" class="alert-close-btn btn-modal-cancel" aria-label="Close modal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <form id="support-request-form" class="auth-form" style="background: transparent; border: none; padding: 0; box-shadow: none;" novalidate>
              <div class="form-group">
                <label for="support-req-name">পূর্ণ নাম / Name <span style="color: #EF4444;">*</span></label>
                <input type="text" id="support-req-name" class="form-control" placeholder="আপনার নাম" required>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label for="support-req-mobile">মোবাইল নম্বর <span style="color: #EF4444;">*</span></label>
                  <input type="tel" id="support-req-mobile" class="form-control" placeholder="01XXXXXXXXX" required>
                </div>
                <div class="form-group">
                  <label for="support-req-email">ইমেইল ঠিকানা</label>
                  <input type="email" id="support-req-email" class="form-control" placeholder="example@mail.com">
                </div>
              </div>
              <div class="form-group">
                <label for="support-req-subject">বিষয় / Subject <span style="color: #EF4444;">*</span></label>
                <input type="text" id="support-req-subject" class="form-control" placeholder="কী বিষয়ে সাহায্য প্রয়োজন?" required>
              </div>
              <div class="form-group">
                <label for="support-req-message">বিস্তারিত বার্তা / Description <span style="color: #EF4444;">*</span></label>
                <textarea id="support-req-message" class="form-control" rows="4" placeholder="আপনার সমস্যা বা প্রশ্নের বিবরণ প্রদান করুন..." required></textarea>
              </div>
              <div class="form-group">
                <label>ফাইল বা স্ক্রিনশট সংযুক্ত করুন (ঐচ্ছিক)</label>
                <input type="file" id="support-req-file-input" accept="image/*,.pdf,.doc,.docx" style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-top: 0.35rem;">
              </div>
              <div style="display: flex; gap: 0.85rem; justify-content: flex-end; margin-top: 1.25rem;">
                <button type="button" class="btn btn-secondary btn-modal-cancel" style="padding: 0.65rem 1.25rem;">বাতিল</button>
                <button type="submit" class="btn btn-primary" id="btn-support-req-submit" style="padding: 0.65rem 1.5rem;"><i class="fas fa-paper-plane"></i> সাবমিট করুন</button>
              </div>
            </form>
          </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll('.btn-modal-cancel').forEach(btn => {
          btn.addEventListener('click', () => modal.classList.remove('active'));
        });

        const supportForm = document.getElementById('support-request-form');
        if (supportForm) {
          supportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('support-req-name')?.value.trim();
            const mobile = document.getElementById('support-req-mobile')?.value.trim();
            const email = document.getElementById('support-req-email')?.value.trim();
            const subject = document.getElementById('support-req-subject')?.value.trim();
            const message = document.getElementById('support-req-message')?.value.trim();
            const fileInput = document.getElementById('support-req-file-input');
            const file = fileInput?.files?.[0];

            if (!name || !mobile || !subject || !message) {
              if (window.showToast) window.showToast('অনুগ্রহ করে প্রয়োজনীয় ঘরগুলো পূরণ করুন।', 'error');
              return;
            }

            const submitBtn = document.getElementById('btn-support-req-submit');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = `<span class="btn-spinner"></span> পাঠানো হচ্ছে...`; }

            let fileURL = null;
            if (file) {
              const storageMod = window.StorageService;
              if (storageMod && storageMod.uploadImage) {
                const uploadRes = await storageMod.uploadImage(file, `support_requests/${Date.now()}`, { allowDocuments: true });
                if (uploadRes && uploadRes.success && uploadRes.url) {
                  fileURL = uploadRes.url;
                }
              }
            }

            const user = window.currentUserState;
            const uid = user ? user.uid : null;
            const userEmail = user ? user.email : email;

            const supportPayload = {
              name: name,
              mobile: mobile,
              email: email || '',
              subject: subject,
              message: message,
              fileURL: fileURL,
              submittedAt: new Date().toISOString(),
              status: 'new',
              userId: uid,
              userEmail: userEmail
            };

            const mod = window.FirebaseModule;
            if (mod && mod.db && mod.collection && mod.addDoc) {
              await mod.addDoc(mod.collection(mod.db, 'supportRequests'), supportPayload).catch(e => console.error('supportRequests write error:', e));
              await mod.addDoc(mod.collection(mod.db, 'messages'), {
                ...supportPayload,
                contactInfo: mobile + (email ? ' | ' + email : ''),
                createdAt: new Date().toISOString()
              }).catch(e => console.error('messages write error:', e));
            }

            modal.classList.remove('active');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> সাবমিট করুন`; }

            if (window.showToast) window.showToast('সাপোর্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!', 'success');
            supportForm.reset();
          });
        }
      }

      // Pre-fill user data if logged in
      const user = window.currentUserState;
      if (user) {
        if (document.getElementById('support-req-name')) document.getElementById('support-req-name').value = user.displayName || '';
        if (document.getElementById('support-req-email')) document.getElementById('support-req-email').value = user.email || '';
      }

      modal.classList.add('active');
    }

    // Attach click listener to support request buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-open-support-modal, .btn-open-support-modal, [data-action="request-support"]');
      if (btn) {
        e.preventDefault();
        openSupportModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     10b. Dashboard UI Interactivity & Client Route Protection Handlers
     -------------------------------------------------------------------------- */
  function initDashboardUI() {
    const sidebar = document.getElementById('dash-sidebar');
    const overlay = document.getElementById('dash-sidebar-overlay');
    const hamburgerBtn = document.getElementById('dash-hamburger-btn');
    const closeBtn = document.getElementById('dash-sidebar-close');

    const isDashboardPage = window.location.pathname.endsWith('dashboard.html');
    if (!sidebar && !isDashboardPage) return;

    if (sidebar) {
      function openDashSidebar() {
        sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closeDashSidebar() {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      }

      if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openDashSidebar();
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', closeDashSidebar);
      }

      if (overlay) {
        overlay.addEventListener('click', closeDashSidebar);
      }
    }

    // Client Dashboard Route Protection & Dynamic Section Switching
    if (isDashboardPage) {
      function checkClientAuth() {
        const mod = window.FirebaseModule;
        if (!mod || !mod.auth || !mod.onAuthStateChanged) {
          setTimeout(checkClientAuth, 50);
          return;
        }

        mod.onAuthStateChanged(mod.auth, (user) => {
          if (!user) {
            // Unauthenticated - redirect to account.html
            window.location.href = 'account.html';
          } else {
            // Authenticated Client
            window.currentUserState = user;
            const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Valued Client');

            const clientTopbarName = document.getElementById('client-topbar-name');
            const clientSidebarName = document.getElementById('client-sidebar-name');
            const welcomeUserName = document.getElementById('welcome-user-name');
            const clientSidebarAvatar = document.getElementById('client-sidebar-avatar');
            const clientTopbarAvatar = document.getElementById('client-topbar-avatar');

            if (clientTopbarName) clientTopbarName.textContent = displayName;
            if (clientSidebarName) clientSidebarName.textContent = displayName;
            if (welcomeUserName) welcomeUserName.textContent = displayName;

            if (user.photoURL) {
              if (clientSidebarAvatar) clientSidebarAvatar.src = user.photoURL;
              if (clientTopbarAvatar) clientTopbarAvatar.src = user.photoURL;
            }

            // Real-time Firestore sync for Client Dashboard
            initClientFirestoreSync(user.uid);
          }
        });
      }

      function initClientFirestoreSync(uid) {
        const mod = window.FirebaseModule;
        if (!mod || !mod.db || !mod.collection || !mod.query || !mod.where || !mod.onSnapshot) return;

        const projectsQuery = mod.query(mod.collection(mod.db, 'projects'), mod.where('userId', '==', uid));
        mod.onSnapshot(projectsQuery, (snapshot) => {
          let total = 0;
          let active = 0;
          let completed = 0;
          let pending = 0;
          const userProjects = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            userProjects.push(data);
            total++;

            const st = (data.status || '').toLowerCase();
            if (st === 'completed') completed++;
            else if (st === 'pending') pending++;
            else active++;
          });

          // Update Dashboard Summary Stats Cards
          const statCards = document.querySelectorAll('.dash-stats-row .dash-stat-card .stat-number');
          if (statCards.length >= 3) {
            statCards[0].textContent = total;
            statCards[1].textContent = active;
            statCards[2].textContent = completed;
          }
        }, (error) => {
          console.error('Error fetching client projects:', error);
        });
      }

      checkClientAuth();

      // Dynamic Sidebar Section Navigation Switching
      const navItems = document.querySelectorAll('.dash-nav-item[data-nav]');
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const navTarget = item.getAttribute('data-nav');
          if (navTarget === 'start-project' || navTarget === 'account' || item.getAttribute('href').endsWith('.html')) {
            return; // Normal link navigation
          }

          e.preventDefault();
          navItems.forEach(i => i.classList.remove('active'));
          item.classList.add('active');

          if (sidebar) sidebar.classList.remove('active');
          if (overlay) overlay.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
     10b2. Client Account Dashboard UI Interactivity & Tab Navigation
     -------------------------------------------------------------------------- */
  function initAccountDashboardUI() {
    const sidebar = document.getElementById('account-sidebar');
    const overlay = document.getElementById('account-sidebar-overlay');
    const hamburgerBtn = document.getElementById('account-hamburger-btn');
    const closeBtn = document.getElementById('account-sidebar-close');
    const themeBtn = document.getElementById('account-theme-toggle-btn');
    const editProfileBtn = document.getElementById('account-edit-profile-btn');

    if (sidebar) {
      function openAccountSidebar() {
        sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closeAccountSidebar() {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      }

      if (hamburgerBtn) hamburgerBtn.addEventListener('click', (e) => { e.stopPropagation(); openAccountSidebar(); });
      if (closeBtn) closeBtn.addEventListener('click', closeAccountSidebar);
      if (overlay) overlay.addEventListener('click', closeAccountSidebar);
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
      });
    }

    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        const editModal = document.getElementById('edit-profile-modal');
        if (editModal) {
          openEditProfileModal();
        } else {
          window.location.href = 'settings.html';
        }
      });
    }

    // Tab Switching Logic for Account Dashboard
    const navLinks = document.querySelectorAll('[data-account-nav]');
    const tabPanes = {
      'overview': document.getElementById('tab-pane-overview'),
      'my-projects': document.getElementById('tab-pane-my-projects'),
      'messages': document.getElementById('tab-pane-messages'),
      'invoices': document.getElementById('tab-pane-invoices')
    };

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const navTarget = link.getAttribute('data-account-nav');
        if (!tabPanes[navTarget]) return;

        e.preventDefault();

        // Active class on sidebar/action links
        document.querySelectorAll('[data-account-nav]').forEach(item => {
          if (item.getAttribute('data-account-nav') === navTarget && item.classList.contains('dash-nav-item')) {
            item.classList.add('active');
          } else if (item.classList.contains('dash-nav-item')) {
            item.classList.remove('active');
          }
        });

        // Switch pane visibility
        Object.keys(tabPanes).forEach(key => {
          if (tabPanes[key]) {
            if (key === navTarget) {
              tabPanes[key].style.display = 'block';
              tabPanes[key].classList.add('active');
            } else {
              tabPanes[key].style.display = 'none';
              tabPanes[key].classList.remove('active');
            }
          }
        });

        // Page title map
        const titleEl = document.getElementById('account-page-title');
        if (titleEl) {
          const map = {
            'overview': currentLang === 'bn' ? 'ক্লায়েন্ট ড্যাশবোর্ড' : 'Client Dashboard',
            'my-projects': currentLang === 'bn' ? 'আমার প্রজেক্টসমূহ' : 'My Projects',
            'messages': currentLang === 'bn' ? 'মেসেজ ও সাপোর্ট' : 'Messages & Support',
            'invoices': currentLang === 'bn' ? 'ইনভয়েস ও বিলিং' : 'Invoices & Billing'
          };
          titleEl.textContent = map[navTarget] || (currentLang === 'bn' ? 'ক্লায়েন্ট ড্যাশবোর্ড' : 'Client Dashboard');
        }

        // Close sidebar if mobile open
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Invoice download handler
    document.querySelectorAll('.btn-download-invoice').forEach(btn => {
      btn.addEventListener('click', () => {
        const invId = btn.getAttribute('data-invoice-id') || 'INV-2026-002';
        const client = btn.getAttribute('data-client') || 'SHAFAET HOSSEN SARIP';
        const project = btn.getAttribute('data-project') || 'Web Development Service';
        const amount = btn.getAttribute('data-amount') || '$180.00';
        const date = btn.getAttribute('data-date') || '2026-04-08';

        if (window.showToast) {
          window.showToast(`Generating Invoice #${invId}...`, 'info');
        }

        const invoiceContent = `
==================================================
                 WEBWORLDBD INVOICE
==================================================
Invoice ID: #${invId}
Date: ${date}
Status: PAID

CLIENT DETAILS:
--------------------------------------------------
Client Name: ${client}
ServiceProvider: WebWorldBD (SHAFAET HOSSEN SARIP)
Contact: saripofficialsupport@gmail.com

PROJECT DETAILS:
--------------------------------------------------
Project Name: ${project}
Amount Paid: ${amount}
Payment Status: Completed

Thank you for choosing WebWorldBD!
Website: https://webworldbd.com
==================================================
        `.trim();

        const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${invId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  }

  function syncAccountDashboardProjects(uid) {
    const mod = window.FirebaseModule;
    if (!mod || !mod.db || !mod.collection || !mod.query || !mod.where || !mod.onSnapshot) return;

    const projectsQuery = mod.query(mod.collection(mod.db, 'projects'), mod.where('userId', '==', uid));
    mod.onSnapshot(projectsQuery, (snapshot) => {
      let total = 0;
      let active = 0;
      let completed = 0;
      let pending = 0;
      const userProjects = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        userProjects.push(data);
        total++;

        const st = (data.status || '').toLowerCase();
        if (st === 'completed') completed++;
        else if (st === 'pending') pending++;
        else active++;
      });

      if (total > 0) {
        if (document.getElementById('stat-total-projects')) document.getElementById('stat-total-projects').textContent = total;
        if (document.getElementById('stat-active-projects')) document.getElementById('stat-active-projects').textContent = active;
        if (document.getElementById('stat-completed-projects')) document.getElementById('stat-completed-projects').textContent = completed;
        if (document.getElementById('sidebar-projects-badge')) document.getElementById('sidebar-projects-badge').textContent = total;

        const recentTbody = document.getElementById('recent-projects-tbody');
        const myProjectsTbody = document.getElementById('my-projects-tbody');

        if (recentTbody || myProjectsTbody) {
          const rowsHtml = userProjects.map(p => {
            const progress = p.progress || 0;
            const status = p.status || 'Active';
            let badge = `<span class="badge-status status-active"><i class="fas fa-sync fa-spin"></i> ${status}</span>`;
            if (status.toLowerCase() === 'completed') {
              badge = `<span class="badge-status status-completed"><i class="fas fa-check"></i> Completed</span>`;
            } else if (status.toLowerCase() === 'pending') {
              badge = `<span class="badge-status status-pending"><i class="fas fa-clock"></i> Pending</span>`;
            }

            const projName = escapeHtml(p.projectName || 'Web Development Project');
            const projId = escapeHtml(p.projectId || p.id);
            return `
              <tr>
                <td>
                  <div class="dash-table-project-name">
                    ${projName}
                    <span class="dash-table-project-sub">ID: ${projId}</span>
                  </div>
                </td>
                <td>${badge}</td>
                <td>
                  <div class="dash-progress-wrapper">
                    <div class="dash-progress-bar">
                      <div class="dash-progress-fill" style="width: ${progress}%;"></div>
                    </div>
                    <span class="dash-progress-text">${progress}%</span>
                  </div>
                </td>
                <td><span class="dash-date-badge"><i class="fas fa-calendar-day"></i> Active</span></td>
                <td>
                  <a href="project-details.html?id=${encodeURIComponent(p.id)}" class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">Details</a>
                </td>
              </tr>
            `;
          }).join('');

          if (recentTbody) recentTbody.innerHTML = rowsHtml;
          if (myProjectsTbody) myProjectsTbody.innerHTML = rowsHtml;
        }
      }
    }, (error) => {
      console.error('Error syncing account dashboard projects:', error);
    });
  }

  /* --------------------------------------------------------------------------
     10c. Admin Dashboard UI & Security Authorization Guard
     -------------------------------------------------------------------------- */
  function initAdminDashboardUI() {
    const isAdminPage = document.getElementById('admin-section-overview') !== null || getNormalizedPath() === '/admin';
    if (!isAdminPage) return;

    // Show initial loading overlay for Admin route protection
    const dashWrapper = document.querySelector('.dash-wrapper');
    let adminLoader = document.getElementById('admin-auth-loading-overlay');
    if (!adminLoader && dashWrapper) {
      adminLoader = document.createElement('div');
      adminLoader.id = 'admin-auth-loading-overlay';
      adminLoader.style.cssText = 'position: fixed; inset: 0; background: var(--bg-dark, #0B0F17); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--text-main, #FFFFFF);';
      adminLoader.innerHTML = `<span class="btn-spinner" style="width: 36px; height: 36px; border-width: 3px; border-color: rgba(56,189,248,0.2); border-top-color: var(--accent-blue);"></span><div style="font-weight: 600; font-size: 1.05rem;">Verifying Admin Access...</div>`;
      dashWrapper.appendChild(adminLoader);
    }

    const ADMIN_UID = 'dS9uZZToHTUPP1Q3DiWiG25D3Xt2';
    const ADMIN_EMAIL = 'webworldbd.lmt@gmail.com';
    let registeredUsersCache = [];
    let activeAdminSelectedUserId = null;
    let activeAdminChatMessagesUnsubscribe = null;

    function checkAdminAuth() {
      const mod = window.FirebaseModule;
      if (!mod || !mod.auth || !mod.onAuthStateChanged) {
        setTimeout(checkAdminAuth, 50);
        return;
      }

      mod.onAuthStateChanged(mod.auth, async (user) => {
        const isSuperAdmin = (u) => u && (u.uid === ADMIN_UID || u.email === ADMIN_EMAIL || u.email === 'onlyphone678@gmail.com');

        if (!user || !isSuperAdmin(user)) {
          if (adminLoader) adminLoader.style.display = 'none';
          if (window.showToast) window.showToast('Access Denied: Admin authorization required.', 'error');
          window.location.href = 'account.html';
          return;
        }

        if (adminLoader) adminLoader.style.display = 'none';

        // Helper function to update Admin Name & Photo consistently across all admin UI elements
        function syncAdminHeaderInfo() {
          const currentAdmin = window.currentUserState || user;
          const adminName = (currentAdmin && currentAdmin.displayName) ? currentAdmin.displayName : 'SHAFAET HOSSEN SARIP';
          ['admin-sidebar-name', 'admin-topbar-name', 'admin-settings-name'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = adminName;
          });
          if (currentAdmin && currentAdmin.photoURL) {
            ['admin-sidebar-avatar', 'admin-topbar-avatar', 'admin-settings-avatar'].forEach(id => {
              const img = document.getElementById(id);
              if (img) img.src = currentAdmin.photoURL;
            });
          }
        }

        window.syncAdminHeaderInfo = syncAdminHeaderInfo;
        syncAdminHeaderInfo();

        if (document.getElementById('admin-settings-email')) {
          document.getElementById('admin-settings-email').textContent = user.email || ADMIN_EMAIL;
        }

        if (user.photoURL) {
          ['admin-sidebar-avatar', 'admin-topbar-avatar', 'admin-settings-avatar'].forEach(id => {
            const img = document.getElementById(id);
            if (img) img.src = user.photoURL;
          });
        }

        // Initialize Admin Submodules
        initAdminTabNavigation();
        initAdminOverviewSync();
        initAdminMessengerSync();
        initAdminUsersSync();
        initAdminProjectRequestsSync();
        initAdminSupportRequestsSync();
        initAdminSettingsSync();
      });
    }

    /* 1. Tab / Section Navigation */
    function initAdminTabNavigation() {
      const navLinks = document.querySelectorAll('.dash-nav .dash-nav-item[data-admin-tab], [data-admin-tab-trigger]');
      const sections = {
        'dashboard': document.getElementById('admin-section-overview'),
        'messenger': document.getElementById('admin-section-messenger'),
        'users': document.getElementById('admin-section-users'),
        'project-requests': document.getElementById('admin-section-project-requests'),
        'support-requests': document.getElementById('admin-section-support-requests'),
        'settings': document.getElementById('admin-section-settings')
      };

      function switchAdminSection(tabId) {
        if (!sections[tabId]) return;

        // Update nav links active class
        document.querySelectorAll('.dash-nav .dash-nav-item[data-admin-tab]').forEach(link => {
          if (link.getAttribute('data-admin-tab') === tabId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        // Hide all sections, show target
        Object.keys(sections).forEach(key => {
          if (sections[key]) sections[key].style.display = 'none';
        });
        sections[tabId].style.display = 'block';

        // Update Page Title with current language support
        let currentAdminActiveTab = tabId;
        function updateAdminTabTitleLanguage() {
          const pageTitleEl = document.getElementById('admin-page-title');
          if (!pageTitleEl) return;

          const keyMap = {
            'dashboard': 'adminNavDashboard',
            'messenger': 'adminNavMessenger',
            'users': 'adminNavUsers',
            'project-requests': 'adminNavProjectRequests',
            'support-requests': 'adminNavSupportRequests',
            'settings': 'adminNavSettings'
          };

          const key = keyMap[currentAdminActiveTab];
          if (key && translations[currentLang] && translations[currentLang][key]) {
            pageTitleEl.textContent = translations[currentLang][key];
          }
        }

        window.updateAdminTabTitleLanguage = updateAdminTabTitleLanguage;
        updateAdminTabTitleLanguage();

        // Mobile sidebar close on click
        const sidebar = document.getElementById('dash-sidebar');
        const overlay = document.getElementById('dash-sidebar-overlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      }

      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const targetTab = link.getAttribute('data-admin-tab') || link.getAttribute('data-admin-tab-trigger');
          if (targetTab && sections[targetTab]) {
            e.preventDefault();
            switchAdminSection(targetTab);
            window.location.hash = targetTab;
          }
        });
      });

      // Handle direct hash navigation e.g. admin.html#messenger
      if (window.location.hash) {
        const hashTab = window.location.hash.replace('#', '');
        if (sections[hashTab]) {
          switchAdminSection(hashTab);
        }
      }

      window.addEventListener('hashchange', () => {
        const hashTab = window.location.hash.replace('#', '');
        if (sections[hashTab]) {
          switchAdminSection(hashTab);
        }
      });
    }

    /* 2. Section 1: Overview & Stats Sync */
    function initAdminOverviewSync() {
      const mod = window.FirebaseModule;
      if (!mod || !mod.db || !mod.collection || !mod.onSnapshot) return;

      let totalUsersCount = 0;
      let totalProjectReqsCount = 0;
      let unreadChatsCount = 0;

      // Realtime Users count
      mod.onSnapshot(mod.collection(mod.db, 'users'), (snap) => {
        totalUsersCount = snap.size;
        const totalUsersEl = document.getElementById('stat-total-users');
        if (totalUsersEl) totalUsersEl.textContent = totalUsersCount;
      });

      // Realtime Project Requests count
      const pReqsCol = mod.collection(mod.db, 'projectRequests');
      mod.onSnapshot(pReqsCol, (snap) => {
        totalProjectReqsCount = snap.size;
        const el = document.getElementById('stat-total-project-requests');
        if (el) el.textContent = totalProjectReqsCount;
      });

      // Aggregated Activity Feed across collections
      let chatActivities = [];
      let projectActivities = [];
      let supportActivities = [];

      function renderAggregatedRecentActivity() {
        const activityContainer = document.getElementById('admin-recent-activity-container');
        if (!activityContainer) return;

        const allActivities = [...chatActivities, ...projectActivities, ...supportActivities];
        allActivities.sort((a, b) => (b.timeMs || 0) - (a.timeMs || 0));
        const top5 = allActivities.slice(0, 5);

        const emptyText = currentLang === 'bn' ? 'কোনো সাম্প্রতিক কার্যক্রম নেই।' : 'No recent activity found.';

        if (top5.length === 0) {
          activityContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;" data-i18n="adminNoRecentActivity">${emptyText}</div>`;
        } else {
          activityContainer.innerHTML = top5.map(act => {
            const timeStr = act.timeMs ? new Date(act.timeMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';
            const initial = (act.userName.trim().charAt(0) || 'U').toUpperCase();

            let typeIcon = 'fas fa-message';
            if (act.type === 'project') typeIcon = 'fas fa-rocket';
            if (act.type === 'support') typeIcon = 'fas fa-headset';

            return `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid var(--border-glass);">
                <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
                  <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--accent-blue); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
                    ${initial}
                  </div>
                  <div style="min-width: 0;">
                    <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                      ${escapeHtml(act.userName)} <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-muted);"><i class="${typeIcon}"></i></span>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(act.text)}</div>
                  </div>
                </div>
                <span style="font-size: 0.78rem; color: var(--text-muted); flex-shrink: 0;"><i class="fas fa-clock"></i> ${timeStr}</span>
              </div>
            `;
          }).join('');
        }
      }
      window.refreshAdminRecentActivityFeed = renderAggregatedRecentActivity;

      // Realtime Unread Chats & Today's messages
      const chatsCol = mod.collection(mod.db, 'chats');
      mod.onSnapshot(chatsCol, (snap) => {
        unreadChatsCount = 0;
        let todayMsgs = 0;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        chatActivities = [];

        snap.forEach(d => {
          const chatData = d.data();
          if (chatData.unreadByAdmin) unreadChatsCount++;

          if (chatData.lastMessageAt) {
            const msgTime = chatData.lastMessageAt.seconds ? chatData.lastMessageAt.seconds * 1000 : new Date(chatData.lastMessageAt).getTime();
            if (msgTime >= startOfToday) {
              todayMsgs++;
            }
            chatActivities.push({
              userName: chatData.userName || chatData.userEmail || 'Client',
              text: chatData.lastMessage || 'Sent a message',
              timeMs: msgTime,
              type: 'chat'
            });
          }
        });

        const unreadEl = document.getElementById('stat-unread-chats');
        if (unreadEl) unreadEl.textContent = unreadChatsCount;

        const todayMsgsEl = document.getElementById('stat-today-messages');
        if (todayMsgsEl) todayMsgsEl.textContent = todayMsgs;

        renderAggregatedRecentActivity();
      }, (err) => {
        console.error('Chats overview snapshot error:', err);
        chatActivities = [];
        renderAggregatedRecentActivity();
      });

      // Project Requests activity feed integration
      mod.onSnapshot(pReqsCol, (snap) => {
        projectActivities = [];
        snap.forEach(d => {
          const req = d.data();
          if (req.submittedAt) {
            const timeMs = new Date(req.submittedAt).getTime();
            projectActivities.push({
              userName: req.name || req.email || 'Client',
              text: `Project Request: ${req.projectType || 'Custom Project'}`,
              timeMs: timeMs,
              type: 'project'
            });
          }
        });
        renderAggregatedRecentActivity();
      }, (err) => {
        console.error('Project requests overview snapshot error:', err);
        projectActivities = [];
        renderAggregatedRecentActivity();
      });

      // Support Requests activity feed integration
      const sReqsCol = mod.collection(mod.db, 'supportRequests');
      mod.onSnapshot(sReqsCol, (snap) => {
        supportActivities = [];
        snap.forEach(d => {
          const supp = d.data();
          if (supp.submittedAt) {
            const timeMs = new Date(supp.submittedAt).getTime();
            supportActivities.push({
              userName: supp.name || supp.email || 'Client',
              text: `Support Ticket: ${supp.subject || 'Support Request'}`,
              timeMs: timeMs,
              type: 'support'
            });
          }
        });
        renderAggregatedRecentActivity();
      }, (err) => {
        console.error('Support requests overview snapshot error:', err);
        supportActivities = [];
        renderAggregatedRecentActivity();
      });
    }

    /* 3. Section 2: Messenger (Live Chat) Sync */
    function initAdminMessengerSync() {
      const mod = window.FirebaseModule;
      if (!mod || !mod.db || !mod.collection || !mod.onSnapshot || !mod.query || !mod.orderBy) return;

      const chatsCol = mod.collection(mod.db, 'chats');
      const q = mod.query(chatsCol, mod.orderBy('lastMessageAt', 'desc'));

      mod.onSnapshot(q, (snapshot) => {
        let unreadCount = 0;
        const threads = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          data.userId = doc.id;
          threads.push(data);
          if (data.unreadByAdmin) {
            unreadCount++;
          }
        });

        // Update badge near Admin Nav "মেসেঞ্জার" item
        const badgeEl = document.getElementById('admin-unread-chat-count');
        if (badgeEl) {
          if (unreadCount > 0) {
            badgeEl.textContent = unreadCount;
            badgeEl.style.display = 'inline-block';
          } else {
            badgeEl.style.display = 'none';
          }
        }

        renderAdminThreadsList(threads);
      });

      // Mobile Back button in Messenger Header
      const backBtn = document.getElementById('btn-admin-messenger-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          const layout = document.getElementById('admin-chat-layout');
          if (layout) layout.classList.remove('mobile-thread-open');
        });
      }

      // Cache users for "নতুন মেসেজ" user picker
      mod.onSnapshot(mod.collection(mod.db, 'users'), (snap) => {
        registeredUsersCache = [];
        snap.forEach(d => {
          const u = d.data();
          u.uid = d.id;
          registeredUsersCache.push(u);
        });
      });
    }

    function renderAdminThreadsList(threads) {
      const container = document.getElementById('admin-threads-list-container');
      if (!container) return;

      if (threads.length === 0) {
        container.innerHTML = `
          <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
            কোন ক্লায়েন্ট চ্যাট পাওয়া যায়নি।
          </div>
        `;
        return;
      }

      container.innerHTML = threads.map(t => {
        const name = t.userName || t.userEmail || 'Client User';
        const lastMsg = t.lastMessage || 'No messages yet';
        const isUnread = !!t.unreadByAdmin;
        const isActive = t.userId === activeAdminSelectedUserId;

        const timeStr = t.lastMessageAt ? new Date(t.lastMessageAt.seconds ? t.lastMessageAt.seconds * 1000 : t.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        const initial = (name.trim().charAt(0) || 'C').toUpperCase();

        return `
          <div class="admin-thread-item ${isActive ? 'active' : ''}" data-user-id="${t.userId}" style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-glass); cursor: pointer; display: flex; align-items: center; gap: 0.75rem; background: ${isActive ? 'rgba(56,189,248,0.12)' : (isUnread ? 'rgba(56,189,248,0.05)' : 'transparent')}; position: relative; transition: background 0.2s ease;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-blue); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
              ${initial}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                <span style="font-weight: ${isUnread ? '700' : '600'}; font-size: 0.92rem; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(name)}</span>
                <span style="font-size: 0.72rem; color: var(--text-muted); flex-shrink: 0; margin-left: 0.4rem;">${timeStr}</span>
              </div>
              <div style="font-size: 0.82rem; color: ${isUnread ? 'var(--text-main)' : 'var(--text-muted)'}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-weight: ${isUnread ? '600' : 'normal'};">
                ${t.lastSenderRole === 'admin' ? ' You: ' : ''}${escapeHtml(lastMsg)}
              </div>
            </div>
            ${isUnread ? `<span style="width: 9px; height: 9px; background: #EF4444; border-radius: 50%; flex-shrink: 0;"></span>` : ''}
          </div>
        `;
      }).join('');

      container.querySelectorAll('.admin-thread-item').forEach(el => {
        el.addEventListener('click', () => {
          const uid = el.getAttribute('data-user-id');
          const thread = threads.find(t => t.userId === uid);
          selectAdminThread(uid, thread ? thread.userName : 'Client User', thread ? thread.userEmail : '');
        });
      });
    }

    async function selectAdminThread(userId, userName, userEmail) {
      activeAdminSelectedUserId = userId;

      const mod = window.FirebaseModule;
      if (!mod || !mod.db) return;

      // Update UI Header
      const headerName = document.getElementById('admin-chat-active-name');
      const headerEmail = document.getElementById('admin-chat-active-email');
      const headerAvatar = document.getElementById('admin-chat-active-avatar');
      const inputArea = document.getElementById('admin-chat-input-area');
      const backBtn = document.getElementById('btn-admin-messenger-back');
      const layout = document.getElementById('admin-chat-layout');

      if (headerName) headerName.textContent = userName || 'Client User';
      if (headerEmail) headerEmail.textContent = userEmail || userId;
      if (headerAvatar) headerAvatar.textContent = (userName ? userName.trim().charAt(0) : 'U').toUpperCase();
      if (inputArea) inputArea.style.display = 'block';
      if (backBtn) backBtn.style.display = 'inline-flex';
      if (layout) layout.classList.add('mobile-thread-open');

      // Clear unreadByAdmin flag
      const chatDocRef = mod.doc(mod.db, 'chats', userId);
      await mod.updateDoc(chatDocRef, { unreadByAdmin: false }).catch(e => console.warn('Update unreadByAdmin error:', e));

      // Stream conversation messages
      const messagesCol = mod.collection(mod.db, 'chats', userId, 'messages');
      const q = mod.query(messagesCol, mod.orderBy('createdAt', 'asc'));

      if (activeAdminChatMessagesUnsubscribe) activeAdminChatMessagesUnsubscribe();

      activeAdminChatMessagesUnsubscribe = mod.onSnapshot(q, (snapshot) => {
        renderAdminChatMessages(snapshot);
      });
    }

    function renderAdminChatMessages(snapshot) {
      const container = document.getElementById('admin-chat-messages-box');
      if (!container) return;

      if (snapshot.empty) {
        container.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); margin: auto; padding: 2rem;">
            <i class="fas fa-paper-plane" style="font-size: 2rem; color: var(--accent-blue); margin-bottom: 0.5rem; display: block;"></i>
            <p>এই থ্রেডে কোনো মেসেজ নেই। নিচে লিখুন এবং প্রথম মেসেজ পাঠান!</p>
          </div>
        `;
        return;
      }

      let html = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const role = data.senderRole || 'user';
        const isAdmin = role === 'admin';
        const timeStr = data.createdAt ? new Date(data.createdAt.seconds ? data.createdAt.seconds * 1000 : data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        html += `
          <div class="chat-msg-row ${isAdmin ? 'msg-user' : 'msg-admin'}">
            <span class="chat-sender-name">${isAdmin ? 'SHAFAET HOSSEN SARIP (Admin)' : 'Client'}</span>
            <div class="chat-bubble">
              ${escapeHtml(data.text || '')}
              <span class="chat-msg-time">${timeStr}</span>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    }

    // Chat reply form submit
    const replyForm = document.getElementById('admin-chat-reply-form');
    if (replyForm) {
      replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!activeAdminSelectedUserId) return;

        const input = document.getElementById('admin-chat-reply-input');
        const text = input ? input.value.trim() : '';

        if (!text) return;
        input.value = '';

        const mod = window.FirebaseModule;
        if (!mod || !mod.db) return;

        try {
          const chatDocRef = mod.doc(mod.db, 'chats', activeAdminSelectedUserId);
          const messagesCol = mod.collection(mod.db, 'chats', activeAdminSelectedUserId, 'messages');

          await mod.addDoc(messagesCol, {
            senderId: ADMIN_UID,
            senderRole: 'admin',
            text: text,
            createdAt: mod.serverTimestamp ? mod.serverTimestamp() : new Date().toISOString(),
            read: false
          });

          await mod.updateDoc(chatDocRef, {
            lastMessage: text,
            lastMessageAt: mod.serverTimestamp ? mod.serverTimestamp() : new Date().toISOString(),
            lastSenderRole: 'admin',
            unreadByUser: true,
            unreadByAdmin: false
          });
        } catch (err) {
          console.error('Error sending admin reply:', err);
        }
      });
    }

    // New Message Modal User Picker
    const newChatBtn = document.getElementById('btn-admin-new-chat');
    const newChatModal = document.getElementById('admin-new-chat-modal');
    const userSearchInput = document.getElementById('admin-user-search-input');

    if (newChatBtn && newChatModal) {
      newChatBtn.addEventListener('click', () => {
        renderUsersPickList(registeredUsersCache);
        newChatModal.classList.add('active');
      });
    }

    if (userSearchInput) {
      userSearchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = registeredUsersCache.filter(u => {
          const name = (u.displayName || u.fullName || '').toLowerCase();
          const email = (u.email || '').toLowerCase();
          return name.includes(q) || email.includes(q);
        });
        renderUsersPickList(filtered);
      });
    }

    function renderUsersPickList(users) {
      const container = document.getElementById('admin-users-pick-list');
      if (!container) return;

      if (users.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">কোন ব্যবহারকারী পাওয়া যায়নি।</div>`;
        return;
      }

      container.innerHTML = users.map(u => {
        const name = u.displayName || u.fullName || 'Client User';
        const email = u.email || 'N/A';
        const initial = (name.trim().charAt(0) || 'U').toUpperCase();

        return `
          <div class="user-pick-item" data-uid="${u.uid}" data-name="${escapeHtml(name)}" data-email="${escapeHtml(email)}" style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background: var(--bg-glass); border: 1px solid var(--border-glass); cursor: pointer; display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--accent-blue); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700;">${initial}</div>
            <div>
              <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">${escapeHtml(name)}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(email)}</div>
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.user-pick-item').forEach(item => {
        item.addEventListener('click', async () => {
          const uid = item.getAttribute('data-uid');
          const name = item.getAttribute('data-name');
          const email = item.getAttribute('data-email');

          const mod = window.FirebaseModule;
          if (mod && mod.db) {
            const chatRef = mod.doc(mod.db, 'chats', uid);
            const chatSnap = await mod.getDoc(chatRef);
            if (!chatSnap.exists()) {
              await mod.setDoc(chatRef, {
                userName: name,
                userEmail: email,
                lastMessage: '',
                lastMessageAt: mod.serverTimestamp ? mod.serverTimestamp() : new Date().toISOString(),
                lastSenderRole: 'admin',
                unreadByAdmin: false,
                unreadByUser: false
              });
            }
          }

          if (newChatModal) newChatModal.classList.remove('active');
          selectAdminThread(uid, name, email);
        });
      });
    }

    /* 4. Section 3: Users Management Sync */
    function initAdminUsersSync() {
      const tbody = document.getElementById('admin-users-tbody');
      const searchInput = document.getElementById('admin-users-search-input');
      if (!tbody) return;

      const mod = window.FirebaseModule;
      if (!mod || !mod.db || !mod.collection || !mod.onSnapshot) return;

      let allUsers = [];

      mod.onSnapshot(mod.collection(mod.db, 'users'), (snap) => {
        allUsers = [];
        snap.forEach(doc => {
          const data = doc.data();
          data.uid = doc.id;
          allUsers.push(data);
        });

        renderUsersTable(allUsers);
      });

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase().trim();
          const filtered = allUsers.filter(u => {
            const name = (u.displayName || u.fullName || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            return name.includes(q) || email.includes(q);
          });
          renderUsersTable(filtered);
        });
      }

      function renderUsersTable(users) {
        if (users.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                কোন রেজিস্টার্ড ইউজার পাওয়া যায়নি।
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = users.map(u => {
          const name = u.displayName || u.fullName || 'Client User';
          const email = u.email || 'N/A';
          const username = u.username || (email.includes('@') ? email.split('@')[0] : 'client');
          const phone = u.phone || u.phoneNumber || 'N/A';
          const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';
          const photoUrl = u.photoURL || '';

          const firstChar = (name.trim().charAt(0) || 'U').toUpperCase();
          const avatarHtml = photoUrl
            ? `<img src="${photoUrl}" alt="${name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />`
            : `<div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(56,189,248,0.2); color: var(--accent-blue); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">${firstChar}</div>`;

          return `
            <tr>
              <td>${avatarHtml}</td>
              <td><strong>${escapeHtml(name)}</strong></td>
              <td>${escapeHtml(email)}</td>
              <td><code>${escapeHtml(username)}</code></td>
              <td>${escapeHtml(phone)}</td>
              <td>${joinedDate}</td>
              <td>
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                  <button type="button" class="btn btn-primary btn-admin-msg-user" data-uid="${u.uid}" data-name="${escapeHtml(name)}" data-email="${escapeHtml(email)}" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">
                    <i class="fas fa-comment"></i> মেসেজ পাঠান
                  </button>
                  <button type="button" class="btn btn-danger-outline btn-admin-delete-user" data-uid="${u.uid}" data-name="${escapeHtml(name)}" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">
                    <i class="fas fa-trash"></i> ডিলিট
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

        // Action Handlers
        tbody.querySelectorAll('.btn-admin-msg-user').forEach(btn => {
          btn.addEventListener('click', () => {
            const uid = btn.getAttribute('data-uid');
            const name = btn.getAttribute('data-name');
            const email = btn.getAttribute('data-email');

            // Switch to Messenger tab
            const messengerNav = document.querySelector('[data-admin-tab="messenger"]');
            if (messengerNav) messengerNav.click();

            selectAdminThread(uid, name, email);
          });
        });

        tbody.querySelectorAll('.btn-admin-delete-user').forEach(btn => {
          btn.addEventListener('click', async () => {
            const uid = btn.getAttribute('data-uid');
            const name = btn.getAttribute('data-name');

            if (!confirm(`Are you sure you want to delete profile document for user "${name}"?`)) return;

            try {
              // Note: Deleting Firebase Auth account client-side is not supported by Firebase Client SDK without Admin SDK on a backend; deleting Firestore user profile doc. TODO: Integrate Firebase Admin SDK function if Auth account deletion is required.
              await mod.deleteDoc(mod.doc(mod.db, 'users', uid));
              if (window.showToast) window.showToast(`User profile "${name}" deleted from Firestore.`, 'info');
            } catch (err) {
              console.error('Error deleting user profile:', err);
              if (window.showToast) window.showToast('Error deleting profile: ' + err.message, 'error');
            }
          });
        });
      }
    }

    /* 5. Section 4: Project Requests Sync */
    function initAdminProjectRequestsSync() {
      const container = document.getElementById('admin-project-requests-list-container');
      const badgeNav = document.getElementById('admin-nav-project-requests-badge');
      const badgeHeader = document.getElementById('admin-project-requests-count-badge');
      if (!container) return;

      const mod = window.FirebaseModule;
      if (!mod || !mod.db || !mod.collection || !mod.onSnapshot) return;

      const colRef = mod.collection(mod.db, 'projectRequests');
      mod.onSnapshot(colRef, (snap) => {
        const requests = [];
        let newCount = 0;

        snap.forEach(doc => {
          const data = doc.data();
          data.id = doc.id;
          requests.push(data);
          if ((data.status || 'new').toLowerCase() === 'new') newCount++;
        });

        // Fallback to legacy collection if projectRequests snap is empty
        if (requests.length === 0) {
          mod.getDocs(mod.collection(mod.db, 'project_requests')).then(legacySnap => {
            legacySnap.forEach(d => {
              const ld = d.data();
              ld.id = d.id;
              requests.push({
                id: d.id,
                name: ld.clientName || ld.name || 'Client',
                mobile: ld.mobileNumber || ld.mobile || 'N/A',
                email: ld.email || ld.userEmail || '',
                projectType: ld.serviceName || ld.projectType || 'Custom Project',
                budget: ld.budget || '',
                requirements: ld.description || ld.requirements || 'N/A',
                fileURL: ld.fileURL || ld.attachmentUrl || null,
                submittedAt: ld.createdAt || ld.submittedAt || new Date().toISOString(),
                status: ld.status || 'new',
                userId: ld.userId || null
              });
            });
            renderProjectRequests(requests);
          }).catch(e => renderProjectRequests(requests));
        } else {
          renderProjectRequests(requests);
        }

        if (badgeNav) {
          badgeNav.textContent = requests.length;
          badgeNav.style.display = requests.length > 0 ? 'inline-block' : 'none';
        }

        if (badgeHeader) {
          badgeHeader.textContent = `${requests.length} Requests (${newCount} New)`;
        }
      });

      function renderProjectRequests(requests) {
        if (requests.length === 0) {
          container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 3rem;">
              <i class="fas fa-inbox" style="font-size: 2.5rem; color: var(--accent-blue); margin-bottom: 0.75rem; display: block;"></i>
              <p style="font-size: 1.05rem; font-weight: 600;">কোন প্রজেক্ট রিকোয়েস্ট জমা হয়নি</p>
            </div>
          `;
          return;
        }

        // Sort newest first
        requests.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

        container.innerHTML = requests.map(req => {
          const status = (req.status || 'new').toLowerCase();
          const submittedDate = req.submittedAt ? new Date(req.submittedAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
          const fileLinkHtml = req.fileURL ? `<a href="${req.fileURL}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; margin-top: 0.5rem;"><i class="fas fa-paperclip"></i> সংযুক্ত ফাইলটি দেখুন</a>` : '';

          return `
            <div class="glass-card" style="padding: 1.25rem 1.5rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.85rem;">
                <div>
                  <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.2rem;">
                    ${escapeHtml(req.name || 'Client Request')}
                  </h4>
                  <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">
                    <i class="fas fa-phone"></i> ${escapeHtml(req.mobile || 'N/A')} ${req.email ? ' | <i class="fas fa-envelope"></i> ' + escapeHtml(req.email) : ''}
                  </p>
                </div>

                <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                  <select class="form-control admin-status-select-project" data-doc-id="${req.id}" style="padding: 0.35rem 0.75rem; font-size: 0.82rem; border-radius: var(--radius-md); background: var(--bg-glass); color: var(--text-main);">
                    <option value="new" ${status === 'new' ? 'selected' : ''}>NEW (নতুন)</option>
                    <option value="contacted" ${status === 'contacted' ? 'selected' : ''}>CONTACTED (যোগাযোগকৃত)</option>
                    <option value="closed" ${status === 'closed' ? 'selected' : ''}>CLOSED (সম্পন্ন)</option>
                  </select>

                  <button type="button" class="btn btn-primary btn-admin-req-msg" data-uid="${req.userId || ''}" data-name="${escapeHtml(req.name || '')}" data-email="${escapeHtml(req.email || '')}" style="padding: 0.35rem 0.75rem; font-size: 0.82rem;">
                    <i class="fas fa-comment"></i> মেসেজ পাঠান
                  </button>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; background: var(--bg-glass); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 0.75rem; font-size: 0.88rem;">
                <div><strong>প্রজেক্ট ক্যাটাগরি:</strong> ${escapeHtml(req.projectType || 'Custom')}</div>
                <div><strong>বাজেট:</strong> ${escapeHtml(req.budget || 'Not specified')}</div>
                <div><strong>জমা দেয়ার তারিখ:</strong> ${submittedDate}</div>
              </div>

              <div>
                <strong style="font-size: 0.88rem; color: var(--text-muted);">প্রয়োজনীয় বিবরণ / Requirements:</strong>
                <p style="font-size: 0.95rem; color: var(--text-main); margin-top: 0.25rem; line-height: 1.6;">${escapeHtml(req.requirements || 'None provided')}</p>
                ${fileLinkHtml}
              </div>
            </div>
          `;
        }).join('');

        // Status Change Handlers
        container.querySelectorAll('.admin-status-select-project').forEach(sel => {
          sel.addEventListener('change', async () => {
            const docId = sel.getAttribute('data-doc-id');
            const newStatus = sel.value;
            try {
              await mod.updateDoc(mod.doc(mod.db, 'projectRequests', docId), { status: newStatus });
              if (window.showToast) window.showToast('প্রজেক্ট রিকোয়েস্ট স্ট্যাটাস আপডেট করা হয়েছে!', 'info');
            } catch (err) {
              console.error('Error updating projectRequest status:', err);
            }
          });
        });

        // Quick Messenger Jump
        container.querySelectorAll('.btn-admin-req-msg').forEach(btn => {
          btn.addEventListener('click', () => {
            const uid = btn.getAttribute('data-uid');
            const name = btn.getAttribute('data-name');
            const email = btn.getAttribute('data-email');

            const messengerNav = document.querySelector('[data-admin-tab="messenger"]');
            if (messengerNav) messengerNav.click();

            if (uid) {
              selectAdminThread(uid, name, email);
            }
          });
        });
      }
    }

    /* 6. Section 5: Support Requests Sync */
    function initAdminSupportRequestsSync() {
      const container = document.getElementById('admin-support-requests-list-container');
      const badgeNav = document.getElementById('admin-nav-support-requests-badge');
      const badgeHeader = document.getElementById('admin-support-requests-count-badge');
      if (!container) return;

      const mod = window.FirebaseModule;
      if (!mod || !mod.db || !mod.collection || !mod.onSnapshot) return;

      const colRef = mod.collection(mod.db, 'supportRequests');
      mod.onSnapshot(colRef, (snap) => {
        const requests = [];
        let newCount = 0;

        snap.forEach(doc => {
          const data = doc.data();
          data.id = doc.id;
          requests.push(data);
          if ((data.status || 'new').toLowerCase() === 'new') newCount++;
        });

        // Fallback to messages collection if supportRequests empty
        if (requests.length === 0) {
          mod.getDocs(mod.collection(mod.db, 'messages')).then(mSnap => {
            mSnap.forEach(d => {
              const md = d.data();
              requests.push({
                id: d.id,
                name: md.name || 'Client',
                mobile: md.mobile || md.contact || 'N/A',
                email: md.email || '',
                subject: md.subject || 'Support Inquiry',
                message: md.message || md.description || 'N/A',
                fileURL: md.fileURL || null,
                submittedAt: md.submittedAt || md.createdAt || new Date().toISOString(),
                status: md.status || 'new',
                userId: md.userId || null
              });
            });
            renderSupportRequests(requests);
          }).catch(e => renderSupportRequests(requests));
        } else {
          renderSupportRequests(requests);
        }

        if (badgeNav) {
          badgeNav.textContent = requests.length;
          badgeNav.style.display = requests.length > 0 ? 'inline-block' : 'none';
        }

        if (badgeHeader) {
          badgeHeader.textContent = `${requests.length} Tickets (${newCount} New)`;
        }
      });

      function renderSupportRequests(requests) {
        if (requests.length === 0) {
          container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 3rem;">
              <i class="fas fa-headset" style="font-size: 2.5rem; color: var(--accent-orange); margin-bottom: 0.75rem; display: block;"></i>
              <p style="font-size: 1.05rem; font-weight: 600;">কোন সাপোর্ট রিকোয়েস্ট জমা হয়নি</p>
            </div>
          `;
          return;
        }

        requests.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

        container.innerHTML = requests.map(req => {
          const status = (req.status || 'new').toLowerCase();
          const submittedDate = req.submittedAt ? new Date(req.submittedAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
          const fileLinkHtml = req.fileURL ? `<a href="${req.fileURL}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; margin-top: 0.5rem;"><i class="fas fa-paperclip"></i> সংযুক্ত ফাইলটি দেখুন</a>` : '';

          return `
            <div class="glass-card" style="padding: 1.25rem 1.5rem; margin-bottom: 1rem; border-left: 4px solid var(--accent-orange);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.85rem;">
                <div>
                  <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.2rem;">
                    ${escapeHtml(req.subject || 'Support Ticket')}
                  </h4>
                  <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">
                    <i class="fas fa-user"></i> ${escapeHtml(req.name || 'Client')} | <i class="fas fa-phone"></i> ${escapeHtml(req.mobile || 'N/A')} ${req.email ? ' | <i class="fas fa-envelope"></i> ' + escapeHtml(req.email) : ''}
                  </p>
                </div>

                <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                  <select class="form-control admin-status-select-support" data-doc-id="${req.id}" style="padding: 0.35rem 0.75rem; font-size: 0.82rem; border-radius: var(--radius-md); background: var(--bg-glass); color: var(--text-main);">
                    <option value="new" ${status === 'new' ? 'selected' : ''}>NEW (নতুন)</option>
                    <option value="in-progress" ${status === 'in-progress' ? 'selected' : ''}>IN-PROGRESS (চলমান)</option>
                    <option value="resolved" ${status === 'resolved' ? 'selected' : ''}>RESOLVED (সমাধানকৃত)</option>
                  </select>

                  <button type="button" class="btn btn-primary btn-admin-supp-msg" data-uid="${req.userId || ''}" data-name="${escapeHtml(req.name || '')}" data-email="${escapeHtml(req.email || '')}" style="padding: 0.35rem 0.75rem; font-size: 0.82rem;">
                    <i class="fas fa-comment"></i> মেসেজ পাঠান
                  </button>
                </div>
              </div>

              <div style="background: var(--bg-glass); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
                <strong>জমা হওয়ার সময়:</strong> ${submittedDate}
              </div>

              <div>
                <strong style="font-size: 0.88rem; color: var(--text-muted);">সমস্যা / বার্তার বিবরণ:</strong>
                <p style="font-size: 0.95rem; color: var(--text-main); margin-top: 0.25rem; line-height: 1.6;">${escapeHtml(req.message || 'None provided')}</p>
                ${fileLinkHtml}
              </div>
            </div>
          `;
        }).join('');

        // Status Change Handlers
        container.querySelectorAll('.admin-status-select-support').forEach(sel => {
          sel.addEventListener('change', async () => {
            const docId = sel.getAttribute('data-doc-id');
            const newStatus = sel.value;
            try {
              await mod.updateDoc(mod.doc(mod.db, 'supportRequests', docId), { status: newStatus });
              if (window.showToast) window.showToast('সাপোর্ট টিকিট স্ট্যাটাস আপডেট করা হয়েছে!', 'info');
            } catch (err) {
              console.error('Error updating supportRequest status:', err);
            }
          });
        });

        // Quick Messenger Jump
        container.querySelectorAll('.btn-admin-supp-msg').forEach(btn => {
          btn.addEventListener('click', () => {
            const uid = btn.getAttribute('data-uid');
            const name = btn.getAttribute('data-name');
            const email = btn.getAttribute('data-email');

            const messengerNav = document.querySelector('[data-admin-tab="messenger"]');
            if (messengerNav) messengerNav.click();

            if (uid) {
              selectAdminThread(uid, name, email);
            }
          });
        });
      }
    }

    /* 7. Section 6: Settings Sync */
    function initAdminSettingsSync() {
      const editProfileBtn = document.getElementById('btn-admin-edit-profile');
      const logoutBtn = document.getElementById('btn-admin-logout');

      if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
          openEditProfileModal();
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          const mod = window.FirebaseModule;
          if (mod && mod.auth && mod.signOut) {
            mod.signOut(mod.auth).then(() => {
              if (window.showToast) window.showToast('অ্যাডমিন সেশন সমাপ্ত। লগআউট করা হয়েছে।', 'info');
              window.location.href = 'account.html';
            }).catch(err => {
              console.error('Admin logout error:', err);
            });
          }
        });
      }
    }

    checkAdminAuth();
  }

  /* --------------------------------------------------------------------------
     10d. Edit Profile Modal Logic & Firestore Username Uniqueness
     -------------------------------------------------------------------------- */
  let currentUserUsername = '';
  let isUsernameValid = false;
  let usernameDebounceTimer = null;

  function openEditProfileModal() {
    const editModal = document.getElementById('edit-profile-modal');
    if (!editModal) return;

    const user = window.currentUserState;
    if (!user) return;

    const nameInput = document.getElementById('edit-name-input');
    const usernameInput = document.getElementById('edit-username-input');
    const phoneInput = document.getElementById('edit-phone-input');
    const photoFileInput = document.getElementById('edit-photo-file-input');
    const avatarImg = document.getElementById('edit-avatar-img');
    const avatarInitial = document.getElementById('edit-avatar-initial');
    const selectedNameSpan = document.getElementById('photo-selected-name');

    // Pre-fill name
    if (nameInput) nameInput.value = user.displayName || '';

    // Fetch existing user doc from Firestore for username and phone
    const mod = window.FirebaseModule;
    let initialUsername = (user.displayName ? user.displayName.toLowerCase().replace(/[^a-z0-9]/g, '') : '') || (user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : '');
    let initialPhone = user.phoneNumber || user.phone || '';

    if (mod && mod.db && mod.doc && mod.getDoc) {
      const userDocRef = mod.doc(mod.db, 'users', user.uid);
      mod.getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.username) initialUsername = data.username;
          const userPhone = data.phoneNumber || data.phone;
          if (userPhone !== undefined) initialPhone = userPhone;
        } else {
          // Fallback to sarip doc if user doc does not exist
          const saripRef = mod.doc(mod.db, 'sarip', 'sarip');
          mod.getDoc(saripRef).then(saripSnap => {
            if (saripSnap.exists() && (saripSnap.data().uid === user.uid || user.uid === 'dS9uZZToHTUPP1Q3DiWiG25D3Xt2' || user.email === 'webworldbd.lmt@gmail.com' || user.email === 'onlyphone678@gmail.com')) {
              const sData = saripSnap.data();
              if (sData.username) initialUsername = sData.username;
              const uPhone = sData.phoneNumber || sData.phone;
              if (uPhone !== undefined) initialPhone = uPhone;
              if (usernameInput) usernameInput.value = initialUsername;
              if (phoneInput) phoneInput.value = initialPhone;
              currentUserUsername = initialUsername;
              validateUsernameLive(initialUsername);
            }
          }).catch(e => console.warn('Fallback sarip read warning:', e));
        }
        currentUserUsername = initialUsername;
        if (usernameInput) {
          usernameInput.value = initialUsername;
          validateUsernameLive(initialUsername);
        }
        if (phoneInput) phoneInput.value = initialPhone;
      }).catch(err => {
        console.error('Error fetching user profile doc:', err);
        currentUserUsername = initialUsername;
        if (usernameInput) {
          usernameInput.value = initialUsername;
          validateUsernameLive(initialUsername);
        }
        if (phoneInput) phoneInput.value = initialPhone;
      });
    } else {
      currentUserUsername = initialUsername;
      if (usernameInput) {
        usernameInput.value = initialUsername;
        validateUsernameLive(initialUsername);
      }
      if (phoneInput) phoneInput.value = initialPhone;
    }

    // Avatar preview
    const firstChar = (user.displayName || user.email || 'S').trim().charAt(0).toUpperCase() || 'S';
    if (avatarInitial) avatarInitial.textContent = firstChar;
    const removePhotoBtn = document.getElementById('btn-remove-photo');
    const statusSpan = document.getElementById('photo-upload-status');
    if (statusSpan) { statusSpan.textContent = ''; statusSpan.style.color = ''; }

    if (user.photoURL && avatarImg) {
      avatarImg.src = user.photoURL;
      avatarImg.style.display = 'block';
      if (avatarInitial) avatarInitial.style.display = 'none';
      if (removePhotoBtn) removePhotoBtn.style.display = 'inline-flex';
    } else if (avatarImg) {
      avatarImg.style.display = 'none';
      if (avatarInitial) avatarInitial.style.display = 'flex';
      if (removePhotoBtn) removePhotoBtn.style.display = 'none';
    }

    if (photoFileInput) photoFileInput.value = '';
    if (selectedNameSpan) selectedNameSpan.textContent = '';

    editModal.classList.add('active');
  }

  function validateUsernameLive(val) {
    const usernameInput = document.getElementById('edit-username-input');
    const spinner = document.getElementById('username-status-spinner');
    const successIcon = document.getElementById('username-status-icon-success');
    const errorIcon = document.getElementById('username-status-icon-error');
    const hintMsg = document.getElementById('username-hint-msg');
    const errorSpan = document.getElementById('edit-username-error');
    const saveBtn = document.getElementById('edit-profile-save-btn');

    if (!usernameInput) return;

    if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer);

    // Auto-lowercase and filter non-lowercase alphanumeric characters
    let cleaned = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (usernameInput.value !== cleaned) {
      usernameInput.value = cleaned;
    }

    // Reset icons
    if (spinner) spinner.style.display = 'none';
    if (successIcon) successIcon.style.display = 'none';
    if (errorIcon) errorIcon.style.display = 'none';
    usernameInput.classList.remove('is-invalid');
    if (errorSpan) { errorSpan.textContent = ''; errorSpan.classList.remove('visible'); }

    if (cleaned.length < 3) {
      isUsernameValid = false;
      if (saveBtn) saveBtn.disabled = true;
      if (cleaned.length > 0) {
        if (errorIcon) errorIcon.style.display = 'block';
        usernameInput.classList.add('is-invalid');
        if (hintMsg) hintMsg.textContent = 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।';
        if (hintMsg) hintMsg.style.color = '#EF4444';
      } else {
        if (hintMsg) hintMsg.textContent = 'শুধুমাত্র ইংরেজি ছোট হাতের অক্ষর (a-z) ও সংখ্যা (0-9) ব্যবহারযোগ্য। (কমপক্ষে ৩ অক্ষর)';
        if (hintMsg) hintMsg.style.color = 'var(--text-muted)';
      }
      return;
    }

    // Show spinner while checking
    if (spinner) spinner.style.display = 'block';
    if (hintMsg) {
      hintMsg.textContent = 'ইউজারনেম অ্যাভেইলিবিলিটি যাঁচাই করা হচ্ছে...';
      hintMsg.style.color = 'var(--accent-blue)';
    }

    usernameDebounceTimer = setTimeout(async () => {
      const mod = window.FirebaseModule;
      const user = window.currentUserState;

      // If user's own existing username unchanged
      if (user && cleaned === currentUserUsername) {
        if (spinner) spinner.style.display = 'none';
        if (successIcon) successIcon.style.display = 'block';
        if (hintMsg) {
          hintMsg.textContent = 'এই ইউজারনেম ব্যবহারযোগ্য';
          hintMsg.style.color = '#10B981';
        }
        isUsernameValid = true;
        if (saveBtn) saveBtn.disabled = false;
        return;
      }

      if (mod && mod.db && mod.doc && mod.getDoc) {
        try {
          const usernameDocRef = mod.doc(mod.db, 'usernames', cleaned);
          const docSnap = await mod.getDoc(usernameDocRef);

          if (spinner) spinner.style.display = 'none';

          if (docSnap.exists() && docSnap.data().uid !== (user ? user.uid : '')) {
            // Taken by someone else
            if (errorIcon) errorIcon.style.display = 'block';
            usernameInput.classList.add('is-invalid');
            if (hintMsg) {
              hintMsg.textContent = 'এই ইউজারনেম ইতিমধ্যে ব্যবহৃত হচ্ছে';
              hintMsg.style.color = '#EF4444';
            }
            isUsernameValid = false;
            if (saveBtn) saveBtn.disabled = true;
          } else {
            // Available
            if (successIcon) successIcon.style.display = 'block';
            if (hintMsg) {
              hintMsg.textContent = 'এই ইউজারনেম ব্যবহারযোগ্য';
              hintMsg.style.color = '#10B981';
            }
            isUsernameValid = true;
            if (saveBtn) saveBtn.disabled = false;
          }
        } catch (err) {
          console.error('Error checking username availability:', err);
          if (spinner) spinner.style.display = 'none';
          // Fallback if network offline/permission check
          if (successIcon) successIcon.style.display = 'block';
          if (hintMsg) {
            hintMsg.textContent = 'এই ইউজারনেম ব্যবহারযোগ্য';
            hintMsg.style.color = '#10B981';
          }
          isUsernameValid = true;
          if (saveBtn) saveBtn.disabled = false;
        }
      } else {
        if (spinner) spinner.style.display = 'none';
        if (successIcon) successIcon.style.display = 'block';
        if (hintMsg) {
          hintMsg.textContent = 'এই ইউজারনেম ব্যবহারযোগ্য';
          hintMsg.style.color = '#10B981';
        }
        isUsernameValid = true;
        if (saveBtn) saveBtn.disabled = false;
      }
    }, 450);
  }

  function initEditProfileModalLogic() {
    const editModal = document.getElementById('edit-profile-modal');
    if (!editModal) return;

    const usernameInput = document.getElementById('edit-username-input');
    const changePhotoBtn = document.getElementById('btn-change-photo');
    const photoFileInput = document.getElementById('edit-photo-file-input');
    const editForm = document.getElementById('edit-profile-form');
    const selectedNameSpan = document.getElementById('photo-selected-name');

    // Close modal on cancel or overlay click
    editModal.querySelectorAll('.btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        editModal.classList.remove('active');
      });
    });

    // Username input event listener
    if (usernameInput) {
      usernameInput.addEventListener('input', (e) => {
        validateUsernameLive(e.target.value);
      });
    }

    let pendingAvatarFile = null;
    let removeAvatarRequested = false;
    const removePhotoBtn = document.getElementById('btn-remove-photo');
    const photoStatusSpan = document.getElementById('photo-upload-status');

    // Change photo button triggers hidden file input
    if (changePhotoBtn && photoFileInput) {
      changePhotoBtn.addEventListener('click', () => {
        photoFileInput.click();
      });

      photoFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const storageMod = window.StorageService;
          if (storageMod && storageMod.validateUploadFile) {
            const validation = storageMod.validateUploadFile(file, { maxSizeMB: 5 });
            if (!validation.valid) {
              if (photoStatusSpan) {
                photoStatusSpan.textContent = `⚠️ ${validation.error}`;
                photoStatusSpan.style.color = '#EF4444';
              }
              if (window.showToast) window.showToast(validation.error, 'error');
              photoFileInput.value = '';
              return;
            }
          }

          pendingAvatarFile = file;
          removeAvatarRequested = false;

          if (selectedNameSpan) selectedNameSpan.textContent = `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
          if (photoStatusSpan) {
            photoStatusSpan.textContent = currentLang === 'bn' ? 'ছবি সংরক্ষণের জন্য তৈরি।' : 'Image ready for saving.';
            photoStatusSpan.style.color = 'var(--accent-blue)';
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            const avatarImg = document.getElementById('edit-avatar-img');
            const avatarInitial = document.getElementById('edit-avatar-initial');
            if (avatarImg) {
              avatarImg.src = event.target.result;
              avatarImg.style.display = 'block';
            }
            if (avatarInitial) avatarInitial.style.display = 'none';
            if (removePhotoBtn) removePhotoBtn.style.display = 'inline-flex';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', () => {
        pendingAvatarFile = null;
        removeAvatarRequested = true;
        if (photoFileInput) photoFileInput.value = '';
        if (selectedNameSpan) selectedNameSpan.textContent = '';
        if (photoStatusSpan) {
          photoStatusSpan.textContent = currentLang === 'bn' ? 'প্রোফাইল ছবি সরিয়ে ফেলা হবে।' : 'Profile photo will be removed.';
          photoStatusSpan.style.color = '#EF4444';
        }
        const avatarImg = document.getElementById('edit-avatar-img');
        const avatarInitial = document.getElementById('edit-avatar-initial');
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarInitial) avatarInitial.style.display = 'flex';
        removePhotoBtn.style.display = 'none';
      });
    }

    // Edit Profile Form submit
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = window.currentUserState;
        if (!user) return;

        const nameInput = document.getElementById('edit-name-input');
        const phoneInput = document.getElementById('edit-phone-input');
        const nameError = document.getElementById('edit-name-error');
        const saveBtn = document.getElementById('edit-profile-save-btn');

        const name = nameInput ? nameInput.value.trim() : '';
        const username = usernameInput ? usernameInput.value.trim().toLowerCase() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';

        // Validation rule a: Full name REQUIRED
        if (!name) {
          if (nameInput) nameInput.classList.add('is-invalid');
          if (nameError) {
            nameError.textContent = 'নাম আবশ্যক';
            nameError.classList.add('visible');
          }
          return;
        } else {
          if (nameInput) nameInput.classList.remove('is-invalid');
          if (nameError) {
            nameError.textContent = '';
            nameError.classList.remove('visible');
          }
        }

        // Validation rule b: Username REQUIRED and valid
        if (!username || !isUsernameValid) {
          validateUsernameLive(username);
          return;
        }

        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = `<span class="btn-spinner"></span> সংরক্ষণ হচ্ছে...`;
        }

        const mod = window.FirebaseModule;

        try {
          // Server-side / query check prior to save to prevent race condition
          if (mod && mod.db && mod.doc && mod.getDoc && username !== currentUserUsername) {
            const checkRef = mod.doc(mod.db, 'usernames', username);
            const checkSnap = await mod.getDoc(checkRef);
            if (checkSnap.exists() && checkSnap.data().uid !== user.uid) {
              if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'সংরক্ষণ করুন';
              }
              validateUsernameLive(username);
              return;
            }
          }

          // Handle profile image processing / removal using StorageService
          let photoURLToSave = user.photoURL || null;
          const storageMod = window.StorageService;

          if (pendingAvatarFile && storageMod) {
            if (photoStatusSpan) {
              photoStatusSpan.textContent = currentLang === 'bn' ? 'ছবি আপলোড হচ্ছে...' : 'Uploading image...';
              photoStatusSpan.style.color = 'var(--accent-blue)';
            }

            try {
              const optimizedBlob = await storageMod.optimizeAndConvertImage(pendingAvatarFile, 500, 500, 0.85);
              const avatarPath = `avatars/${user.uid}/avatar.webp`;
              const uploadRes = await storageMod.uploadImage(optimizedBlob, avatarPath);

              if (uploadRes.success && uploadRes.url) {
                photoURLToSave = uploadRes.url;
                if (photoStatusSpan) {
                  photoStatusSpan.textContent = currentLang === 'bn' ? 'ছবি সফলভাবে আপলোড করা হয়েছে!' : 'Image uploaded successfully!';
                  photoStatusSpan.style.color = '#10B981';
                }
              } else {
                const uploadErrMsg = currentLang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে, আবার চেষ্টা করুন' : 'Image upload failed, please try again.';
                if (photoStatusSpan) {
                  photoStatusSpan.textContent = `⚠️ ${uploadErrMsg}`;
                  photoStatusSpan.style.color = '#EF4444';
                }
                if (window.showToast) {
                  window.showToast(uploadErrMsg, 'error');
                }
                if (saveBtn) {
                  saveBtn.disabled = false;
                  saveBtn.textContent = 'সংরক্ষণ করুন';
                }
                return;
              }
            } catch (imgErr) {
              console.error('Avatar processing error:', imgErr);
              const uploadErrMsg = currentLang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে, আবার চেষ্টা করুন' : 'Image upload failed, please try again.';
              if (photoStatusSpan) {
                photoStatusSpan.textContent = `⚠️ ${uploadErrMsg}`;
                photoStatusSpan.style.color = '#EF4444';
              }
              if (window.showToast) {
                window.showToast(uploadErrMsg, 'error');
              }
              if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'সংরক্ষণ করুন';
              }
              return;
            }
          } else if (removeAvatarRequested) {
            if (user.photoURL && storageMod) {
              await storageMod.deleteImage(user.photoURL);
            }
            photoURLToSave = null;
          }

          // 1. Update Firebase Auth profile (displayName & photoURL)
          if (mod && mod.updateProfile) {
            await mod.updateProfile(user, {
              displayName: name,
              photoURL: photoURLToSave
            });
          }

          // 2. Manage usernames collection doc
          if (mod && mod.db && mod.doc) {
            if (username !== currentUserUsername) {
              const usernameDocRef = mod.doc(mod.db, 'usernames', username);
              const usernameSnap = await mod.getDoc(usernameDocRef);

              if (usernameSnap.exists() && usernameSnap.data().uid !== user.uid) {
                throw new Error('Username is already taken.');
              }

              if (!usernameSnap.exists()) {
                await mod.setDoc(usernameDocRef, {
                  uid: user.uid,
                  updatedAt: mod.serverTimestamp ? mod.serverTimestamp() : new Date().toISOString()
                });
              }

              if (currentUserUsername && currentUserUsername !== username && mod.deleteDoc) {
                try {
                  await mod.deleteDoc(mod.doc(mod.db, 'usernames', currentUserUsername));
                } catch (e) {
                  console.warn('Could not delete old username doc:', e);
                }
              }
              currentUserUsername = username;
            }
          }

          // 3. Update primary user document users/{user.uid} in Firestore
          if (mod && mod.db && mod.doc) {
            const userRef = mod.doc(mod.db, 'users', user.uid);
            const userSnap = await mod.getDoc(userRef);

            const userPayload = {
              uid: user.uid,
              displayName: name,
              fullName: name,
              username: username,
              phoneNumber: phone,
              phone: phone,
              email: user.email || '',
              photoURL: photoURLToSave,
              profilePicture: photoURLToSave,
              updatedAt: mod.serverTimestamp ? mod.serverTimestamp() : new Date().toISOString()
            };

            if (userSnap.exists()) {
              if (mod.updateDoc) {
                await mod.updateDoc(userRef, userPayload);
              } else {
                await mod.setDoc(userRef, userPayload, { merge: true });
              }
            } else {
              await mod.setDoc(userRef, userPayload, { merge: true });
            }

            // 4. Also update sarip/sarip document if user is sarip/owner
            try {
              const saripRef = mod.doc(mod.db, 'sarip', 'sarip');
              const saripSnap = await mod.getDoc(saripRef);
              if (saripSnap.exists() && saripSnap.data().uid === user.uid) {
                if (mod.updateDoc) {
                  await mod.updateDoc(saripRef, userPayload);
                } else {
                  await mod.setDoc(saripRef, userPayload, { merge: true });
                }
              }
            } catch (saripErr) {
              console.warn('sarip/sarip doc update skipped:', saripErr);
            }
          }

          // Update local state
          user.displayName = name;
          user.photoURL = photoURLToSave;

          // Update DOM display on account card & sidebars
          const avatarEl = document.getElementById('account-user-avatar-img') || document.getElementById('user-avatar-img');
          const avatarInitialEl = document.getElementById('account-user-avatar-initial') || document.getElementById('user-avatar-initial');

          if (photoURLToSave) {
            ['account-user-avatar-img', 'account-sidebar-avatar', 'account-topbar-avatar', 'user-avatar-img', 'client-sidebar-avatar', 'client-topbar-avatar'].forEach(id => {
              const img = document.getElementById(id);
              if (img) {
                img.src = photoURLToSave;
                img.style.display = 'block';
              }
            });
            if (avatarInitialEl) avatarInitialEl.style.display = 'none';
          } else {
            ['account-user-avatar-img', 'user-avatar-img'].forEach(id => {
              const img = document.getElementById(id);
              if (img) img.style.display = 'none';
            });
            const firstChar = name.trim().charAt(0).toUpperCase() || 'S';
            if (avatarInitialEl) {
              avatarInitialEl.textContent = firstChar;
              avatarInitialEl.style.display = 'flex';
            }
          }

          if (document.getElementById('account-profile-name')) {
            document.getElementById('account-profile-name').textContent = name;
          }
          if (document.getElementById('account-profile-username')) {
            document.getElementById('account-profile-username').textContent = username;
          }
          if (document.getElementById('account-profile-phone-row') && document.getElementById('account-profile-phone')) {
            const phoneText = document.getElementById('account-profile-phone');
            if (phone) {
              phoneText.textContent = phone;
            } else {
              const isBn = currentLang === 'bn';
              const promptLabel = isBn ? '+ ফোন নম্বর যোগ করুন' : '+ Add phone number';
              phoneText.innerHTML = `<a href="settings.html" style="font-size: 0.88rem; font-weight: 500;">${promptLabel}</a>`;
            }
          }

          if (document.getElementById('account-sidebar-name')) document.getElementById('account-sidebar-name').textContent = name;
          if (document.getElementById('welcome-client-name')) {
            const firstName = name.trim().split(' ')[0] || 'Client';
            document.getElementById('welcome-client-name').textContent = firstName;
          }

          if (window.refreshThreeDotsMenu) window.refreshThreeDotsMenu();

          editModal.classList.remove('active');

          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'সংরক্ষণ করুন';
          }

          if (window.showToast) {
            window.showToast(currentLang === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!', 'success');
          }

        } catch (err) {
          console.error('Error updating profile:', err);
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'সংরক্ষণ করুন';
          }
          if (window.showToast) {
            window.showToast(err.message || 'Error updating profile', 'error');
          }
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     11. Dedicated Settings Page Logic
     -------------------------------------------------------------------------- */
  function initSettingsPage() {
    if (!document.getElementById('card-appearance')) return;

    // Appearance Theme Radios
    const themeRadios = document.querySelectorAll('input[name="theme-radio"]');
    themeRadios.forEach(radio => {
      radio.checked = (radio.value === currentTheme);
      radio.addEventListener('change', () => {
        applyTheme(radio.value);
      });
    });

    // Appearance Language Radios
    const langRadios = document.querySelectorAll('input[name="lang-radio"]');
    langRadios.forEach(radio => {
      radio.checked = (radio.value === currentLang);
      radio.addEventListener('change', () => {
        applyLanguage(radio.value);
      });
    });

    // Notifications Switches
    const notifProjectSwitch = document.getElementById('notif-project-switch');
    const notifPromoSwitch = document.getElementById('notif-promo-switch');

    if (notifProjectSwitch) {
      notifProjectSwitch.checked = localStorage.getItem('webworldbd_notif_project') !== 'false';
      notifProjectSwitch.addEventListener('change', () => {
        localStorage.setItem('webworldbd_notif_project', notifProjectSwitch.checked);
      });
    }

    if (notifPromoSwitch) {
      notifPromoSwitch.checked = localStorage.getItem('webworldbd_notif_promo') === 'true';
      notifPromoSwitch.addEventListener('change', () => {
        localStorage.setItem('webworldbd_notif_promo', notifPromoSwitch.checked);
      });
    }

    // Clear Cache Button
    const clearCacheBtn = document.getElementById('btn-clear-cache');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => {
        const confirmMsg = currentLang === 'bn'
          ? 'আপনি কি নিশ্চিত যে আপনার লোকাল প্রেফারেন্স ও ক্যাশ পরিষ্কার করতে চান?'
          : 'Are you sure you want to clear your local preferences and cache?';

        if (confirm(confirmMsg)) {
          localStorage.removeItem('webworldbd_theme');
          localStorage.removeItem('webworldbd_lang');
          localStorage.removeItem('webworldbd_notif_project');
          localStorage.removeItem('webworldbd_notif_promo');

          applyTheme('light');
          applyLanguage('en');

          alert(translations[currentLang].msgCacheCleared || 'Cache cleared successfully!');
        }
      });
    }

    // Modal Triggers & Controls
    const editProfileBtn = document.getElementById('btn-edit-profile');
    const changePassBtn = document.getElementById('btn-change-password');
    const deleteAccountBtn = document.getElementById('btn-delete-account');
    const logoutSettingsBtn = document.getElementById('btn-logout-settings');

    const editProfileModal = document.getElementById('modal-edit-profile');
    const changePassModal = document.getElementById('modal-change-password');
    const deleteAccountModal = document.getElementById('modal-delete-account');

    function closeModal(modal) {
      if (modal) modal.classList.remove('active');
    }

    document.querySelectorAll('.btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal(editProfileModal);
        closeModal(changePassModal);
        closeModal(deleteAccountModal);
      });
    });

    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        const user = window.currentUserState;
        if (!user) return;
        document.getElementById('edit-profile-name').value = user.displayName || '';
        document.getElementById('edit-profile-photo').value = user.photoURL || '';
        editProfileModal.classList.add('active');
      });
    }

    if (changePassBtn) {
      changePassBtn.addEventListener('click', () => {
        changePassModal.classList.add('active');
      });
    }

    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', () => {
        deleteAccountModal.classList.add('active');
      });
    }

    if (logoutSettingsBtn) {
      logoutSettingsBtn.addEventListener('click', () => {
        const mod = window.FirebaseModule;
        if (mod && mod.auth && mod.signOut) {
          mod.signOut(mod.auth).then(() => {
            alert(currentLang === 'bn' ? 'সফলভাবে লগআউট করা হয়েছে।' : 'Logged out successfully.');
          });
        }
      });
    }

    // Edit Profile Form Submit
    const formEditProfile = document.getElementById('form-edit-profile');
    if (formEditProfile) {
      formEditProfile.addEventListener('submit', (e) => {
        e.preventDefault();
        const mod = window.FirebaseModule;
        const user = window.currentUserState;
        if (!mod || !user || !mod.updateProfile) return;

        const newName = document.getElementById('edit-profile-name').value.trim();
        const newPhoto = document.getElementById('edit-profile-photo').value.trim();

        mod.updateProfile(user, {
          displayName: newName,
          photoURL: newPhoto || null
        }).then(() => {
          closeModal(editProfileModal);
          updateSettingsAccountView(user);
          alert(translations[currentLang].msgProfileUpdated);
        }).catch(err => {
          alert(err.message);
        });
      });
    }

    // Change Password Form Submit
    const formChangePassword = document.getElementById('form-change-password');
    if (formChangePassword) {
      formChangePassword.addEventListener('submit', (e) => {
        e.preventDefault();
        const mod = window.FirebaseModule;
        const user = window.currentUserState;
        if (!mod || !user || !mod.updatePassword) return;

        const oldPass = document.getElementById('change-pass-old').value;
        const newPass = document.getElementById('change-pass-new').value;
        const confirmPass = document.getElementById('change-pass-confirm').value;

        if (newPass !== confirmPass) {
          alert(translations[currentLang].errPasswordMismatch);
          return;
        }

        if (mod.EmailAuthProvider && mod.reauthenticateWithCredential) {
          const cred = mod.EmailAuthProvider.credential(user.email, oldPass);
          mod.reauthenticateWithCredential(user, cred)
            .then(() => mod.updatePassword(user, newPass))
            .then(() => {
              closeModal(changePassModal);
              document.getElementById('change-pass-old').value = '';
              document.getElementById('change-pass-new').value = '';
              document.getElementById('change-pass-confirm').value = '';
              alert(translations[currentLang].msgPasswordChanged);
            })
            .catch(err => {
              alert(err.message || translations[currentLang].errWrongPassword);
            });
        } else {
          mod.updatePassword(user, newPass)
            .then(() => {
              closeModal(changePassModal);
              alert(translations[currentLang].msgPasswordChanged);
            })
            .catch(err => alert(err.message));
        }
      });
    }

    // Delete Account Form Submit
    const formDeleteAccount = document.getElementById('form-delete-account');
    if (formDeleteAccount) {
      formDeleteAccount.addEventListener('submit', (e) => {
        e.preventDefault();
        const mod = window.FirebaseModule;
        const user = window.currentUserState;
        if (!mod || !user || !mod.deleteUser) return;

        const pass = document.getElementById('delete-pass-confirm').value;

        if (mod.EmailAuthProvider && mod.reauthenticateWithCredential) {
          const cred = mod.EmailAuthProvider.credential(user.email, pass);
          mod.reauthenticateWithCredential(user, cred)
            .then(() => mod.deleteUser(user))
            .then(() => {
              closeModal(deleteAccountModal);
              alert(translations[currentLang].msgAccountDeleted);
            })
            .catch(err => alert(err.message || translations[currentLang].errWrongPassword));
        } else {
          mod.deleteUser(user)
            .then(() => {
              closeModal(deleteAccountModal);
              alert(translations[currentLang].msgAccountDeleted);
            })
            .catch(err => alert(err.message));
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     12. User Live Chat Module (1-on-1 with Admin)
     -------------------------------------------------------------------------- */
  function initUserLiveChatModule() {
    let activeChatUnsubscribe = null;
    let activeUserDocUnsubscribe = null;

    // Create Modal Elements dynamically if not in DOM
    let chatModal = document.getElementById('user-live-chat-modal');
    if (!chatModal) {
      chatModal = document.createElement('div');
      chatModal.id = 'user-live-chat-modal';
      chatModal.className = 'chat-modal-overlay';
      chatModal.innerHTML = `
        <div class="chat-modal-card">
          <div class="chat-header">
            <div class="chat-header-user">
              <img src="profile.jpg" alt="SHAFAET HOSSEN SARIP" class="chat-avatar">
              <div class="chat-header-info">
                <span class="chat-header-name">SHAFAET HOSSEN SARIP</span>
                <span class="chat-header-status"><span class="chat-status-dot"></span> Admin (Online)</span>
              </div>
            </div>
            <button type="button" class="chat-close-btn" id="user-chat-close-btn" aria-label="Close Chat">
              <i class="fas fa-xmark"></i>
            </button>
          </div>
          <div class="chat-messages-container" id="user-chat-messages-container">
            <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
              <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--accent-blue); margin-bottom: 0.5rem; display: block;"></i>
              মেসেজ সমুহ লোড হচ্ছে...
            </div>
          </div>
          <div class="chat-footer">
            <form id="user-chat-form" class="chat-input-form">
              <input type="text" id="user-chat-input" placeholder="মেসেজ লিখুন..." autocomplete="off" required />
              <button type="submit" class="chat-send-btn" id="user-chat-send-btn" aria-label="Send Message">
                <i class="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(chatModal);

      const closeBtn = document.getElementById('user-chat-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeUserLiveChat);
      }

      chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) closeUserLiveChat();
      });
    }

    function openUserLiveChat() {
      const user = window.currentUserState;
      if (!user) {
        sessionStorage.setItem('pending_live_chat_open', 'true');
        if (window.showToast) {
          window.showToast(currentLang === 'bn' ? 'লাইভ চ্যাট ব্যবহার করতে প্রথমে লগইন করুন।' : 'Please login first to access Live Chat.', 'info');
        }
        window.location.href = 'account.html';
        return;
      }

      const isAdminUser = user.uid === 'dS9uZZToHTUPP1Q3DiWiG25D3Xt2' || user.email === 'webworldbd.lmt@gmail.com' || user.email === 'onlyphone678@gmail.com';
      if (isAdminUser) {
        if (window.showToast) {
          window.showToast(currentLang === 'bn' ? 'আপনি অ্যাডমিন হিসেবে লগইন করেছেন। অ্যাডমিন মেসেঞ্জারে নিয়ে যাওয়া হচ্ছে...' : 'Logged in as Admin. Redirecting to Admin Messenger...', 'info');
        }
        window.location.href = 'admin.html#messenger';
        return;
      }

      chatModal.classList.add('active');
      document.body.style.overflow = 'hidden';

      ensureUserChatDocAndListen(user);
    }
    window.openUserLiveChat = openUserLiveChat;

    function closeUserLiveChat() {
      chatModal.classList.remove('active');
      document.body.style.overflow = '';
      if (activeChatUnsubscribe) {
        activeChatUnsubscribe();
        activeChatUnsubscribe = null;
      }
    }

    async function ensureUserChatDocAndListen(user) {
      const mod = window.FirebaseModule;
      if (!mod || !mod.db || !mod.doc || !mod.getDoc || !mod.setDoc || !mod.collection || !mod.onSnapshot || !mod.query || !mod.orderBy) return;

      const chatDocRef = mod.doc(mod.db, 'chats', user.uid);

      try {
        const snap = await mod.getDoc(chatDocRef);
        const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Client User');
        const displayEmail = user.email || '';

        if (!snap.exists()) {
          await mod.setDoc(chatDocRef, {
            userName: displayName,
            userEmail: displayEmail,
            lastMessage: '',
            lastMessageAt: mod.serverTimestamp ? mod.serverTimestamp() : new Date().toISOString(),
            lastSenderRole: 'user',
            unreadByAdmin: false,
            unreadByUser: false
          });
        } else {
          // Clear unreadByUser flag when user opens chat
          await mod.updateDoc(chatDocRef, {
            unreadByUser: false,
            userName: displayName,
            userEmail: displayEmail
          }).catch(e => console.warn('Update unreadByUser error:', e));
        }

        // Listen for messages in real-time
        const messagesCol = mod.collection(mod.db, 'chats', user.uid, 'messages');
        const q = mod.query(messagesCol, mod.orderBy('createdAt', 'asc'));

        if (activeChatUnsubscribe) activeChatUnsubscribe();

        activeChatUnsubscribe = mod.onSnapshot(q, (snapshot) => {
          renderUserMessages(snapshot);
        }, (error) => {
          console.error('Error listening to user chat messages:', error);
        });

      } catch (err) {
        console.error('Error initializing user chat doc:', err);
      }
    }

    function renderUserMessages(snapshot) {
      const container = document.getElementById('user-chat-messages-container');
      if (!container) return;

      if (snapshot.empty) {
        container.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); margin: auto; padding: 2rem;">
            <i class="fas fa-comments" style="font-size: 2.5rem; color: var(--accent-blue); margin-bottom: 0.75rem; display: block;"></i>
            <p style="font-size: 0.95rem; font-weight: 600;">👋 ${currentLang === 'bn' ? 'হাই! কিভাবে আপনাকে সাহায্য করতে পারি?' : 'Hi! How can I help you today?'}</p>
            <p style="font-size: 0.82rem; margin-top: 0.25rem;">${currentLang === 'bn' ? 'এখানে মেসেজ লিখুন, এডমিন সরাসরি উত্তর দিবেন।' : 'Write a message below, admin will reply directly.'}</p>
          </div>
        `;
        return;
      }

      let html = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const role = data.senderRole || 'user';
        const isUser = role === 'user';
        const timeStr = data.createdAt ? new Date(data.createdAt.seconds ? data.createdAt.seconds * 1000 : data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        html += `
          <div class="chat-msg-row ${isUser ? 'msg-user' : 'msg-admin'}">
            <span class="chat-sender-name">${isUser ? 'You' : 'SHAFAET HOSSEN SARIP (Admin)'}</span>
            <div class="chat-bubble">
              ${escapeHtml(data.text || '')}
              <span class="chat-msg-time">${timeStr}</span>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    }

    // User Message Submit Handler
    const userChatForm = document.getElementById('user-chat-form');
    if (userChatForm) {
      userChatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('user-chat-input');
        const text = input ? input.value.trim() : '';
        const user = window.currentUserState;

        if (!text || !user) return;

        input.value = '';

        const mod = window.FirebaseModule;
        if (!mod || !mod.db) return;

        try {
          const chatDocRef = mod.doc(mod.db, 'chats', user.uid);
          const messagesCol = mod.collection(mod.db, 'chats', user.uid, 'messages');

          // Add message doc
          await mod.addDoc(messagesCol, {
            senderId: user.uid,
            senderRole: 'user',
            text: text,
            createdAt: mod.serverTimestamp ? mod.serverTimestamp() : new Date().toISOString(),
            read: false
          });

          // Update parent chat doc
          await mod.updateDoc(chatDocRef, {
            lastMessage: text,
            lastMessageAt: mod.serverTimestamp ? mod.serverTimestamp() : new Date().toISOString(),
            lastSenderRole: 'user',
            unreadByAdmin: true
          });

        } catch (err) {
          console.error('Error sending message:', err);
          if (window.showToast) window.showToast('মেসেজ পাঠাতে সমস্যা হয়েছে: ' + err.message, 'error');
        }
      });
    }

    // Real-time listener for user unread status badge on bottom nav & drawer
    function initUserUnreadListener() {
      const mod = window.FirebaseModule;
      if (!mod || !mod.auth || !mod.onAuthStateChanged) {
        setTimeout(initUserUnreadListener, 100);
        return;
      }

      mod.onAuthStateChanged(mod.auth, (user) => {
        if (!user) {
          if (activeUserDocUnsubscribe) {
            activeUserDocUnsubscribe();
            activeUserDocUnsubscribe = null;
          }
          updateUserUnreadBadges(false);
          return;
        }

        // Auto-open live chat if redirected from auth gate
        if (sessionStorage.getItem('pending_live_chat_open') === 'true') {
          sessionStorage.removeItem('pending_live_chat_open');
          setTimeout(() => {
            openUserLiveChat();
          }, 300);
        }

        const chatDocRef = mod.doc(mod.db, 'chats', user.uid);
        activeUserDocUnsubscribe = mod.onSnapshot(chatDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            updateUserUnreadBadges(!!data.unreadByUser);
          } else {
            updateUserUnreadBadges(false);
          }
        }, (err) => {
          console.error('Error listening to user chat doc unread:', err);
        });
      });
    }

    function updateUserUnreadBadges(hasUnread) {
      // Bottom nav item badge
      const bottomNavChat = document.querySelector('.mobile-nav-item[data-nav="live-chat"]');
      if (bottomNavChat) {
        let dot = bottomNavChat.querySelector('.live-chat-unread-dot');
        if (hasUnread) {
          if (!dot) {
            dot = document.createElement('span');
            dot.className = 'live-chat-unread-dot';
            bottomNavChat.appendChild(dot);
          }
          dot.style.display = 'block';
        } else if (dot) {
          dot.style.display = 'none';
        }
      }

      // Three dots drawer badge
      const drawerBadge = document.getElementById('live-chat-drawer-badge');
      if (drawerBadge) {
        drawerBadge.style.display = hasUnread ? 'block' : 'none';
      }
    }

    initUserUnreadListener();
  }
});
