# Design: Supabase Storage Integration for Images

## Goal
Replace Base64 image storage with Supabase Storage and direct database insertions for Shops and Products.

## Proposed Approaches

### Approach 1: Direct Supabase Integration (Recommended)
Refactor `submitShop` and `saveProduct` to perform the following steps:
1. Upload file to Supabase Storage.
2. Retrieve the public URL.
3. Insert the record directly into the corresponding Supabase table (`shops` or `products`).
4. Trigger a UI update.

**Pros:**
- Efficient storage (Cloud vs Base64).
- Supabase as the single source of truth.
- Consistent with modern web development practices.

**Cons:**
- Requires network connectivity for all operations (already true for this app).

### Approach 2: Hybrid Storage (Local State + Supabase)
Continue updating local state and `localStorage` while also uploading to Supabase.

**Pros:**
- Immediate UI feedback (though Base64 is slow).

**Cons:**
- Redundant data storage.
- Complexity in keeping local and remote state in sync.

## Recommended Approach
We will use **Approach 1**. This aligns with the user's instructions to insert records into Supabase tables and get public URLs.

## Implementation Details

### 1. Refactor `submitShop()`
- Change function signature to `async`.
- Upload image to `dorumart-assets` bucket in `shops/` folder.
- Use `Date.now() + '-' + file.name` for uniqueness.
- Get public URL.
- Insert `{ name, image: imageUrl, status: 'pending', owner: state.loggedInVendorEmail }` into `shops` table.
- Call `updateUI()` to refresh the dashboard.

### 2. Refactor `saveProduct()`
- Change function signature to `async`.
- Upload image to `dorumart-assets` bucket in `products/` folder.
- Get public URL.
- Insert `{ name, price, image: imageUrl, shop_id: activeManageId }` into `products` table.
- Re-fetch products for the current shop and call `renderManageProducts()`.

## Validation Plan
- Verify `submitShop` successfully uploads to Supabase and inserts a record.
- Verify `saveProduct` successfully uploads to Supabase and inserts a record.
- Confirm images are displayed correctly via the public URL.
