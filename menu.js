const productImages = [
  "ارز بلبن ساده.jpg",
  "ارز بلبن لوتس.jpg",
  "ارز بلبن مانجو.jpg",
  "ارز بلبن مكسرات و قشطة.jpg",
  "ارز بلبن مكسرات.jpg",
  "السبيكة.jpg",
  "السبيكه.png",
  "السح الدح امبو.png",
  "الفزعة شيكولا.png",
  "الكشخة.jpg",
  "اللؤة.jpg",
  "اللؤة بستاشيو.jpg",
  "اللؤة شيكولاتة.jpg",
  "اللؤة كيندر.jpg",
  "اللؤة مانجو.jpg",
  "المتكندرة.png",
  "بمبوظه بندق.jpg",
  "بمبوظه ساده.jpg",
  "بمبوظه قشطه.jpg",
  "بمبوظه لوتس.jpg",
  "بمبوظه مكسرات.jpg",
  "بومباستيك.png",
  "تشيز بوم.jpg",
  "خالتي ماتيلدا.png",
  "دباديبو.png",
  "دي باريس.png",
  "ريمونتادا.png",
  "ريمونتادا.jpg",
  "سانكوريتا.png",
  "شوكيز.png",
  "شيكولاتة بي.png",
  "طاجن ام علي.jpg",
  "طاجن ام علي مكسرات.jpg",
  "طاجن ام علي قشطة.jpg",
  "طاجن ام علي قشطة مكسرات.jpg",
  "قسطوطه كراميل.jpg",
  "قشطوطه ارز بلبن كريمه.jpg",
  "قشطوطه ارز بلبن لوتس.jpg",
  "قشطوطه ارز بلبن مانجو.jpg",
  "قشطوطه ارز بلبن مكسرات.jpg",
  "قشطوطه سوبر لوكس.jpg",
  "قشطوطه قشطه.jpg",
  "قشطوطه لوتس.jpg",
  "قشطوطه مانجو.jpg",
  "قشطوطه مكسرات.jpg",
  "كبسه ص.jpg",
  "كريب دبي.jpg",
  "كريب ماجنم دبي.png",
  "كشري بستاشيو لوتس.jpg",
  "كشري بستاشيو.jpg",
  "كشري كيندر.jpg",
  "كشري لوتس.jpg",
  "كشري لوريو نوتيلا.jpg",
  "كشري مانجو.jpg",
  "كشري نوتيلا.jpg",
  "هبة دبي بندق.jpg",
  "هبة دبي شيكولاتة.jpg",
  "هبه دبي كيندر.jpg",
];

const version = document.body.dataset.version;
const app = document.querySelector("#app");
let activeProducts = [];
const OFFERS_CATEGORY = "عروض ب لبن";
const NEW_CATEGORY = "منتجات جديدة";
const CUSTOM_PRODUCTS_KEY = "blabenCustomProducts";

window.addEventListener("load", () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => document.body.classList.add("menu-ready"), reduced ? 80 : 2450);
});

init();

async function init() {
  try {
    const raw = await fetch("names_and_descriptons.txt", { cache: "no-store" }).then((res) => {
      if (!res.ok) throw new Error("menu text not found");
      return res.text();
    });
    const products = buildCatalog(parseMenu(raw));
    const grouped = groupProducts(products);

    if (version === "world") renderWorld(grouped);
    else if (version === "spotlight") renderSpotlight(grouped);
    else if (version === "cinematic") renderCinematic(grouped);
    else if (version === "magazine") renderMagazine(grouped);
    else renderScroll(grouped);

    revealCards();
    bindProductDetails();
    createProductDialog();
  } catch (error) {
    app.innerHTML = `
      <section class="error-state">
        <h1>تعذر تحميل المنيو</h1>
        <p>افتح الموقع من سيرفر محلي حتى يتم تحميل ملف المنتجات والصور بشكل صحيح.</p>
      </section>
    `;
  }
}

function parseMenu(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const products = [];
  let category = "الأكثر طلبا";

  for (let i = 0; i < lines.length; i += 1) {
    const line = cleanLine(lines[i]);
    if (!line) continue;

    if (isCategory(line)) {
      category = line.replace(/\s+\d+$/, "");
      continue;
    }

    if (isNoise(line)) continue;

    const name = line;
    const details = [];
    let price = "";
    let unavailable = false;
    let j = i + 1;

    while (j < lines.length) {
      const next = cleanLine(lines[j]);
      if (!next || isNoise(next)) {
        j += 1;
        continue;
      }
      if (isCategory(next)) break;
      if (next.includes("غير متاح")) {
        unavailable = true;
        j += 1;
        continue;
      }
      if (isLikelyProductStart(next, lines[j + 1])) break;
      if (isPrice(next)) {
        price = next;
        j += 1;
        break;
      }
      details.push(next);
      j += 1;
    }

    if (price) {
      const imageMatch = matchImage(name);
      products.push({
        id: products.length,
        name,
        category,
        description: cleanDescription(details.join(" ")),
        price,
        unavailable,
        image: imageMatch.image,
        imageScore: imageMatch.score,
      });
      i = j - 1;
    }
  }

  return products.filter((product) => product.image);
}

function buildCatalog(parsedProducts) {
  const products = [];
  const seen = new Set();
  const usedImages = new Set();

  const addProduct = (product) => {
    const key = `${product.category}|${normalizeArabic(product.name)}|${product.price}|${product.image}`;
    if (seen.has(key) || !product.image) return;
    seen.add(key);
    usedImages.add(product.image);
    products.push({ ...product });
  };

  parsedProducts.forEach(addProduct);

  productImages.forEach((image) => {
    if (usedImages.has(image)) return;
    const name = imageNameToTitle(image);
    addProduct({
      name,
      category: inferCategory(name),
      description: "منتج مضاف من صورة المنتج المتاحة في فولدر المنيو.",
      price: "السعر قريباً",
      unavailable: false,
      image,
      imageScore: 100,
    });
  });

  ensureMetkandra(products);
  addOffers(products);
  loadCustomProducts().forEach(addProduct);

  activeProducts = products.map((product, id) => ({ ...product, id }));
  return activeProducts;
}

function imageNameToTitle(path) {
  return path.replace(/\.[^.]+$/, "").trim();
}

function inferCategory(name) {
  const norm = normalizeArabic(name);
  if (norm.includes("ارز")) return "دنيا الارز";
  if (norm.includes("قشطوط") || norm.includes("قسطوط")) return "دنيا القشطوطة";
  if (norm.includes("كشري")) return "دينا الكشري";
  if (norm.includes("بمبو")) return "دنيا البمبوظة";
  if (norm.includes("طاجن") || norm.includes("ام علي")) return "دنيا ام على";
  if (norm.includes("دبي") || norm.includes("كريب")) return "تريندات دبي";
  if (norm.includes("اللء")) return "اللؤة";
  if (norm.includes("كيك") || norm.includes("ماتيلدا") || norm.includes("كبسه") || norm.includes("كشخه") || norm.includes("متكندر")) return "دنيا الكيك";
  return "منتجات متنوعة";
}

function ensureMetkandra(products) {
  const hasNew = products.some((product) => product.category === NEW_CATEGORY && normalizeArabic(product.name).includes("متكندر"));
  if (hasNew) return;
  const source = products.find((product) => normalizeArabic(product.name).includes("متكندر")) || {
    name: "المتكندره",
    price: "175 جنيه",
    description: "بار شوكولاتة، كريمة البندق، ميكس كرانشي، شوكو فادج، شوكولاتة ايطالي",
    unavailable: false,
    image: "المتكندرة.png",
  };
  products.push({ ...source, category: NEW_CATEGORY, image: "المتكندرة.png" });
}

function addOffers(products) {
  const offerSeeds = products
    .filter((product) => product.category !== OFFERS_CATEGORY)
    .filter((product) => !product.unavailable)
    .slice(0, 6);
  offerSeeds.forEach((product) => {
    products.push({
      ...product,
      category: OFFERS_CATEGORY,
      description: product.description || "عرض مميز من ب لبن.",
    });
  });
}

function loadCustomProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((item) => item && item.name && item.category && item.price && item.image)
      .map((item) => ({
        name: String(item.name).slice(0, 80),
        category: String(item.category).slice(0, 80),
        description: String(item.description || "").slice(0, 700),
        price: String(item.price).slice(0, 40),
        unavailable: item.state === "unavailable",
        image: String(item.image).startsWith("data:image/") ? item.image : "b.laben logo.jfif",
        imageScore: 100,
      }));
  } catch {
    return [];
  }
}

function cleanLine(line) {
  return line.replace(/\s+/g, " ").replace(/بلبن restaurant/g, "").trim();
}

function cleanDescription(text) {
  return text
    .replace(/غير متاح/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCategory(line) {
  return (
    /^(منتجات جديدة|دنيا|دينا|هبة دبي|تريندات دبي|اللؤة|السح ادح امبو)/.test(line) &&
    /\d+$/.test(line)
  );
}

function isPrice(line) {
  return /\d+\s*(?:-|–)?\s*\d*\s*جنيه/.test(line);
}

function isNoise(line) {
  return /^\d+$/.test(line) || line === "restaurant";
}

function isLikelyProductStart(line, nextLine = "") {
  const next = cleanLine(nextLine || "");
  return !isPrice(line) && (isPrice(next) || next.includes("غير متاح"));
}

function groupProducts(products) {
  const map = new Map();
  products.forEach((product) => {
    if (!map.has(product.category)) map.set(product.category, []);
    map.get(product.category).push(product);
  });
  const priority = [OFFERS_CATEGORY, NEW_CATEGORY, "الأكثر طلبا"];
  return [...map.entries()].sort(([a], [b]) => {
    const aIndex = priority.indexOf(a);
    const bIndex = priority.indexOf(b);
    if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    return 0;
  }).map(([name, items]) => ({
    name,
    image: items[0]?.image || "b.laben logo.jfif",
    items,
  }));
}

function normalizeArabic(value) {
  return value
    .replace(/\.[^.]+$/, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/[ةه]/g, "ه")
    .replace(/[ىي]/g, "ي")
    .replace(/[ؤئ]/g, "ء")
    .replace(/[^\u0600-\u06FF0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchImage(name) {
  const normalizedName = normalizeArabic(name);
  let best = "";
  let bestScore = 0;

  productImages.forEach((path) => {
    const candidate = normalizeArabic(path);
    let score = 0;
    if (candidate.includes(normalizedName) || normalizedName.includes(candidate)) score += 20;
    normalizedName.split(" ").forEach((token) => {
      if (token.length > 2 && candidate.includes(token)) score += 3;
    });
    if (score > bestScore) {
      bestScore = score;
      best = path;
    }
  });

  return { image: bestScore >= 6 ? best : "", score: bestScore };
}

function renderScroll(grouped) {
  const featured = grouped.flatMap((group) => group.items).slice(0, 3);
  app.innerHTML = `
    ${heroMarkup("منيو بلبن", "حلوياتك المفضلة في تجربة سريعة وواضحة، اختار التصنيف وشوف كل المنتجات بالصور والأسعار.", featured)}
    <div class="category-rail" aria-label="التصنيفات">
      ${grouped.map((group, index) => `<button class="category-pill ${index === 0 ? "active" : ""}" data-target="cat-${index}">${escapeHtml(group.name)}</button>`).join("")}
    </div>
    ${grouped.map(sectionMarkup).join("")}
  `;
  bindRail();
}

function renderWorld(grouped) {
  app.innerHTML = `
    <section class="world-intro">
      <p class="eyebrow">تصفح بالصور</p>
      <h1>كل دنيا ليها طعمها</h1>
      <p class="hero-text">اختار التصنيف من الصور، والمنتجات هتظهر فوراً بشكل بسيط وواضح.</p>
    </section>
    <section class="category-world" aria-label="تصنيفات المنيو">
      ${grouped.map((group, index) => `
        <button class="category-tile ${index === 0 ? "active" : ""}" data-index="${index}">
          <img src="${encodeURI(group.image)}" alt="" loading="lazy" />
          <span>${escapeHtml(group.name)}</span>
        </button>
      `).join("")}
    </section>
    <section class="selected-products" id="selected-products"></section>
  `;

  const selected = app.querySelector("#selected-products");
  const renderSelected = (index) => {
    selected.innerHTML = sectionMarkup(grouped[index], index);
    revealCards();
  };
  renderSelected(0);

  app.querySelectorAll(".category-tile").forEach((button) => {
    button.addEventListener("click", () => {
      app.querySelectorAll(".category-tile").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderSelected(Number(button.dataset.index));
      selected.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderSpotlight(grouped) {
  const all = grouped.flatMap((group) => group.items);
  const heroProduct = all.find((item) => item.description.length > 60) || all[0];
  app.innerHTML = `
    <section class="spot-intro">
      <p class="eyebrow">Spotlight Menu</p>
      <h1>منتجات تشد العين وتخلي الاختيار أسهل</h1>
    </section>
    <section class="spot-layout">
      <article class="spot-card">
        <img src="${encodeURI(heroProduct.image)}" alt="${escapeHtml(heroProduct.name)}" />
        ${heroProduct.unavailable ? `<span class="status">غير متاح</span>` : ""}
        <div class="spot-copy">
          <h2>${escapeHtml(heroProduct.name)}</h2>
          <p>${escapeHtml(heroProduct.description || heroProduct.category)}</p>
          <span class="price">${escapeHtml(heroProduct.price)}</span>
        </div>
      </article>
      <div class="spot-side">
        <div class="category-rail" aria-label="التصنيفات">
          ${grouped.map((group, index) => `<button class="category-pill ${index === 0 ? "active" : ""}" data-index="${index}">${escapeHtml(group.name)}</button>`).join("")}
        </div>
        <div class="compact-list" id="spot-list"></div>
      </div>
    </section>
    <section id="spot-sections">
      ${grouped.slice(0, 4).map(sectionMarkup).join("")}
    </section>
  `;

  const list = app.querySelector("#spot-list");
  const renderList = (index) => {
    list.innerHTML = grouped[index].items.slice(0, 4).map(productMarkup).join("");
    revealCards();
  };
  renderList(0);

  app.querySelectorAll(".category-pill").forEach((button) => {
    button.addEventListener("click", () => {
      app.querySelectorAll(".category-pill").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderList(Number(button.dataset.index));
    });
  });
}

function renderCinematic(grouped) {
  const all = grouped.flatMap((group) => group.items);
  const featured = all.filter((item) => item.description).slice(0, 4);

  app.innerHTML = `
    <section class="presentation-hero">
      <p class="eyebrow">b.laben presentation menu</p>
      <h1>كل سكرول يحكي جزء من المنيو</h1>
      <p class="hero-text">تجربة بسيطة وواضحة، لكن كل قسم يدخل بحركة زي شرائح العرض.</p>
      <div class="presentation-hero-grid">
        ${featured.map((product) => presentationFeatureMarkup(product)).join("")}
      </div>
    </section>

    <section class="category-rail presentation-rail" aria-label="التصنيفات">
      ${grouped.map((group, index) => `<button class="category-pill ${index === 0 ? "active" : ""}" data-target="cat-${index}" type="button">${escapeHtml(group.name)}</button>`).join("")}
    </section>

    ${grouped.map(presentationSectionMarkup).join("")}
  `;
  bindRail();
  revealPresentation();
}

function renderMagazine(grouped) {
  const all = grouped.flatMap((group) => group.items);
  const hero = all.find((item) => item.description.length > 90) || all[0];
  app.innerHTML = `
    <section class="magazine-hero">
      <div class="magazine-cover" role="button" tabindex="0" data-product-id="${hero.id}">
        <img src="${encodeURI(hero.image)}" alt="${escapeHtml(hero.name)}" />
        <div>
          <p class="eyebrow">اختيارنا للمنيو</p>
          <h1>${escapeHtml(hero.name)}</h1>
          <p>${escapeHtml(hero.description || hero.category)}</p>
          <span class="price">${escapeHtml(hero.price)}</span>
        </div>
      </div>
      <aside class="magazine-note">
        <p class="eyebrow">Version 5</p>
        <h2>Luxury Magazine Menu</h2>
        <p>دي النسخة اللي أنصح بها كمنيو نهائي: شكل فاخر، صور كبيرة، قراءة سهلة، وتصنيفات واضحة من غير تعقيد.</p>
      </aside>
    </section>

    <section class="category-rail" aria-label="التصنيفات">
      ${grouped.map((group, index) => `<button class="category-pill ${index === 0 ? "active" : ""}" data-target="cat-${index}" type="button">${escapeHtml(group.name)}</button>`).join("")}
    </section>

    ${grouped.map(magazineSectionMarkup).join("")}
  `;
  bindRail();
  revealPresentation();
}

function presentationFeatureMarkup(product) {
  return `
    <article class="presentation-feature" role="button" tabindex="0" data-product-id="${product.id}">
      <img src="${encodeURI(product.image)}" alt="${escapeHtml(product.name)}" />
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(product.price)}</span>
      </div>
    </article>
  `;
}

function presentationSectionMarkup(group, index = 0) {
  const lead = group.items[0];
  const rest = group.items.slice(1, 7);
  return `
    <section class="presentation-section reveal-panel" id="cat-${index}">
      <div class="presentation-lead" role="button" tabindex="0" data-product-id="${lead.id}">
        <img src="${encodeURI(lead.image)}" alt="${escapeHtml(lead.name)}" loading="lazy" />
        <div>
          <p class="eyebrow">${escapeHtml(group.name)}</p>
          <h2>${escapeHtml(lead.name)}</h2>
          <p>${escapeHtml(lead.description || "اضغط على المنتج لعرض التفاصيل.")}</p>
          <span class="price">${escapeHtml(lead.price)}</span>
        </div>
      </div>
      <div class="presentation-products">
        ${rest.map(productMarkup).join("")}
      </div>
    </section>
  `;
}

function magazineSectionMarkup(group, index = 0) {
  const lead = group.items[0];
  return `
    <section class="magazine-section reveal-panel" id="cat-${index}">
      <div class="magazine-heading">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h2>${escapeHtml(group.name)}</h2>
      </div>
      <div class="magazine-layout">
        <article class="magazine-large" role="button" tabindex="0" data-product-id="${lead.id}">
          <img src="${encodeURI(lead.image)}" alt="${escapeHtml(lead.name)}" loading="lazy" />
          <div>
            <h3>${escapeHtml(lead.name)}</h3>
            <p>${escapeHtml(lead.description || "منتج مميز من هذا التصنيف.")}</p>
            <span class="price">${escapeHtml(lead.price)}</span>
          </div>
        </article>
        <div class="product-grid">
          ${group.items.slice(1, 7).map(productMarkup).join("")}
        </div>
      </div>
    </section>
  `;
}

function heroMarkup(title, copy, products) {
  const first = products[0] || {};
  const second = products[1] || first;
  return `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">b.laben online menu</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="hero-text">${escapeHtml(copy)}</p>
      </div>
      <div class="hero-media" aria-hidden="true">
        <div class="hero-card main"><img src="${encodeURI(first.image || "b.laben logo.jfif")}" alt="" /></div>
        <div class="hero-card side"><img src="${encodeURI(second.image || "b.laben logo.jfif")}" alt="" /></div>
        <div class="hero-card badge"><strong>${escapeHtml(first.price || "منيو")}</strong><span>${escapeHtml(first.name || "b.laben")}</span></div>
      </div>
    </section>
  `;
}

function sectionMarkup(group, index = 0) {
  return `
    <section class="menu-section" id="cat-${index}">
      <div class="section-head">
        <h2>${escapeHtml(group.name)}</h2>
        <span>${group.items.length} منتج</span>
      </div>
      <div class="product-grid">
        ${group.items.map(productMarkup).join("")}
      </div>
    </section>
  `;
}

function productMarkup(product) {
  return `
    <article class="product-card" role="button" tabindex="0" data-product-id="${product.id}" aria-label="عرض تفاصيل ${escapeHtml(product.name)}">
      <div class="product-image">
        <img src="${encodeURI(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
        ${product.unavailable ? `<span class="status">غير متاح</span>` : ""}
      </div>
      <div class="product-body">
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
        ${product.description ? `<p class="product-desc">${escapeHtml(product.description)}</p>` : ""}
        <span class="price">${escapeHtml(product.price)}</span>
      </div>
    </article>
  `;
}

function createProductDialog() {
  if (document.querySelector(".product-dialog")) return;
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="product-dialog" hidden>
        <div class="dialog-backdrop" data-close-dialog></div>
        <section class="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <button class="dialog-close" type="button" data-close-dialog aria-label="إغلاق">×</button>
          <div class="dialog-image"><img src="b.laben logo.jfif" alt="" /></div>
          <div class="dialog-content">
            <p class="eyebrow dialog-category"></p>
            <h2 id="dialog-title"></h2>
            <p class="dialog-description"></p>
            <div class="dialog-meta">
              <span class="price dialog-price"></span>
              <span class="dialog-status"></span>
            </div>
          </div>
        </section>
      </div>
    `
  );

  document.querySelectorAll("[data-close-dialog]").forEach((control) => {
    control.addEventListener("click", closeProductDialog);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProductDialog();
  });
}

function bindProductDetails() {
  app.addEventListener("click", (event) => {
    const card = event.target.closest(".product-card, .cinema-stage, .presentation-feature, .presentation-lead, .magazine-cover, .magazine-large");
    if (card) openProductDialog(Number(card.dataset.productId));
  });
  app.addEventListener("keydown", (event) => {
    const card = event.target.closest(".product-card, .cinema-stage, .presentation-feature, .presentation-lead, .magazine-cover, .magazine-large");
    if ((event.key === "Enter" || event.key === " ") && card) {
      event.preventDefault();
      openProductDialog(Number(card.dataset.productId));
    }
  });
}

function openProductDialog(id) {
  const product = activeProducts.find((item) => item.id === id);
  const dialog = document.querySelector(".product-dialog");
  if (!product || !dialog) return;

  dialog.querySelector(".dialog-image img").src = encodeURI(product.image);
  dialog.querySelector(".dialog-image img").alt = product.name;
  dialog.querySelector(".dialog-category").textContent = product.category;
  dialog.querySelector("#dialog-title").textContent = product.name;
  dialog.querySelector(".dialog-description").textContent =
    product.description || "لا يوجد وصف إضافي لهذا المنتج حاليا.";
  dialog.querySelector(".dialog-price").textContent = product.price;
  dialog.querySelector(".dialog-status").textContent = product.unavailable ? "غير متاح حاليا" : "متاح";
  dialog.querySelector(".dialog-status").classList.toggle("is-unavailable", product.unavailable);
  dialog.hidden = false;
  document.body.classList.add("dialog-open");
  dialog.querySelector(".dialog-close").focus();
}

function closeProductDialog() {
  const dialog = document.querySelector(".product-dialog");
  if (!dialog || dialog.hidden) return;
  dialog.hidden = true;
  document.body.classList.remove("dialog-open");
}

function bindRail() {
  app.querySelectorAll(".category-pill").forEach((button) => {
    button.addEventListener("click", () => {
      app.querySelectorAll(".category-pill").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function revealCards() {
  const cards = [...document.querySelectorAll(".product-card:not(.visible)")];
  if (!("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  cards.forEach((card) => observer.observe(card));
}

function revealPresentation() {
  const panels = [...document.querySelectorAll(".reveal-panel, .presentation-feature, .magazine-cover, .magazine-note")];
  if (!("IntersectionObserver" in window)) {
    panels.forEach((panel) => panel.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  panels.forEach((panel) => observer.observe(panel));
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
