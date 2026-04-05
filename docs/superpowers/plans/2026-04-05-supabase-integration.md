# Supabase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transition DoruMart from browser `localStorage` to a persistent Supabase cloud database.

**Architecture:** We will replace the current synchronous `localStorage` logic with asynchronous Supabase calls using the JavaScript SDK. Data will be stored in PostgreSQL tables, and images will be uploaded to Supabase Storage buckets instead of being stored as Base64 strings.

**Tech Stack:** HTML/JS, Supabase (PostgreSQL + Storage), GitHub CLI.

---

### Task 1: Initialize Supabase Client

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Inject Supabase SDK via CDN**
Add the script tag to the `<head>` section of `index.html`.

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

- [ ] **Step 2: Initialize Supabase Client**
Replace the top of the `<script>` section with the initialization logic.

```javascript
// --- Supabase Config (Placeholders) ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- [ ] **Step 3: Verify Initialization**
Open the file in a browser (or mock environment) and check if `supabase` is defined.

### Task 2: Data Migration Helper

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Create Migration Function**
Add a one-time migration function to move `localStorage` data to Supabase tables.

```javascript
async function migrateToSupabase() {
  const localShops = JSON.parse(localStorage.getItem('doru_shops') || '[]');
  if (localShops.length > 0) {
    const { data, error } = await supabase.from('shops').upsert(localShops);
    if (!error) console.log('Shops migrated!');
  }
}
```

- [ ] **Step 2: Run Migration**
Call `migrateToSupabase()` in the initialization phase and verify data in the Supabase dashboard.

### Task 3: Refactor State Management

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update `updateUI` to Fetch Data**
Change `updateUI` to be `async` and fetch shops from Supabase instead of local state.

```javascript
async function updateUI() {
  const { data: shops, error } = await supabase.from('shops').select('*').eq('status', 'approved');
  state.shops = shops || [];
  renderShops();
  // ... rest of UI updates
}
```

- [ ] **Step 2: Update `openShop` to Fetch Products**
Fetch products for the active shop from the Supabase `products` table.

```javascript
async function openShop(id) {
  const { data: products } = await supabase.from('products').select('*').eq('shop_id', id);
  state.products[id] = products || [];
  // ... render logic
}
```

### Task 4: Cloud Storage for Images

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update `submitShop` for Image Upload**
Replace Base64 logic with Supabase Storage upload in `submitShop()`.

```javascript
async function submitShop() {
  const file = newShopImage.files[0];
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('dorumart-assets').upload(`shops/${fileName}`, file);
  const imageUrl = supabase.storage.from('dorumart-assets').getPublicUrl(`shops/${fileName}`).data.publicUrl;
  
  await supabase.from('shops').insert({ name: newShopName.value, image_url: imageUrl, status: 'pending' });
}
```

- [ ] **Step 2: Update `saveProduct` for Image Upload**
Repeat the upload logic for product images in `saveProduct()`.

### Task 5: Persistent Orders

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update `completeOrder`**
Insert the final order into the Supabase `orders` table.

```javascript
async function completeOrder() {
  const order = { /* ... order details ... */ };
  const { error } = await supabase.from('orders').insert(order);
  if (!error) alert('Order saved to cloud!');
}
```

### Task 6: GitHub Integration

**Files:**
- Create: `.gitignore`
- Run: Shell Commands

- [ ] **Step 1: Initialize Git and Add Remote**
```bash
git init
git remote add origin https://github.com/rajchauhan28/Doru-mall
```

- [ ] **Step 2: Create .gitignore**
Add `node_modules`, `.env`, and other sensitive files.

- [ ] **Step 3: Final Push**
```bash
git add .
git commit -m "feat: integrate Supabase for cloud persistence"
git push -u origin main
```
