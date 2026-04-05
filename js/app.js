// --- State Management ---
let state = {
  user: JSON.parse(localStorage.getItem('doru_user') || '{"name":"","address":"","phone":""}'),
  shops: [],
  products: {},
  cart: JSON.parse(localStorage.getItem('doru_cart') || '[]'),
  orders: [],
  vendorAccounts: JSON.parse(localStorage.getItem('doru_vendor_accounts') || '[]'),
  currentView: 'home',
  activeShop: null,
  isVendor: false,
  loggedInVendorEmail: null
};

const saveState = () => {
  localStorage.setItem('doru_user', JSON.stringify(state.user));
  localStorage.setItem('doru_cart', JSON.stringify(state.cart));
  localStorage.setItem('doru_vendor_accounts', JSON.stringify(state.vendorAccounts));
  updateUI();
};

// --- View Router ---
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId + 'View').classList.add('active');
  state.currentView = viewId;
  window.scrollTo(0,0);
  updateUI();
}

// --- Modals ---
function openModal(modalId) {
  document.getElementById('modalOverlay').style.display = 'flex';
  document.querySelectorAll('.modal-box').forEach(m => m.classList.add('hidden'));
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

// --- UI Rendering ---
async function updateUI() {
  let query = window.supabaseClient.from('shops').select('*');
  
  if (state.loggedInVendorEmail) {
    query = query.or(`status.eq.approved,owner.eq.${state.loggedInVendorEmail}`);
  } else {
    query = query.eq('status', 'approved');
  }

  const { data: shops, error } = await query;
  if (!error) state.shops = shops;

  renderShops();
  renderCart();
  await renderOrders();
  renderVendorDash();
  
  // Update header badge
  document.getElementById('cartCount').innerText = state.cart.reduce((a, b) => a + b.qty, 0);
  
  // Fill settings
  document.getElementById('userName').value = state.user.name;
  document.getElementById('userAddress').value = state.user.address;
  document.getElementById('userPhone').value = state.user.phone;
}

function renderShops() {
  const grid = document.getElementById('shopGrid');
  const approved = state.shops.filter(s => s.status === 'approved');
  grid.innerHTML = approved.map(s => `
    <div class="card" onclick="openShop('${s.id}')">
      <img src="${s.image_url || s.image}">
      <div class="card-body">
        <div class="card-title">${escape(s.name)}</div>
        <div class="card-meta">
          <span style="font-size:14px; color:#666">Verified Vendor</span>
          <span style="color:var(--primary)">★ 4.8</span>
        </div>
      </div>
    </div>
  `).join('') || '<p>No shops found.</p>';
}

async function openShop(id) {
  const shop = state.shops.find(s => s.id === id);
  state.activeShop = shop;
  showView('shopDetail');
  
  document.getElementById('shopHeader').innerHTML = `
    <div style="display:flex; gap:20px; align-items:center">
      <img src="${shop.image_url || shop.image}" style="width:100px; height:100px; border-radius:50%; object-fit:cover">
      <div>
        <h1>${escape(shop.name)}</h1>
        <p>Verified Partner • Fast Delivery</p>
      </div>
    </div>
  `;
  
  const { data: products, error } = await window.supabaseClient
    .from('products')
    .select('*')
    .eq('shop_id', id);
  if (!error) state.products[id] = products;
  
  document.getElementById('productGrid').innerHTML = shopProducts.map((p, idx) => `
    <div class="card">
      <img src="${p.image_url || p.image}">
      <div class="card-body">
        <div class="card-title">${escape(p.name)}</div>
        <div class="card-meta">
          <span class="price">₹${p.price}</span>
          <button class="btn btn-primary" style="padding:8px 12px" onclick="addToCart('${id}', ${idx})">Add</button>
        </div>
      </div>
    </div>
  `).join('') || '<p>No products available yet.</p>';
}

// --- Cart Logic ---
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
}

function addToCart(shopId, pIdx) {
  const shop = state.shops.find(s => s.id === shopId);
  const product = state.products[shopId][pIdx];
  const existing = state.cart.find(item => item.shopId === shopId && item.name === product.name);
  
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...product, shopId, shopName: shop.name, qty: 1 });
  }
  saveState();
  if (!document.getElementById('cartSidebar').classList.contains('open')) toggleCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  let total = 0;
  
  container.innerHTML = state.cart.map((item, i) => {
    total += item.price * item.qty;
    return `
      <div class="cart-item">
        <img src="${item.image_url || item.image}">
        <div style="flex:1">
          <div style="font-weight:600; font-size:14px">${escape(item.name)}</div>
          <div style="font-size:12px; color:#666">${escape(item.shopName)}</div>
          <div style="display:flex; align-items:center; gap:10px; margin-top:5px">
            <button class="btn btn-light" style="padding:2px 8px" onclick="updateQty(${i}, -1)">-</button>
            <span>${item.qty}</span>
            <button class="btn btn-light" style="padding:2px 8px" onclick="updateQty(${i}, 1)">+</button>
          </div>
        </div>
        <div style="font-weight:700">₹${item.price * item.qty}</div>
      </div>
    `;
  }).join('');
  
  document.getElementById('cartTotal').innerText = `₹${total}`;
}

function updateQty(idx, delta) {
  state.cart[idx].qty += delta;
  if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
  saveState();
}

function checkout() {
  if (state.cart.length === 0) return alert('Cart is empty');
  
  // Pre-fill with current user details
  document.getElementById('checkName').value = state.user.name || '';
  document.getElementById('checkPhone').value = state.user.phone || '';
  document.getElementById('checkAddress').value = state.user.address || '';
  
  const total = state.cart.reduce((a, b) => a + (b.price * b.qty), 0);
  document.getElementById('checkTotal').innerText = `₹${total}`;
  
  openModal('checkoutModal');
}

async function completeOrder() {
  const name = document.getElementById('checkName').value.trim();
  const phone = document.getElementById('checkPhone').value.trim();
  const address = document.getElementById('checkAddress').value.trim();
  
  if (!name || !phone || !address) return alert('Please fill all delivery details');
  
  // Update user profile with these details
  state.user = { name, phone, address };
  
  const order = {
    id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    date: new Date().toLocaleDateString(),
    items: [...state.cart],
    total: state.cart.reduce((a, b) => a + (b.price * b.qty), 0),
    status: 'Delivering',
    customer: { name, phone, address }
  };
  
  const { error } = await window.supabaseClient.from('orders').insert([order]);
  if (error) return alert('Error saving order: ' + error.message);

  state.cart = [];
  saveState();
  closeModal();
  if (document.getElementById('cartSidebar').classList.contains('open')) toggleCart();
  showView('orders');
  alert(`Order ${order.id} placed successfully! 🚀`);
}

// --- Vendor Logic ---
function openVendorPortal() {
  if (state.isVendor) showView('vendor');
  else openModal('vendorLoginModal');
}

function authVendor() {
  const email = vEmail.value;
  const pass = vPass.value;
  
  const account = state.vendorAccounts.find(v => v.email === email && v.pass === pass);
  
  if (account) {
    state.isVendor = true;
    state.loggedInVendorEmail = email;
    closeModal();
    showView('vendor');
  } else {
    alert('Invalid credentials. Ask the admin to create a vendor account for you.');
  }
}

async function toBase64(file) {
  return new Promise((r, j) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => r(reader.result);
    reader.onerror = j;
  });
}

async function submitShop() {
  const name = newShopName.value;
  const file = newShopImage.files[0];
  if (!name || !file) return alert('Fill all fields');
  
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
      .from('dorumart-assets')
      .upload(`shops/${fileName}`, file);
    
    if (uploadError) throw uploadError;

    const imageUrl = window.supabaseClient.storage
      .from('dorumart-assets')
      .getPublicUrl(`shops/${fileName}`).data.publicUrl;

    const { error: insertError } = await window.supabaseClient
      .from('shops')
      .insert([{
        name,
        image_url: imageUrl,
        status: 'pending',
        owner: state.loggedInVendorEmail
      }]);

    if (insertError) throw insertError;

    newShopName.value = '';
    newShopImage.value = '';
    closeModal();
    alert('Shop sent for admin approval!');
    updateUI(); 
  } catch (error) {
    console.error('Error submitting shop:', error);
    alert('Error submitting shop: ' + error.message);
  }
}

function renderVendorDash() {
  const grid = document.getElementById('vendorShops');
  const myShops = state.shops.filter(s => s.owner === state.loggedInVendorEmail);
  grid.innerHTML = myShops.map(s => `
    <div class="card" style="cursor:default">
      <img src="${s.image_url || s.image}">
      <div class="card-body">
        <div style="display:flex; justify-content:space-between">
          <div class="card-title">${escape(s.name)}</div>
          <span style="font-size:12px; font-weight:700; color:${s.status === 'approved' ? 'var(--primary)' : '#f59e0b'}">${s.status.toUpperCase()}</span>
        </div>
        ${s.status === 'approved' ? `<button class="btn btn-primary" style="width:100%; margin-top:10px" onclick="openProductManager('${s.id}')">Manage Products</button>` : ''}
      </div>
    </div>
  `).join('') || '<p>You haven\'t added any shops yet.</p>';
}

function switchVendorTab(tab) {
  const shopsSection = document.getElementById('vendorShopsSection');
  const ordersSection = document.getElementById('vendorOrdersSection');
  if (tab === 'shops') {
    shopsSection.classList.remove('hidden');
    ordersSection.classList.add('hidden');
    renderVendorDash();
  } else {
    ordersSection.classList.remove('hidden');
    shopsSection.classList.add('hidden');
    renderVendorOrders();
  }
}

function renderVendorOrders() {
  const container = document.getElementById('vendorReceivedOrders');
  const myShopIds = state.shops.filter(s => s.owner === state.loggedInVendorEmail).map(s => s.id);
  
  const myOrders = state.orders.filter(order => 
    order.items.some(item => myShopIds.includes(item.shopId))
  );

  container.innerHTML = myOrders.map(o => `
    <div class="card" style="cursor:default; border:1px solid #eee">
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px">
          <span style="font-weight:700">${o.id}</span>
          <select class="btn btn-light" style="padding:4px; font-size:12px" onchange="updateOrderStatus('${o.id}', this.value)">
            <option value="Delivering" ${o.status === 'Delivering' ? 'selected' : ''}>Delivering</option>
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
        <div style="font-size:12px; color:#666">${o.date}</div>
        <div style="margin:10px 0; padding:10px; background:#f9fafb; border-radius:8px">
          ${o.items.filter(item => myShopIds.includes(item.shopId)).map(item => `
            <div style="font-size:14px"><b>${item.qty}x</b> ${escape(item.name)} (₹${item.price * item.qty})</div>
          `).join('')}
        </div>
        <div style="font-size:12px; color:#666">
          👤 ${escape(o.customer.name)} (${escape(o.customer.phone)})<br>
          📍 ${escape(o.customer.address)}
        </div>
      </div>
    </div>
  `).join('') || '<p>No orders received yet.</p>';
}

function updateOrderStatus(orderId, newStatus) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveState();
    renderVendorOrders();
  }
}

// --- Admin Logic ---
function authAdmin() {
  if (aEmail.value === 'admin@dorumart.com' && aPass.value === 'admin123') {
    openModal('adminDash');
    switchAdminTab('shops');
  } else alert('Access Denied');
}

function switchAdminTab(tab) {
  const shopTab = document.getElementById('tabShops');
  const vendorTab = document.getElementById('tabVendors');
  const shopSection = document.getElementById('adminShopsSection');
  const vendorSection = document.getElementById('adminVendorsSection');

  if (tab === 'shops') {
    shopTab.style.color = 'var(--primary)';
    vendorTab.style.color = '#666';
    shopSection.classList.remove('hidden');
    vendorSection.classList.add('hidden');
    renderPending();
  } else {
    vendorTab.style.color = 'var(--primary)';
    shopTab.style.color = '#666';
    vendorSection.classList.remove('hidden');
    shopSection.classList.add('hidden');
    renderVendors();
  }
}

function createVendor() {
  const email = newVEmail.value.trim();
  const pass = newVPass.value.trim();
  if (!email || !pass) return alert('Enter email and password');
  
  if (state.vendorAccounts.some(v => v.email === email)) {
    return alert('This vendor email already exists');
  }
  
  state.vendorAccounts.push({ email, pass });
  saveState();
  newVEmail.value = '';
  newVPass.value = '';
  renderVendors();
  alert('Vendor account created!');
}

function renderVendors() {
  const list = document.getElementById('vendorList');
  list.innerHTML = state.vendorAccounts.map(v => `
    <div style="padding:12px; background:#f3f4f6; border-radius:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center">
      <div>
        <b>${escape(v.email)}</b><br>
        <span style="font-size:12px; color:#666">Password: ${escape(v.pass)}</span>
      </div>
      <button class="btn btn-light" style="padding:4px 10px; color:red" onclick="deleteVendor('${v.email}')">Remove</button>
    </div>
  `).join('') || 'No vendors created yet.';
}

function deleteVendor(email) {
  if (email === 'vendor@dorumart.com') return alert('Cannot remove default vendor');
  state.vendorAccounts = state.vendorAccounts.filter(v => v.email !== email);
  saveState();
  renderVendors();
}

function renderPending() {
  const box = document.getElementById('pendingShops');
  const pending = state.shops.filter(s => s.status === 'pending');
  box.innerHTML = pending.map(s => `
    <div style="display:flex; align-items:center; gap:15px; background:#f3f4f6; padding:10px; border-radius:12px; margin-bottom:10px">
      <img src="${s.image_url || s.image}" style="width:50px; height:50px; border-radius:8px">
      <div style="flex:1">
        <b>${escape(s.name)}</b><br>
        <span style="font-size:11px; color:#666">Owner: ${escape(s.owner || 'Unknown')}</span>
      </div>
      <button class="btn btn-primary" style="padding:5px 15px" onclick="approveShop('${s.id}')">Approve</button>
    </div>
  `).join('') || 'No pending approvals';
}

function approveShop(id) {
  const shop = state.shops.find(s => s.id === id);
  shop.status = 'approved';
  saveState();
  renderPending();
}

// --- Product Manager Upgrade ---
let activeManageId = null;
let editingProductIdx = null;

function openProductManager(id) {
  activeManageId = id;
  const shop = state.shops.find(s => s.id === id);
  document.getElementById('manageShopTitle').innerText = 'Manage ' + shop.name;
  openModal('manageProductsModal');
  renderManageProducts();
}

async function saveProduct() {
  const name = pName.value;
  const price = pPrice.value;
  const file = pImage.files[0];
  if (!name || !price || !file) return alert('Fill all fields');
  
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
      .from('dorumart-assets')
      .upload(`products/${fileName}`, file);
    
    if (uploadError) throw uploadError;

    const imageUrl = window.supabaseClient.storage
      .from('dorumart-assets')
      .getPublicUrl(`products/${fileName}`).data.publicUrl;

    const { error: insertError } = await window.supabaseClient
      .from('products')
      .insert([{
        name,
        price: parseFloat(price),
        image_url: imageUrl,
        shop_id: activeManageId
      }]);

    if (insertError) throw insertError;

    pName.value = ''; 
    pPrice.value = ''; 
    pImage.value = '';
    
    // Refresh products in state and UI
    const { data: products, error: fetchError } = await window.supabaseClient
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

function renderManageProducts() {
  const list = document.getElementById('manageProductList');
  const items = state.products[activeManageId] || [];
  list.innerHTML = items.map((p, i) => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-top:1px solid #eee">
      <div style="display:flex; align-items:center; gap:10px">
        <img src="${p.image_url || p.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover">
        <div>${escape(p.name)} - <b>₹${p.price}</b></div>
      </div>
      <div style="display:flex; gap:5px">
        <button class="btn btn-light" style="padding:4px 8px" onclick="openEditProduct(${i})">Edit</button>
        <button class="btn btn-light" style="padding:4px 8px; color:red" onclick="deleteProduct(${i})">Delete</button>
      </div>
    </div>
  `).join('');
}

function openEditProduct(idx) {
  editingProductIdx = idx;
  const product = state.products[activeManageId][idx];
  document.getElementById('editPName').value = product.name;
  document.getElementById('editPPrice').value = product.price;
  openModal('editProductModal');
}

async function updateProduct() {
  const name = document.getElementById('editPName').value;
  const price = document.getElementById('editPPrice').value;
  const fileInput = document.getElementById('editPImage');
  
  if (!name || !price) return alert('Fill all fields');
  
  const product = state.products[activeManageId][editingProductIdx];
  product.name = name;
  product.price = price;
  
  if (fileInput.files[0]) {
    product.image = await toBase64(fileInput.files[0]);
  }
  
  saveState();
  fileInput.value = '';
  openModal('manageProductsModal');
  renderManageProducts();
}

function deleteProduct(i) {
  state.products[activeManageId].splice(i, 1);
  saveState();
  renderManageProducts();
}

// --- Orders Rendering ---
async function renderOrders() {
  const { data: orders, error } = await window.supabaseClient
    .from('orders')
    .select('*')
    .eq('customer->phone', state.user.phone)
    .order('date', { ascending: false });

  if (!error) state.orders = orders || [];

  const container = document.getElementById('ordersList');
  if (!container) return;
  
  container.innerHTML = state.orders.map(o => `
    <div class="card" style="cursor:default">
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px">
          <span style="font-weight:700">${o.id}</span>
          <span class="badge" style="background:#e0f2fe; color:#0369a1">${o.status}</span>
        </div>
        <div style="font-size:12px; color:#666">${o.date}</div>
        <div style="margin:10px 0; font-size:14px; border-bottom:1px solid #eee; padding-bottom:8px">
          ${o.items.map(item => `<b>${item.qty}x</b> ${escape(item.name)}`).join(', ')}
        </div>
        ${o.customer ? `
          <div style="font-size:12px; color:#666; margin-top:8px">
            📍 <b>Deliver to:</b> ${escape(o.customer.name)}<br>
            ${escape(o.customer.address)}
          </div>
        ` : ''}
        <div class="price" style="margin-top:10px">Total: ₹${o.total}</div>
      </div>
    </div>
  `).join('') || '<p>You haven\'t placed any orders yet.</p>';
}

// --- Search Filter ---
function filterShops(q) {
  const grid = document.getElementById('shopGrid');
  const filtered = state.shops.filter(s => s.status === 'approved' && s.name.toLowerCase().includes(q.toLowerCase()));
  grid.innerHTML = filtered.map(s => `
    <div class="card" onclick="openShop('${s.id}')">
      <img src="${s.image_url || s.image}">
      <div class="card-body">
        <div class="card-title">${escape(s.name)}</div>
        <div class="card-meta">
          <span style="font-size:14px; color:#666">Verified Vendor</span>
          <span style="color:var(--primary)">★ 4.8</span>
        </div>
      </div>
    </div>
  `).join('') || '<p>No matching shops.</p>';
}

// --- Settings ---
function saveSettings() {
  state.user = {
    name: document.getElementById('userName').value,
    address: document.getElementById('userAddress').value,
    phone: document.getElementById('userPhone').value
  };
  saveState();
  alert('Profile updated!');
}

function escape(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function migrateToSupabase() {
  // Migrate Shops
  const localShops = JSON.parse(localStorage.getItem('doru_shops') || '[]');
  if (localShops.length > 0) {
    const formattedShops = localShops.map(s => ({
      ...s,
      image_url: s.image_url || s.image
    }));
    const { data, error } = await window.supabaseClient.from('shops').upsert(formattedShops);
    if (!error) {
      console.log('Shops migrated to Supabase!');
      localStorage.removeItem('doru_shops');
    }
    else console.error('Error migrating shops:', error);
  }
  // Migrate Products
  const localProductsMap = JSON.parse(localStorage.getItem('doru_products') || '{}');
  for (const shopId in localProductsMap) {
    const products = localProductsMap[shopId].map(p => ({ 
      ...p, 
      shop_id: shopId,
      image_url: p.image_url || p.image
    }));
    if (products.length > 0) {
      const { error } = await window.supabaseClient.from('products').upsert(products);
      if (!error) {
        console.log(`Products for shop ${shopId} migrated!`);
      }
    }
  }
  localStorage.removeItem('doru_products');
}

// Init
async function init() {
  const localShops = JSON.parse(localStorage.getItem('doru_shops') || '[]');
  const localProducts = JSON.parse(localStorage.getItem('doru_products') || '{}');
  
  if (localShops.length > 0 || Object.keys(localProducts).length > 0) {
    await migrateToSupabase();
  }
  
  await updateUI();
}

init();
