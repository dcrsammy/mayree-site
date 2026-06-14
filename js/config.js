// ─── MAYREE CONFIG ───────────────────────────────────────────
// Replace these with your real values before going live

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const PAYSTACK_PUBLIC_KEY = 'pk_test_YOUR_PAYSTACK_KEY';
const ADMIN_EMAIL = 'admin@mayree.co'; // only this email gets admin access

// ─── Supabase client ─────────────────────────────────────────
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Helpers ─────────────────────────────────────────────────
function fmt(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

function setLoading(el, state, text = '') {
  if (!el) return;
  el.disabled = state;
  if (text) el.textContent = text;
}
