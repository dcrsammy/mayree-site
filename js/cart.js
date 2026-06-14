// ─── CART ────────────────────────────────────────────────────

function getCart() {
  return JSON.parse(localStorage.getItem('mayree_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('mayree_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      qty
    });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart ✓`);
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}

function updateQty(id, qty) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) {
    if (qty < 1) { cart.splice(idx, 1); }
    else { cart[idx].qty = qty; }
  }
  saveCart(cart);
}

function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function clearCart() {
  localStorage.removeItem('mayree_cart');
  updateCartBadge();
}

// Wishlist
function getWishlist() {
  return JSON.parse(localStorage.getItem('mayree_wishlist') || '[]');
}

function toggleWishlist(product) {
  const list = getWishlist();
  const idx = list.findIndex(i => i.id === product.id);
  if (idx > -1) {
    list.splice(idx, 1);
    showToast(`${product.name} removed from wishlist`);
  } else {
    list.push(product);
    showToast(`${product.name} saved to wishlist ♥`);
  }
  localStorage.setItem('mayree_wishlist', JSON.stringify(list));
  return idx === -1;
}

function isWishlisted(id) {
  return getWishlist().some(i => i.id === id);
}
