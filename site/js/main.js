/**
 * Shared utilities for Luce.
 * Handles mobile navigation, footer flame easter egg, and cart count updates.
 */

(function () {
  'use strict';

  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.getElementById('menu-toggle');
  const footerLogo = document.querySelector('.footer-logo');
  const overlay = document.getElementById('sunset-overlay');
  let lanternInterval = null;
  let lanterns = [];

  function toggleMenu() {
    if (!mobileMenu) return;
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', !isOpen);
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-mobile a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Toast helper
  window.showToast = function (message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  };

  // Update mini cart count in header
  window.updateCartCount = function () {
    const countEl = document.querySelector('.cart-count');
    if (!countEl) return;
    try {
      const cart = JSON.parse(localStorage.getItem('luce_cart') || '[]');
      const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      countEl.textContent = total > 0 ? String(total) : '';
      countEl.setAttribute('data-count', String(total));
      countEl.classList.toggle('has-items', total > 0);
    } catch (e) {
      countEl.textContent = '';
      countEl.setAttribute('data-count', '0');
    }
  };

  function spawnLanterns() {
    // Remove any existing lanterns before creating new ones
    lanterns.forEach((l) => l.remove());
    lanterns = [];

    for (let i = 0; i < 12; i++) {
      const l = document.createElement('div');
      l.className = 'lantern';
      l.style.left = Math.random() * 100 + 'vw';
      l.style.top = Math.random() * 60 + 20 + 'vh';
      l.style.animationDelay = Math.random() * 5 + 's';
      l.style.animationDuration = 8 + Math.random() * 6 + 's';
      l.style.opacity = '0';
      l.style.transition = 'opacity 1s ease';
      document.body.appendChild(l);
      lanterns.push(l);
      // stagger fade in
      setTimeout(() => {
        l.style.opacity = '0.85';
      }, i * 120);
    }
  }

  function clearLanterns() {
    lanterns.forEach((l) => {
      l.style.opacity = '0';
      setTimeout(() => l.remove(), 1000);
    });
    lanterns = [];
  }

  function toggleSunset() {
    document.body.classList.toggle('sunset-mode');
    if (document.body.classList.contains('sunset-mode')) {
      overlay.classList.add('active');
      spawnLanterns();
      window.showToast('Ibiza sunset mode on');
    } else {
      overlay.classList.remove('active');
      clearLanterns();
    }
  }

  if (footerLogo) {
    footerLogo.addEventListener('click', toggleSunset);
  }

  // Konami-code style easter egg: type "LUCE" to trigger sunset
  const secretBuffer = [];
  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    secretBuffer.push(e.key.toUpperCase());
    if (secretBuffer.length > 8) secretBuffer.shift();
    if (secretBuffer.join('').includes('LUCE')) {
      toggleSunset();
      secretBuffer.length = 0;
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    window.updateCartCount();
  });
})();
