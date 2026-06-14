# MAYREE — Setup Guide

Everything is built. Follow these steps to go live.

---

## Step 1 — Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Name it `mayree` — choose a region close to Nigeria (e.g. EU West or US East)
3. Copy your **Project URL** and **Anon Key** from:
   Settings → API → Project URL & anon public key

---

## Step 2 — Run the Database Schema

1. In Supabase dashboard: SQL Editor → New Query
2. Open `supabase-schema.sql` from this folder
3. Paste the entire contents and click **Run**
4. You should see success messages — no errors

---

## Step 3 — Create the Storage Bucket

The SQL schema creates the bucket automatically. If it fails:
1. Go to Storage in Supabase
2. Create bucket named exactly: `mayree-images`
3. Set it to **Public**

---

## Step 4 — Enable Google Login (Optional)

1. Supabase → Authentication → Providers → Google
2. Follow the guide to get a Google OAuth Client ID
3. Add `https://your-domain.netlify.app` to allowed redirect URLs

---

## Step 5 — Get Your Paystack Keys

1. Log in to https://dashboard.paystack.com
2. Settings → API Keys & Webhooks
3. Copy your **Public Key** (starts with `pk_live_` or `pk_test_`)

---

## Step 6 — Update config.js

Open `js/config.js` and replace all placeholders:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const PAYSTACK_PUBLIC_KEY = 'pk_live_YOUR_KEY';
const ADMIN_EMAIL = 'your@email.com'; // your actual email
```

Also update the WhatsApp number in `index.html` — search for `2348000000000` and replace with your number.

---

## Step 7 — Deploy to Netlify

1. Go to https://netlify.com
2. Sites → Add new site → Deploy manually
3. Drag and drop the entire `mayree_site` folder
4. Netlify gives you a URL immediately

To connect a custom domain (e.g. mayree.co):
- Domain settings → Add custom domain
- Add CNAME record at your domain registrar

---

## Step 8 — Add Your Products

1. Visit `your-site.com/admin`
2. Log in with the email you set as `ADMIN_EMAIL`
3. Go to Products → Add New Product
4. Upload your bag photos, set price and category
5. Hit Save — it appears on the shop instantly

---

## File Structure

```
mayree_site/
├── index.html          Homepage
├── shop.html           All products + filters
├── product.html        Single product page
├── cart.html           Cart
├── checkout.html       Checkout + Paystack
├── confirmation.html   Order confirmed
├── wishlist.html       Wishlist
├── login.html          Login / Register
├── account.html        My Account + Orders
├── track.html          Track Order
├── admin/
│   ├── index.html      Dashboard (stats + recent orders)
│   ├── products.html   Add/edit/delete products
│   ├── orders.html     Manage orders + update status
│   └── customers.html  Customer list
├── css/
│   └── mayree.css      All styles
├── js/
│   ├── config.js       Keys + helpers
│   ├── auth.js         Login/logout/session
│   ├── cart.js         Cart + wishlist
│   ├── shop.js         Product fetching + rendering
│   └── admin.js        Admin CRUD
├── assets/
│   └── logo.png        Mayree logo
├── supabase-schema.sql DB schema (run once)
└── netlify.toml        Netlify routing config
```

---

## WhatsApp Numbers to Update

Search the project for `2348000000000` and replace with your actual WhatsApp business number (with country code, no +).

---

## Admin Access

Only the email set in `ADMIN_EMAIL` inside `js/config.js` can access `/admin`. 
Log in with that email at `/login.html` first, then go to `/admin`.

---

Built by Akoms / DCR Agency
