/**
 * Product catalog rendering for Luce.
 * Loads products.json, renders cards, and wires filtering/sorting.
 */

(function () {
  'use strict';

  let allProducts = [];

  async function loadProducts() {
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error('Failed to load products');
      allProducts = await response.json();
      return allProducts;
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  function formatMoney(value) {
    return '$' + Number(value).toFixed(2);
  }

  function productCard(product, hideAddButton = false) {
    const soldOut = (product.stock || 0) === 0;
    const productJson = JSON.stringify(product).replace(/"/g, '&quot;');

    return `
      <article class="product-card" data-product-id="${product.id}" data-scent="${product.sent}" data-price="${product.price}" data-name="${product.name}">
        <div class="product-image-wrapper">
          <img class="product-image" src="${product.image}" alt="${product.name} candle" loading="lazy">
          <div class="product-badge-group">
            ${product.featured ? '<span class="badge badge-accent">Featured</span>' : ''}
            ${product.category ? `<span class="badge badge-olive">${product.category}</span>` : ''}
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-scent">${product.scent}</p>
          <p class="product-description">${product.description}</p>
          <div class="product-meta">
            <span class="product-price">${formatMoney(product.price)}</span>
            <span class="product-size">${product.size}</span>
          </div>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary ${soldOut ? 'disabled' : ''}" ${soldOut ? 'disabled' : ''}
            data-add-to-cart="${productJson}">
            ${soldOut ? 'Sold out' : 'Add to cart'}
          </button>
          <a href="candles.html" class="btn btn-ghost" aria-label="View product details">Details</a>
        </div>
      </article>
    `;
  }

  function renderProducts(container, products) {
    if (!container) return;
    if (products.length === 0) {
      container.innerHTML = '<p class="text-center" style="color:var(--color-text-muted)">No candles match your filters.</p>';
      return;
    }
    container.innerHTML = products.map((p) => productCard(p)).join('');
  }

  function renderFeatured(container) {
    if (!container) return;
    const featured = allProducts.filter((p) => p.featured);
    renderProducts(container, featured);
  }

  function filterAndSort(products, scent, sort) {
    let result = [...products];

    if (scent && scent !== 'all') {
      const needle = scent.toLowerCase();
      result = result.filter((p) => p.scent.toLowerCase().includes(needle));
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }

  function setupCatalog() {
    const grid = document.getElementById('product-grid');
    const scentFilter = document.getElementById('scent-filter');
    const sortFilter = document.getElementById('sort-filter');
    const resultCount = document.getElementById('result-count');
    if (!grid || !scentFilter || !sortFilter) return;

    function refresh() {
      const filtered = filterAndSort(allProducts, scentFilter.value, sortFilter.value);
      renderProducts(grid, filtered);
      if (resultCount) {
        resultCount.textContent = `${filtered.length} candle${filtered.length === 1 ? '' : 's'}`;
      }
      // Re-wire add-to-cart buttons because the DOM was replaced
      if (window.luceCart) {
        grid.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const product = JSON.parse(btn.getAttribute('data-add-to-cart'));
            window.luceCart.addToCart(product);
          });
        });
      }
    }

    scentFilter.addEventListener('change', refresh);
    sortFilter.addEventListener('change', refresh);
    refresh();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();

    const featuredGrid = document.getElementById('featured-grid');
    const catalogGrid = document.getElementById('product-grid');

    if (featuredGrid) {
      renderFeatured(featuredGrid);
      if (window.luceCart) {
        featuredGrid.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const product = JSON.parse(btn.getAttribute('data-add-to-cart'));
            window.luceCart.addToCart(product);
          });
        });
      }
    }

    if (catalogGrid) {
      setupCatalog();
    }
  });
})();
