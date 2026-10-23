(() => {
  const ROOT_ID = 'filt-common-menu';
  if (window.__FILT_COMMON_MENU_LOADED) return;
  window.__FILT_COMMON_MENU_LOADED = true;

  const desktopLinks = [
    { label: 'OFFICE', href: '/office' },
    { label: 'NEWS', href: '/news' },
    { label: 'WORKS', href: '/works_list' }
  ];
  const mobileLinks = [
    { label: 'WORKS', href: '/works_list' },
    { label: 'OFFICE', href: '/office' },
    { label: 'NEWS', href: '/news' }
  ];

  function mount() {
    if (!document.body || document.getElementById(ROOT_ID)) return;

    const css = [
      '#filt-common-menu, #filt-common-menu * { box-sizing:border-box; }',
      '#filt-common-menu { --fcm-accent:#BD005E; font-family:"Pretendard Variable","Pretendard","Noto Sans KR",sans-serif; letter-spacing:.4px; color:#000; }',
      '#filt-common-menu button, #filt-common-menu a { font-family:inherit; }',
      '#filt-common-menu .fcm-desktop-panel { position:fixed; z-index:999991; top:0; left:0; width:240px; height:100vh; height:100dvh; padding:0; margin:0; background:#fff; border-right:1px solid #000; transform:translateX(-210px); transition:transform .35s ease; }',
      '#filt-common-menu.is-open .fcm-desktop-panel { transform:translateX(0); }',
      '#filt-common-menu .fcm-edge-toggle { position:absolute; top:0; left:230px; width:10px; height:410px; margin:0; padding:0; border:0; border-radius:0; background:#000; cursor:pointer; appearance:none; -webkit-appearance:none; }',
      '#filt-common-menu .fcm-edge-toggle:focus-visible, #filt-common-menu .fcm-mobile-toggle:focus-visible, #filt-common-menu a:focus-visible { outline:2px solid var(--fcm-accent); outline-offset:2px; }',
      '#filt-common-menu .fcm-home { position:absolute; top:20px; left:20px; z-index:12; display:block; width:15px; height:15px; border:0; border-radius:50%; background:#000; transition:opacity .3s ease, transform .2s ease; }',
      '#filt-common-menu .fcm-home:hover { opacity:.5; }',
      '#filt-common-menu .fcm-logo { position:absolute; top:0; left:0; width:240px; height:410px; display:block; }',
      '#filt-common-menu .fcm-logo svg { display:block; width:100%; height:100%; fill:none; stroke:#000; stroke-width:5; transition:opacity .3s ease; }',
      '#filt-common-menu .fcm-logo:hover svg { opacity:.7; }',
      '#filt-common-menu .fcm-office-name { position:absolute; top:330px; left:20px; width:180px; margin:0; font-size:12px; line-height:1; font-weight:600; letter-spacing:0; }',
      '#filt-common-menu .fcm-divider { position:absolute; top:410px; left:0; width:240px; height:.5px; background:#000; }',
      '#filt-common-menu .fcm-desktop-nav { position:absolute; top:420px; left:20px; z-index:20; display:flex; flex-direction:column; }',
      '#filt-common-menu .fcm-desktop-nav a { display:block; color:#000; text-decoration:none; font-size:12px; font-weight:400; line-height:1.6; transition:color .2s ease, transform .2s ease, font-weight .2s ease; }',
      '#filt-common-menu .fcm-desktop-nav a:hover { color:var(--fcm-accent); font-weight:700; transform:translateX(3px); }',
      '#filt-common-menu .fcm-footer { position:absolute; right:0; bottom:0; left:0; height:35px; display:flex; align-items:center; padding:0 20px; border-top:1px solid #000; color:#fff; background:#000; text-decoration:none; font-size:12px; line-height:1; font-weight:200; letter-spacing:.6px; }',
      '#filt-common-menu .fcm-mobile-toggle, #filt-common-menu .fcm-mobile-panel, #filt-common-menu .fcm-overlay { display:none; }',
      '@media (max-width:767px) {',
      '  #filt-common-menu .fcm-desktop-panel { display:none; }',
      '  #filt-common-menu .fcm-mobile-toggle { position:fixed; z-index:999992; top:0; right:0; display:flex; width:40px; height:40px; margin:0; padding:0; align-items:center; justify-content:center; border:0; border-radius:0; background:transparent; cursor:pointer; appearance:none; -webkit-appearance:none; }',
      '  #filt-common-menu .fcm-mobile-dot { display:block; width:12px; height:12px; flex:0 0 12px; border-radius:50%; background:#000; opacity:1; visibility:visible; }',
      '  #filt-common-menu .fcm-overlay { position:fixed; z-index:999990; inset:0; display:block; background:rgba(0,0,0,.3); opacity:0; visibility:hidden; transition:opacity .35s ease, visibility .35s ease; }',
      '  #filt-common-menu.is-open .fcm-overlay { opacity:1; visibility:visible; }',
      '  #filt-common-menu .fcm-mobile-panel { position:fixed; z-index:999991; top:0; right:0; display:flex; flex-direction:column; width:45%; max-width:82vw; min-width:180px; height:100vh; height:100dvh; border-left:.5px solid #000; background:#fff; transform:translateX(101%); transition:transform .35s ease; }',
      '  #filt-common-menu.is-open .fcm-mobile-panel { transform:translateX(0); }',
      '  #filt-common-menu .fcm-mobile-nav { flex:1 1 auto; display:flex; flex-direction:column; justify-content:flex-start; align-items:flex-start; margin-top:150px; padding:5px; border-top:.5px solid #000; border-bottom:.5px solid #000; text-align:left; }',
      '  #filt-common-menu .fcm-mobile-nav a { display:block; color:#000; text-decoration:none; font-size:1.2rem; font-weight:400; line-height:1.55; transition:color .35s ease; }',
      '  #filt-common-menu .fcm-mobile-nav a:hover { color:var(--fcm-accent); }',
      '  #filt-common-menu .fcm-mobile-footer { flex:0 0 50px; display:flex; justify-content:flex-end; align-items:flex-start; padding:5px; color:#fff; background:#000; text-decoration:none; font-size:1.2rem; font-weight:400; }',
      '}',
      '@media (prefers-reduced-motion:reduce) { #filt-common-menu *, #filt-common-menu *::before, #filt-common-menu *::after { transition-duration:.01ms !important; } }'
    ].join('\n');

    const style = document.createElement('style');
    style.id = ROOT_ID + '-styles';
    style.textContent = css;

    const root = document.createElement('div');
    root.id = ROOT_ID;

    const desktopPanel = document.createElement('aside');
    desktopPanel.className = 'fcm-desktop-panel';
    desktopPanel.setAttribute('aria-label', 'FILT 사이트 메뉴');

    const edgeToggle = document.createElement('button');
    edgeToggle.className = 'fcm-edge-toggle';
    edgeToggle.type = 'button';
    edgeToggle.setAttribute('aria-label', '메뉴 열기');
    edgeToggle.setAttribute('aria-expanded', 'false');
    edgeToggle.setAttribute('aria-controls', 'fcm-desktop-nav');

    const home = document.createElement('a');
    home.className = 'fcm-home';
    home.href = '/home';
    home.setAttribute('aria-label', '홈으로 이동');

    const logoLink = document.createElement('a');
    logoLink.className = 'fcm-logo';
    logoLink.href = '/home';
    logoLink.setAttribute('aria-label', 'FILT 홈');
    const svgNS = 'http://www.w3.org/2000/svg';
    const logoSvg = document.createElementNS(svgNS, 'svg');
    logoSvg.setAttribute('viewBox', '0 0 240 410');
    logoSvg.setAttribute('aria-hidden', 'true');
    [
      'M28.2,265.02v54.66', 'M25.78,267.47h19.22', 'M18,289.07h6',
      'M32.4,289.07h9.6', 'M42,289.07h9.6', 'M60,289.07h24',
      'M55.8,289.07v30.6', 'M55.8,264.47v24.6', 'M72,293.27v26.4',
      'M72,264.47v20.4', 'M42,293.27v26.4', 'M67.81,317.17h-14.46'
    ].forEach(d => {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', d);
      logoSvg.appendChild(path);
    });
    logoLink.appendChild(logoSvg);

    const officeName = document.createElement('p');
    officeName.className = 'fcm-office-name';
    officeName.append('필트아키텍츠', document.createElement('br'), '건축사사무소');

    const divider = document.createElement('div');
    divider.className = 'fcm-divider';
    divider.setAttribute('aria-hidden', 'true');

    const desktopNav = document.createElement('nav');
    desktopNav.className = 'fcm-desktop-nav';
    desktopNav.id = 'fcm-desktop-nav';
    desktopNav.setAttribute('aria-label', '주요 메뉴');

    const mobileNav = document.createElement('nav');
    mobileNav.className = 'fcm-mobile-nav';
    mobileNav.id = 'fcm-mobile-nav';
    mobileNav.setAttribute('aria-label', '주요 메뉴');

    function addLinks(nav, items) {
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
      items.forEach(item => {
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.label;
        if (currentPath === item.href || currentPath.startsWith(item.href + '/')) {
          link.setAttribute('aria-current', 'page');
        }
        nav.appendChild(link);
      });
    }
    addLinks(desktopNav, desktopLinks);
    addLinks(mobileNav, mobileLinks);

    const desktopFooter = document.createElement('a');
    desktopFooter.className = 'fcm-footer';
    desktopFooter.href = '/000';
    desktopFooter.textContent = 'ESSAYS AND DRAWINGS';

    desktopPanel.append(edgeToggle, home, logoLink, officeName, divider, desktopNav, desktopFooter);

    const overlay = document.createElement('div');
    overlay.className = 'fcm-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const mobilePanel = document.createElement('aside');
    mobilePanel.className = 'fcm-mobile-panel';
    mobilePanel.setAttribute('aria-label', 'FILT 사이트 메뉴');

    const mobileFooter = document.createElement('a');
    mobileFooter.className = 'fcm-mobile-footer';
    mobileFooter.href = '/000';
    mobileFooter.textContent = 'ESSAY & DRAWING';
    mobilePanel.append(mobileNav, mobileFooter);

    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'fcm-mobile-toggle';
    mobileToggle.type = 'button';
    mobileToggle.setAttribute('aria-label', '메뉴 열기');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', 'fcm-mobile-nav');
    const mobileDot = document.createElement('span');
    mobileDot.className = 'fcm-mobile-dot';
    mobileDot.setAttribute('aria-hidden', 'true');
    mobileToggle.appendChild(mobileDot);

    root.append(overlay, desktopPanel, mobilePanel, mobileToggle);
    (document.head || document.documentElement).appendChild(style);
    document.body.appendChild(root);

    const toggles = [edgeToggle, mobileToggle];
    let previousOverflow = '';
    function setOpen(open) {
      root.classList.toggle('is-open', open);
      toggles.forEach(button => {
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      });
      if (window.matchMedia('(max-width:767px)').matches) {
        if (open) {
          previousOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = previousOverflow;
        }
      }
    }

    toggles.forEach(button => button.addEventListener('click', () => {
      setOpen(!root.classList.contains('is-open'));
    }));
    overlay.addEventListener('click', () => setOpen(false));
    [desktopNav, mobileNav].forEach(nav => nav.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    }));
    desktopPanel.addEventListener('click', event => {
      if (event.target === desktopPanel) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && root.classList.contains('is-open')) setOpen(false);
    });
    window.addEventListener('resize', () => {
      if (!window.matchMedia('(max-width:767px)').matches) {
        document.body.style.overflow = previousOverflow;
      }
    });
  }

  if (document.readyState === 'loading' && !document.body) {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();