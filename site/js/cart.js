/**
 * Cart management for Luce.
 * Persists cart state in localStorage and renders the cart page.
 */

(function () {
  'use strict';

  const CART_KEY = 'luce_cart';

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (typeof window.updateCartCount === 'function') {
      window.updateCartCount();
    }
  }

  function findItem(cart, productId) {
    return cart.find((item) => item.productId === productId);
  }

  function addToCart(product) {
    const cart = readCart();
    const existing = findItem(cart, product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    writeCart(cart);
    window.showToast(`${product.name} added to cart`);
  }

  function removeFromCart(productId) {
    let cart = readCart();
    cart = cart.filter((item) => item.productId !== productId);
    writeCart(cart);
    renderCart();
  }

  function updateQuantity(productId, delta) {
    const cart = readCart();
    const item = findItem(cart, productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    writeCart(cart);
    renderCart();
  }

  function clearCart() {
    writeCart([]);
  }

  function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  function formatMoney(value) {
    return '$' + value.toFixed(2);
  }

  function generateOrderId() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${date}-${rand}`;
  }

  function renderCart() {
    const cart = readCart();
    const itemsEl = document.getElementById('cart-items');
    const summaryEl = document.getElementById('cart-summary');
    const emptyEl = document.getElementById('empty-cart');
    const checkoutForm = document.getElementById('checkout-form');

    if (!itemsEl || !summaryEl || !emptyEl) return;

    if (cart.length === 0) {
      itemsEl.innerHTML = '';
      summaryEl.innerHTML = '';
      emptyEl.hidden = false;
      if (checkoutForm) checkoutForm.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    if (checkoutForm) checkoutForm.hidden = false;

    itemsEl.innerHTML = cart.map((item) => `
      <li class="cart-item" data-product-id="${item.productId}">
        <img class="cart-item-thumb" src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${formatMoney(item.price)} each</span>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>
          <span class="cart-item-line-total">${formatMoney(item.quantity * item.price)}</span>
          <button class="remove-btn" data-action="remove" aria-label="Remove item">×</button>
        </div>
      </li>
    `).join('');

    const subtotal = cartTotal(cart);
    const shipping = subtotal > 0 ? 8 : 0;
    const total = subtotal + shipping;

    summaryEl.innerHTML = `
      <div class="cart-summary-row">
        <span>Subtotal</span>
        <span>${formatMoney(subtotal)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Shipping</span>
        <span>${shipping === 0 ? 'Free' : formatMoney(shipping)}</span>
      </div>
      <div class="cart-summary-row total">
        <span>Total</span>
        <span>${formatMoney(total)}</span>
      </div>
    `;

    itemsEl.querySelectorAll('.cart-item').forEach((row) => {
      const productId = row.getAttribute('data-product-id');
      row.querySelector('[data-action="decrease"]').addEventListener('click', () => updateQuantity(productId, -1));
      row.querySelector('[data-action="increase"]').addEventListener('click', () => updateQuantity(productId, 1));
      row.querySelector('[data-action="remove"]').addEventListener('click', () => removeFromCart(productId));
    });
  }

  function handleCheckout(event) {
    event.preventDefault();
    const form = event.target;
    const cart = readCart();
    if (cart.length === 0) return;

    const order = {
      items: JSON.parse(JSON.stringify(cart)),
      total: cartTotal(cart) + 8,
      email: form.email.value,
      shipping: {
        name: form.name.value,
        address: form.address.value,
        city: form.city.value,
        zip: form.zip.value,
      },
      orderId: generateOrderId(),
      placedAt: new Date().toISOString(),
    };

    // Demo only: log and show confirmation
    console.log('Demo order', order);

    const confirmationEl = document.getElementById('order-confirmation');
    if (confirmationEl) {
      confirmationEl.hidden = false;
      confirmationEl.querySelector('.order-id').textContent = order.orderId;
      confirmationEl.querySelector('.order-email').textContent = order.email;
      confirmationEl.querySelector('.order-total').textContent = formatMoney(order.total);
      form.hidden = true;
      document.getElementById('cart-items').closest('.cart-panel').scrollIntoView({ behavior: 'smooth' });
    }

    clearCart();
    renderCart();
  }

  function setupAddButtons() {
    document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
      button.addEventListener('click', () => {
        const product = JSON.parse(button.getAttribute('data-add-to-cart'));
        addToCart(product);
      });
    });
  }

  function setupCheckout() {
    const form = document.getElementById('checkout-form');
    if (form) {
      form.addEventListener('submit', handleCheckout);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupAddButtons();
    setupCheckout();
    renderCart();
  });

  // Expose minimal API for product page reuse
  window.luceCart = {
    addToCart,
    readCart,
    writeCart,
  };
})();
