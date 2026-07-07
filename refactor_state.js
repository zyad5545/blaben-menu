const fs = require('fs');
let code = fs.readFileSync('src/main.jsx', 'utf-8');

// Parse logic
code = code.replace(/let unavailable = false;/g, 'let state = "available";');
code = code.replace(/unavailable = true;/g, 'state = "unavailable";');
code = code.replace(/unavailable,/g, 'state,');

// buildCatalog
code = code.replace(/unavailable: false,/g, 'state: "available",');

// loadCustomProducts & AdminPortal load
code = code.replace(/unavailable: item.state === "unavailable",/g, 'state: item.state || (item.unavailable ? "unavailable" : "available"),');

// product filtering
code = code.replace(/!product.unavailable/g, 'product.state !== "unavailable"');
code = code.replace(/!p.unavailable/g, 'p.state !== "unavailable"');

// ProductCard badge
code = code.replace(
  /\{product.unavailable && <span className="absolute start-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">غير متاح<\\/span>\\}/g,
  \{product.state === "unavailable" && <span className="absolute start-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-md">غير متاح</span>}
        {product.state === "special_offer" && <span className="absolute start-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-xs font-black text-white shadow-md">عرض خاص</span>}\
);

// ProductModal badge
code = code.replace(
  /className={\ounded-full px-4 py-2 font-black \\$\\{product.unavailable \\? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"\\}\\}/g,
  'className={\ounded-full px-4 py-2 font-black \$\{product.state === "unavailable" ? "bg-red-50 text-red-600" : product.state === "special_offer" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-700"\}\}'
);
code = code.replace(
  /\\{product.unavailable \\? "غير متاح حاليا" : "متاح"\\}/g,
  '{product.state === "unavailable" ? "غير متاح حاليا" : product.state === "special_offer" ? "عرض خاص" : "متاح"}'
);

// Version 6/7/Final badge replacements
code = code.replace(/\\{product.unavailable && \\(/g, '{product.state === "unavailable" && (');
code = code.replace(/\\{product.unavailable && <span/g, '{product.state === "unavailable" && <span');
code = code.replace(
  /\\{product.state === "unavailable" && <span className="text-xs font-bold text-red-500">غير متاح<\\/span>\\}/g,
  \{product.state === "unavailable" && <span className="text-xs font-bold text-red-500">غير متاح</span>}
                      {product.state === "special_offer" && <span className="text-xs font-bold text-amber-500">عرض خاص</span>}\
);

// Version 7 back badge
code = code.replace(
  /product.unavailable\\n\\s+\\? "bg-red-500\\/20 text-red-200"\\n\\s+: "bg-emerald-500\\/20 text-emerald-200"/g,
  'product.state === "unavailable" ? "bg-red-500/20 text-red-200" : product.state === "special_offer" ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-200"'
);
code = code.replace(
  /\\{product.unavailable \\? "غير متاح" : "متاح"\\}/g,
  '{product.state === "unavailable" ? "غير متاح" : product.state === "special_offer" ? "عرض خاص" : "متاح"}'
);

// toSupabaseProduct
code = code.replace(/state: product.unavailable \\? "unavailable" : "available",/g, 'state: product.state,');

// AdminCreateForm and Manage (select state)
code = code.replace(
  /<label className="grid gap-2 font-black text-blaben-950">الحالة<select name="state" className="rounded-lg border border-blue-100 p-3 font-normal"><option value="available">متاح<\\/option><option value="unavailable">غير متاح<\\/option><\\/select><\\/label>/g,
  '<label className="grid gap-2 font-black text-blaben-950">الحالة<select name="state" className="rounded-lg border border-blue-100 p-3 font-normal"><option value="available">متاح</option><option value="unavailable">غير متاح</option><option value="special_offer">عرض خاص</option></select></label>'
);
code = code.replace(/unavailable: data.get\\("state"\\) === "unavailable",/g, 'state: data.get("state"),');

// AdminRow map and select
code = code.replace(/unavailable: item.state === "unavailable"/g, 'state: item.state');
code = code.replace(
  /<select value=\\{draft.unavailable \\? "unavailable" : "available"\\} onChange=\\{\\(e\\) => setDraft\\(\\{ ...draft, unavailable: e.target.value === "unavailable" \\}\\)\\} className="rounded-lg border border-blue-100 p-2">/g,
  '<select value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })} className="rounded-lg border border-blue-100 p-2">'
);
code = code.replace(
  /<option value="unavailable">غير متاح<\\/option>/g,
  '<option value="unavailable">غير متاح</option><option value="special_offer">عرض خاص</option>'
);

// Fallback items map
code = code.replace(/saveLocal\\(\\[...items, \\{ ...product, state: product.unavailable \\? "unavailable" : "available" \\}\\]\\);/g, 'saveLocal([...items, { ...product, state: product.state }]);');

fs.writeFileSync('src/main.jsx', code);
console.log("Refactor complete.");
