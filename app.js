/* ─────────────────────────────────────────────────────────────────
   Online Book Store — Frontend Application
   Communicates ONLY through API Gateway at localhost:5000
   ─────────────────────────────────────────────────────────────────*/

const API = 'http://localhost:5000';

// ── STATE ─────────────────────────────────────────────────────────
let currentPage = 'home';
let searchTimer = null;
let currentBookId = null;

// ── AUTH HELPERS ──────────────────────────────────────────────────
const getToken  = () => localStorage.getItem('bs_token');
const getUser   = () => { try { return JSON.parse(localStorage.getItem('bs_user')); } catch { return null; } };
const isLoggedIn = () => !!getToken();

function saveAuth(token, user) {
  localStorage.setItem('bs_token', token);
  localStorage.setItem('bs_user', JSON.stringify(user));
  updateNavForAuth();
}

function logout() {
  localStorage.removeItem('bs_token');
  localStorage.removeItem('bs_user');
  updateNavForAuth();
  navigate('home');
  showToast('Logged out successfully', 'info');
}

function updateNavForAuth() {
  const user = getUser();
  const loggedIn = isLoggedIn();

  document.getElementById('navAuth').classList.toggle('hidden', loggedIn);
  document.getElementById('navUser').classList.toggle('hidden', !loggedIn);
  document.getElementById('navOrders').classList.toggle('hidden', !loggedIn);
  document.getElementById('navAddBook').classList.toggle('hidden', !(loggedIn && user?.role === 'admin'));

  if (user) {
    document.getElementById('navUserName').textContent = `👋 ${user.name.split(' ')[0]}`;
  }
}

// ── ROUTER ────────────────────────────────────────────────────────
function navigate(page, param = null) {
  // Guard auth pages
  if (['orders', 'add-book'].includes(page) && !isLoggedIn()) {
    showToast('Please login to continue', 'error');
    navigate('login');
    return;
  }
  if (['login', 'register'].includes(page) && isLoggedIn()) {
    navigate('home');
    return;
  }

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target
  const id = page === 'book-details' ? 'page-book-details' : `page-${page}`;
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  currentPage = page;

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');

  // Update hash
  const hash = param ? `#${page}/${param}` : `#${page}`;
  if (window.location.hash !== hash) history.pushState({}, '', hash);

  // Page-specific init
  if (page === 'home') loadFeaturedBooks();
  if (page === 'books') loadBooks();
  if (page === 'book-details' && param) { currentBookId = param; loadBookDetails(param); }
  if (page === 'orders') loadOrders();
  if (page === 'add-book') resetAddBookForm();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle browser back/forward
window.addEventListener('popstate', handleHash);
window.addEventListener('DOMContentLoaded', () => {
  updateNavForAuth();
  handleHash();
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  });
});

function handleHash() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const [page, param] = hash.split('/');
  navigate(page, param || null);
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ── API HELPER ────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (getToken()) headers['Authorization'] = `Bearer ${getToken()}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), 3500);
}

// ── HOME PAGE ─────────────────────────────────────────────────────
async function loadFeaturedBooks() {
  const grid = document.getElementById('featuredBooks');
  grid.innerHTML = '<div class="skeleton-card"></div>'.repeat(4);
  try {
    const books = await apiFetch('/api/books?sort=rating');
    const featured = books.slice(0, 4);
    if (featured.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);padding:1rem;">No books yet. <a href="#add-book" style="color:var(--primary)">Add some!</a></p>';
      return;
    }
    grid.innerHTML = featured.map(renderBookCard).join('');
    document.getElementById('statBooks').textContent = `${books.length}+`;
  } catch (e) {
    grid.innerHTML = `<p style="color:var(--danger);padding:1rem;">⚠️ Could not load books. Make sure all services are running.</p>`;
  }
}

// ── BOOKS PAGE ────────────────────────────────────────────────────
async function loadBooks() {
  const grid = document.getElementById('booksGrid');
  const empty = document.getElementById('booksEmpty');
  grid.innerHTML = '<div class="skeleton-card"></div>'.repeat(6);
  empty.classList.add('hidden');

  const search = document.getElementById('searchInput')?.value || '';
  const category = document.getElementById('categoryFilter')?.value || 'All';
  const sort = document.getElementById('sortFilter')?.value || 'newest';

  // Show/hide clear button
  const clearBtn = document.getElementById('searchClear');
  if (clearBtn) clearBtn.style.display = search ? 'block' : 'none';

  let url = `/api/books?sort=${sort}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;

  try {
    const books = await apiFetch(url);
    if (books.length === 0) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    grid.innerHTML = books.map(renderBookCard).join('');
  } catch (e) {
    grid.innerHTML = `<p style="color:var(--danger);padding:1rem;grid-column:1/-1;">⚠️ Could not load books. Make sure services are running.</p>`;
  }
}

function debounceSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadBooks, 350);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
  loadBooks();
}

function renderBookCard(book) {
  const rating = book.rating > 0 ? `⭐ ${Number(book.rating).toFixed(1)}` : 'Not rated';
  const cover = book.coverImage
    ? `<img src="${book.coverImage}" alt="${book.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy" /><div class="book-cover-fallback" style="display:none">📖</div>`
    : '<div class="book-cover-fallback">📖</div>';
  const stock = book.stock > 0 ? `${book.stock} in stock` : '<span style="color:var(--danger)">Out of stock</span>';

  return `
    <div class="book-card" onclick="navigate('book-details','${book._id}')">
      <div class="book-cover">
        ${cover}
        <div class="book-category-tag">${book.category}</div>
      </div>
      <div class="book-info">
        <div class="book-title">${book.title}</div>
        <div class="book-author">by ${book.author}</div>
        <div class="book-rating">${rating}</div>
        <div class="book-meta">
          <div class="book-price">$${Number(book.price).toFixed(2)}</div>
          <div class="book-stock">${stock}</div>
        </div>
      </div>
    </div>`;
}

// ── BOOK DETAILS PAGE ─────────────────────────────────────────────
async function loadBookDetails(id) {
  const container = document.getElementById('bookDetailsContent');
  container.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';

  try {
    const book = await apiFetch(`/api/books/${id}`);
    const stars = '★'.repeat(Math.round(book.rating)) + '☆'.repeat(5 - Math.round(book.rating));
    const cover = book.coverImage
      ? `<img src="${book.coverImage}" alt="${book.title}" onerror="this.style.display='none'" loading="lazy" />`
      : '<div style="font-size:5rem">📖</div>';

    const adminActions = (isLoggedIn() && getUser()?.role === 'admin')
      ? `<button class="btn btn-danger" onclick="deleteBook('${book._id}')"> 🗑 Delete Book</button>`
      : '';

    container.innerHTML = `
      <div class="detail-back">
        <button class="btn btn-outline btn-sm" onclick="history.back()">← Back</button>
      </div>
      <div class="detail-container">
        <div class="detail-cover">${cover}</div>
        <div class="detail-info">
          <div class="detail-category">${book.category}</div>
          <h1 class="detail-title">${book.title}</h1>
          <div class="detail-author">by <strong>${book.author}</strong></div>
          <div class="detail-rating">
            <span class="stars">${stars}</span>
            <span style="color:var(--text-muted);font-size:0.85rem">${book.rating > 0 ? book.rating.toFixed(1) + '/5' : 'No rating'}</span>
          </div>
          <div class="detail-price">$${Number(book.price).toFixed(2)}</div>
          <p class="detail-desc">${book.description}</p>
          <div class="detail-meta">
            ${book.isbn ? `<div class="meta-chip"><strong>ISBN:</strong> ${book.isbn}</div>` : ''}
            ${book.publisher ? `<div class="meta-chip"><strong>Publisher:</strong> ${book.publisher}</div>` : ''}
            ${book.publishedYear ? `<div class="meta-chip"><strong>Year:</strong> ${book.publishedYear}</div>` : ''}
            <div class="meta-chip"><strong>Stock:</strong> ${book.stock > 0 ? book.stock + ' available' : 'Out of stock'}</div>
          </div>
          <div class="detail-actions">
            ${book.stock > 0
              ? `<button class="btn btn-primary" onclick="openOrderModal('${book._id}')">🛒 Place Order</button>`
              : `<button class="btn btn-outline" disabled>Out of Stock</button>`
            }
            ${adminActions}
          </div>
        </div>
      </div>`;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><h3>Book not found</h3><p>${e.message}</p></div>`;
  }
}

async function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  try {
    await apiFetch(`/api/books/${id}`, { method: 'DELETE' });
    showToast('Book deleted successfully', 'success');
    navigate('books');
  } catch (e) {
    showToast(`Error: ${e.message}`, 'error');
  }
}

// ── ORDER MODAL ───────────────────────────────────────────────────
async function openOrderModal(bookId) {
  if (!isLoggedIn()) {
    showToast('Please login to place an order', 'error');
    navigate('login');
    return;
  }

  const modal = document.getElementById('orderModal');
  const body = document.getElementById('modalBody');
  modal.classList.add('open');

  body.innerHTML = '<div class="loading-center" style="min-height:120px"><div class="spinner"></div></div>';

  try {
    const book = await apiFetch(`/api/books/${bookId}`);
    const cover = book.coverImage
      ? `<img src="${book.coverImage}" alt="${book.title}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'" />`
      : '📖';

    body.innerHTML = `
      <div class="modal-book-info">
        <div class="modal-book-cover">${cover}</div>
        <div>
          <div class="modal-book-title">${book.title}</div>
          <div class="modal-book-author">by ${book.author}</div>
          <div class="modal-book-price">$${Number(book.price).toFixed(2)}</div>
        </div>
      </div>
      <div class="form-group">
        <label for="orderQty">Quantity (max ${book.stock})</label>
        <input type="number" id="orderQty" min="1" max="${book.stock}" value="1" oninput="updateOrderTotal(${book.price})" />
      </div>
      <div class="form-group">
        <label for="orderAddress">Shipping Address</label>
        <input type="text" id="orderAddress" placeholder="123 Main St, City, Country" />
      </div>
      <div style="background:var(--bg2);border-radius:var(--radius);padding:1rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:var(--text-muted)">Total:</span>
        <span id="orderTotal" style="font-size:1.3rem;font-weight:800;color:var(--primary)">$${Number(book.price).toFixed(2)}</span>
      </div>
      <div id="orderError" class="form-error hidden"></div>
      <div style="display:flex;gap:1rem;">
        <button class="btn btn-outline" style="flex:1" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1" onclick="submitOrder('${book._id}','${book.price}')">Confirm Order</button>
      </div>`;
  } catch (e) {
    body.innerHTML = `<p style="color:var(--danger)">${e.message}</p>`;
  }
}

function updateOrderTotal(price) {
  const qty = parseInt(document.getElementById('orderQty').value) || 1;
  const total = (price * qty).toFixed(2);
  document.getElementById('orderTotal').textContent = `$${total}`;
}

async function submitOrder(bookId, price) {
  const user = getUser();
  const qty = parseInt(document.getElementById('orderQty').value) || 1;
  const addr = document.getElementById('orderAddress').value;
  const errEl = document.getElementById('orderError');
  errEl.classList.add('hidden');

  try {
    await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        bookId,
        quantity: qty,
        shippingAddress: addr || 'Not provided',
      }),
    });
    closeModal();
    showToast('🎉 Order placed successfully!', 'success');
    // Refresh book details stock
    if (currentPage === 'book-details') loadBookDetails(bookId);
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
  }
}

function closeModal() {
  document.getElementById('orderModal').classList.remove('open');
}
function closeOrderModal(e) {
  if (e.target === document.getElementById('orderModal')) closeModal();
}

// ── ADD BOOK ──────────────────────────────────────────────────────
function resetAddBookForm() {
  document.getElementById('addBookForm').reset();
  document.getElementById('addBookError').classList.add('hidden');
  document.getElementById('addBookSuccess').classList.add('hidden');
  document.getElementById('addBookBtn').disabled = false;
  document.getElementById('addBookBtn').textContent = 'Add Book';
}

async function handleAddBook(e) {
  e.preventDefault();
  const btn = document.getElementById('addBookBtn');
  const errEl = document.getElementById('addBookError');
  const successEl = document.getElementById('addBookSuccess');

  errEl.classList.add('hidden');
  successEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Adding...';

  const payload = {
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    price: parseFloat(document.getElementById('bookPrice').value),
    category: document.getElementById('bookCategory').value,
    stock: parseInt(document.getElementById('bookStock').value) || 10,
    rating: parseFloat(document.getElementById('bookRating').value) || 0,
    publisher: document.getElementById('bookPublisher').value.trim(),
    publishedYear: parseInt(document.getElementById('bookYear').value) || undefined,
    isbn: document.getElementById('bookISBN').value.trim(),
    coverImage: document.getElementById('bookCover').value.trim(),
    description: document.getElementById('bookDescription').value.trim(),
  };

  try {
    const result = await apiFetch('/api/books', { method: 'POST', body: JSON.stringify(payload) });
    successEl.textContent = `✅ "${result.book.title}" added successfully!`;
    successEl.classList.remove('hidden');
    document.getElementById('addBookForm').reset();
    showToast('Book added successfully!', 'success');
    setTimeout(() => navigate('books'), 1500);
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Add Book';
  }
}

// ── LOGIN ─────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const errEl = document.getElementById('loginError');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const data = await apiFetch('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value,
      }),
    });
    saveAuth(data.token, data.user);
    showToast(`Welcome back, ${data.user.name}! 👋`, 'success');
    navigate('home');
    document.getElementById('loginForm').reset();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

// ── REGISTER ──────────────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  const errEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');
  errEl.classList.add('hidden');
  successEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    const data = await apiFetch('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value,
        role: document.getElementById('regRole').value,
      }),
    });
    saveAuth(data.token, data.user);
    successEl.textContent = `🎉 Welcome, ${data.user.name}! Account created successfully.`;
    successEl.classList.remove('hidden');
    showToast('Account created! Welcome 🎉', 'success');
    setTimeout(() => { navigate('books'); document.getElementById('registerForm').reset(); }, 1500);
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

// ── ORDERS PAGE ───────────────────────────────────────────────────
async function loadOrders() {
  const container = document.getElementById('ordersContent');
  container.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';

  const user = getUser();
  if (!user) { navigate('login'); return; }

  try {
    const orders = await apiFetch(`/api/orders/user/${user.id}`);

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No orders yet</h3>
          <p>Browse our catalog and place your first order!</p>
          <br/>
          <button class="btn btn-primary" onclick="navigate('books')">Browse Books</button>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="orders-table-wrap">
        <table class="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Book</th>
              <th>Author</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map((o, i) => `
              <tr>
                <td style="color:var(--text-dim)">${i + 1}</td>
                <td style="font-weight:600">${o.bookTitle}</td>
                <td style="color:var(--text-muted)">${o.bookAuthor || '—'}</td>
                <td>${o.quantity}</td>
                <td>$${Number(o.unitPrice).toFixed(2)}</td>
                <td style="font-weight:700;color:var(--primary)">$${Number(o.totalPrice).toFixed(2)}</td>
                <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                <td style="color:var(--text-dim)">${new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><h3>Error</h3><p>${e.message}</p></div>`;
  }
}

// ── PASSWORD TOGGLE ───────────────────────────────────────────────
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
  else { input.type = 'password'; btn.textContent = '👁'; }
}
