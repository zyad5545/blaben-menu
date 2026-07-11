import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const ASSET = "/menu-assets/";
const CUSTOM_KEY = "blabenCustomProducts";
const OFFERS = "عروض ب لبن";
const NEW = "منتجات جديدة";
const ADMIN_ROUTE = "/staff-portal-blaben-73.html";
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
// The "coming soon" state label used in badges across the menu.
const COMING_SOON_LABEL = "قريبا";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth and database features will be disabled.");
}
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

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

function asset(path) {
  if (!path) return `${ASSET}${encodeURIComponent("b.laben logo.jfif")}`;
  const value = String(path);
  if (isSafeImageSrc(value)) {
    if (value.startsWith("data:image/") || value.startsWith("https://")) return value;
    return `${ASSET}${encodeURIComponent(value)}`;
  }
  return `${ASSET}${encodeURIComponent("b.laben logo.jfif")}`;
}

// Coming-soon badge is now rendered as a styled text element, not an image.

// Flexible per-product pricing: a product can either have one plain price,
// OR a list of size/option variants (e.g. "بدون آيس كريم" / "سكوب صغير" /
// "سكوب كبير"), each with its own admin-set price. Nothing here is hardcoded
// to "small/large" specifically — the admin can add any number of options
// with any labels from the dashboard.
function hasVariants(product) {
  return Array.isArray(product.variants) && product.variants.length > 0;
}

function parsePriceNumber(price) {
  const match = String(price || "").match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
}

function priceSummary(product) {
  if (!hasVariants(product)) return priceDetails(product).display;
  const numbers = product.variants.map((variant) => parsePriceNumber(variant.price)).filter((n) => !Number.isNaN(n));
  if (!numbers.length) return product.variants[0]?.price || product.price;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return min === max ? `${min} جنيه` : `${min} - ${max} جنيه`;
}

function priceDetails(product) {
  if (hasVariants(product)) {
    const cleanVariants = product.variants
      .map((variant) => ({
        label: limitText(variant.label || "خيار", 40),
        price: limitText(variant.price || "", 40),
      }))
      .filter((variant) => variant.price);
    return { display: priceSummary({ ...product, variants: cleanVariants }), rows: cleanVariants };
  }

  const raw = limitText(product?.price || "", 60);
  const numbers = raw.match(/\d+(?:\.\d+)?/g) || [];
  if (numbers.length >= 2) {
    const display = `${numbers[0]} - ${numbers[1]} جنيه`;
    return {
      display,
      rows: [
        { label: "صغير", price: `${numbers[0]} جنيه` },
        { label: "كبير", price: `${numbers[1]} جنيه` },
      ],
    };
  }
  return { display: raw || "السعر قريباً", rows: raw ? [{ label: "السعر", price: raw }] : [] };
}

function limitText(value, max) {
  return String(value || "").trim().slice(0, max);
}

function isAllowedImageFile(file) {
  return Boolean(file && ALLOWED_IMAGE_TYPES.has(file.type) && file.size <= MAX_IMAGE_BYTES);
}

function isSafeImageSrc(src) {
  const value = String(src || "");
  if (value.startsWith("data:image/")) return /^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.test(value);
  if (value.startsWith("https://")) return true;
  return productImages.includes(value) || value === "b.laben logo.jfif" || value === SPECIAL_OFFER_BADGE;
}

function normalizeArabic(value) {
  return String(value)
    .replace(/\.[^.]+$/, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/[ةه]/g, "ه")
    .replace(/[ىي]/g, "ي")
    .replace(/[ؤئ]/g, "ء")
    .replace(/[^\u0600-\u06FF0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchText(value) {
  return normalizeArabic(value).toLowerCase();
}

function productMatches(product, query) {
  const q = searchText(query);
  if (!q) return false;
  const haystack = searchText(`${product.name} ${product.category} ${product.description || ""} ${product.price}`);
  return q.split(" ").filter(Boolean).every((part) => haystack.includes(part));
}

function scrollToProducts(index = 0) {
  document.getElementById(`cat-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToProductPanel() {
  document.getElementById("products-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cleanLine(line) {
  return line.replace(/\s+/g, " ").replace(/بلبن restaurant/g, "").trim();
}

function isCategory(line) {
  return /^(منتجات جديدة|دنيا|دينا|هبة دبي|تريندات دبي|اللؤة|السح ادح امبو)/.test(line) && /\d+$/.test(line);
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

function matchImage(name) {
  const normalizedName = normalizeArabic(name);
  let best = "";
  let bestScore = 0;
  productImages.forEach((path) => {
    const candidate = normalizeArabic(path);
    let score = candidate.includes(normalizedName) || normalizedName.includes(candidate) ? 20 : 0;
    normalizedName.split(" ").forEach((token) => {
      if (token.length > 2 && candidate.includes(token)) score += 3;
    });
    if (score > bestScore) {
      bestScore = score;
      best = path;
    }
  });
  return bestScore >= 6 ? best : "";
}

function parseMenu(raw) {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
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

    const details = [];
    let price = "";
    let state = "available";
    let j = i + 1;
    while (j < lines.length) {
      const next = cleanLine(lines[j]);
      if (!next || isNoise(next)) {
        j += 1;
        continue;
      }
      if (isCategory(next)) break;
      if (next.includes("غير متاح")) {
        state = "unavailable";
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
      const image = matchImage(line);
      if (image) {
        products.push({
          name: line,
          category,
          description: details.join(" ").replace(/غير متاح/g, "").trim(),
          price,
          state,
          image,
        });
      }
      i = j - 1;
    }
  }
  return products;
}

function loadCustomProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
    return Array.isArray(saved)
      ? saved.filter((item) => item?.name && item?.category && item?.price && isSafeImageSrc(item?.image)).map((item) => ({
          name: limitText(item.name, 90),
          category: limitText(item.category, 70),
          price: limitText(item.price, 60),
          description: limitText(item.description || "", 500),
          state: item.state || (item.unavailable ? "unavailable" : "available"),
          image: String(item.image),
          variants: Array.isArray(item.variants)
            ? item.variants.map((variant) => ({
                label: limitText(variant.label, 40),
                price: limitText(variant.price, 40),
              })).filter((variant) => variant.label && variant.price)
            : [],
        }))
      : [];
  } catch {
    return [];
  }
}

function buildCatalog(parsed) {
  const products = [];
  const seen = new Set();
  const usedImages = new Set();
  const add = (product) => {
    const key = `${product.category}|${normalizeArabic(product.name)}|${product.price}|${product.image}`;
    if (!product.image || seen.has(key)) return;
    seen.add(key);
    usedImages.add(product.image);
    products.push(product);
  };

  parsed.forEach(add);
  productImages.forEach((image) => {
    if (usedImages.has(image)) return;
    const name = image.replace(/\.[^.]+$/, "");
    add({
      name,
      category: inferCategory(name),
      price: "السعر قريباً",
      description: "منتج مضاف من صورة المنتج المتاحة في فولدر المنيو.",
      state: "available",
      image,
    });
  });

  const metkandra = products.find((product) => normalizeArabic(product.name).includes("متكندر"));
  if (metkandra && !products.some((product) => product.category === NEW && normalizeArabic(product.name).includes("متكندر"))) {
    products.push({ ...metkandra, category: NEW, image: "المتكندرة.png" });
  }

  products.filter((product) => product.state !== "unavailable").slice(0, 6).forEach((product) => {
    products.push({ ...product, category: OFFERS, description: product.description || "عرض مميز من ب لبن." });
  });

  loadCustomProducts().forEach(add);
  return products.map((product, id) => ({ ...product, id }));
}

function groupProducts(products) {
  const map = new Map();
  products.forEach((product) => {
    if (!map.has(product.category)) map.set(product.category, []);
    map.get(product.category).push(product);
  });

  // Load admin-set category order; fall back to legacy hardcoded priority
  let savedOrder = [];
  try {
    savedOrder = JSON.parse(localStorage.getItem("blabenCategoryOrder") || "[]");
  } catch {}
  const priority = savedOrder.length ? savedOrder : [OFFERS, NEW, "الأكثر طلبا"];

  let customCatImages = {};
  try {
    customCatImages = JSON.parse(localStorage.getItem("blabenCategoryImages") || "{}");
  } catch {}

  return [...map.entries()]
    .sort(([a], [b]) => {
      const ai = priority.indexOf(a);
      const bi = priority.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return 0;
    })
    .map(([name, items]) => ({ name, items, image: customCatImages[name] || items[0]?.image }));
}

// Source of truth for the PUBLIC menu. If Supabase is configured, the live
// products table is what customers see — this is what makes admin edits
// actually show up. Falls back to the old static text-file catalog only
// when Supabase isn't configured (local dev without credentials).
function useCatalog() {
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    let ignore = false;

    function loadStaticFallback() {
      fetch("/names_and_descriptons.txt", { cache: "no-store" })
        .then((res) => res.text())
        .then((text) => !ignore && setCatalog(buildCatalog(parseMenu(text))))
        .catch(() => !ignore && setCatalog(buildCatalog([])));
    }

    if (!supabase) {
      loadStaticFallback();
      return () => {
        ignore = true;
      };
    }

    async function loadFromSupabase() {
      const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
      if (ignore) return;
      if (error || !data || !data.length) {
        loadStaticFallback();
        return;
      }
      setCatalog(data.map((row, index) => fromSupabaseProduct(row, index)));
    }

    loadFromSupabase();

    // Live updates: admin changes reflect for anyone with the menu open,
    // without needing to reload the page.
    const channel = supabase
      .channel("public:products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, loadFromSupabase)
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return catalog;
}

function useIntro() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setReady(true), reduced ? 80 : 3000);
    return () => window.clearTimeout(timer);
  }, []);
  return ready;
}

function Header({ current }) {
  const links = [
    ["01", "/version-1.html"],
    ["02", "/version-2.html"],
    ["03", "/version-3.html"],
    ["04", "/version-4.html"],
    ["05", "/version-5.html"],
    ["06", "/version-6.html"],
    ["07", "/version-7.html"],
  ];
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-blue-100/80 bg-white/85 px-3 py-2 backdrop-blur-xl md:px-10">
      <a href="/" className="block h-12 w-12 overflow-hidden rounded-full shadow-luxe md:h-14 md:w-14" aria-label="الرئيسية">
        <img src={asset("b.laben logo.jfif")} alt="b.laben" className="h-full w-full object-cover" />
      </a>
      <nav className="flex flex-wrap justify-end gap-1.5 md:gap-2" aria-label="روابط النسخ">
        {links.map(([label, href]) => (
          <a key={href} href={href} className={`grid h-9 w-9 place-items-center rounded-lg border text-sm font-black md:h-11 md:w-11 ${current === href ? "border-blaben-850 bg-blaben-850 text-white" : "border-blue-100 bg-white text-blaben-850"}`}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function PublicHeader({ query, onQuery, results, onOpen }) {
  const [open, setOpen] = useState(false);
  const hasQuery = query.trim().length > 0;
  return (
    <header className="sticky top-0 z-50 border-b border-blue-100/80 bg-white/90 px-3 py-2 backdrop-blur-xl md:px-10">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
        <a href="/" className="h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-luxe" aria-label="القائمة الرئيسية">
          <img src={asset("b.laben logo.jfif")} alt="b.laben" className="h-full w-full object-cover" />
        </a>
        <div className="relative flex-1">
          <label className="sr-only" htmlFor="menu-search">بحث في المنيو</label>
          <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blaben-50 px-4 py-2 shadow-sm focus-within:ring-4 focus-within:ring-blue-100">
            <span aria-hidden="true" className="text-xl text-blaben-850">⌕</span>
            <input
              id="menu-search"
              value={query}
              onChange={(event) => {
                onQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="ابحث عن منتج، تصنيف، سعر..."
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-blaben-950 outline-none placeholder:text-slate-400 md:text-base"
            />
            {query && (
              <button type="button" onClick={() => onQuery("")} className="rounded-full bg-white px-3 py-1 text-xs font-black text-blaben-850">
                مسح
              </button>
            )}
          </div>
          {open && hasQuery && (
            <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-lg border border-blue-100 bg-white p-2 shadow-luxe">
              {results.length ? (
                <div className="grid gap-2">
                  {results.slice(0, 12).map((product) => (
                    <button
                      key={`search-${product.id}`}
                      type="button"
                      onClick={() => {
                        onOpen(product);
                        setOpen(false);
                      }}
                      className="grid grid-cols-[64px_1fr] items-center gap-3 rounded-lg p-2 text-right transition hover:bg-blaben-50"
                    >
                      <img loading="lazy" decoding="async" src={asset(product.image)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <span>
                        <strong className="block leading-6 text-blaben-950">{product.name}</strong>
                        <small className="block text-slate-500">{product.category} · {priceSummary(product)}</small>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-center text-sm font-bold text-slate-500">لا توجد نتائج مطابقة</p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Intro({ ready }) {
  return (
    <div className={`fixed inset-0 z-50 grid place-items-center bg-white transition duration-500 ${ready ? "pointer-events-none invisible opacity-0" : "opacity-100"}`} aria-hidden="true">
      <img src={asset("b.laben logo.jfif")} alt="" className="w-44 rounded-full animate-introPop md:w-56" />
    </div>
  );
}

function ProductCard({ product, onOpen, compact = false }) {
  return (
    <article tabIndex={0} role="button" onClick={() => onOpen(product)} onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && onOpen(product)} className={`group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-luxe focus:outline-none focus:ring-4 focus:ring-blue-200 ${compact ? "" : "reveal-card"}`}>
      <div className={`${compact ? "h-36" : "h-48"} relative overflow-hidden bg-blaben-50`}>
        <img loading="lazy" decoding="async" src={asset(product.image)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {product.state === "unavailable" && <span className="absolute start-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-md">غير متاح</span>}
        {product.state === "coming_soon" && <span className="absolute start-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-white shadow-md animate-pulse">{COMING_SOON_LABEL}</span>}
      </div>
      <div className="grid gap-2 p-4">
        <h3 className="text-lg font-black leading-relaxed text-blaben-950">{product.name}</h3>
        {product.description && <p className="line-clamp-3 text-sm leading-7 text-slate-500">{product.description}</p>}
        <span className="w-max rounded-full bg-blaben-100 px-3 py-2 text-sm font-black text-blaben-850">{priceSummary(product)}</span>
      </div>
    </article>
  );
}

function ProductModal({ product, onClose }) {
  if (!product) return null;
  const pricing = priceDetails(product);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <button className="absolute inset-0 bg-blaben-950/55 backdrop-blur-md" aria-label="إغلاق" onClick={onClose} />
      <section role="dialog" aria-modal="true" className="relative grid max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl md:grid-cols-[.95fr_1fr]">
        <button className="absolute start-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-2xl font-black text-blaben-950 shadow" onClick={onClose} aria-label="إغلاق">×</button>
        <div className="relative h-72 bg-blaben-50 md:h-full md:min-h-[430px]">
          <img loading="lazy" decoding="async" src={asset(product.image)} alt={product.name} className="h-full w-full object-cover" />
          {product.state === "coming_soon" && <span className="absolute start-3 top-3 rounded-full bg-amber-500 px-3 py-1.5 text-sm font-black text-white shadow-md animate-pulse">{COMING_SOON_LABEL}</span>}
        </div>
        <div className="grid content-center gap-4 overflow-y-auto p-6 md:p-10">
          <p className="font-black text-blaben-700">{product.category}</p>
          <h2 className="text-3xl font-black leading-tight text-blaben-950 md:text-5xl">{product.name}</h2>
          <p className="leading-8 text-slate-600">{product.description || "لا يوجد وصف إضافي لهذا المنتج حاليا."}</p>
          {pricing.rows.length ? (
            <div className="grid gap-2">
              <h3 className="font-black text-blaben-950">تفاصيل السعر</h3>
              {pricing.rows.map((variant, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-blaben-50 px-4 py-3">
                  <span className="font-black text-blaben-950">{variant.label || "خيار"}</span>
                  <span className="font-black text-blaben-850">{variant.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="w-max rounded-full bg-blaben-100 px-4 py-2 font-black text-blaben-850">{pricing.display}</span>
          )}
          <span className={`w-max rounded-full px-4 py-2 font-black ${product.state === "unavailable" ? "bg-red-50 text-red-600" : product.state === "coming_soon" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{product.state === "unavailable" ? "غير متاح حاليا" : product.state === "coming_soon" ? COMING_SOON_LABEL : "متاح"}</span>
        </div>
      </section>
    </div>
  );
}

function CategoryRail({ groups }) {
  return (
    <div className="sticky top-[65px] z-30 mb-7 flex gap-2 overflow-x-auto rounded-full bg-white/80 px-3 py-3 backdrop-blur-xl [direction:ltr] md:top-[78px]">
      {groups.map((group, index) => (
        <a key={group.name} href={`#cat-${index}`} className="shrink-0 rounded-full border border-blue-100 bg-white px-4 py-3 text-sm font-black text-blaben-850 transition hover:-translate-y-0.5 hover:bg-blaben-850 hover:text-white [direction:rtl]">
          {group.name}
        </a>
      ))}
    </div>
  );
}

function Section({ group, index, onOpen }) {
  return (
    <section id={`cat-${index}`} className="scroll-mt-28 py-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-3xl font-black text-blaben-950 md:text-5xl">{group.name}</h2>
        <span className="shrink-0 text-slate-500">{group.items.length} منتج</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {group.items.map((product) => <ProductCard key={`${product.id}-${group.name}`} product={product} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

function Chooser() {
  const cards = [
    ["01", "Premium Scroll Menu", "أسرع نسخة للتصفح، بتابات ثابتة ومنتجات واضحة.", "/version-1.html"],
    ["02", "Visual Category World", "تصنيفات كبيرة بالصور وتجربة بصرية.", "/version-2.html"],
    ["03", "Product Spotlight Menu", "منتجات بارزة ومساحات أقوى للصور.", "/version-3.html"],
    ["04", "Presentation Menu", "حركات دخول مع السكرول زي شرائح العرض.", "/version-4.html"],
    ["05", "Luxury Magazine Menu", "النسخة التي أنصح بها كمنيو نهائي.", "/version-5.html"],
    ["06", "Carousel Showcase", "كاروسيل ملء الشاشة مع تأثيرات زجاجية وعرض تفاعلي.", "/version-6.html"],
    ["07", "Tabbed Accordion", "تابات أنيقة مع كروت بتقلب وألوان دافية فاخرة.", "/version-7.html"],
  ];
  return (
    <main className="mx-auto min-h-screen w-[min(1100px,calc(100%-24px))] py-10">
      <section className="grid items-center gap-8 py-10 md:grid-cols-[180px_1fr]">
        <img src={asset("b.laben logo.jfif")} alt="b.laben" className="h-40 w-40 rounded-full object-cover shadow-luxe" />
        <div>
          <p className="font-black text-blaben-700">منيو b.laben التفاعلي</p>
          <h1 className="mt-3 text-5xl font-black leading-none text-blaben-950 md:text-7xl">اختار تجربة العرض المناسبة</h1>
          <p className="mt-5 max-w-2xl leading-8 text-slate-500">نسخة React + Tailwind منظمة، سريعة، وسهلة التطوير.</p>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([number, title, copy, href]) => (
          <a key={href} href={href} className="grid min-h-64 content-end gap-4 rounded-lg border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-luxe">
            <span className="text-3xl font-black text-blaben-700">{number}</span>
            <strong className="text-2xl text-blaben-950">{title}</strong>
            <span className="leading-7 text-slate-500">{copy}</span>
          </a>
        ))}
      </section>
    </main>
  );
}

function Version1({ groups, onOpen }) {
  const featured = groups.flatMap((group) => group.items).slice(0, 2);
  return (
    <main className="mx-auto w-[min(1180px,calc(100%-24px))] pb-16">
      <section className="grid min-h-[calc(100vh-82px)] items-center gap-8 py-10 md:grid-cols-[1fr_.9fr]">
        <div className="animate-slideUp">
          <p className="font-black text-blaben-700">b.laben online menu</p>
          <h1 className="mt-3 text-6xl font-black leading-none text-blaben-950 md:text-8xl">منيو بلبن</h1>
          <p className="mt-5 max-w-xl leading-8 text-slate-500">حلوياتك المفضلة في تجربة سريعة وواضحة، اختار التصنيف وشوف كل المنتجات بالصور والأسعار.</p>
        </div>
        <div className="relative min-h-96">
          {featured.map((product, index) => (
            <button key={product.id} onClick={() => onOpen(product)} className={`absolute overflow-hidden rounded-lg shadow-luxe ${index ? "bottom-0 left-0 h-56 w-56 border-8 border-white" : "right-0 top-4 h-80 w-72"}`}>
              <img loading="lazy" decoding="async" src={asset(product.image)} alt={product.name} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </section>
      <CategoryRail groups={groups} />
      {groups.map((group, index) => <Section key={group.name} group={group} index={index} onOpen={onOpen} />)}
    </main>
  );
}

function Version2({ groups, onOpen }) {
  const [selected, setSelected] = useState(0);
  const group = groups[selected] || groups[0];
  return (
    <main className="mx-auto w-[min(1180px,calc(100%-24px))] pb-16">
      <section className="py-10">
        <p className="font-black text-blaben-700">تصفح بالصور</p>
        <h1 className="mt-3 text-5xl font-black text-blaben-950 md:text-7xl">كل دنيا ليها طعمها</h1>
        <p className="mt-4 leading-8 text-slate-500">اختار التصنيف من الصور، والمنتجات هتظهر فوراً بشكل بسيط وواضح.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((item, index) => (
          <button key={item.name} onClick={() => setSelected(index)} className={`relative min-h-64 overflow-hidden rounded-lg text-right text-white shadow-luxe transition hover:-translate-y-1 ${selected === index ? "ring-4 ring-blaben-100" : ""}`}>
            <img loading="lazy" decoding="async" src={asset(item.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-blaben-950/85 to-transparent" />
            <strong className="absolute bottom-5 right-5 z-10 text-2xl">{item.name}</strong>
          </button>
        ))}
      </section>
      {group && <Section group={group} index={selected} onOpen={onOpen} />}
    </main>
  );
}

function Version3({ groups, onOpen }) {
  const all = groups.flatMap((group) => group.items);
  const hero = all.find((item) => item.description.length > 70) || all[0];
  return (
    <main className="mx-auto w-[min(1180px,calc(100%-24px))] pb-16">
      <section className="py-10">
        <p className="font-black text-blaben-700">Spotlight Menu</p>
        <h1 className="mt-3 text-5xl font-black text-blaben-950 md:text-7xl">منتجات تشد العين وتخلي الاختيار أسهل</h1>
      </section>
      {hero && (
        <button onClick={() => onOpen(hero)} className="relative mb-6 min-h-[520px] w-full overflow-hidden rounded-lg text-right text-white shadow-luxe">
          <img loading="lazy" decoding="async" src={asset(hero.image)} alt={hero.name} className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-blaben-950/90 to-transparent" />
          <div className="absolute bottom-8 right-8 z-10 max-w-xl">
            <h2 className="text-5xl font-black">{hero.name}</h2>
            <p className="mt-4 leading-8">{hero.description || hero.category}</p>
            <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 font-black text-blaben-850">{priceSummary(hero)}</span>
          </div>
        </button>
      )}
      <CategoryRail groups={groups} />
      {groups.slice(0, 5).map((group, index) => <Section key={group.name} group={group} index={index} onOpen={onOpen} />)}
    </main>
  );
}

function Version4({ groups, onOpen }) {
  const featured = groups.flatMap((group) => group.items).filter((item) => item.description).slice(0, 4);
  return (
    <main className="mx-auto w-[min(1220px,calc(100%-24px))] pb-16">
      <section className="grid min-h-[calc(100vh-82px)] content-center gap-6 py-10">
        <p className="font-black text-white/85">b.laben presentation menu</p>
        <h1 className="max-w-3xl text-6xl font-black leading-none text-white drop-shadow-2xl md:text-8xl">كل سكرول يحكي جزء من المنيو</h1>
        <p className="max-w-2xl leading-8 text-white/85">تجربة بسيطة وواضحة، لكن كل قسم يدخل بحركة زي شرائح العرض.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <button key={product.id} onClick={() => onOpen(product)} className="reveal-panel relative min-h-64 overflow-hidden rounded-lg text-right text-white shadow-luxe">
              <img loading="lazy" decoding="async" src={asset(product.image)} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-blaben-950/90 to-transparent" />
              <strong className="absolute bottom-5 right-5 z-10 text-xl">{product.name}</strong>
            </button>
          ))}
        </div>
      </section>
      <CategoryRail groups={groups} />
      {groups.map((group, index) => {
        const lead = group.items[0];
        return (
          <section key={group.name} id={`cat-${index}`} className="reveal-panel scroll-mt-28 py-12">
            <button onClick={() => onOpen(lead)} className="relative mb-5 min-h-[460px] w-full overflow-hidden rounded-lg text-right text-white shadow-luxe">
              <img loading="lazy" decoding="async" src={asset(lead.image)} alt={lead.name} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-blaben-950/90 to-transparent" />
              <div className="absolute bottom-8 right-8 z-10 max-w-2xl">
                <p className="font-black text-white/80">{group.name}</p>
                <h2 className="mt-2 text-5xl font-black md:text-7xl">{lead.name}</h2>
                <p className="mt-4 leading-8">{lead.description || "اضغط على المنتج لعرض التفاصيل."}</p>
              </div>
            </button>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.slice(1, 7).map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} />)}
            </div>
          </section>
        );
      })}
    </main>
  );
}

function Version5({ groups, onOpen }) {
  const all = groups.flatMap((group) => group.items);
  const hero = all.find((item) => item.description.length > 90) || all[0];
  return (
    <main className="mx-auto w-[min(1240px,calc(100%-24px))] pb-16">
      {hero && (
        <section className="grid min-h-[calc(100vh-96px)] gap-4 py-8 lg:grid-cols-[1.35fr_.65fr]">
          <button onClick={() => onOpen(hero)} className="reveal-panel relative min-h-[560px] overflow-hidden rounded-lg text-right text-white shadow-luxe">
            <img loading="lazy" decoding="async" src={asset(hero.image)} alt={hero.name} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-blaben-950/90 to-transparent" />
            <div className="absolute bottom-8 right-8 z-10 max-w-2xl">
              <p className="font-black text-white/80">اختيارنا للمنيو</p>
              <h1 className="mt-3 text-6xl font-black leading-none md:text-8xl">{hero.name}</h1>
              <p className="mt-4 leading-8">{hero.description || hero.category}</p>
              <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 font-black text-blaben-850">{priceSummary(hero)}</span>
            </div>
          </button>
          <aside className="reveal-panel grid content-end rounded-lg border border-blue-100 bg-white p-8 shadow-sm">
            <p className="font-black text-blaben-700">Version 5</p>
            <h2 className="mt-3 text-4xl font-black text-blaben-950">Luxury Magazine Menu</h2>
            <p className="mt-4 leading-8 text-slate-500">دي النسخة اللي أنصح بها كمنيو نهائي: شكل فاخر، صور كبيرة، قراءة سهلة، وتصنيفات واضحة من غير تعقيد.</p>
          </aside>
        </section>
      )}
      <CategoryRail groups={groups} />
      {groups.map((group, index) => <Section key={group.name} group={group} index={index} onOpen={onOpen} />)}
    </main>
  );
}

function Version6({ groups, onOpen }) {
  const all = groups.flatMap((g) => g.items);
  const featured = all.filter((p) => p.image && p.state !== "unavailable").slice(0, 8);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || !featured.length) return;
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, featured.length]);

  const go = (dir) => setSlide((s) => (s + dir + featured.length) % featured.length);

  return (
    <main className="pb-16">
      {/* ── Full-screen carousel ── */}
      <div
        className="v6-carousel-wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {featured.map((product, i) => (
          <div
            key={product.id}
            className={`v6-slide ${i === slide ? "active" : ""}`}
            onClick={() => onOpen(product)}
          >
            <img loading="lazy" decoding="async" src={asset(product.image)} alt={product.name} />
            <div className="v6-gradient" />
            <div className="v6-glass">
              <p className="text-sm font-bold opacity-80">{product.category}</p>
              <h2 className="mt-1 text-3xl font-black leading-tight md:text-5xl">{product.name}</h2>
              {product.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-7 opacity-90">{product.description}</p>
              )}
              <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-black text-blaben-850">
                {priceSummary(product)}
              </span>
            </div>
          </div>
        ))}

        {/* Nav arrows */}
        <button className="v6-nav v6-nav-next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="التالي">‹</button>
        <button className="v6-nav v6-nav-prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="السابق">›</button>

        {/* Dot indicators */}
        <div className="v6-dots">
          {featured.map((_, i) => (
            <button
              key={i}
              className={`v6-dot ${i === slide ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setSlide(i); }}
              aria-label={`الشريحة ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Category strip ── */}
      <div className="mx-auto w-[min(1200px,calc(100%-24px))]">
        <div className="sticky top-[65px] z-30 my-6 flex gap-2 overflow-x-auto rounded-full bg-white/80 px-3 py-3 backdrop-blur-xl [direction:ltr] md:top-[78px]">
          {groups.map((group, index) => (
            <a
              key={group.name}
              href={`#v6-cat-${index}`}
              className="shrink-0 rounded-full border border-blue-100 bg-white px-4 py-3 text-sm font-black text-blaben-850 transition hover:-translate-y-0.5 hover:bg-blaben-850 hover:text-white [direction:rtl]"
            >
              {group.name}
            </a>
          ))}
        </div>

        {/* ── Compact list grid ── */}
        {groups.map((group, gIdx) => (
          <section key={group.name} id={`v6-cat-${gIdx}`} className="scroll-mt-28 py-6">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-black text-blaben-950 md:text-4xl">{group.name}</h2>
              <span className="shrink-0 text-sm text-slate-500">{group.items.length} منتج</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((product) => (
                <button
                  key={`${product.id}-${group.name}`}
                  className="v6-list-card"
                  onClick={() => onOpen(product)}
                >
                  <img loading="lazy" decoding="async" src={asset(product.image)} alt={product.name} />
                  <div className="grid gap-1 text-right">
                    <h3 className="text-sm font-black leading-relaxed text-blaben-950">{product.name}</h3>
                    <span className="text-xs font-bold text-blaben-700">{priceSummary(product)}</span>
                    {product.state === "unavailable" && (
                      <span className="text-xs font-bold text-red-500">غير متاح</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function Version7({ groups, onOpen }) {
  const [activeTab, setActiveTab] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const group = groups[activeTab] || groups[0];
  const heroProduct = group?.items[0];

  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Reset animation key when tab changes
  const [animKey, setAnimKey] = useState(0);
  const switchTab = (idx) => {
    setActiveTab(idx);
    setAnimKey((k) => k + 1);
  };

  return (
    <main className="mx-auto w-[min(1200px,calc(100%-24px))] pb-16">
      {/* ── Header area ── */}
      <section className="py-8">
        <p className="font-black text-gold-500">Tabbed Menu</p>
        <h1 className="mt-2 text-5xl font-black text-blaben-950 md:text-7xl">اكتشف كل الأصناف</h1>
        <p className="mt-4 max-w-2xl leading-8 text-slate-500">
          اختار التصنيف من الأسفل وشوف كل المنتجات بتفاصيلها، اقلب الكارت لمعلومات أكتر.
        </p>
      </section>

      {/* ── Hero background with selected category ── */}
      {heroProduct && (
        <div className="v7-hero-bg" onClick={() => onOpen(heroProduct)}>
          <img loading="lazy" decoding="async" src={asset(heroProduct.image)} alt={heroProduct.name} />
          <div className="v7-hero-text">
            <p className="text-sm font-bold opacity-80">{group.name}</p>
            <h2 className="mt-1 text-4xl font-black md:text-6xl">{heroProduct.name}</h2>
            <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-black text-blaben-850">
              {priceSummary(heroProduct)}
            </span>
          </div>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="v7-tab-bar">
        {groups.map((g, i) => (
          <button
            key={g.name}
            className={`v7-tab ${i === activeTab ? "active" : ""}`}
            onClick={() => switchTab(i)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* ── Product grid with flip cards ── */}
      {group && (
        <section className="py-8" key={animKey}>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-black text-blaben-950 md:text-4xl">{group.name}</h2>
            <span className="shrink-0 text-sm text-slate-500">{group.items.length} منتج</span>
          </div>
          <div className="v7-grid">
            {group.items.map((product, pIdx) => (
              <div
                key={`${product.id}-${group.name}`}
                className={`v7-flip-card v7-stagger-item`}
                style={{ animationDelay: `${pIdx * 60}ms` }}
                onClick={() => onOpen(product)}
                tabIndex={0}
                role="button"
              >
                <div className="v7-flip-inner">
                  {/* Front */}
                  <div className="v7-flip-front">
                    <img loading="lazy" decoding="async" src={asset(product.image)} alt={product.name} />
                    {product.state === "coming_soon" && <span className="absolute start-2 top-2 rounded-full bg-amber-500 px-2 py-1 text-xs font-black text-white shadow-md animate-pulse">{COMING_SOON_LABEL}</span>}
                    <div className="v7-flip-front-info">
                      <h3 className="text-base font-black leading-relaxed text-blaben-950">
                        {product.name}
                      </h3>
                      {product.state === "unavailable" && (
                        <span className="text-xs font-bold text-red-500">غير متاح</span>
                      )}
                    </div>
                  </div>
                  {/* Back */}
                  <div className="v7-flip-back">
                    <p className="text-sm font-bold opacity-70">{product.category}</p>
                    <h3 className="text-2xl font-black">{product.name}</h3>
                    <p className="line-clamp-4 text-sm leading-7 opacity-90">
                      {product.description || "لا يوجد وصف إضافي لهذا المنتج."}
                    </p>
                    {hasVariants(product) ? (
                      <div className="grid gap-1.5">
                        {product.variants.map((variant, index) => (
                          <div key={index} className="flex items-center justify-between rounded-full bg-white/90 px-3 py-1.5 text-sm font-black text-blaben-850">
                            <span>{variant.label || "خيار"}</span>
                            <span>{variant.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-blaben-850">
                          {product.price}
                        </span>
                      </div>
                    )}
                    <span
                      className={`w-max rounded-full px-3 py-1.5 text-sm font-black ${
                        product.state === "unavailable" ? "bg-red-500/20 text-red-200" : product.state === "coming_soon" ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-200"
                      }`}
                    >
                      {product.state === "unavailable" ? "غير متاح" : product.state === "coming_soon" ? COMING_SOON_LABEL : "متاح"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Back to top ── */}
      <button
        className={`v7-back-to-top ${showTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="العودة للأعلى"
      >
        ↑
      </button>
    </main>
  );
}

function FinalPublicMenu({ groups, catalog, onOpen }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTop, setShowTop] = useState(false);
  const searchResults = useMemo(() => (query.trim() ? catalog.filter((product) => productMatches(product, query)) : []), [catalog, query]);
  const selectedGroup = selectedCategory === null ? null : groups[selectedCategory];
  const chooseCategory = (index) => {
    setSelectedCategory(index);
    window.setTimeout(scrollToProductPanel, 40);
  };

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <PublicHeader query={query} onQuery={setQuery} results={searchResults} onOpen={onOpen} />
      <main className="mx-auto w-[min(1240px,calc(100%-24px))] pb-20">
        <section className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="تصنيفات المنيو">
          {groups.map((group, index) => (
            <button
              key={group.name}
              type="button"
              onClick={() => chooseCategory(index)}
              className={`relative min-h-64 overflow-hidden rounded-lg text-right text-white shadow-luxe transition hover:-translate-y-1 ${selectedCategory === index || (selectedCategory === null && index === 0) ? "ring-4 ring-blaben-100" : ""}`}
            >
              <img loading="lazy" decoding="async" src={asset(group.image)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-blaben-950/90 via-blaben-950/24 to-transparent" />
              <span className="absolute bottom-5 right-5 z-10 grid gap-2">
                <small className="w-max rounded-full bg-white px-3 py-1 text-xs font-black text-blaben-850 animate-pulse">اضغط هنا للانتقال إلى المنتجات</small>
                <strong className="text-2xl">{group.name}</strong>
                <small className="font-bold text-white/80">{group.items.length} منتج</small>
              </span>
            </button>
          ))}
        </section>

        <section id="products-panel" className="mt-10 grid scroll-mt-28 gap-5">
          {selectedGroup && (
            <nav className="sticky top-[68px] z-30 -mx-3 overflow-x-auto rounded-lg border border-blue-100 bg-white/95 px-3 py-3 shadow-sm backdrop-blur-xl md:top-[82px]" aria-label="تغيير التصنيف">
              <div className="flex min-w-max gap-2">
                {groups.map((group, index) => (
                  <button
                    key={`sticky-${group.name}`}
                    type="button"
                    onClick={() => chooseCategory(index)}
                    className={`rounded-full px-4 py-2 text-sm font-black transition ${selectedCategory === index ? "bg-blaben-850 text-white shadow" : "bg-blaben-50 text-blaben-850 hover:bg-blaben-100"}`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </nav>
          )}
          {selectedGroup ? (
            <section id={`cat-${selectedCategory}`} key={selectedGroup.name} className="scroll-mt-32">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="text-3xl font-black text-blaben-950 md:text-5xl">{selectedGroup.name}</h2>
                <span className="shrink-0 text-sm text-slate-500">{selectedGroup.items.length} منتج</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedGroup.items.map((product) => (
                  <button key={`${selectedGroup.name}-${product.id}`} type="button" className="v6-list-card reveal-card" onClick={() => onOpen(product)}>
                    <span className="relative block shrink-0">
                      <img loading="lazy" decoding="async" src={asset(product.image)} alt={product.name} />
                      {product.state === "coming_soon" && <span className="absolute start-1 top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-md animate-pulse">{COMING_SOON_LABEL}</span>}
                    </span>
                    <div className="grid gap-1 text-right">
                      <h3 className="text-sm font-black leading-relaxed text-blaben-950">{product.name}</h3>
                      <span className="text-xs font-bold text-blaben-700">{priceSummary(product)}</span>
                      {product.state === "unavailable" && <span className="text-xs font-bold text-red-500">غير متاح</span>}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-lg border border-dashed border-blue-200 bg-white/80 p-6 text-center shadow-sm">
              <p className="text-xl font-black text-blaben-950">اختار تصنيف من الأعلى لعرض منتجاته فقط</p>
              <p className="mt-2 text-sm font-bold text-blaben-700">ابدأ من أول تصنيف أو استخدم البحث للوصول لأي منتج مباشرة.</p>
            </section>
          )}
        </section>
      </main>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-blaben-850 text-2xl font-black text-white shadow-luxe transition ${showTop ? "translate-y-0 opacity-100 animate-floatSoft" : "pointer-events-none translate-y-4 opacity-0"}`}
        aria-label="العودة إلى أعلى الصفحة"
      >
        ↑
      </button>
    </>
  );
}


// Map Supabase error messages to user-friendly Arabic messages
function mapSupabaseError(message) {
  const lower = (message || "").toLowerCase();
  if (lower.includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (lower.includes("email not confirmed")) return "يجب تأكيد البريد الإلكتروني أولاً.";
  if (lower.includes("invalid api key") || lower.includes("apikey")) return "إعدادات Supabase غير صحيحة. تحقق من مفتاح API.";
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch")) return "تعذر الاتصال بالخادم. تحقق من الاتصال بالإنترنت.";
  if (lower.includes("rate limit") || lower.includes("too many")) return "محاولات كثيرة جداً. انتظر قليلاً ثم حاول مرة أخرى.";
  if (lower.includes("user not found")) return "المستخدم غير موجود.";
  // Fallback: show the original error for debugging
  return `خطأ: ${message}`;
}

function AdminPortal({ catalog }) {
  const [items, setItems] = useState(loadCustomProducts());
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [connectionError, setConnectionError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const configured = Boolean(supabase);
  const source = configured ? items : items.length ? items : catalog;
  const filtered = query.trim() ? source.filter((product) => productMatches(product, query)) : source;

  // Verify that a user exists in admin_users table
  const verifyAdmin = async (userId) => {
    if (!supabase) return false;
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    console.log("Admin check:", { userId, admin, error });
    return Boolean(admin);
  };

  useEffect(() => {
    if (!supabase) return;
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("getSession error:", error);
          setConnectionError(true);
          setMessage("تعذر الاتصال بـ Supabase.");
          return;
        }
        console.log("Restored session:", data.session);
        if (data.session) {
          // Verify admin status on session restore
          const isAdmin = await verifyAdmin(data.session.user.id);
          if (!isAdmin) {
            console.warn("Session user is not an admin. Signing out.");
            await supabase.auth.signOut();
            setSession(null);
            setMessage("الحساب ليس مسؤولاً. تم تسجيل الخروج.");
            return;
          }
          setSession(data.session);
        }
      } catch (err) {
        console.error("Supabase connection failed:", err);
        setConnectionError(true);
        setMessage("تعذر الاتصال بـ Supabase. تحقق من إعدادات المشروع.");
      }
    };
    initSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Only update session via the listener if it's a sign-out event
      // Login sets session manually after admin verification
      if (!nextSession) setSession(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) return;
    supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setMessage("تعذر تحميل بيانات Supabase. راجع إعدادات الجدول والسياسات.");
          return;
        }
        setItems((data || []).map(fromSupabaseProduct));
      });
  }, [session]);

  const login = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!supabase) return;
    setIsLoggingIn(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("Login result:", { session: authData?.session, error });
      if (error) {
        console.error("Login error:", error);
        setMessage(mapSupabaseError(error.message));
        return;
      }
      // Verify admin authorization
      const isAdmin = await verifyAdmin(authData.session.user.id);
      console.log("Admin verification:", { userId: authData.session.user.id, isAdmin });
      if (!isAdmin) {
        await supabase.auth.signOut();
        setMessage("هذا الحساب ليس مسؤولاً.");
        return;
      }
      setSession(authData.session);
    } catch (err) {
      console.error("Login exception:", err);
      setMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const saveLocal = (next) => {
    const safe = next.map((product, index) => {
      const row = toSupabaseProduct(product);
      return {
        id: product.id || index,
        uuid: product.uuid,
        name: row.name,
        category: row.category,
        price: row.price,
        description: row.description,
        state: row.state,
        image: row.image_url,
        sort_order: row.sort_order,
        variants: row.variants,
      };
    });
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(safe));
    setItems(safe);
  };

  const removeProduct = async (product) => {
    if (configured && session && product.uuid) {
      const { error } = await supabase.from("products").delete().eq("id", product.uuid);
      if (error) {
        setMessage("تعذر حذف المنتج من Supabase.");
        return;
      }
    }
    saveLocal(items.filter((item) => item.id !== product.id && item.uuid !== product.uuid));
  };

  const updateProduct = async (product, patch) => {
    const nextProduct = { ...product, ...patch };
    if (configured && session && product.uuid) {
      const { error } = await supabase.from("products").update(toSupabaseProduct(nextProduct)).eq("id", product.uuid);
      if (error) {
        setMessage("تعذر حفظ التعديل في Supabase.");
        return;
      }
    }
    saveLocal(items.map((item) => (item.id === product.id || item.uuid === product.uuid ? nextProduct : item)));
  };

  const renameCategory = async (oldName, newName) => {
    if (configured && session) {
      const { error } = await supabase.from("products").update({ category: newName }).eq("category", oldName);
      if (error) {
        setMessage("تعذر إعادة تسمية التصنيف في Supabase.");
        return;
      }
      setItems(items.map((item) => (item.category === oldName ? { ...item, category: newName } : item)));
    } else {
      saveLocal(items.map((item) => (item.category === oldName ? { ...item, category: newName } : item)));
    }
  };

  const deleteCategory = async (name, mode = "uncategorize", targetCategory = "") => {
    const fallback = "غير مصنف";
    if (mode === "delete") {
      // Delete all products in this category
      if (configured && session) {
        const { error } = await supabase.from("products").delete().eq("category", name);
        if (error) {
          setMessage("تعذر حذف منتجات التصنيف من Supabase.");
          return;
        }
        setItems(items.filter((item) => item.category !== name));
      } else {
        saveLocal(items.filter((item) => item.category !== name));
      }
    } else {
      // Move products to fallback or target category
      const moveTo = mode === "move" && targetCategory ? targetCategory : fallback;
      if (configured && session) {
        const { error } = await supabase.from("products").update({ category: moveTo }).eq("category", name);
        if (error) {
          setMessage("تعذر نقل المنتجات في Supabase.");
          return;
        }
        setItems(items.map((item) => (item.category === name ? { ...item, category: moveTo } : item)));
      } else {
        saveLocal(items.map((item) => (item.category === name ? { ...item, category: moveTo } : item)));
      }
    }
  };

  const importStaticMenu = async () => {
    setMessage("جاري الاستيراد...");
    try {
      const res = await fetch("/names_and_descriptons.txt", { cache: "no-store" });
      const text = await res.text();
      const parsed = buildCatalog(parseMenu(text));
      const rows = parsed.map((product) => toSupabaseProduct(product));
      const { error } = await supabase.from("products").insert(rows);
      if (error) {
        setMessage("تعذر الاستيراد: " + error.message);
        return;
      }
      const { data } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
      setItems((data || []).map((row, index) => fromSupabaseProduct(row, index)));
      setMessage(`تم استيراد ${rows.length} منتج بنجاح. المنيو العام يعرض الآن بيانات Supabase.`);
    } catch {
      setMessage("حدث خطأ أثناء الاستيراد.");
    }
  };

  if (configured && !session) {
    return (
      <main className="mx-auto grid min-h-[calc(100vh-70px)] w-[min(520px,calc(100%-24px))] content-center py-10">
        <section className="rounded-lg border border-blue-100 bg-white p-6 shadow-luxe">
          <p className="font-black text-blaben-700">بوابة الإدارة</p>
          <h1 className="mt-3 text-4xl font-black text-blaben-950">تسجيل دخول الأدمن</h1>
          <p className="mt-3 leading-7 text-slate-500">الرابط وحده لا يحمي الصفحة. الدخول هنا يعتمد على Supabase Auth و RLS.</p>
          {connectionError ? (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-600">
              <p>تعذر الاتصال بـ Supabase.</p>
              <p className="mt-1 text-xs text-red-500">تحقق من إعدادات VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.</p>
            </div>
          ) : (
            <form onSubmit={login} className="mt-5 grid gap-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="rounded-lg border border-blue-100 p-3" required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="rounded-lg border border-blue-100 p-3" required />
              <button disabled={isLoggingIn} className="rounded-lg bg-blaben-850 px-5 py-3 font-black text-white disabled:opacity-60">{isLoggingIn ? "جاري الدخول..." : "دخول"}</button>
            </form>
          )}
          {message && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">{message}</p>}
          {/* Dev debug panel — only visible during development */}
          {import.meta.env.DEV && (
            <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <summary className="cursor-pointer font-black text-slate-700">🛠 Debug Info (dev only)</summary>
              <div className="mt-2 grid gap-1 font-mono">
                <p><strong>Supabase URL:</strong> {supabaseUrl || "❌ MISSING"}</p>
                <p><strong>Anon Key:</strong> {supabaseAnonKey ? `${supabaseAnonKey.slice(0, 20)}...` : "❌ MISSING"}</p>
                <p><strong>Connection:</strong> {connectionError ? "❌ Failed" : "✅ OK"}</p>
                <p><strong>Session:</strong> {session ? "✅ Active" : "❌ None"}</p>
                <p><strong>User ID:</strong> {session?.user?.id || "—"}</p>
                <p><strong>User Email:</strong> {session?.user?.email || "—"}</p>
                <p><strong>Current URL:</strong> {window.location.href}</p>
              </div>
            </details>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-24px))] py-8">
      <section className="mb-5 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <p className="font-black text-blaben-700">بوابة الإدارة</p>
        <h1 className="mt-2 text-4xl font-black text-blaben-950 md:text-6xl">إدارة المنيو</h1>
        <p className="mt-3 leading-7 text-slate-500">
          {configured ? "الوضع الآمن مفعل عبر Supabase. التعديلات تتطلب جلسة أدمن." : "Supabase غير مضبوط حالياً، لذلك هذه نسخة محلية للتجربة فقط وليست آمنة للنشر."}
        </p>
        
        <div className="mt-6 flex gap-2 border-b border-blue-100 pb-4">
          <button onClick={() => setActiveTab("products")} className={`flex-1 rounded-lg py-3 text-sm md:text-base font-black transition ${activeTab === "products" ? "bg-blaben-850 text-white shadow-md" : "bg-blaben-50 text-blaben-850 hover:bg-blaben-100"}`}>إدارة المنتجات</button>
          <button onClick={() => setActiveTab("categories")} className={`flex-1 rounded-lg py-3 text-sm md:text-base font-black transition ${activeTab === "categories" ? "bg-blaben-850 text-white shadow-md" : "bg-blaben-50 text-blaben-850 hover:bg-blaben-100"}`}>إدارة التصنيفات</button>
        </div>

        {activeTab === "products" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث عن منتج..." className="min-w-64 flex-1 rounded-lg border border-blue-100 p-3" />
            {configured && session && <button onClick={() => supabase.auth.signOut()} className="rounded-lg bg-blaben-100 px-4 py-3 font-black text-blaben-850">تسجيل خروج</button>}
          </div>
        )}
        
        {message && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-700">{message}</p>}

        {configured && session && items.length === 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-black text-amber-800">جدول المنتجات في Supabase فارغ حالياً، والمنيو الذي يظهر للزبائن مبني على الملف الثابت القديم.</p>
            <button onClick={importStaticMenu} className="mt-3 rounded-lg bg-amber-600 px-4 py-2 font-black text-white">استيراد المنيو الحالي إلى Supabase (مرة واحدة)</button>
          </div>
        )}
      </section>

      {activeTab === "products" ? (
        <>
          <AdminCreateForm categories={Array.from(new Set(catalog.map(p => p.category).concat(items.map(p => p.category))))} items={items} saveLocal={saveLocal} configured={configured} session={session} setMessage={setMessage} />
          <section className="mt-6">
            {query.trim() && <p className="mb-3 text-sm font-bold text-slate-500">{filtered.length ? `${filtered.length} نتيجة` : "لا توجد نتائج مطابقة للبحث."}</p>}
            <div className="grid gap-3" style={{ minHeight: "200px" }}>
              {filtered.map((product) => (
                <AdminProductRow key={`${product.uuid || product.id}-${product.name}`} product={product} onUpdate={updateProduct} onDelete={removeProduct} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <AdminCategoryManager products={source} configured={configured} session={session} onRenameCategory={renameCategory} onDeleteCategory={deleteCategory} setMessage={setMessage} />
      )}
    </main>
  );
}

function fromSupabaseProduct(item, index = 0) {
  return {
    id: index,
    uuid: item.id,
    name: limitText(item.name, 90),
    category: limitText(item.category, 70),
    price: limitText(item.price, 60),
    description: limitText(item.description || "", 500),
    state: item.state || (item.unavailable ? "unavailable" : "available"),
    image: isSafeImageSrc(item.image_url) ? item.image_url : "b.laben logo.jfif",
    sort_order: item.sort_order || 0,
    variants: Array.isArray(item.variants) ? item.variants : [],
  };
}

function toSupabaseProduct(product) {
  return {
    name: limitText(product.name, 90),
    category: limitText(product.category, 70),
    price: limitText(product.price, 60),
    description: limitText(product.description || "", 500),
    state: ["available", "unavailable", "coming_soon"].includes(product.state) ? product.state : "available",
    image_url: isSafeImageSrc(product.image) ? product.image : "b.laben logo.jfif",
    sort_order: product.sort_order || 0,
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant) => ({
          label: limitText(variant.label, 40),
          price: limitText(variant.price, 40),
        })).filter((variant) => variant.label && variant.price)
      : [],
  };
}

function AdminCreateForm({ categories, items, saveLocal, configured, session, setMessage }) {
  const [preview, setPreview] = useState("");
  const [catPreview, setCatPreview] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");
  const [newCategory, setNewCategory] = useState("");
  const [variants, setVariants] = useState([]);

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const category = isNewCategory ? newCategory : selectedCategory;
    if (!category || !category.trim()) return;

    const categoryName = category.trim();

    const catFile = data.get("categoryImage");
    if (isNewCategory && catFile && catFile.size) {
      if (!isAllowedImageFile(catFile)) {
        setMessage("صورة التصنيف يجب أن تكون PNG أو JPG أو WEBP أو GIF وأقل من 3MB.");
        return;
      }
      try {
        const catImgBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(catFile);
        });
        const stored = JSON.parse(localStorage.getItem("blabenCategoryImages") || "{}");
        stored[categoryName] = catImgBase64;
        localStorage.setItem("blabenCategoryImages", JSON.stringify(stored));
      } catch (e) {
        console.error("Could not save category image", e);
      }
    }

    const file = data.get("image");
    let image = "b.laben logo.jfif";
    if (file && file.size) {
      if (!isAllowedImageFile(file)) {
        setMessage("صورة المنتج يجب أن تكون PNG أو JPG أو WEBP أو GIF وأقل من 3MB.");
        return;
      }
      image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    const product = {
      id: Date.now(),
      category: categoryName,
      name: limitText(data.get("name"), 90),
      price: limitText(data.get("price"), 60),
      description: limitText(data.get("description"), 500),
      state: data.get("state"),
      image,
      variants: variants.map((variant) => ({
        label: limitText(variant.label, 40),
        price: limitText(variant.price, 40),
      })).filter((variant) => variant.label && variant.price),
    };
    if (configured && session) {
      const { data: inserted, error } = await supabase.from("products").insert(toSupabaseProduct(product)).select().single();
      if (error) {
        setMessage("تعذر إضافة المنتج إلى Supabase.");
        return;
      }
      saveLocal([...items, fromSupabaseProduct(inserted, items.length)]);
    } else {
      saveLocal([...items, { ...product, state: product.state }]);
    }
    
    event.currentTarget.reset();
    setPreview("");
    setCatPreview("");
    setIsNewCategory(false);
    setSelectedCategory(categories[0] || "");
    setNewCategory("");
    setVariants([]);
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-xl border border-blue-100 bg-white p-5 shadow-sm md:grid-cols-2">
      
      {/* Category Section */}
      <div className="md:col-span-2 rounded-xl border border-blue-100/60 bg-gradient-to-b from-blue-50/40 to-transparent p-4">
        <label className="mb-3 block font-black text-blaben-950 text-lg">1. إعداد التصنيف</label>
        <div className="flex gap-2">
          {!isNewCategory ? (
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 rounded-lg border border-blue-100 p-3 font-normal shadow-sm">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required placeholder="اسم التصنيف الجديد" className="flex-1 rounded-lg border border-blue-100/50 bg-white/60 p-3 font-normal shadow-inner backdrop-blur-sm transition focus:bg-white" />
          )}
          <button type="button" onClick={() => setIsNewCategory(!isNewCategory)} className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-black text-blaben-850 shadow-sm transition hover:bg-blaben-50">
            {isNewCategory ? "إلغاء" : "+ جديد"}
          </button>
        </div>
        {isNewCategory && (
          <div className="mt-3 grid gap-2 rounded-lg border border-blue-100/40 bg-white/40 p-3 shadow-sm backdrop-blur-sm">
            <label className="text-sm font-black text-blaben-850">صورة التصنيف (اختياري)</label>
            <input name="categoryImage" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setCatPreview(e.target.files?.[0] && isAllowedImageFile(e.target.files[0]) ? URL.createObjectURL(e.target.files[0]) : "")} className="rounded-lg border border-white/60 bg-white/50 p-2 text-sm font-normal shadow-sm backdrop-blur-sm transition hover:bg-white/80" />
            {catPreview && <img src={catPreview} alt="معاينة التصنيف" className="h-16 w-16 rounded-lg object-cover shadow-sm" />}
            <p className="text-xs text-slate-500">هذه الصورة مخصصة للظهور كواجهة للتصنيف (مثل نسخة 2).</p>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="md:col-span-2 mt-1">
        <label className="mb-2 block border-b border-blue-50 pb-2 font-black text-blaben-950 text-lg">2. تفاصيل المنتج</label>
      </div>

      <Field label="اسم المنتج" name="name" placeholder="مثال: قشطوطة مانجو" />
      <Field label="السعر الأساسي" name="price" placeholder="مثال: 120 جنيه" />
      <label className="grid gap-2 font-black text-blaben-950">الحالة<select name="state" className="rounded-lg border border-blue-100 p-3 font-normal"><option value="available">متاح</option><option value="unavailable">غير متاح</option><option value="coming_soon">قريبا</option></select></label>
      <VariantEditor variants={variants} onChange={setVariants} />
      <label className="grid gap-2 font-black text-blaben-950 md:col-span-2">الوصف<textarea name="description" rows="3" className="rounded-lg border border-blue-100 p-3 font-normal" /></label>
      <label className="grid gap-2 font-black text-blaben-950 md:col-span-2">الصورة<input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setPreview(e.target.files?.[0] && isAllowedImageFile(e.target.files[0]) ? URL.createObjectURL(e.target.files[0]) : "")} className="rounded-lg border border-blue-100 p-3 font-normal" /></label>
      {preview && <img src={preview} alt="" className="h-32 w-32 rounded-lg object-cover" />}
      <button className="rounded-lg bg-blaben-850 px-5 py-3 font-black text-white md:col-span-2">إضافة المنتج</button>
    </form>
  );
}

function CategoryDeleteModal({ name, count, categories, onClose, onConfirm }) {
  const [mode, setMode] = useState("uncategorize");
  const [targetCategory, setTargetCategory] = useState("");
  const otherCategories = categories.filter((c) => c !== name);

  const handleConfirm = () => {
    if (mode === "move" && !targetCategory) return;
    onConfirm(name, mode, targetCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button className="absolute inset-0 bg-blaben-950/55 backdrop-blur-md" aria-label="إغلاق" onClick={onClose} />
      <section role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-blaben-950">حذف تصنيف "{name}"</h2>
        {count > 0 && (
          <p className="mt-2 text-sm leading-7 text-slate-500">
            يوجد <strong className="text-blaben-950">{count}</strong> منتج داخل هذا التصنيف. اختر ماذا تريد أن يحصل لهم:
          </p>
        )}
        <div className="mt-4 grid gap-3">
          <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${mode === "uncategorize" ? "border-blaben-850 bg-blaben-50" : "border-blue-100 hover:bg-blue-50"}`}>
            <input type="radio" name="deleteMode" value="uncategorize" checked={mode === "uncategorize"} onChange={() => setMode("uncategorize")} className="mt-1" />
            <div>
              <p className="font-black text-blaben-950">نقل إلى "غير مصنف"</p>
              <p className="text-xs text-slate-500">المنتجات تبقى موجودة لكن بدون تصنيف.</p>
            </div>
          </label>
          {otherCategories.length > 0 && (
            <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${mode === "move" ? "border-blaben-850 bg-blaben-50" : "border-blue-100 hover:bg-blue-50"}`}>
              <input type="radio" name="deleteMode" value="move" checked={mode === "move"} onChange={() => setMode("move")} className="mt-1" />
              <div className="flex-1">
                <p className="font-black text-blaben-950">نقل إلى تصنيف آخر</p>
                {mode === "move" && (
                  <select value={targetCategory} onChange={(e) => setTargetCategory(e.target.value)} className="mt-2 w-full rounded-lg border border-blue-100 p-2 text-sm">
                    <option value="">— اختر التصنيف —</option>
                    {otherCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>
            </label>
          )}
          <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${mode === "delete" ? "border-red-500 bg-red-50" : "border-blue-100 hover:bg-blue-50"}`}>
            <input type="radio" name="deleteMode" value="delete" checked={mode === "delete"} onChange={() => setMode("delete")} className="mt-1" />
            <div>
              <p className="font-black text-red-600">حذف المنتجات نهائياً</p>
              <p className="text-xs text-red-500">سيتم حذف التصنيف وجميع المنتجات بداخله بشكل دائم.</p>
            </div>
          </label>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={handleConfirm} disabled={mode === "move" && !targetCategory} className={`flex-1 rounded-lg px-4 py-2.5 font-black text-white disabled:opacity-40 ${mode === "delete" ? "bg-red-600" : "bg-blaben-850"}`}>
            {mode === "delete" ? "حذف نهائياً" : "تأكيد"}
          </button>
          <button onClick={onClose} className="flex-1 rounded-lg bg-slate-100 px-4 py-2.5 font-black text-slate-700">إلغاء</button>
        </div>
      </section>
    </div>
  );
}

function AdminCategoryManager({ products, configured, session, onRenameCategory, onDeleteCategory, setMessage }) {
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [catImages, setCatImages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blabenCategoryImages") || "{}");
    } catch {
      return {};
    }
  });
  const [catOrder, setCatOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blabenCategoryOrder") || "[]");
    } catch {
      return [];
    }
  });

  const counts = useMemo(() => {
    const map = new Map();
    products.forEach((product) => map.set(product.category, (map.get(product.category) || 0) + 1));
    return map;
  }, [products]);

  // Sort categories by saved order; new categories go to the end
  const categories = useMemo(() => {
    const allCats = Array.from(counts.keys());
    const ordered = [];
    catOrder.forEach((c) => { if (allCats.includes(c)) ordered.push(c); });
    allCats.forEach((c) => { if (!ordered.includes(c)) ordered.push(c); });
    return ordered;
  }, [counts, catOrder]);

  const saveCatOrder = (next) => {
    localStorage.setItem("blabenCategoryOrder", JSON.stringify(next));
    setCatOrder(next);
  };

  const saveCatImages = (next) => {
    localStorage.setItem("blabenCategoryImages", JSON.stringify(next));
    setCatImages(next);
  };

  const uploadCatImage = async (name, file) => {
    if (!isAllowedImageFile(file)) {
      setMessage("صورة التصنيف يجب أن تكون PNG أو JPG أو WEBP أو GIF وأقل من 3MB.");
      return;
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    saveCatImages({ ...catImages, [name]: dataUrl });
  };

  const rename = async (oldName) => {
    const newName = (drafts[oldName] ?? oldName).trim();
    if (!newName || newName === oldName) return;
    if (categories.includes(newName)) {
      setMessage(`التصنيف "${newName}" موجود بالفعل. اختر اسماً مختلفاً أو احذف أحد التصنيفين.`);
      return;
    }
    setBusy(oldName);
    await onRenameCategory(oldName, newName);
    if (catImages[oldName]) {
      const next = { ...catImages, [newName]: catImages[oldName] };
      delete next[oldName];
      saveCatImages(next);
    }
    // Update order as well
    saveCatOrder(catOrder.map((c) => (c === oldName ? newName : c)));
    setBusy("");
  };

  const remove = (name) => {
    setDeleteTarget(name);
  };

  const handleDeleteConfirm = async (name, mode, targetCategory) => {
    setBusy(name);
    await onDeleteCategory(name, mode, targetCategory);
    if (catImages[name]) {
      const next = { ...catImages };
      delete next[name];
      saveCatImages(next);
    }
    saveCatOrder(catOrder.filter((c) => c !== name));
    setBusy("");
    setDeleteTarget(null);
  };

  // ── Drag and drop ──
  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    const reordered = [...categories];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    saveCatOrder(reordered);
    setDragIndex(null);
  };

  return (
    <section className="mt-6 grid gap-4">
      <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <p className="text-sm leading-6 text-slate-500">
          إعادة التسمية والحذف تطبَّق فوراً على كل المنتجات المرتبطة بهذا التصنيف
          {configured && session ? " (يُحفظ مباشرة في Supabase، وكل الأجهزة تشوف التغيير فوراً)" : " (يُحفظ محلياً فقط لأن Supabase غير مفعل حالياً)"}.
          اسحب التصنيف لأعلى أو أسفل لتغيير ترتيب العرض في المنيو العام.
        </p>
      </div>
      {categories.length ? (
        <div className="grid gap-3">
          {categories.map((name, index) => (
            <article
              key={name}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`grid gap-3 rounded-lg border bg-white p-4 shadow-sm transition md:grid-cols-[auto_72px_1fr_auto] md:items-center ${dragIndex === index ? "border-blaben-850 opacity-50" : "border-blue-100"}`}
            >
              {/* Drag handle */}
              <div className="hidden cursor-grab select-none text-2xl text-slate-300 active:cursor-grabbing md:grid md:place-items-center" title="اسحب لتغيير الترتيب">⠿</div>
              <div className="h-18 w-18 overflow-hidden rounded-lg bg-blaben-50">
                <img
                  src={catImages[name] || asset(products.find((product) => product.category === name)?.image)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-18 w-18 object-cover"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blaben-100 px-2 py-0.5 text-xs font-black text-blaben-700">{index + 1}</span>
                  <input
                    value={drafts[name] ?? name}
                    onChange={(event) => setDrafts({ ...drafts, [name]: event.target.value })}
                    className="flex-1 rounded-lg border border-blue-100 p-2 font-black text-blaben-950"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span>{counts.get(name)} منتج</span>
                  <label className="cursor-pointer rounded-lg bg-blaben-50 px-3 py-1.5 font-black text-blaben-850">
                    تغيير صورة الغلاف
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => event.target.files?.[0] && uploadCatImage(name, event.target.files[0])} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button disabled={busy === name} onClick={() => rename(name)} className="rounded-lg bg-blaben-850 px-4 py-2 font-black text-white disabled:opacity-50">حفظ الاسم</button>
                <button disabled={busy === name} onClick={() => remove(name)} className="rounded-lg bg-red-50 px-4 py-2 font-black text-red-600 disabled:opacity-50">حذف</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-blue-100 bg-white p-5 text-slate-500">لا توجد تصنيفات بعد.</p>
      )}
      {deleteTarget && (
        <CategoryDeleteModal
          name={deleteTarget}
          count={counts.get(deleteTarget) || 0}
          categories={categories}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </section>
  );
}

function VariantEditor({ variants, onChange }) {
  const list = Array.isArray(variants) ? variants : [];
  const update = (index, patch) => onChange(list.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));
  const remove = (index) => onChange(list.filter((_, i) => i !== index));
  const add = () => onChange([...list, { label: "", price: "" }]);

  return (
    <div className="grid gap-2 md:col-span-2">
      <div className="flex items-center justify-between">
        <span className="font-black text-blaben-950">أحجام/خيارات بأسعار مختلفة (اختياري)</span>
        <button type="button" onClick={add} className="rounded-lg bg-blaben-100 px-3 py-1.5 text-sm font-black text-blaben-850">+ إضافة خيار</button>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">لا توجد خيارات إضافة، سيتم استخدام السعر الأساسي فقط. مثال على خيار: "سكوب كبير" بسعر مختلف عن "بدون آيس كريم".</p>
      ) : (
        list.map((variant, index) => (
          <div key={index} className="flex gap-2">
            <input value={variant.label} onChange={(e) => update(index, { label: limitText(e.target.value, 40) })} placeholder="مثال: سكوب كبير" className="flex-1 rounded-lg border border-blue-100 p-2" />
            <input value={variant.price} onChange={(e) => update(index, { price: limitText(e.target.value, 40) })} placeholder="مثال: 90 جنيه" className="w-32 rounded-lg border border-blue-100 p-2" />
            <button type="button" onClick={() => remove(index)} className="rounded-lg bg-red-50 px-3 font-black text-red-600">×</button>
          </div>
        ))
      )}
    </div>
  );
}

function AdminProductRow({ product, onUpdate, onDelete }) {
  const [draft, setDraft] = useState(product);
  useEffect(() => setDraft(product), [product]);
  const updateImage = async (file) => {
    if (!file || !isAllowedImageFile(file)) return;
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setDraft({ ...draft, image: dataUrl });
  };
  return (
    <article className="grid gap-3 rounded-lg border border-blue-100 bg-white p-3 shadow-sm md:grid-cols-[96px_1fr_auto]">
      <div className="grid gap-2">
        <img loading="lazy" decoding="async" src={asset(draft.image)} alt="" className="h-24 w-24 rounded-lg object-cover" />
        <label className="cursor-pointer rounded-lg bg-blaben-50 px-2 py-1 text-center text-xs font-black text-blaben-850">
          تغيير الصورة
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => updateImage(event.target.files?.[0])} />
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: limitText(e.target.value, 90) })} className="rounded-lg border border-blue-100 p-2" />
        <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: limitText(e.target.value, 70) })} className="rounded-lg border border-blue-100 p-2" />
        <input value={draft.price} onChange={(e) => setDraft({ ...draft, price: limitText(e.target.value, 60) })} placeholder="السعر الأساسي" className="rounded-lg border border-blue-100 p-2" />
        <select value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })} className="rounded-lg border border-blue-100 p-2">
          <option value="available">متاح</option>
          <option value="unavailable">غير متاح</option><option value="coming_soon">قريبا</option>
        </select>
        <textarea value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: limitText(e.target.value, 500) })} className="rounded-lg border border-blue-100 p-2 md:col-span-2" rows="2" />
        <VariantEditor variants={draft.variants} onChange={(next) => setDraft({ ...draft, variants: next })} />
      </div>
      <div className="flex gap-2 md:grid md:content-center">
        <button onClick={() => onUpdate(product, draft)} className="rounded-lg bg-blaben-850 px-4 py-2 font-black text-white">حفظ</button>
        <button onClick={() => onDelete(product)} className="rounded-lg bg-red-50 px-4 py-2 font-black text-red-600">حذف</button>
      </div>
    </article>
  );
}

function Field({ label, name, placeholder }) {
  return (
    <label className="grid gap-2 font-black text-blaben-950">
      {label}
      <input name={name} required placeholder={placeholder} className="rounded-lg border border-blue-100 p-3 font-normal" />
    </label>
  );
}

function App() {
  const catalog = useCatalog();
  const groups = useMemo(() => groupProducts(catalog), [catalog]);
  const ready = useIntro();
  const [selected, setSelected] = useState(null);
  const path = window.location.pathname;

  useEffect(() => {
    document.body.className = path.includes("version-4")
      ? "bg-gradient-to-br from-[#03183c] via-blaben-700 to-white font-sans text-slate-900"
      : path.includes("version-7")
      ? "bg-gradient-to-b from-cream-100 to-cream-50 font-sans text-slate-900"
      : path.includes("staff-portal")
      ? "bg-blaben-50 font-sans text-slate-900"
      : "bg-gradient-to-b from-blaben-100/80 to-white font-sans text-slate-900";
  }, [path]);

  if (path === "/" || path.endsWith("/index.html")) {
    return (
      <>
        <Intro ready={ready} />
        {catalog.length ? <FinalPublicMenu groups={groups} catalog={catalog} onOpen={setSelected} /> : <main className="min-h-[70vh]" />}
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      </>
    );
  }

  const current = path;
  return (
    <>
      {!path.includes("staff-portal") && <Intro ready={ready} />}
      {!path.includes("staff-portal") && <Header current={current} />}
      {!catalog.length && !path.includes("staff-portal") ? <main className="min-h-[70vh]" /> : null}
      {catalog.length && path.includes("version-1") ? <Version1 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-2") ? <Version2 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-3") ? <Version3 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-4") ? <Version4 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-5") ? <Version5 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-6") ? <Version6 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-7") ? <Version7 groups={groups} onOpen={setSelected} /> : null}
      {path.includes("staff-portal") ? <AdminPortal catalog={catalog} /> : null}
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
