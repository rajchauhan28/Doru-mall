# Supabase Storage Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Base64 image storage with Supabase Storage for shops and products.

**Architecture:** Upload images to Supabase Storage buckets, retrieve public URLs, and store these URLs in the Supabase database.

**Tech Stack:** JavaScript, Supabase Client (Storage and DB).

---

### Task 1: Refactor `submitShop` to use Supabase Storage

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update `submitShop` to be async and implement storage upload**

Replace the `toBase64` logic with Supabase Storage upload and direct DB insertion.

```javascript
async function submitShop() {
  const name = newShopName.value;
  const file = newShopImage.files[0];
  if (!name || !file) return alert('Fill all fields');
  
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('dorumart-assets')
      .upload(`shops/${fileName}`, file);
    
    if (uploadError) throw uploadError;

    const imageUrl = supabaseClient.storage
      .from('dorumart-assets')
      .getPublicUrl(`shops/${fileName}`).data.publicUrl;

    const { error: insertError } = await supabaseClient
      .from('shops')
      .insert([{
        name,
        image: imageUrl,
        status: 'pending',
        owner: state.loggedInVendorEmail
      }]);

    if (insertError) throw insertError;

    newShopName.value = '';
    newShopImage.value = '';
    closeModal();
    alert('Shop sent for admin approval!');
    updateUI(); // Refresh UI to reflect changes
  } catch (error) {
    console.error('Error submitting shop:', error);
    alert('Error submitting shop: ' + error.message);
  }
}
```

- [ ] **Step 2: Commit Task 1**

```bash
git add index.html
git commit -m "feat: refactor submitShop to use Supabase Storage"
```

### Task 2: Refactor `saveProduct` to use Supabase Storage

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update `saveProduct` to be async and implement storage upload**

Replace the `toBase64` logic with Supabase Storage upload and direct DB insertion.

```javascript
async function saveProduct() {
  const name = pName.value;
  const price = pPrice.value;
  const file = pImage.files[0];
  if (!name || !price || !file) return alert('Fill all fields');
  
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('dorumart-assets')
      .upload(`products/${fileName}`, file);
    
    if (uploadError) throw uploadError;

    const imageUrl = supabaseClient.storage
      .from('dorumart-assets')
      .getPublicUrl(`products/${fileName}`).data.publicUrl;

    const { error: insertError } = await supabaseClient
      .from('products')
      .insert([{
        name,
        price: parseFloat(price),
        image: imageUrl,
        shop_id: activeManageId
      }]);

    if (insertError) throw insertError;

    pName.value = ''; 
    pPrice.value = ''; 
    pImage.value = '';
    
    // Refresh products in state and UI
    const { data: products, error: fetchError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('shop_id', activeManageId);
    
    if (!fetchError) {
      state.products[activeManageId] = products;
      renderManageProducts();
    }
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Error saving product: ' + error.message);
  }
}
```

- [ ] **Step 2: Commit Task 2**

```bash
git add index.html
git commit -m "feat: refactor saveProduct to use Supabase Storage"
```

### Task 3: Final Verification and Cleanup

- [ ] **Step 1: Verify `updateUI` handles pending shops if necessary**

Review `updateUI` to ensure the vendor can still see their pending shops.

- [ ] **Step 2: Final Commit**

```bash
git add index.html
git commit -m "feat: add Supabase Cloud Storage for images"
```
