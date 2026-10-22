/* FILT shared mobile menu behavior
 * Imported by the cloned WORKS and Tempin mobile page code widgets.
 */
(() => {
  if (window.FILTSharedMobileMenuV1) return;
  window.FILTSharedMobileMenuV1 = true;
  const panel = document.querySelector('#mobileMenuPanel');
  const menuButton = document.querySelector('#openMenuBtn');
  const overlay = document.querySelector('#menuOverlay');
  if (!panel || !menuButton || !overlay) return;
  const closeMenu = () => {
    panel.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };
  menuButton.addEventListener('click', () => {
    panel.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  overlay.addEventListener('click', closeMenu);
})();

