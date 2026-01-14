/* www/api.js */
const BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

/**
 * holt ein Objekt – erst localStorage‑Cache, sonst Netzwerk
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function fetchObject(id) {
  const key = `met-object-${id}`;
  const cached = localStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  const res  = await fetch(`${BASE}/objects/${id}`);
  if (!res.ok)  throw new Error(`Met object ${id} not found`);
  const data = await res.json();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}
