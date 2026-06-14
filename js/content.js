// ─── CONTENT LOADER ──────────────────────────────────────────
// Loads editable content from Supabase and applies it to the page

async function loadPageContent() {
  try {
    const { data } = await sb.from('content').select('*');
    if (!data || !data.length) return;

    const c = {};
    data.forEach(row => c[row.key] = row.value);

    // ── Announce bar
    const announce = document.querySelector('.announce');
    if (announce && c.announce_text) {
      announce.innerHTML = '✦ &nbsp;' + c.announce_text + ' &nbsp;✦';
    }

    // ── Hero
    const heroEye = document.getElementById('hero-eyebrow');
    const heroHead = document.getElementById('hero-headline');
    const heroSub = document.getElementById('hero-sub');
    const heroBtn1 = document.getElementById('hero-btn1');
    const heroBtn2 = document.getElementById('hero-btn2');
    if (heroEye && c.hero_eyebrow)   heroEye.textContent   = c.hero_eyebrow;
    if (heroHead && c.hero_headline) heroHead.innerHTML    = c.hero_headline;
    if (heroSub && c.hero_sub)       heroSub.textContent   = c.hero_sub;
    if (heroBtn1 && c.hero_btn1)     heroBtn1.textContent  = c.hero_btn1;
    if (heroBtn2 && c.hero_btn2)     heroBtn2.textContent  = c.hero_btn2;

    // ── Story
    const storyH1 = document.getElementById('story-headline1');
    const storyH2 = document.getElementById('story-headline2');
    const storyP1 = document.getElementById('story-p1');
    const storyP2 = document.getElementById('story-p2');
    const storyBtn = document.getElementById('story-btn');
    if (storyH1 && c.story_headline1)  storyH1.textContent  = c.story_headline1;
    if (storyH2 && c.story_headline2)  storyH2.textContent  = c.story_headline2;
    if (storyP1 && c.story_p1)         storyP1.textContent  = c.story_p1;
    if (storyP2 && c.story_p2)         storyP2.textContent  = c.story_p2;
    if (storyBtn && c.story_btn)        storyBtn.textContent = c.story_btn;

    // ── By Request
    const reqTitle = document.getElementById('request-title');
    const reqDesc  = document.getElementById('request-desc');
    const reqWa    = document.querySelectorAll('a[href*="wa.me"]');
    if (reqTitle && c.request_title) reqTitle.textContent = c.request_title;
    if (reqDesc && c.request_desc)   reqDesc.textContent  = c.request_desc;
    if (c.whatsapp_number) {
      reqWa.forEach(a => {
        a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + c.whatsapp_number);
      });
    }

    // ── Newsletter
    const nlHead = document.getElementById('nl-headline');
    const nlSub  = document.getElementById('nl-sub');
    if (nlHead && c.nl_headline) nlHead.textContent = c.nl_headline;
    if (nlSub && c.nl_sub)       nlSub.textContent  = c.nl_sub;

    // ── Shop page
    const shopEye   = document.getElementById('shop-eyebrow');
    const shopTitle = document.getElementById('shop-title');
    if (shopEye && c.shop_eyebrow)   shopEye.textContent   = c.shop_eyebrow;
    if (shopTitle && c.shop_title)   shopTitle.textContent  = c.shop_title;

    // ── Footer - applies to every page
    document.querySelectorAll('.ft-desc').forEach(el => {
      if (c.footer_tagline) el.innerHTML = c.footer_tagline;
    });
    document.querySelectorAll('.ft-copy').forEach(el => {
      if (c.footer_copy) el.textContent = c.footer_copy;
    });
    document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
      if (c.instagram_url) a.href = c.instagram_url;
      if (c.instagram_handle && a.textContent.includes('@')) a.textContent = c.instagram_handle;
    });
    document.querySelectorAll('a[href*="tiktok.com"]').forEach(a => {
      if (c.tiktok_url) a.href = c.tiktok_url;
    });
    document.querySelectorAll('a[href*="mailto:"]').forEach(a => {
      if (c.contact_email) {
        a.href = 'mailto:' + c.contact_email;
        if (a.textContent.includes('@')) a.textContent = c.contact_email;
      }
    });

  } catch(e) {
    // Fail silently - defaults stay in place
    console.log('Content load skipped:', e.message);
  }
}

// Auto-run on every page
document.addEventListener('DOMContentLoaded', loadPageContent);
