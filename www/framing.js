import { render, getPrintSizes, calculatePrice } from './frame.js';

const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

const params = new URLSearchParams(window.location.search);
const objectID = params.get('objectID');

if (!objectID) {
  window.location.replace('search.html');
}

window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const objectID = params.get('objectID');

  //if (!objectID) return redirectToSearch();
  if (!objectID) {
    redirectToSearch();
    return;
  }

  const artwork = await fetchObject(objectID);
  //if (!artwork || !artwork.primaryImageSmall) return redirectToSearch();
  if (!artwork || (!artwork.primaryImageSmall && !artwork.primaryImage)) {
    redirectToSearch();
    return;
  }  

  document.getElementById('preview-image').src = artwork.primaryImageSmall || artwork.primaryImage;
  document.getElementById('preview-image').alt = artwork.title;

  document.getElementById('image-label').innerHTML = `
    <span class="artist">${artwork.artistDisplayName || 'Unknown Artist'}</span>
    <span class="title">${artwork.title}</span>,
    <span class="date">${artwork.objectDate}</span>
  `;

  document.getElementById('object-id').value = objectID;

  applyPreselectedParams(params);
  bindInputSync();
  updateCartCount();
  renderPreview();
});

function redirectToSearch() {
  window.location.href = 'search.html';
}

function fetchObject(id) {
  const url = `${MET_API_BASE}/objects/${id}`;
  const cached = localStorage.getItem(url);
  
  if (cached) {
    return Promise.resolve(JSON.parse(cached));
  }

  return fetch(url).then(res => res.json()).then(data => {
    localStorage.setItem(url, JSON.stringify(data));
    return data;
  });
}


function applyPreselectedParams(params) {
  const mappings = [
    ['printSize', 'printSize'],
    ['frameStyle', 'frameStyle'],
    ['frameWidth', 'frameWidth'],
    ['matWidth', 'matWidth'],
    ['matColor', 'matColor']
  ];

  mappings.forEach(([name, key]) => {
    const value = params.get(key);
    if (value) {
      const input = document.querySelector(`[name="${name}"][value="${value}"]`);
      if (input && input.type === 'radio') input.checked = true;
  
      const otherInput = document.querySelector(`input[name="${name}"]`);
      if (otherInput && otherInput.type !== 'radio') {
        const numericValue = (name === 'frameWidth' || name === 'matWidth') 
          ? parseFloat(value) / 10 // 🔁 mm → cm
          : parseFloat(value);
  
        otherInput.value = numericValue;
      }
  
      const rangeOrNumber = document.querySelector(`[name="${name}"]`);
      if (rangeOrNumber?.type === 'number' || rangeOrNumber?.type === 'range') {
        const numericValue = (name === 'frameWidth' || name === 'matWidth') 
          ? parseFloat(value) / 10
          : parseFloat(value);
  
        rangeOrNumber.value = numericValue;
      }
    }
  });
}

function bindInputSync() {
  const frameInput = document.querySelector('input[name="frameWidth"]');
  const frameRange = document.querySelector('input[name="frameWidthR"]');
  const matInput = document.querySelector('input[name="matWidth"]');
  const matRange = document.querySelector('input[name="matWidthR"]');

  [frameInput, frameRange].forEach(el =>
    el.addEventListener('input', () => sync(frameInput, frameRange, 2, 5))
  );
  [matInput, matRange].forEach(el =>
    el.addEventListener('input', () => sync(matInput, matRange, 0, 10))
  );

  document.getElementById('framing-form').addEventListener('change', renderPreview); 
  document.getElementById('framing-form').addEventListener('input', renderPreview);
  document.querySelector('.buy').addEventListener('click', addToCart);
}

function sync(num, range, min, max) {
  let val = clamp(parseFloat(num.value), min, max);
  val = Math.round(val * 10) / 10;
  num.value = range.value = val;
}

function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
}

function renderPreview() {
  const img = document.getElementById('preview-image');
  const container = document.getElementById('preview-container');
  const label = document.getElementById('image-label');
  const form = document.getElementById('framing-form');

  const printSize = form.printSize.value;
  const frameStyle = form.frameStyle.value;
  const frameWidth = parseFloat(form.frameWidth.value) * 10;
  const matColor = form.matColor.value;
  const matWidth = parseFloat(form.matWidth.value) * 10;

  render(img, container, label, printSize, frameStyle, frameWidth, matColor, matWidth);

  const sizes = getPrintSizes(img);
  document.getElementById("print-size-s-label").innerHTML = `Small <br>${sizes.S[0] / 10} × ${sizes.S[1] / 10} cm`
  document.getElementById("print-size-m-label").innerHTML = `Medium<br>${sizes.M[0] / 10} × ${sizes.M[1] / 10} cm`
  document.getElementById("print-size-l-label").innerHTML = `Large <br>${sizes.L[0] / 10} × ${sizes.L[1] / 10} cm`

  document.getElementById('total-size').innerText =
    `${(sizes[printSize][0] + 2 * frameWidth + 2 * matWidth) / 10} × ${(sizes[printSize][1] + 2 * frameWidth + 2 * matWidth) / 10} cm`;

  const price = calculatePrice(printSize, frameStyle, frameWidth, matWidth) / 100;
  document.getElementById('price').innerText = `€ ${price.toFixed(2)}`;
}

function addToCart() {
  const form = document.getElementById('framing-form');
  const objectID = parseInt(form['object-id'].value);

  const item = {
    objectID,
    printSize: form.printSize.value,
    frameStyle: form.frameStyle.value,
    frameWidth: parseFloat(form.frameWidth.value) * 10,
    matWidth: parseFloat(form.matWidth.value) * 10,
    matColor: form.matColor.value
  };

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.unshift(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  window.location.href = 'cart.html';
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartLink = document.getElementById('cart-link');
  if (cartLink) {
    cartLink.innerText = cart.length ? `Cart (${cart.length})` : 'Cart';
  }
}
