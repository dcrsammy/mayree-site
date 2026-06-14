// ─── SHOP ────────────────────────────────────────────────────

async function fetchProducts(filters = {}) {
  let query = sb.from('products').select('*').eq('active', true);

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);
  if (filters.sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) console.error(error);
  return data || [];
}

async function fetchProduct(id) {
  const { data } = await sb.from('products').select('*').eq('id', id).single();
  return data;
}

function productCardHTML(p) {
  const img = p.images?.[0] || '';
  const badgeHTML = p.badge
    ? `<span class="pbadge ${p.badge === 'New In' ? 'new-in' : ''}">${p.badge}</span>`
    : '';
  const wishlisted = isWishlisted(p.id);
  return `
  <div class="pcard" data-id="${p.id}">
    <div class="pimg">
      ${badgeHTML}
      ${img ? `<img src="${img}" alt="${p.name}" loading="lazy"/>` : '<div class="pimg-placeholder"></div>'}
      <div class="pactions">
        <button class="padd" onclick="quickAdd('${p.id}')">Quick Add</button>
        <button class="pwish ${wishlisted ? 'active' : ''}" onclick="wishToggle(this,'${p.id}')">
          ${wishlisted ? '&#9829;' : '&#9825;'}
        </button>
      </div>
    </div>
    <div class="pinfo">
      <div class="ptype">${p.category || 'The Edit'} · One of One</div>
      <div class="pname">${p.name}</div>
      <div class="pprice-row">
        <span class="pprice">${fmt(p.price)}</span>
        ${p.old_price ? `<span class="pprice-old">${fmt(p.old_price)}</span>` : ''}
      </div>
      <div class="pstars">★★★★★</div>
    </div>
    <a class="pcard-link" href="/product.html?id=${p.id}"></a>
  </div>`;
}

// called from inline onclick
async function quickAdd(id) {
  const p = await fetchProduct(id);
  if (p) addToCart(p);
}

async function wishToggle(btn, id) {
  const p = await fetchProduct(id);
  if (!p) return;
  const added = toggleWishlist(p);
  btn.innerHTML = added ? '&#9829;' : '&#9825;';
  btn.classList.toggle('active', added);
}

async function renderProducts(containerId, filters = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner"></div>';
  const products = await fetchProducts(filters);
  if (!products.length) {
    container.innerHTML = '<p class="empty-state">No products found.</p>';
    return;
  }
  container.innerHTML = products.map(productCardHTML).join('');
}
