// ─── AUTH ────────────────────────────────────────────────────

// Wait for Supabase to restore session from storage (no guessing with timeouts)
function waitForSession() {
  return new Promise((resolve) => {
    // First check if session already exists
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        resolve(data.session);
        return;
      }
      // If not, listen for the auth state change event
      const { data: listener } = sb.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          listener.subscription.unsubscribe();
          resolve(session);
        }
        if (event === 'SIGNED_OUT') {
          listener.subscription.unsubscribe();
          resolve(null);
        }
      });
      // Fallback: resolve after 2s no matter what
      setTimeout(() => {
        listener.subscription.unsubscribe();
        resolve(null);
      }, 2000);
    });
  });
}

async function getSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function getUser() {
  const session = await getSession();
  return session ? session.user : null;
}

async function requireAuth() {
  const session = await waitForSession();
  if (!session) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    return null;
  }
  return session.user;
}

async function requireAdmin() {
  const session = await waitForSession();

  if (!session) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    return null;
  }

  if (session.user.email !== ADMIN_EMAIL) {
    window.location.href = '/index.html';
    return null;
  }

  return session.user;
}

async function logout() {
  await sb.auth.signOut();
  window.location.href = '/index.html';
}

async function updateNavAuth() {
  const session = await getSession();
  const user = session ? session.user : null;
  const loginLink   = document.getElementById('nav-login');
  const accountLink = document.getElementById('nav-account');
  const logoutBtn   = document.getElementById('nav-logout');

  if (user) {
    if (loginLink)   loginLink.style.display   = 'none';
    if (accountLink) accountLink.style.display  = 'block';
    if (logoutBtn)   logoutBtn.style.display    = 'block';
  } else {
    if (loginLink)   loginLink.style.display   = 'block';
    if (accountLink) accountLink.style.display  = 'none';
    if (logoutBtn)   logoutBtn.style.display    = 'none';
  }
}

async function getOrCreateProfile(user) {
  const { data } = await sb
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!data) {
    await sb.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: '',
      phone: '',
      address: ''
    });
  }
  return data;
}
