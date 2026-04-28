/* ===== PRODUCT CATALOG ===== */
const products = [
  {
    id: 1,
    name: "Dragon's Dawn",
    category: "black",
    icon: "\u2604\ufe0f",
    price: 24.99,
    short: "A bold awakening forged in volcanic soil and morning mist.",
    full: "Plucked from ancient Camellia sinensis bushes clinging to cliff faces, Dragon's Dawn is oxidised to a deep, coppery glow. The brew yields malty notes of dark honey and smoked plum, with a finish as warm as a sunrise over volcanic peaks.",
    origin: "Assam, India",
    strength: "Bold — 9/10",
    caffeine: "High",
    bestTime: "First light, to wake the spirit"
  },
  {
    id: 2,
    name: "Whisper of Jade",
    category: "green",
    icon: "\U0001f33f",
    price: 28.99,
    short: "A serene whisper of steamed leaves and mountain dew.",
    full: "Harvested during a forty-day window each spring, the youngest Jade buds are gently steamed in bamboo baskets over cedar fires. The result is a liquor of pale jade, tasting of sweet grass, chestnut, and a faint whisper of umami that lingers like morning fog.",
    origin: "Uji, Kyoto — Japan",
    strength: "Gentle — 3/10",
    caffeine: "Moderate",
    bestTime: "Midday contemplation"
  },
  {
    id: 3,
    name: "Moonvein White",
    category: "white",
    icon: "\U0001f319",
    price: 34.99,
    short: "Silver needles hand-withered beneath a waning moon — impossibly delicate.",
    full: "Silver Veil White tips are harvested under lantern light and withered on bamboo mats for three full nights. The brew is pale moonlight in a cup: honeyed apricot, white peach, and the delicate silkiness of snowmilk. A tea for the patient soul.",
    origin: "Fuding, Fujian — China",
    strength: "Ethereal — 2/10",
    caffeine: "Low",
    bestTime: "Evening meditation"
  },
  {
    id: 4,
    name: "Amber Serpent",
    category: "oolong",
    icon: "\U0001f409",
    price: 31.50,
    short: "Rocks and orchid, twisted into an oolong coil that unfurls with every pour.",
    full: "Heavily oxidised and charred over ironwood, Amber Serpent oolong is rolled by hand into tight serpentine coils. Each infusion yields a different personality: first pour brings orchid and stone fruit, the second reveals roasted mineral and toasted grain.",
    origin: "Wuyi Mountains — China",
    strength: "Medium-High — 7/10",
    caffeine: "Medium-High",
    bestTime: "Afternoon deep dive"
  },
  {
    id: 5,
    name: "Starbloom",
    category: "herbal",
    icon: "\u2728",
    price: 22.00,
    short: "Caffeine-free petals gathered during the summer solstice.",
    full: "Chamomile crowns, rooibos needles, and dried vanilla pods — blended on the longest day of the year. Starbloom produces a golden, honey-sweet infusion that calms the frenzied mind and invites the most enchanted of slumbers.",
    origin: "Cederberg Mountains — S. Africa",
    strength: "Dream — 1/10",
    caffeine: "None",
    bestTime: "Before sleep"
  },
  {
    id: 6,
    name: "Shadowmere",
    category: "black",
    icon: "\U0001f570\ufe0f",
    price: 27.50,
    short: "A dark as midnight blend, smoked over peat and ancient embers.",
    full: "Shadowmere is a marriage of smoked black tea and lapsang souchong, laid in cedar chambers for forty days. Pour yields bonfire and dark chocolate, with a tannic grip and a finish that tastes of old libraries and peat bog. A tea for stormy nights.",
    origin: "Tongmuguan — China",
    strength: "Fierce — 10/10",
    caffeine: "Very High",
    bestTime: "Midnight vigils and stormy nights"
  },
  {
    id: 7,
    name: "Celestia",
    category: "blend",
    icon: "\U0001f30c",
    price: 36.00,
    short: "Our legendary signature blend — seven leaves from seven realms.",
    full: "Celestia is Emberleaf's masterpiece: green tip from Uji, white needle from Fujian, jasmine petal from Hangzhou, matcha from Nara, rooibos from the Cederberg, rosebud from Kazanlak, and a single leaf of sencha harvested on the first day of spring. Impossible to replicate. A taste of the cosmos.",
    origin: "Seven Realms",
    strength: "Harmonious — 5/10",
    caffeine: "Medium",
    bestTime: "Any occasion — this is your tea"
  },
  {
    id: 8,
    name: "Emerald Oath",
    category: "green",
    icon: "\U0001f6e1\ufe0f",
    price: 26.50,
    short: "The warrior's tea — pan-fired resolve and steely calm.",
    full: "A bold, flat-leafed green tea from the high terraces of Mingshan. Pan-fired in iron woks and pressed flat, Emerald Oath tastes of toasted rice, spinach broth, and the greenest part of a forest after rain. Clean, sharp, unforgiving in the best way.",
    origin: "Mingshan — Sichuan, China",
    strength: "Resolute — 6/10",
    caffeine: "Medium",
    bestTime: "Before quests and important tasks"
  },
  {
    id: 9,
    name: "Rose of Avalon",
    category: "blend",
    icon: "\U0001f339",
    price: 33.00,
    short: "White tea petals steeped with hand-picked Bulgarian roses.",
    full: "White Peony tea from Fuding married with Rosa Damascena petals and a touch of vanilla bean. Rose of Avalon produces pale pink steam and tastes like a fairy garden: rosewater, cream, white grape, and the faintest trace of citrus blossom.",
    origin: "Fuding, China & Kazanlak, Bulgaria",
    strength: "Enchanting — 4/10",
    caffeine: "Low-Medium",
    bestTime: "Afternoon courtly gatherings"
  }
];

/* ===== CART STATE ===== */
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

/* ===== HELPERS ===== */
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-count').textContent = count;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('show');
  }, 2500);
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: product.id, qty: 1 });
  }
  saveCart();
  showToast(`\u2604\ufe0f ${product.name} added to thy satchel`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

/* ===== PAGE NAVIGATION ===== */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    // trigger opacity reset
    page.style.opacity = '0';
    requestAnimationFrame(() => { page.style.opacity = '1'; });
  }

  // show/hide footer on confirm page
  document.getElementById('footer').style.display =
    pageId === 'confirm' ? 'none' : 'block';

  // render shop page products
  if (pageId === 'shop') renderProductGrid('all');
  if (pageId === 'cart') renderCart();
  if (pageId === 'checkout') renderCheckoutSummary();

  window.scrollTo(0, 0);
}

/* ===== RENDER PRODUCTS ===== */
function cardHTML(product, showIcon = true) {
  return `
    <div class="product-card" data-category="${product.category}" onclick="openModal(${product.id})">
      <div class="product-icon category-${product.category}">${product.icon}</div>
      <div class="product-info">
        <div class="product-cat">${product.category === 'blend' ? 'Enchanted Blend' : product.category.charAt(0).toUpperCase() + product.category.slice(1)} Tea</div>
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.short}</div>
        <div class="product-bottom">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <button class="btn-add" onclick="event.stopPropagation(); addToCart(${product.id})">+ Add</button>
        </div>
      </div>
    </div>
  `;
}

function renderFeatured() {
  const featured = products.filter(p => [1, 3, 7].includes(p.id));
  document.getElementById('featured-row').innerHTML =
    featured.map(p => cardHTML(p)).join('');
}

function renderProductGrid(category) {
  const filtered = category === 'all'
    ? products
    : products.filter(p => p.category === category);
  document.getElementById('product-grid').innerHTML =
    filtered.map(p => cardHTML(p)).join('');
}

function filterCategory(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProductGrid(category);
}

/* ===== MODAL ===== */
function openModal(productId) {
  const p = products.find(pr => pr.id === productId);
  if (!p) return;
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-icon category-${p.category}">${p.icon}</div>
    <div class="modal-info">
      <div class="product-cat">${p.category === 'blend' ? 'Enchanted Blend' : p.category.charAt(0).toUpperCase() + p.category.slice(1)} Tea</div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.full}</div>
      <div class="modal-details">
        <span>Origin:</span> <span>${p.origin}</span>
        <span>Strength:</span> <span>${p.strength}</span>
        <span>Caffeine:</span> <span>${p.caffeine}</span>
        <span>Best Time:</span> <span>${p.bestTime}</span>
      </div>
      <div class="modal-bottom">
        <span class="product-price">$${p.price.toFixed(2)}</span>
        <button class="btn-add-lg" onclick="addToCart(${p.id}); closeModal();">Add to Satchel</button>
      </div>
    </div>
  `;
  document.getElementById('product-modal').classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('product-modal').classList.remove('open');
}

/* ===== CART RENDERING ===== */
function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const summaryEl = document.getElementById('cart-summary');
  const emptyEl = document.getElementById('cart-empty');

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    summaryEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');

  itemsEl.innerHTML = cart.map(item => {
    const p = products.find(pr => pr.id === item.id);
    if (!p) return '';
    const total = (p.price * item.qty).toFixed(2);
    return `
      <div class="cart-item">
        <div class="cart-item-icon category-${p.category}">${p.icon}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">$${p.price.toFixed(2)} &times; ${item.qty} = $${total}</div>
        </div>
        <div class="qty-controls">
          <button onclick="updateQty(${p.id}, -1)">&minus;</button>
          <span class="qty-num">${item.qty}</span>
          <button onclick="updateQty(${p.id}, 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${p.id})" title="Remove">&times;</button>
      </div>
    `;
  }).join('');

  const subtotal = getCartTotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  summaryEl.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="summary-row"><span>Shipping ${shipping === 0 ? '(Complimentary!)' : ''}</span><span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
    <div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    <div class="checkout-btn-wrap">
      <a class="hero-cta" href="#" onclick="showPage('checkout')">Proceed to Covenant &rarr;</a>
    </div>
  `;
}

/* ===== CHECKOUT ===== */
function renderCheckoutSummary() {
  const el = document.getElementById('checkout-summary');
  const subtotal = getCartTotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  el.innerHTML = `
    <h3>Order Summary</h3>
    ${cart.map(item => {
      const p = products.find(pr => pr.id === item.id);
      return p ? `<div class="summary-row"><span>${p.name} &times; ${item.qty}</span><span>$${(p.price * item.qty).toFixed(2)}</span></div>` : '';
    }).join('')}
    <div class="summary-row"><span>Shipping${shipping === 0 ? ' (Free)' : ''}</span><span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
    <div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
  `;
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
  input.value = v;
}

function handleCheckout(e) {
  e.preventDefault();
  const name = document.getElementById('fname').value;
  if (!name) return;

  const orderNum = 'EBL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById('confirm-order').textContent = `Order ${orderNum} — Sealed for ${name}`;

  // clear cart
  cart = [];
  saveCart();
  document.getElementById('checkout-form').reset();

  showPage('confirm');
}

/* ===== PARTICLES ===== */
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
}

/* ===== INIT ===== */
createParticles();
renderFeatured();
updateCartCount();
