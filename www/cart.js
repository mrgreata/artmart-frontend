import * as Frame from './frame.js';

const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

document.addEventListener('DOMContentLoaded', async () => {
  const cart = getCartItems();

  updateCartCount();

  const cartSection = document.getElementById('cart');

  if (cart.length === 0) {
    cartSection.innerHTML = ''; // zuerst alles entfernen
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'cart-empty';
    emptyMessage.innerText = 'There are no items in your shopping cart.';
    cartSection.appendChild(emptyMessage);
    return;
  }

  let total = 0;
  for (const item of cart) {
    const element = await createCartItem(item);
    cartSection.insertBefore(element, document.getElementById('cart-total'));
    const price = calculatePrice(item);
    total += price;
  }

  document.getElementById('price-total').innerText = `€ ${total.toFixed(2)}`;
});

function getCartItems() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCartCount() {
  const cart = getCartItems();
  const cartLink = document.getElementById('cart-link');
  cartLink.innerText = cart.length > 0 ? `Cart (${cart.length})` : 'Cart';
}

async function createCartItem(cartItem) {
  const { objectID, printSize, frameStyle, frameWidth, matColor, matWidth } = cartItem;

  const object = await fetchObject(objectID);
  const price = calculatePrice(cartItem);

  const itemDiv = document.createElement("div");
  itemDiv.classList.add("cart-item");

  const previewDiv = document.createElement("div");
  previewDiv.classList.add("cart-preview");

  const previewImg = document.createElement("img");
  previewImg.classList.add("cart-thumb");
  previewImg.src = object.primaryImageSmall;
  previewImg.alt = object.title;

  const framingLink = document.createElement("a");
  framingLink.href = `framing.html?objectID=${objectID}&printSize=${printSize}&frameStyle=${frameStyle}&frameWidth=${frameWidth}&matColor=${matColor}&matWidth=${matWidth}`;
  framingLink.appendChild(previewImg);

  previewImg.onload = () => {
    Frame.render(previewImg, previewDiv, null, printSize, frameStyle, frameWidth, matColor, matWidth);
  };

  previewDiv.appendChild(framingLink);
  itemDiv.appendChild(previewDiv);

  const labelDiv = document.createElement("div");
  labelDiv.classList.add("museum-label");
  const description = `${getPrintSizeLabel(printSize)} print in a ${frameWidth / 10} cm ${frameStyle} frame`
    + (matWidth > 0 ? ` with a ${matWidth / 10} cm ${matColor} mat.` : '.');

  labelDiv.innerHTML = `
    <div>
      <span class="artist">${object.artistDisplayName || 'Unknown Artist'}</span>
      <span class="title">${object.title}</span>,
      <span class="date">${object.objectDate || ''}</span>
      <br><br>
      <span class="frame-description">${description}</span>
    </div>
    <div class="price">€ ${price.toFixed(2)}</div>
    <button class="cart-remove" aria-label="Remove">✕</button>`;

  const removeButton = labelDiv.querySelector('.cart-remove');
  removeButton.addEventListener('click', () => {
    removeFromCart(cartItem);  
    itemDiv.remove();
    recalculateTotal();
  });

  itemDiv.appendChild(labelDiv);
  return itemDiv;
}

function calculatePrice(item) {
  return Frame.calculatePrice(item.printSize, item.frameStyle, item.frameWidth, item.matWidth) / 100;
}

function getPrintSizeLabel(size) {
  return size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large';
}

function removeFromCart(toRemove) {
    let cart = getCartItems();
    const index = cart.findIndex(item =>
      item.objectID == toRemove.objectID &&
      item.printSize == toRemove.printSize &&
      item.frameStyle == toRemove.frameStyle &&
      item.frameWidth == toRemove.frameWidth &&
      item.matColor == toRemove.matColor &&
      item.matWidth == toRemove.matWidth
    );
    if (index !== -1) {
      cart.splice(index, 1); // nur das erste passende Element entfernen
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
    }
  }
  

function recalculateTotal() {
  const cart = getCartItems();
  let total = 0;
  document.querySelectorAll('.cart-item').forEach((item, index) => {
    const priceText = item.querySelector('.price')?.innerText?.replace('€ ', '');
    if (priceText) total += parseFloat(priceText);
  });
  document.getElementById('price-total').innerText = `€ ${total.toFixed(2)}`;

  if (cart.length === 0) {
    document.getElementById('cart').innerHTML = '<div class="cart-empty">There are no items in your shopping cart.</div>';
  }
}

async function fetchObject(id) {
  const url = `${MET_API_BASE}/objects/${id}`;
  const cached = localStorage.getItem(url);
  if (cached) return JSON.parse(cached);

  const res = await fetch(url);
  const data = await res.json();
  localStorage.setItem(url, JSON.stringify(data));
  return data;
}
