import { calculatePrice } from './frame.js';

let shippingData = [];

window.addEventListener('DOMContentLoaded', async () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  const subtotalElem = document.getElementById('price-subtotal');
  const shippingElem = document.getElementById('price-shipping');
  const totalElem = document.getElementById('price-total');
  const freeShippingThresholdElem = document.getElementById('free-shipping-threshold');
  const freeShippingNoteElem = document.getElementById('free-shipping-from');
  const countrySelect = document.getElementById('country');

  const res = await fetch('shipping.json');
  const data = await res.json();
  shippingData = data.countries;

  populateCountryOptions(shippingData, countrySelect);
  calculateSubtotal(cart, subtotalElem);
  calculateTotal(cart, subtotalElem, shippingElem, totalElem, shippingData, countrySelect, freeShippingNoteElem, freeShippingThresholdElem);

  countrySelect.addEventListener('change', () => {
    calculateTotal(cart, subtotalElem, shippingElem, totalElem, shippingData, countrySelect, freeShippingNoteElem, freeShippingThresholdElem);
  });
});

function calculateSubtotal(cart, subtotalElem) {
  let subtotal = 0;
  for (const item of cart) {
    subtotal += calculatePrice(item.printSize, item.frameStyle, item.frameWidth, item.matWidth) / 100;
  }
  subtotalElem.innerText = subtotal.toFixed(2);
}

function populateCountryOptions(data, countrySelect) {
  for (const country of data) {
    const option = document.createElement('option');
    option.value = country.isoCode;
    option.textContent = country.displayName;
    countrySelect.appendChild(option);
  }
  countrySelect.selectedIndex = 0;
}

function calculateTotal(cart, subtotalElem, shippingElem, totalElem, shippingData, countrySelect, freeShippingNoteElem, freeShippingThresholdElem) {
  const selectedIsoCode = countrySelect.value;
  const country = shippingData.find(c => c.isoCode === selectedIsoCode);

  if (!country) return;

  const subtotal = parseFloat(subtotalElem.innerText);
  let shipping = country.price;
  let shippingLabel = `€ ${shipping.toFixed(2)}`;
  freeShippingNoteElem.style.display = 'none';

  if (country.freeShippingPossible && subtotal >= country.freeShippingThreshold) {
    shipping = 0;
    shippingLabel = 'Free';
  } else if (country.freeShippingPossible && country.freeShippingThreshold > 0) {
    freeShippingNoteElem.style.display = 'block';
    freeShippingThresholdElem.innerText = country.freeShippingThreshold.toFixed(2);
  }

  shippingElem.innerHTML = shippingLabel;
  totalElem.innerText = '€ ' + (subtotal + shipping).toFixed(2);
}
