import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const ASSET = "/menu-assets/";
const CUSTOM_KEY = "blabenCustomProducts";
const OFFERS = "عروض ب لبن";
const NEW = "منتجات جديدة";

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
  if (String(path).startsWith("data:image/")) return path;
  return `${ASSET}${encodeURIComponent(path)}`;
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
      const image = matchImage(line);
      if (image) {
        products.push({
          name: line,
          category,
          description: details.join(" ").replace(/غير متاح/g, "").trim(),
          price,
          unavailable,
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
      ? saved.filter((item) => item?.name && item?.category && item?.price && item?.image).map((item) => ({
          name: String(item.name),
          category: String(item.category),
          price: String(item.price),
          description: String(item.description || ""),
          unavailable: item.state === "unavailable",
          image: String(item.image),
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
      unavailable: false,
      image,
    });
  });

  const metkandra = products.find((product) => normalizeArabic(product.name).includes("متكندر"));
  if (metkandra && !products.some((product) => product.category === NEW && normalizeArabic(product.name).includes("متكندر"))) {
    products.push({ ...metkandra, category: NEW, image: "المتكندرة.png" });
  }

  products.filter((product) => !product.unavailable).slice(0, 6).forEach((product) => {
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
  const priority = [OFFERS, NEW, "الأكثر طلبا"];
  return [...map.entries()]
    .sort(([a], [b]) => {
      const ai = priority.indexOf(a);
      const bi = priority.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return 0;
    })
    .map(([name, items]) => ({ name, items, image: items[0]?.image }));
}

function useCatalog() {
  const [catalog, setCatalog] = useState([]);
  useEffect(() => {
    fetch("/names_and_descriptons.txt", { cache: "no-store" })
      .then((res) => res.text())
      .then((text) => setCatalog(buildCatalog(parseMenu(text))))
      .catch(() => setCatalog(buildCatalog([])));
  }, []);
  return catalog;
}

function useIntro() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setReady(true), reduced ? 80 : 2200);
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
    ["+", "/manage.html"],
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
        <img src={asset(product.image)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {product.unavailable && <span className="absolute start-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">غير متاح</span>}
      </div>
      <div className="grid gap-2 p-4">
        <h3 className="text-lg font-black leading-relaxed text-blaben-950">{product.name}</h3>
        {product.description && <p className="line-clamp-3 text-sm leading-7 text-slate-500">{product.description}</p>}
        <span className="w-max rounded-full bg-blaben-100 px-3 py-2 text-sm font-black text-blaben-850">{product.price}</span>
      </div>
    </article>
  );
}

function ProductModal({ product, onClose }) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <button className="absolute inset-0 bg-blaben-950/55 backdrop-blur-md" aria-label="إغلاق" onClick={onClose} />
      <section role="dialog" aria-modal="true" className="relative grid max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl md:grid-cols-[.95fr_1fr]">
        <button className="absolute start-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-2xl font-black text-blaben-950 shadow" onClick={onClose} aria-label="إغلاق">×</button>
        <div className="h-72 bg-blaben-50 md:h-full md:min-h-[430px]">
          <img src={asset(product.image)} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="grid content-center gap-4 overflow-y-auto p-6 md:p-10">
          <p className="font-black text-blaben-700">{product.category}</p>
          <h2 className="text-3xl font-black leading-tight text-blaben-950 md:text-5xl">{product.name}</h2>
          <p className="leading-8 text-slate-600">{product.description || "لا يوجد وصف إضافي لهذا المنتج حاليا."}</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blaben-100 px-4 py-2 font-black text-blaben-850">{product.price}</span>
            <span className={`rounded-full px-4 py-2 font-black ${product.unavailable ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{product.unavailable ? "غير متاح حاليا" : "متاح"}</span>
          </div>
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
    ["+", "إضافة منتج", "أضف اسم، سعر، تصنيف، صورة، وصف، وحالة.", "/manage.html"],
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
              <img src={asset(product.image)} alt={product.name} className="h-full w-full object-cover" />
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
            <img src={asset(item.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
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
          <img src={asset(hero.image)} alt={hero.name} className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-blaben-950/90 to-transparent" />
          <div className="absolute bottom-8 right-8 z-10 max-w-xl">
            <h2 className="text-5xl font-black">{hero.name}</h2>
            <p className="mt-4 leading-8">{hero.description || hero.category}</p>
            <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 font-black text-blaben-850">{hero.price}</span>
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
              <img src={asset(product.image)} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
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
              <img src={asset(lead.image)} alt={lead.name} className="absolute inset-0 h-full w-full object-cover" />
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
            <img src={asset(hero.image)} alt={hero.name} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-blaben-950/90 to-transparent" />
            <div className="absolute bottom-8 right-8 z-10 max-w-2xl">
              <p className="font-black text-white/80">اختيارنا للمنيو</p>
              <h1 className="mt-3 text-6xl font-black leading-none md:text-8xl">{hero.name}</h1>
              <p className="mt-4 leading-8">{hero.description || hero.category}</p>
              <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 font-black text-blaben-850">{hero.price}</span>
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

function Manage() {
  const [items, setItems] = useState(loadCustomProducts());
  const [preview, setPreview] = useState("");
  const saveItems = (next) => {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    setItems(next);
  };
  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const file = data.get("image");
    if (!file || !file.type?.startsWith("image/")) return;
    const image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    saveItems([...items, {
      category: data.get("category"),
      name: data.get("name"),
      price: data.get("price"),
      state: data.get("state"),
      description: data.get("description"),
      image,
    }]);
    event.currentTarget.reset();
    setPreview("");
  };
  return (
    <main className="mx-auto w-[min(1040px,calc(100%-24px))] py-10">
      <section className="mb-5">
        <p className="font-black text-blaben-700">إدارة محلية</p>
        <h1 className="mt-3 text-5xl font-black text-blaben-950 md:text-7xl">إضافة منتج جديد</h1>
        <p className="mt-4 leading-8 text-slate-500">المنتجات تحفظ في نفس المتصفح فقط باستخدام localStorage.</p>
      </section>
      <form onSubmit={submit} className="grid gap-4 rounded-lg border border-blue-100 bg-white p-5 shadow-luxe md:grid-cols-2">
        <Field label="التصنيف" name="category" placeholder="مثال: عروض ب لبن" />
        <Field label="اسم المنتج" name="name" placeholder="اسم المنتج" />
        <Field label="السعر" name="price" placeholder="مثال: 120 جنيه" />
        <label className="grid gap-2 font-black text-blaben-950">الحالة<select name="state" className="rounded-lg border border-blue-100 p-3 font-normal"><option value="available">متاح</option><option value="unavailable">غير متاح</option></select></label>
        <label className="grid gap-2 font-black text-blaben-950 md:col-span-2">الوصف<textarea name="description" rows="4" className="rounded-lg border border-blue-100 p-3 font-normal" /></label>
        <label className="grid gap-2 font-black text-blaben-950 md:col-span-2">الصورة<input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required onChange={(e) => setPreview(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : "")} className="rounded-lg border border-blue-100 p-3 font-normal" /></label>
        {preview && <img src={preview} alt="" className="h-40 w-40 rounded-lg object-cover" />}
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button className="rounded-lg bg-blaben-850 px-5 py-3 font-black text-white">إضافة المنتج</button>
          <button type="button" onClick={() => saveItems([])} className="rounded-lg bg-blaben-100 px-5 py-3 font-black text-blaben-850">مسح المنتجات المضافة</button>
        </div>
      </form>
      <section className="mt-8">
        <h2 className="mb-4 text-3xl font-black text-blaben-950">المنتجات المضافة</h2>
        {items.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item, idx) => <ProductCard key={idx} product={{ ...item, unavailable: item.state === "unavailable" }} onOpen={() => {}} />)}</div> : <p className="rounded-lg border border-dashed border-blue-100 bg-white p-5 text-slate-500">لا توجد منتجات مضافة بعد.</p>}
      </section>
    </main>
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
    document.body.className = path.includes("version-4") ? "bg-gradient-to-br from-[#03183c] via-blaben-700 to-white font-sans text-slate-900" : "bg-gradient-to-b from-blaben-100/80 to-white font-sans text-slate-900";
  }, [path]);

  if (path === "/" || path.endsWith("/index.html")) return <Chooser />;

  const current = path;
  return (
    <>
      {!path.includes("manage") && <Intro ready={ready} />}
      <Header current={current} />
      {!catalog.length && !path.includes("manage") ? <main className="p-8 text-center text-blaben-950">جاري تحميل المنيو...</main> : null}
      {catalog.length && path.includes("version-1") ? <Version1 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-2") ? <Version2 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-3") ? <Version3 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-4") ? <Version4 groups={groups} onOpen={setSelected} /> : null}
      {catalog.length && path.includes("version-5") ? <Version5 groups={groups} onOpen={setSelected} /> : null}
      {path.includes("manage") ? <Manage /> : null}
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
