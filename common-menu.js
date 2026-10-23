(() => {
  const ROOT_ID = 'filt-common-menu';
  if (window.__FILT_COMMON_MENU_LOADED) return;
  window.__FILT_COMMON_MENU_LOADED = true;

  const links = [
    { label: 'OFFICE', href: '/office' },
    { label: 'NEWS', href: '/news' },
    { label: 'WORKS', href: '/works_list' },
    { label: 'ESSAYS AND DRAWINGS', href: '/000', footer: true }
  ];

  function mount() {
    if (!document.body || document.getElementById(ROOT_ID)) return;

    const css = [
      '#filt-common-menu, #filt-common-menu * { box-sizing: border-box; }',
      '#filt-common-menu { --fc-black:#000; --fc-white:#fff; --fc-accent:#BD005E; font-family:"Pretendard Variable",Pretendard,SUIT,Arial,sans-serif; letter-spacing:.4px; }',
      '#filt-common-menu button, #filt-common-menu a { font:inherit; }',
      '#filt-common-menu .fc-panel { position:fixed; z-index:999991; top:0; left:0; width:240px; height:100vh; height:100dvh; color:var(--fc-black); background:var(--fc-white); border-right:1px solid var(--fc-black); transform:translateX(calc(-100% + 10px)); transition:transform .35s ease; }',
      '#filt-common-menu.is-open .fc-panel { transform:translateX(0); }',
      '#filt-common-menu .fc-edge-toggle { position:absolute; top:0; right:0; width:10px; height:410px; margin:0; padding:0; border:0; border-radius:0; background:var(--fc-black); cursor:pointer; appearance:none; -webkit-appearance:none; }',
      '#filt-common-menu .fc-edge-toggle:focus-visible, #filt-common-menu .fc-mobile-toggle:focus-visible, #filt-common-menu a:focus-visible { outline:2px solid var(--fc-accent); outline-offset:3px; }',
      '#filt-common-menu .fc-brand { position:absolute; top:258px; left:20px; color:inherit; text-decoration:none; font-size:34px; line-height:1; font-weight:400; letter-spacing:.12em; }',
      '#filt-common-menu .fc-office-name { position:absolute; top:330px; left:20px; margin:0; font-size:12px; line-height:1.15; font-weight:600; letter-spacing:0; }',
      '#filt-common-menu .fc-nav { position:absolute; top:420px; left:20px; display:flex; flex-direction:column; align-items:flex-start; gap:0; }',
      '#filt-common-menu .fc-nav a { display:block; color:var(--fc-black); text-decoration:none; font-size:12px; font-weight:400; line-height:1.6; transition:color .2s ease, transform .2s ease, font-weight .2s ease; }',
      '#filt-common-menu .fc-nav a:hover, #filt-common-menu .fc-nav a[aria-current="page"] { color:var(--fc-accent); font-weight:700; transform:translateX(3px); }',
      '#filt-common-menu .fc-footer { position:absolute; right:0; bottom:0; left:0; min-height:35px; padding:10px 20px; border-top:1px solid var(--fc-black); color:var(--fc-white); background:var(--fc-black); text-decoration:none; font-size:10px; line-height:1.4; letter-spacing:.6px; }',
      '#filt-common-menu .fc-overlay { position:fixed; z-index:999990; inset:0; background:rgba(0,0,0,.12); opacity:0; visibility:hidden; transition:opacity .35s ease, visibility .35s ease; }',
      '#filt-common-menu.is-open .fc-overlay { opacity:1; visibility:visible; }',
      '#filt-common-menu .fc-mobile-toggle { display:none; }',
      '@media (max-width:767px) {',
      '  #filt-common-menu .fc-overlay { background:rgba(0,0,0,.3); }',
      '  #filt-common-menu .fc-panel { left:auto; right:0; width:min(45vw,340px); min-width:180px; max-width:82vw; transform:translateX(101%); border-right:0; border-left:.5px solid var(--fc-black); display:flex; flex-direction:column; }',
      '  #filt-common-menu.is-open .fc-panel { transform:translateX(0); }',
      '  #filt-common-menu .fc-edge-toggle { display:none; }',
      '  #filt-common-menu .fc-mobile-toggle { position:fixed; z-index:999992; top:0; right:0; display:flex; width:40px; height:40px; margin:0; padding:0; align-items:center; justify-content:center; border:0; border-radius:0; color:var(--fc-black); background:transparent; cursor:pointer; appearance:none; -webkit-appearance:none; }',
      '  #filt-common-menu .fc-mobile-dot { display:block; width:12px; height:12px; border-radius:50%; background:var(--fc-black); transition:transform .2s ease; }',
      '  #filt-common-menu.is-open .fc-mobile-dot { transform:scale(.78); }',
      '  #filt-common-menu .fc-brand { top:24px; left:16px; font-size:22px; }',
      '  #filt-common-menu .fc-office-name { top:54px; left:16px; font-size:10px; }',
      '  #filt-common-menu .fc-nav { position:relative; top:auto; left:auto; display:flex; flex:1; margin-top:150px; padding:5px; border-top:.5px solid var(--fc-black); border-bottom:.5px solid var(--fc-black); }',
      '  #filt-common-menu .fc-nav a { font-size:1.2rem; line-height:1.55; }',
      '  #filt-common-menu .fc-footer { position:relative; min-height:50px; padding:14px 5px; text-align:right; font-size:12px; }',
      '}',
      '@media (prefers-reduced-motion: reduce) { #filt-common-menu *, #filt-common-menu *::before, #filt-common-menu *::after { transition-duration:.01ms !important; } }'
    ].join('\n');

    const style = document.createElement('style');
    style.id = ROOT_ID + '-styles';
    style.textContent = css;

    const root = document.createElement('div');
    root.id = ROOT_ID;

    const overlay = document.createElement('div');
    overlay.className = 'fc-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const panel = document.createElement('aside');
    panel.className = 'fc-panel';
    panel.setAttribute('aria-label', 'FILT 사이트 메뉴');

    const edgeToggle = document.createElement('button');
    edgeToggle.className = 'fc-edge-toggle';
    edgeToggle.type = 'button';
    edgeToggle.setAttribute('aria-label', '메뉴 열기');
    edgeToggle.setAttribute('aria-expanded', 'false');

    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'fc-mobile-toggle';
    mobileToggle.type = 'button';
    mobileToggle.setAttribute('aria-label', '메뉴 열기');
    mobileToggle.setAttribute('aria-expanded', 'false');
    const dot = document.createElement('span');
    dot.className = 'fc-mobile-dot';
    dot.setAttribute('aria-hidden', 'true');
    mobileToggle.appendChild(dot);

    const brand = document.createElement('a');
    brand.className = 'fc-brand';
    brand.href = '/home';
    brand.textContent = 'FILT.';
    brand.setAttribute('aria-label', 'FILT 홈');

    const officeName = document.createElement('p');
    officeName.className = 'fc-office-name';
    officeName.append('필트아키텍츠', document.createElement('br'), '건축사사무소');

    const nav = document.createElement('nav');
    nav.className = 'fc-nav';
    nav.setAttribute('aria-label', '주요 메뉴');

    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    links.filter(item => !item.footer).forEach(item => {
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.label;
      if (currentPath === item.href || currentPath.startsWith(item.href + '/')) {
        link.setAttribute('aria-current', 'page');
      }
      nav.appendChild(link);
    });

    const footer = document.createElement('a');
    footer.className = 'fc-footer';
    footer.href = links.find(item => item.footer).href;
    footer.textContent = links.find(item => item.footer).label;

    panel.append(edgeToggle, brand, officeName, nav, footer);
    root.append(overlay, panel, mobileToggle);
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
      if (window.matchMedia('(max-width: 767px)').matches) {
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
    panel.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && root.classList.contains('is-open')) setOpen(false);
    });
    window.addEventListener('resize', () => {
      if (!window.matchMedia('(max-width: 767px)').matches) {
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