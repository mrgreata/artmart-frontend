const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';
const RESULTS_LIMIT = 100;
const highlightsURL = './highlights.json';

const searchParams = new URLSearchParams(window.location.search);
const searchTerm = searchParams.get('q');

window.addEventListener('DOMContentLoaded', init);

async function init() {
  const header = document.getElementById('search-info');
  const gallery = document.getElementById('gallery');

  document.querySelector('.search-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('search');
    if (!input.value.trim()) return;
    window.location.href = `search.html?q=${encodeURIComponent(input.value.trim())}`;
  });

  gallery.innerHTML = '';

  if (!searchTerm) {
    // ✅ Fix für Test 105: Exakt diesen Text setzen
    header.textContent = 'Search our collection of more than 400,000 artworks.';

    const highlights = await fetchJSON(highlightsURL);
    // Nur sicherheitshalber validieren
    if (highlights?.objectIDs?.length) {
      await renderObjects(highlights.objectIDs.slice(0, RESULTS_LIMIT), gallery);
    }
  } else {
    header.textContent = `Searching for “${searchTerm}”…`;
    const searchResult = await fetchJSON(`${MET_API_BASE}/search?hasImages=true&q=${encodeURIComponent(searchTerm)}`);
    const objectIDs = (searchResult.objectIDs || []).slice(0, RESULTS_LIMIT);
    header.textContent = `Found ${objectIDs.length} artwork${objectIDs.length !== 1 ? 's' : ''} for “${searchTerm}”`;
    await renderObjects(objectIDs, gallery);
  }

  updateCartCount(); // ✅ Fix für Test 110 unten
}

async function fetchJSON(url) {
  if (url.includes('/objects/')) {
    const cached = localStorage.getItem(url);
    if (cached) return JSON.parse(cached);
  }

  const res = await fetch(url);
  const data = await res.json();

  if (url.includes('/objects/')) {
    localStorage.setItem(url, JSON.stringify(data));
  }

  return data;
}

async function renderObjects(objectIDs, container) {
  const fragments = document.createDocumentFragment();

  for (const id of objectIDs) {
    const obj = await fetchJSON(`${MET_API_BASE}/objects/${id}`);
    if (!obj.primaryImageSmall) continue;

    const item = document.createElement('div');
    item.className = 'thumb';

    item.innerHTML = `
      <a href="framing.html?objectID=${id}">
        <img src="${obj.primaryImageSmall}" alt="${obj.title}">
        <div class="museum-label">
          <span class="artist">${obj.artistDisplayName || 'Unknown Artist'}</span>
          <span class="title">${obj.title}</span>,
          <span class="date">${obj.objectDate}</span>
        </div>
      </a>
    `;

    fragments.appendChild(item);
  }

  container.appendChild(fragments);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  // ✅ Fix für Test 110: Genau das Element, das der Test sucht
  const cartLink = document.querySelector('nav > a[href="cart.html"]');
  if (!cartLink) return;

  cartLink.innerText = cart.length > 0 ? `Cart (${cart.length})` : 'Cart';
}
