const CUSTOM_PRODUCTS_KEY = "blabenCustomProducts";
const form = document.querySelector("#product-form");
const list = document.querySelector("#custom-list");
const clearButton = document.querySelector("#clear-products");

renderCustomProducts();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const file = data.get("image");
  if (!file || !file.type?.startsWith("image/")) return;

  const image = await readImage(file);
  const products = getProducts();
  products.push({
    category: String(data.get("category") || "").trim(),
    name: String(data.get("name") || "").trim(),
    price: String(data.get("price") || "").trim(),
    state: String(data.get("state") || "available"),
    description: String(data.get("description") || "").trim(),
    image,
  });
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(products));
  form.reset();
  renderCustomProducts();
});

clearButton.addEventListener("click", () => {
  localStorage.removeItem(CUSTOM_PRODUCTS_KEY);
  renderCustomProducts();
});

function getProducts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderCustomProducts() {
  const products = getProducts();
  if (!products.length) {
    list.innerHTML = `<p class="empty-state">لا توجد منتجات مضافة بعد.</p>`;
    return;
  }
  list.innerHTML = products
    .map((product) => `
      <article class="product-card visible">
        <div class="product-image">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
          ${product.state === "unavailable" ? `<span class="status">غير متاح</span>` : ""}
        </div>
        <div class="product-body">
          <h3 class="product-title">${escapeHtml(product.name)}</h3>
          <p class="product-desc">${escapeHtml(product.category)}</p>
          ${product.description ? `<p class="product-desc">${escapeHtml(product.description)}</p>` : ""}
          <span class="price">${escapeHtml(product.price)}</span>
        </div>
      </article>
    `)
    .join("");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
