// ─── MAYREE CONFIG ───────────────────────────────────────────

const SUPABASE_URL = 'https://tguxvixozyowqzplfone.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndXh2aXhvenlvd3F6cGxmb25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDQzOTIsImV4cCI6MjA5Njk4MDM5Mn0.35i3HufOt5bWmTJ6JwmI1rAcygcW0WVNNT4CUTkk5yA';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_s1kwJPMyv-tzSOhQj8_-sQ_ZmnOYSa3';
const PAYSTACK_PUBLIC_KEY = 'pk_test_YOUR_PAYSTACK_KEY';
const ADMIN_EMAIL = 'admin@mayree.co'; // replace with your actual email

// ─── Supabase client ─────────────────────────────────────────
const { createClient } = supabase;
// Use publishable key (new format) with fallback to anon key
const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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
