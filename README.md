# Artmart – Frontend Web Application

Artmart is a fully client-side **e-commerce-style web application** for browsing, customizing, and purchasing framed artworks.

The project demonstrates clean **frontend architecture**, **modern JavaScript (ES Modules)**, and interaction with a real-world public API.

---

## ✨ Highlights

- Interactive artwork search using a public museum API
- Product configuration with live preview and pricing
- Persistent shopping cart with client-side state management
- Checkout flow with dynamic shipping calculation
- No backend required – fully static deployment

---

## 🧩 Core Features

### 🔍 Artwork Search
- Search artworks via the **Metropolitan Museum of Art Collection API**
- URL-based search state (`?q=…`)
- Highlights shown when no search query is provided
- Results limited to 100 items for performance
- Image-only artworks are displayed

### 🖼️ Product Customization
- Frame configuration with:
  - Print size (S / M / L)
  - Frame style
  - Frame width (2–5 cm, millimeter precision)
  - Mat width (0–10 cm, millimeter precision)
  - Mat color
- Real-time visual preview
- Dynamic price calculation
- Configuration sharable via URL parameters

### 🛒 Shopping Cart
- Cart state stored in `localStorage`
- Preview of framed artworks
- Human-readable configuration summaries
- Items removable without page reload
- Automatic price recalculation

### 💳 Checkout
- Subtotal and total calculation
- Shipping destinations loaded from configuration
- Free-shipping thresholds supported
- Clean, form-based checkout UI

---

## 🧠 Technical Overview

- **JavaScript:** ES2022+, native modules
- **Architecture:** separation of concerns (API, views, state)
- **Styling:** CSS (responsive, no frameworks)
- **State management:** `localStorage`
- **API integration:** REST (fetch)
- **Deployment:** static hosting (GitHub Pages)

No frameworks, no build step, no backend.
