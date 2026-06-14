// ─── ADMIN ───────────────────────────────────────────────────

async function adminFetchProducts() {
  // Bypass RLS: fetch ALL products (active and inactive) for admin
  const { data, error } = await sb
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('Fetch products error:', error);
  return data || [];
}

async function adminFetchOrders() {
  const { data, error } = await sb
    .from('orders')
    .select('*, profiles(full_name, email, phone)')
    .order('created_at', { ascending: false });
  if (error) console.error('Fetch orders error:', error);
  return data || [];
}

async function uploadProductImage(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const filename = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await sb.storage
    .from('mayree-images')
    .upload(filename, file, { upsert: true, contentType: file.type });
  if (error) throw new Error('Upload failed: ' + error.message);
  const { data: urlData } = sb.storage.from('mayree-images').getPublicUrl(filename);
  return urlData.publicUrl;
}

async function saveProduct(formData, existingId = null) {
  const payload = {
    name:         formData.name,
    price:        parseFloat(formData.price),
    old_price:    formData.old_price ? parseFloat(formData.old_price) : null,
    description:  formData.description || '',
    category:     formData.category,
    badge:        formData.badge || null,
    active:       formData.active !== undefined ? formData.active : true,
    product_type: formData.product_type || 'edit',
    stock:        parseInt(formData.stock) || 1,
    updated_at:   new Date().toISOString(),
  };

  // Upload new images if provided
  if (formData.imageFiles && formData.imageFiles.length > 0) {
    const urls = [];
    for (const file of formData.imageFiles) {
      const url = await uploadProductImage(file);
      urls.push(url);
    }
    // Merge with existing images (don't wipe them on edit)
    if (existingId && formData.keepExisting) {
      payload.images = [...(formData.existingImages || []), ...urls];
    } else {
      payload.images = urls;
    }
  } else if (existingId && formData.existingImages) {
    // No new files uploaded — keep existing images untouched
    payload.images = formData.existingImages;
  }

  if (existingId) {
    const { error } = await sb.from('products').update(payload).eq('id', existingId);
    if (error) throw new Error('Update failed: ' + error.message);
  } else {
    if (!payload.images || !payload.images.length) {
      payload.images = [];
    }
    const { error } = await sb.from('products').insert(payload);
    if (error) throw new Error('Insert failed: ' + error.message);
  }
}

async function adminDeleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return false;
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return false; }
  showToast('Product deleted');
  return true;
}

async function adminUpdateOrderStatus(orderId, status) {
  const { error } = await sb.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
  if (error) { showToast('Update failed: ' + error.message, 'error'); return false; }
  showToast('Order updated → ' + status);
  return true;
}

function orderStatusBadge(status) {
  const colors = {
    pending:    '#C9A87A',
    paid:       '#4CAF50',
    processing: '#2196F3',
    shipped:    '#9C27B0',
    delivered:  '#388E3C',
    cancelled:  '#F44336'
  };
  const c = colors[status] || '#999';
  return `<span style="background:${c};color:white;padding:4px 12px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;">${status}</span>`;
}
