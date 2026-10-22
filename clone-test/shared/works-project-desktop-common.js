/* FILT shared desktop project-menu logo morph
 * Shared by the cloned Home, WORKS list, and Tempin desktop pages.
 */
(() => {
  if (window.FILTSharedProjectDesktopV1) return;
  window.FILTSharedProjectDesktopV1 = true;
  function initialize() {
    const logoButton = document.querySelector('#logoBtn');
    const logo = logoButton?.querySelector('svg');
    const paths = logo?.querySelectorAll('path');
    const panel = document.getElementById('panel');
    const verticalTrigger = document.querySelector('.vert');
    const isHomePage = logoButton?.dataset.filtCommonPage === 'home';
    if (!logoButton || !paths?.length || !panel || (!isHomePage && !verticalTrigger)) return;
    if (!window.gsap || !window.MorphSVGPlugin) return;
    gsap.registerPlugin(MorphSVGPlugin);
    const shapes = {
      panel: [
        'M28.2,265.02v54.66', 'M25.78,267.47h19.22', 'M18,289.07h6',
        'M32.4,289.07h9.6', 'M42,289.07h9.6', 'M60,289.07h24',
        'M55.8,289.07v30.6', 'M55.8,264.47v24.6', 'M72,293.27v26.4',
        'M72,264.47v20.4', 'M42,293.27v26.4', 'M67.81,317.17h-14.46'
      ],
      logo: [
        'M49.37-.25v270.82', 'M85.87,261.57h39', 'M-.13,289.07h69',
        'M45,301.57h53.87', 'M93.37,327.57h27.5', 'M164.87,299.07h75.13',
        'M93.37,314.57v75', 'M114.87,270.35v45.23', 'M149.87,382.37v27.63',
        'M209.87,296.57v42', 'M68.87,258.57v33', 'M239.87,355.57h-125'
      ]
    };
    let panelOpen = false;
    let currentStage = 'panel';
    const morphTo = (targetStage) => {
      const timeline = gsap.timeline({ defaults: { duration: 0.8, ease: 'power2.inOut' } });
      paths.forEach((path, index) => {
        timeline.to(path, { morphSVG: { shape: shapes[targetStage][index], shapeIndex: 0 } }, 0);
      });
      currentStage = targetStage;
    };
    const togglePanel = () => {
      panel.classList.toggle('open', !panelOpen);
      morphTo('panel');
      panelOpen = !panelOpen;
    };
    if (isHomePage) {
      logoButton.addEventListener('click', () => {
        morphTo(currentStage === 'panel' ? 'logo' : 'panel');
      });
      return;
    }
    verticalTrigger.addEventListener('click', (event) => {
      event.stopPropagation();
      togglePanel();
    });
    panel.addEventListener('click', (event) => {
      if (event.target.closest('a') || event.target.closest('#logoBtn')) return;
      togglePanel();
    });
    logoButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!panelOpen) return;
      morphTo(currentStage === 'panel' ? 'logo' : 'panel');
    });
    document.addEventListener('wheel', (event) => {
      if (event.ctrlKey) event.preventDefault();
    }, { passive: false });
    document.addEventListener('gesturestart', (event) => event.preventDefault());
  }
  if (document.readyState === 'complete') initialize();
  else window.addEventListener('load', initialize, { once: true });
})();

