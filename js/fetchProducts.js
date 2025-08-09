document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.product-grid[data-category]').forEach(grid => {
      const category = grid.dataset.category; // "stickers" or "physical"
      fetch('products.json')
        .then(r => r.json())
        .then(items => {
          items.filter(p => p.category === category).forEach(p => {
            const card = document.createElement('div');
            card.className = 'product';
            card.innerHTML = `
              <img src="${p.img}" alt="${p.title}">
              <h3>${p.title}</h3>
              <p class="price">$${p.price.toFixed(2)}</p>
              <a href="${p.buy}" target="_blank" rel="noopener" class="buy-btn">Buy Now</a>
            `;
            grid.appendChild(card);
          });
        })
        .catch(err => {
          grid.innerHTML = `<p class="error-state">Couldn’t load products.</p>`;
          console.error('products.json error', err);
        });
    });
  });
  