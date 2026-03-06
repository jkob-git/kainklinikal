import { useState, useRef, useEffect } from "react";

// ============================================
// GLOBAL STYLES
// ============================================
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0D1F15; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #A8DFBF; border-radius: 4px; }
  input, button, select, textarea { font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
  @keyframes popIn    { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }
  @keyframes spin     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes shimmer  { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes float    { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
  @keyframes gradShift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes checkPop { 0% { transform:scale(0) rotate(-15deg); } 60% { transform:scale(1.2) rotate(3deg); } 100% { transform:scale(1) rotate(0deg); } }
`;

// ============================================
// CONSTANTS
// ============================================
const CONDITIONS = [
  { id: "diabetes",     label: "Diabetes",     sublabel: "Mataas na Asukal",       emoji: "🩸", color: "#C0392B", bg: "#FDECEA", border: "#F1948A" },
  { id: "hypertension", label: "Hypertension", sublabel: "Mataas na Presyon",      emoji: "❤️", color: "#E74C3C", bg: "#FDEDEC", border: "#F5B7B1" },
  { id: "ckd",          label: "Sakit sa Bato", sublabel: "Chronic Kidney Disease", emoji: "🫘", color: "#1A6B8A", bg: "#EAF4FB", border: "#85C1E9" },
  { id: "anemia",       label: "Anemia",       sublabel: "Mababang Hemoglobin",    emoji: "💉", color: "#8E44AD", bg: "#F5EEF8", border: "#C39BD3" },
  { id: "arthritis",    label: "Arthritis",    sublabel: "Masakit na Kasukasuan",  emoji: "🦴", color: "#D35400", bg: "#FEF9E7", border: "#F0B27A" },
  { id: "gerd",         label: "GERD / Sikmura", sublabel: "Acid Reflux / Heartburn", emoji: "🔥", color: "#B7770D", bg: "#FEF9E7", border: "#F9D56E" },
  { id: "gout",         label: "Gout",           sublabel: "Mataas na Uric Acid",     emoji: "🦶", color: "#4A235A", bg: "#F4ECF7", border: "#C39BD3" },
];

const VERDICT_CFG = {
  kainin:    { label: "PWEDE ✅",    tagline: "Mainam para sa iyo",               color: "#1A7A4A", bg: "#E8F8F0", border: "#6FCF97", icon: "✅", dot: "#2D9E6B" },
  limitahan: { label: "LIMITADO ⚠️", tagline: "Pwede pero katamtaman lang",      color: "#B8620A", bg: "#FEF8EC", border: "#F6C86A", icon: "⚠️", dot: "#E67E22" },
  iwasan:    { label: "IWASAN ❌",   tagline: "Hindi mainam para sa iyo",         color: "#A93226", bg: "#FDECEA", border: "#F1948A", icon: "❌", dot: "#E05252" },
  depende:   { label: "DEPENDE 🔄",  tagline: "Iba ang sagot sa bawat kalagayan", color: "#6C3483", bg: "#F5EEF8", border: "#C39BD3", icon: "🔄", dot: "#9B59B6" },
};

const BADGE_COLORS = {
  FNRI:  { bg: "#EBF5FB", text: "#1A5276" },
  DOH:   { bg: "#E9F7EF", text: "#1E8449" },
  WHO:   { bg: "#FEF5E7", text: "#9A5C0A" },
  WHF:   { bg: "#FDEDEC", text: "#922B21" },
  FAO:   { bg: "#EAF4E8", text: "#1D5C2E" },
  PRA:   { bg: "#F5EEF8", text: "#6C3483" },
  PHA:   { bg: "#FDECEA", text: "#A93226" },
  KDIGO: { bg: "#EAF4FB", text: "#1A6B8A" },
  ACG:   { bg: "#FEF9E7", text: "#B7770D" },
  NKF:   { bg: "#E8F8F5", text: "#1A7A5A" },
  ACR:   { bg: "#F4ECF7", text: "#4A235A" },
};

// ============================================
// FOOD DATABASE v2 — Cross-Referenced
// Sources: FNRI, DOH, WHO, WHF, FAO, PRA, PHA
// WHO Healthy Diet Fact Sheet (2024)
// WHF Hypertension & Heart Health Guidelines
// FAO/WHO Human Vitamin & Mineral Requirements (2001)
// FAO Food & Nutrition Paper: Iron Bioavailability
// WHO Sodium/Potassium Intake Guidelines
// Mayo Clinic / Arthritis Foundation Gout Diet Guidelines
// ADA Standards of Care in Diabetes (2024)
// ============================================
const FOOD_DATABASE = [

  // ── ISDA (FISH & SEAFOOD) ──────────────────────────────────────────

  { food_id:"galunggong_001", name:"Galunggong", aliases:["galunggong","round scad","bilong-bilong","blue mackerel scad"], emoji:"🐟", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Walang carbohydrates, mataas sa protina. Sinusuportahan ng ADA (2024) ang regular na pagkain ng isda bilang bahagi ng DASH diet para sa diabetes management.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Nagbibigay ng heme iron na 2–3x mas madaling masipsip kaysa plant iron, ayon sa FAO/WHO Human Mineral Requirements. Tumutulong din sa B12 para sa red blood cell formation.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Ang omega-3 fatty acids ng galunggong ay may anti-inflammatory effect na kinikilala ng Arthritis Foundation at ng WHO bilang protektibo laban sa joint inflammation.", badge:"WHO"},
      hypertension:{verdict:"limitahan", reason:"Ang sariwang galunggong ay mababa sa sodium, pero ang pinirito o inasnan ay maaaring lumampas sa WHO limit na 2g sodium/araw. Inihaw o nilaga ang pinakamainam.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Ang galunggong ay mataas sa phosphorus (~200mg/100g). Ayon sa KDIGO 2024, ang mga may CKD stage 3–5 ay dapat limitahan ang phosphorus-rich na pagkain. Inihaw at walang asin.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Inihaw o nilaga na galunggong ay mababa sa taba at hindi nagpapalakas ng acid production. Ayon sa ACG Guidelines, ang lean fish ay ligtas para sa GERD.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang galunggong ay moderate sa purines ngunit ang omega-3 nito ay nagpapababa ng inflammation. Ayon sa Arthritis Foundation (2025), ang moderate na pagkain ng non-shellfish fish ay katanggap-tanggap para sa gout at ang heart benefits ay mas malaki kaysa panganib. Limitahan sa 115g, 3-4x bawat linggo.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱80–120 / kilo",
    cooking_tip:"Inihaw nang walang asin — piga ng dayap para sa lasa at para mapalakas ang iron absorption",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
    ]},

  { food_id:"sardinas_001", name:"Sardinas (de lata)", aliases:["sardinas","sardines","de lata","canned sardines"], emoji:"🐟", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Mataas sa protina at omega-3, walang carbohydrates. Ayon sa WHO, ang pagkain ng isda ng dalawang beses sa isang linggo ay nakakatulong sa cardiovascular at metabolic health.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Isa sa pinakamataas na heme iron sa abot-kayang pagkain — 15% ng Daily Value bawat lata, ayon sa USDA/FAO data. Kasama rin ang B12 para sa hemoglobin formation.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Kinikilala ng Arthritis Foundation at Mayo Clinic na ang sardinas ay isa sa pinaka-mapanganib na pagkain para sa gout — napakataas sa purines (480mg/100g) na nagpapataas ng uric acid.", badge:"PRA"},
      hypertension:{verdict:"limitahan", reason:"Ang de latang sardinas ay maaaring may 400–500mg sodium bawat lata. Inirerekomenda ng WHF na hugasan ng tubig bago kainin para mabawasan ang sodium ng hanggang 40%.", badge:"WHF"},
      ckd:          {verdict:"iwasan",    reason:"Ang de latang sardinas ay mataas sa phosphorus at sodium — parehong pangunahing alalahanin sa CKD. Ayon sa KDIGO 2024 at NKF, ang canned processed fish ay dapat iwasan ng mga may CKD.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang sardinas ay mababang taba at hindi trigger ng acid reflux kung hindi pinrito. Ayon sa ACG guidelines, ang lean protein ay ligtas para sa GERD.", badge:"ACG"},
      gout:         {verdict:"iwasan",    reason:"Ang sardinas ay isa sa pinaka-mapanganib na pagkain para sa gout -- 480mg purines bawat 100g. Kinikilala ng Arthritis Foundation, Mayo Clinic, at ACR bilang top 'avoid' na pagkain para sa gout. Nagpapataas ng uric acid at nagdudulot ng acute gout attacks.", badge:"ACR"},
    },
    safe_alternative:"Inihaw na galunggong o tilapia — may heme iron din pero mas mababa sa purines at sodium",
    price_estimate:"₱20–35 / lata", cooking_tip:"Hugasan ng malamig na tubig ng 1 minuto para mabawasan ang sodium at purine content",
    sources:[
      {label:"Arthritis Foundation: Gout Diet Dos and Don'ts", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"PRA"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
    ]},

  { food_id:"tilapia_001", name:"Tilapia", aliases:["tilapia","pla-pla","tilapya","nile tilapia","freshwater tilapia","inihaw na tilapia","sinigang na tilapia"], emoji:"🐠", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"26g lean protein bawat 100g, walang carbohydrates. Inirerekomenda ng WHO at ADA (2024) bilang isang pinakamagandang affordable na protina para sa diabetes — nagpapabusog nang matagal nang hindi nagpapataas ng blood sugar.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Nagbibigay ng heme iron (0.7mg/100g) at napakaraming B12 (131% Daily Value bawat 100g) na parehong kailangan ng hemoglobin synthesis. Ayon sa FNRI at FAO, ang tilapia ay isa sa pinaka-accessible na iron at B12 source sa Pilipinas.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Napakababa sa purines (57mg/100g) — isa sa pinakamainam na isda para sa gout patients ayon sa Arthritis Foundation at Mayo Clinic. Ang anti-inflammatory omega-3 nito ay tumutulong pa sa joint health.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Napakababa sa sodium (52mg/100g) at saturated fat (0.9g). Ang DASH diet na inirekomenda ng WHO at WHF para sa hypertension ay kinabibilangan ng lean fish tulad ng tilapia bilang pangunahing protina.", badge:"WHF"},
      ckd:         {verdict:"kainin",    reason:"Isa sa mga pinaka-recommended na isda para sa CKD ayon sa NKF at American Kidney Fund — mababa sa phosphorus (170mg/100g), moderate sa potassium, at walang sodium additives kung sariwang binili. Para sa advanced CKD: limitahan sa 85–100g bawat serving.", badge:"NKF"},
      gerd:        {verdict:"kainin",    reason:"Ang tilapia ay isa sa pinakamainam na protina para sa GERD — napakababa sa taba (1.7g/100g) at hindi nagpapalakas ng acid production. Inirekomenda ng ACG at Cleveland Clinic bilang ideal na lean protein para sa acid reflux patients.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang tilapia ay napakababa sa purines (57mg/100g) -- isa sa pinakaligtas na isda para sa gout ayon sa Arthritis Foundation at ACR. Hindi nagpapataas ng uric acid at ang omega-3 nito ay may anti-inflammatory benefit pa.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱100–150 / kilo",
    cooking_tip:"Inihaw, tinola, o sinigang — pinakamainam sa lahat ng kalagayan. Para sa CKD: iwasan ang toyo at patis na sawsawan",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"NKF: Fish for Kidney Disease", url:"https://www.kidney.org/kidney-topics/fish", badge:"NKF"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"Arthritis Foundation: Low-Purine Fish", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"PRA"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
    ]},

  { food_id:"hipon_001", name:"Hipon", aliases:["hipon","shrimp","sugpo","prawns"], emoji:"🦐", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Walang carbohydrates at mataas sa lean protein. Okay para sa blood sugar control.", badge:"FNRI"},
      anemia:      {verdict:"kainin",    reason:"May heme iron at B12. Ayon sa FAO, ang pagkain ng mixed seafood ay nagpapalakas ng iron status.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Ang hipon (shellfish) ay kinikilala ng Arthritis Foundation, Mayo Clinic, at ng American College of Rheumatology bilang high-purine food na nagpapataas ng uric acid at nagdudulot ng gout attacks.", badge:"PRA"},
      hypertension:{verdict:"limitahan", reason:"Ang natural na hipon ay mababa sa sodium, pero ang procesadong hipon o may sarsa ay mataas. Kumain ng walang dagdag na asin.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Ang hipon ay mataas sa phosphorus. Ayon sa NKF at KDIGO guidelines, ang shellfish ay dapat limitahan sa CKD diet dahil sa mataas na phosphorus at sodium content.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang hipon ay mababa sa taba at hindi trigger ng acid reflux. Inihaw o nilaga — iwasan ang mga sarsa na may kamatis o siling labuyo.", badge:"ACG"},
      gout:         {verdict:"iwasan",    reason:"Ang hipon at lahat ng shellfish ay kinikilala ng Arthritis Foundation, Mayo Clinic, at ACR bilang high-purine foods na dapat iwasan ng mga may gout. Direktang nagpapataas ng uric acid sa dugo at nagdudulot ng flare-ups.", badge:"ACR"},
    },
    safe_alternative:"Tilapia o galunggong — katulad na protina at iron pero ligtas sa arthritis",
    price_estimate:"₱180–300 / kilo", cooking_tip:"Para sa arthritis: ihinto ang pagkain. Para sa iba: nilaga lang, walang asin",
    sources:[
      {label:"Arthritis Foundation: Safe Foods for Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"PRA"},
      {label:"Mayo Clinic: Gout Diet", url:"https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/gout-diet/art-20048524", badge:"PRA"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
    ]},

  // ── KARNE (MEAT) ──────────────────────────────────────────────────

  { food_id:"manok_001", name:"Manok (walang balat)", aliases:["manok","chicken","walang balat","inihaw na manok","tinola"], emoji:"🍗", category:"Karne",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Lean protein na walang carbohydrates. Ayon sa WHO at ADA (2024), ang poultry ay isa sa pinakamainam na protina para sa blood sugar management.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Nagbibigay ng heme iron at B12. Ayon sa FAO/WHO, ang heme iron mula sa manok ay mas madaling masipsip kaysa plant-based iron.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Kinikilala ng Arthritis Foundation bilang 'safer protein' — mas mababa sa purines kaysa pula ng karne at organ meats.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Mababa sa saturated fat at sodium kung walang balat at hindi pinirito. Kasama sa DASH diet na inirekomenda ng WHO at WHF para sa hypertension.", badge:"WHF"},
      ckd:          {verdict:"kainin",    reason:"Ang manok (walang balat) ay katamtaman sa phosphorus at protina. Ayon sa KDIGO 2024, ang moderate lean protein ay katanggap-tanggap para sa CKD stages 1–3. Limitahan sa advanced CKD (stage 4–5) ayon sa doktor.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang inihaw o nilagang manok ay isa sa pinaka-ligtas na protina para sa GERD. Kinikilala ng ACG guidelines at Harvard Health na ang lean poultry ay hindi nagpapalakas ng acid reflux.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang manok (walang balat) ay mababa sa purines at kinikilala ng Arthritis Foundation at ACR bilang ligtas na protina para sa gout. Hindi nagpapataas ng uric acid.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱180–220 / kilo",
    cooking_tip:"Alisin ang balat bago lutuin — nagbabawas ng saturated fat ng hanggang 50%. Inihaw o tinola ang pinakamainam",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"WHF: Healthy Diet & Heart Health", url:"https://world-heart-federation.org/what-we-do/healthy-diet/", badge:"WHF"},
      {label:"Arthritis Foundation: Safe Foods for Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"PRA"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
    ]},

  { food_id:"atay_001", name:"Atay ng Manok", aliases:["atay","liver","chicken liver","atay ng manok","beef liver"], emoji:"🫀", category:"Karne",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Mataas sa protina, walang carbohydrates. Hindi nagpapataas ng blood sugar. Nagbibigay din ng chromium na tumutulong sa insulin sensitivity.", badge:"FNRI"},
      anemia:      {verdict:"kainin",    reason:"Pinakamataas na heme iron sa lahat ng pagkain — 31% Daily Value bawat 113g, ayon sa USDA at FAO data. Kasama ang folate at B12 na lahat ay kailangan para sa hemoglobin.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Kinikilala ng Mayo Clinic, Arthritis Foundation, at American College of Rheumatology na ang organ meats tulad ng atay ay PINAKA-MATAAS sa purines (>400mg/100g) — pinakamapanganib para sa gout.", badge:"PRA"},
      hypertension:{verdict:"limitahan", reason:"Mataas sa cholesterol ang atay. Inirerekomenda ng WHF na limitahan ang pagkain ng organ meats para sa cardiovascular health.", badge:"WHF"},
      ckd:          {verdict:"iwasan",    reason:"Ang atay ay napakataas sa phosphorus (476mg/100g) at protina. Ang KDIGO 2024 at NKF ay malinaw na nagtatala ng organ meats bilang pinaka-mapanganib na pagkain para sa CKD — nagpapataas ng phosphorus, potassium, at protein waste.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang atay ay hindi kilalang trigger ng acid reflux. Ligtas para sa GERD kung luto nang hindi gumagamit ng maraming taba.", badge:"ACG"},
      gout:         {verdict:"iwasan",    reason:"Ang organ meats tulad ng atay ay pinaka-mataas sa purines sa lahat ng pagkain (>400mg/100g). Ang ACR, Arthritis Foundation, at Mayo Clinic ay nagkakaisang nagsasabing ang atay ay pinakaunang dapat IWASAN para sa gout.", badge:"ACR"},
    },
    safe_alternative:"Para sa anemia: Kangkong at pechay — mataas din sa plant iron kasama ang dayap para sa absorption",
    price_estimate:"₱80–120 / kilo",
    cooking_tip:"Para sa anemia na walang arthritis: igisa sa bawang, sibuyas, at kalamansi. Hindi hihigit sa 2x sa linggo",
    sources:[
      {label:"Mayo Clinic: Gout Diet — What to Avoid", url:"https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/gout-diet/art-20048524", badge:"PRA"},
      {label:"FAO: Iron Bioavailability in Plant & Animal Foods", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"WHF: Healthy Diet & Heart Health", url:"https://world-heart-federation.org/what-we-do/healthy-diet/", badge:"WHF"},
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
    ]},

  { food_id:"baboy_001", name:"Baboy", aliases:["baboy","pork","adobo","humba","inihaw na liempo","liempo"], emoji:"🥩", category:"Karne",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang mataba na parte ng baboy ay nagpapabagal ng insulin sensitivity. Ayon sa ADA (2024) at WHO, ang saturated fat mula sa pula ng karne ay nagpapalala ng insulin resistance. Payat na parte lang, limitadong dami.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Nagbibigay ng heme iron na mas madaling masipsip kaysa plant iron, ayon sa FAO. Pero ang mas malusog na opsyon ay manok o isda.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Ayon sa Arthritis Foundation at Mayo Clinic, ang pork ay high in purines at saturated fat — parehong nagpapataas ng uric acid at nagpapalakas ng joint inflammation.", badge:"PRA"},
      hypertension:{verdict:"iwasan",    reason:"Inirerekomenda ng WHO at WHF na bawasan ang red meat consumption. Ang karamihang lutong baboy (adobo, lechon, adobong liempo) ay mataas sa sodium at saturated fat na nagpapataas ng blood pressure.", badge:"WHF"},
      ckd:          {verdict:"iwasan",    reason:"Ang baboy ay mataas sa phosphorus, potassium, at saturated fat. Ayon sa KDIGO 2024 at NKF, ang fatty pork at processed pork products ay dapat iwasan ng mga may CKD.", badge:"KDIGO"},
      gerd:         {verdict:"iwasan",    reason:"Ang matabang pagkain tulad ng baboy ay nagpapahina ng lower esophageal sphincter (LES), nagpapalakas ng acid reflux. Kinikilala ng ACG guidelines at Harvard Health bilang pangunahing GERD trigger.", badge:"ACG"},
      gout:         {verdict:"limitahan",    reason:"Ang baboy ay moderate-high sa purines. Ayon sa ACR at Mayo Clinic, ang red meat kasama ang baboy ay dapat limitahan sa gout -- 85g bawat pagkain, hindi hihigit sa 3-4x bawat linggo.", badge:"ACR"},
    },
    safe_alternative:"Inihaw na manok na walang balat o tilapia — mas ligtas para sa lahat ng kalagayan",
    price_estimate:"₱220–320 / kilo",
    cooking_tip:"Kung kakain: piliin ang kasim (leaner cut), lutuin na nilaga, at huwag gagamit ng toyo o patis",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"Arthritis Foundation: Gout Diet", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"PRA"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
    ]},

  { food_id:"lechon_001", name:"Lechon / Litson", aliases:["lechon","lechon baboy","roast pig","litson","lechon kawali"], emoji:"🍖", category:"Karne",
    conditions:{
      diabetes:    {verdict:"iwasan",    reason:"Ang mataas na saturated fat ng lechon ay nagpapabagal ng insulin at nagpapataas ng blood sugar. Pinapalakas din ang cardiovascular risk na mataas na sa mga diabetic, ayon sa WHO.", badge:"WHO"},
      anemia:      {verdict:"limitahan", reason:"May heme iron pero ang sobrang taba ay nagpapababa ng overall nutritional benefit. Mas epektibong iron sources ang available.", badge:"FNRI"},
      arthritis:   {verdict:"iwasan",    reason:"Napakataas sa saturated fat at purines. Kinikilala ng Arthritis Foundation at Mayo Clinic na ang matabang karne at organ meats ng lechon ay nagdudulot ng acute gout attacks.", badge:"PRA"},
      hypertension:{verdict:"iwasan",    reason:"Ang lechon ay mataas sa saturated fat at sodium. Ang WHO at WHF ay malinaw na nagrerekomenda na iwasan ang fatty red meat para sa hypertension control.", badge:"WHF"},
      ckd:          {verdict:"iwasan",    reason:"Napakataas sa phosphorus, potassium, sodium, at saturated fat ang lechon. Ayon sa KDIGO 2024, ang ultra-processed at fatty meats ay pinaka-mapanganib para sa CKD progression.", badge:"KDIGO"},
      gerd:         {verdict:"iwasan",    reason:"Ang lechon ay isa sa pinakamataba na pagkain — direktang nagpapahina ng LES at nagpapalakas ng acid reflux. Kinikilala ng ACG at Cleveland Clinic bilang pinaka-mapanganib na GERD trigger food.", badge:"ACG"},
      gout:         {verdict:"iwasan",    reason:"Ang lechon ay pinagsama ang mataas na purine content ng baboy at organ meats. Ayon sa ACR at Arthritis Foundation, ang fatty pork at pork-based fiesta foods ay dapat iwasan ng mga may gout.", badge:"ACR"},
    },
    safe_alternative:"Inihaw na manok na walang balat — may lasa pa rin pero mababa sa taba at purine",
    price_estimate:"₱350–500 / kilo", cooking_tip:null,
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"WHF: Hypertension & Heart Health", url:"https://world-heart-federation.org/what-we-do/hypertension/", badge:"WHF"},
      {label:"Mayo Clinic: Gout Diet", url:"https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/gout-diet/art-20048524", badge:"PRA"},
      {label:"DOH Healthy Diet Guidelines", url:"https://doh.gov.ph/node/7771", badge:"DOH"},
    ]},

  // ── GULAY (VEGETABLES) ────────────────────────────────────────────

  { food_id:"kangkong_001", name:"Kangkong", aliases:["kangkong","water spinach","kang kong"], emoji:"🥬", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Halos walang carbohydrates at mataas sa fiber. Ayon sa WHO at ADA, ang non-starchy vegetables tulad ng kangkong ay dapat kainin ng sagana para sa blood sugar control.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Mayaman sa non-heme iron at Vitamin C. Ayon sa FAO, ang Vitamin C ay nagpapalakas ng iron absorption ng hanggang 3x — lalo na kapag may kasamang kalamansi.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Ayon sa pananaliksik at Arthritis Foundation, ang high-purine vegetables tulad ng kangkong ay HINDI nagpapataas ng uric acid — ligtas kumain ng sagana.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Mataas sa potassium na nagpapababa ng blood pressure. Kinikilala ng WHO na ang potassium mula sa gulay ay nagbabawas ng cardiovascular risk.", badge:"WHO"},
      ckd:          {verdict:"kainin",    reason:"Ang kangkong ay mababa sa phosphorus at katamtaman sa potassium. Ayon sa KDIGO 2024, ang plant-based vegetables ay preferred sa CKD — ang potassium mula sa halaman ay mas mababa sa bioavailability kaysa sa animal sources.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang kangkong ay alkaline-forming vegetable na nagbabawas ng acid sa tiyan. Kinikilala ng ACG at Cleveland Clinic bilang GERD-friendly na gulay.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Kahit itinuturing na high-purine vegetable, ang Arthritis Foundation at ACR (2025 update) ay malinaw na nagsasabing ang lahat ng gulay ay hindi nagpapataas ng uric acid at LIGTAS para sa gout. Ang potassium nito ay nagpapalakas pa ng uric acid excretion.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱15–25 / bigkis",
    cooking_tip:"Igisa sa bawang — dagdag ng kalamansi bago kumain para ma-maximize ang iron absorption ng 2–3x",
    sources:[
      {label:"WHO: Increasing Potassium Intake", url:"https://www.who.int/tools/elena/interventions/potassium-cvd-adults", badge:"WHO"},
      {label:"FAO: Iron Bioavailability — Vitamin C Enhancers", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"Arthritis Foundation: Vegetables & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"PRA"},
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
    ]},

  { food_id:"malunggay_001", name:"Malunggay", aliases:["malunggay","moringa","kamunggay","horse radish leaves"], emoji:"🌿", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang malunggay ay may isothiocyanates na nagpapababa ng blood sugar. Kinikilala ng DOH at ng FAO bilang isa sa pinakamayamang gulay sa micronutrients.", badge:"FAO"},
      anemia:      {verdict:"kainin",    reason:"Ayon sa FAO, ang malunggay ay isa sa pinakamataas na plant source ng iron at Vitamin C sa Southeast Asia — 7mg iron at 220mg Vitamin C bawat 100g. Mahigit doble sa spinach.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"May quercetin at kaempferol ang malunggay na may anti-inflammatory properties. Ligtas para sa arthritis at hindi nagpapataas ng uric acid.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Nagbibigay ng potassium, magnesium, at antioxidants na lahat ay tumutulong sa blood pressure control ayon sa WHO guidelines.", badge:"WHO"},
      ckd:          {verdict:"limitahan",    reason:"Ang malunggay ay mataas sa potassium at phosphorus. Para sa advanced CKD (stage 3–5), ang KDIGO 2024 ay nagtatagubilin na bantayan ang potassium intake. Sa early CKD (stage 1–2), okay lang.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang malunggay ay alkaline at anti-inflammatory. Hindi kilalang trigger ng acid reflux. Ligtas para sa GERD.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ayon sa Arthritis Foundation, ang lahat ng gulay kasama ang malunggay ay LIGTAS para sa gout. Ang antioxidants at anti-inflammatory compounds nito ay tumutulong pa sa pamamahala ng gout symptoms.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱10–20 / sanga",
    cooking_tip:"Ihalo sa tinola, sinigang, o lugaw — lutuin ng maikli (2–3 minuto) para mapanatili ang iron at Vitamin C",
    sources:[
      {label:"FAO: Nutritive Value of Indigenous African Foods", url:"https://www.fao.org/3/x5450e/x5450e00.htm", badge:"FAO"},
      {label:"WHO: Increasing Potassium Intake", url:"https://www.who.int/tools/elena/interventions/potassium-cvd-adults", badge:"WHO"},
      {label:"DOH Nutritional Guidelines for Filipinos", url:"https://doh.gov.ph/node/7771", badge:"DOH"},
    ]},

  { food_id:"ampalaya_001", name:"Ampalaya", aliases:["ampalaya","bitter gourd","bitter melon","amplaya"], emoji:"🥒", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Kinikilala ng DOH at ng WHO bilang Traditional Medicinal Plant na nagpapababa ng blood sugar. Ang charantin at polypeptide-P nito ay may insulin-like effect.", badge:"DOH"},
      anemia:      {verdict:"kainin",    reason:"May non-heme iron at Vitamin C na nagpapalakas ng iron absorption, ayon sa FAO guidelines.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Walang purines. Ayon sa Arthritis Foundation, ang mga gulay — kahit 'high-purine' — ay hindi nagpapataas ng uric acid at safe para sa gout.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Mababa sa sodium at nagbibigay ng potassium at antioxidants. Kasama sa listahan ng WHO ng heart-protective vegetables.", badge:"WHO"},
      ckd:          {verdict:"kainin",    reason:"Ang ampalaya ay mababa sa phosphorus at katamtaman sa potassium. Ayon sa KDIGO 2024, ang bitter melon ay may kidney-protective properties at ligtas para sa early CKD.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang ampalaya ay hindi acidic at hindi trigger ng GERD. Ang fiber nito ay tumutulong sa digestive health.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ayon sa Arthritis Foundation guidelines, ang lahat ng gulay ay ligtas para sa gout -- hindi nagpapataas ng uric acid. Ang bitter melon ay may potential pa na nagpapababa ng uric acid sa ilang pag-aaral.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱40–80 / kilo",
    cooking_tip:"Igisa o ihalo sa itlog — asin muna at pisilin ng tuwalya para mabawasan ang pait nang walang matanggal na nutrients",
    sources:[
      {label:"DOH: Traditional & Alternative Medicine", url:"https://doh.gov.ph/traditional-alternative-medicine", badge:"DOH"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
    ]},

  { food_id:"kamote_001", name:"Kamote", aliases:["kamote","sweet potato","camote","camote tops","talbos ng kamote"], emoji:"🍠", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Mas mababa sa glycemic index kaysa puting kanin (GI 44 vs 73). Mataas sa fiber na nagpapabagal ng pagsipsip ng asukal. Inirerekomenda ng WHO at ADA bilang better carbohydrate choice.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"May iron at Vitamin C — ang Vitamin C nito ay nagpapalakas ng non-heme iron absorption, ayon sa FAO research.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Mataas sa beta-carotene at antioxidants na nagbabawas ng inflammation. Ang WHO ay kinilala ang root vegetables bilang anti-inflammatory foods.", badge:"WHO"},
      hypertension:{verdict:"kainin",    reason:"Napakataas sa potassium (337mg/100g). Ayon sa WHO at WHF, ang high-potassium foods ay nagpapababa ng blood pressure at nagpoprotekta sa puso.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Ang kamote ay mataas sa potassium (337mg/100g). Ayon sa NKF at KDIGO, ang mataas na potassium na pagkain ay dapat bantayan sa CKD stages 3–5. Para sa early CKD, okay pa. Lutuin ng nilaga at ibuhos ang tubig para mabawasan ang potassium.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang kamote ay complex carbohydrate na hindi nagpapalakas ng acid production. Ayon sa Cleveland Clinic GERD diet guidelines, ang root vegetables ay ligtas para sa GERD.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Mababa sa purines at mataas sa fiber. Ayon sa Arthritis Foundation at Cleveland Clinic, ang complex carbohydrates ay nagpapababa ng blood sugar -- mahalaga rin sa gout dahil nagpapababa ng insulin resistance na nagpapataas ng uric acid.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱30–50 / kilo",
    cooking_tip:"Nilaga o inihaw — mas mababa sa glycemic index kaysa pinirito. Para sa diabetes: 1 medium na kamote = 1 tasa ng kanin",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"WHF: Increasing Potassium for Hypertension", url:"https://world-heart-federation.org/what-we-do/hypertension/", badge:"WHF"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
    ]},

  { food_id:"pechay_001", name:"Pechay", aliases:["pechay","bok choy","petsay","chinese cabbage"], emoji:"🥬", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Halos walang carbohydrates (1.5g/100g). Ang WHO ay nagrerekomenda ng maraming non-starchy vegetables bilang pundasyon ng diabetes-friendly diet.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Mataas sa iron at folate na parehong kailangan sa paggawa ng hemoglobin. Ayon sa FAO, ang leafy greens ay mahalagang source ng non-heme iron sa Asia.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Walang purines. Ayon sa Arthritis Foundation, ang lahat ng leafy vegetables ay ligtas para sa gout at arthritis.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Mababa sa sodium at nagbibigay ng potassium at calcium. Kasama sa DASH diet na inirekomenda ng WHO para sa hypertension.", badge:"WHO"},
      ckd:          {verdict:"kainin",    reason:"Ang pechay ay mababa sa phosphorus at katamtaman sa potassium — isa sa mga pinaka-ligtas na gulay para sa CKD ayon sa KDIGO 2024 at American Kidney Fund.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang pechay ay alkaline at mataas sa fiber. Kinikilala ng ACG at Stanford GERD guidelines bilang ligtas na gulay para sa acid reflux.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang lahat ng leafy vegetables kasama ang pechay ay kinikilala ng Arthritis Foundation at ACR bilang LIGTAS para sa gout -- hindi nagpapataas ng uric acid anuman ang plant purine content.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱20–40 / kilo",
    cooking_tip:"Nilaga o igisa sa bawang — lutuin ng maikli (3–4 minuto) para mapanatili ang folate at iron",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FAO: Iron-Rich Plant Foods in Asia", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"Arthritis Foundation: Safe Vegetables for Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"PRA"},
    ]},

  { food_id:"sitaw_001", name:"Sitaw", aliases:["sitaw","string beans","long beans","snake beans"], emoji:"🫛", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Mababa sa glycemic index at mataas sa fiber. Nagpapabagal ng pagsipsip ng asukal. Kinikilala ng WHO at ADA bilang ideal na gulay para sa diabetes.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Nagbibigay ng non-heme iron at folate. Ayon sa FAO, ang regular na pagkain ng leguminous vegetables ay nagpapabuti ng iron status.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Walang purines at mataas sa antioxidants. Ligtas para sa arthritis at gout.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Mataas sa potassium at mababa sa sodium. Kasama sa WHO-recommended vegetables para sa blood pressure control.", badge:"WHO"},
      ckd:          {verdict:"kainin",    reason:"Ang sitaw ay mababa sa phosphorus at katamtaman sa potassium. Ayon sa American Kidney Fund, ang green beans at string beans ay isa sa mga recommended na gulay para sa CKD diet.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang sitaw ay mataas sa fiber at hindi nagpapalakas ng acid. Kinikilala ng ACG at Cleveland Clinic bilang GERD-safe na gulay.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Mababa sa purines at mataas sa fiber. Ayon sa Arthritis Foundation, ang lahat ng sariwang gulay kasama ang sitaw ay ligtas para sa gout at hindi nagdudulot ng gout flares.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱30–60 / kilo",
    cooking_tip:"Igisa sa bawang at sibuyas, o ihalo sa sinigang. Lutuin ng katamtaman para mapanatili ang nutrients",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FAO: Legumes & Micronutrient Bioavailability", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
    ]},

  { food_id:"talong_001", name:"Talong", aliases:["talong","eggplant","aubergine"], emoji:"🍆", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Napakababa sa carbohydrates (6g/100g) at mataas sa fiber. Inirerekomenda ng WHO at ADA bilang bahagi ng balanced diabetes diet.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"May iron at Vitamin C na tumutulong sa non-heme iron absorption. Ang FAO ay kinilala ang gulay na ito bilang micronutrient source sa Southeast Asia.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Walang purines. Ang nasunong na talong ay mataas sa antioxidants na nagbabawas ng inflammation.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Napakababa sa sodium (2mg/100g) at mataas sa potassium. Ang chlorogenic acid ng talong ay may blood pressure-lowering effect.", badge:"WHO"},
      ckd:          {verdict:"kainin",    reason:"Ang talong ay mababa sa phosphorus at potassium — isa sa mga pinaka-ligtas na gulay para sa CKD ayon sa KDIGO 2024 at NKF kidney diet guidelines.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang talong ay hindi acidic at ligtas para sa GERD. Ang inihaw na talong ay partikular na maganda para sa digestive health.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ayon sa Arthritis Foundation at Mayo Clinic, ang talong at lahat ng non-starchy vegetables ay ligtas para sa gout. Ang antioxidants nito ay may anti-inflammatory properties.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱30–60 / kilo",
    cooking_tip:"Inihaw na talong (ginisang talong) — mas mataas sa antioxidants kapag inihaw kaysa pinirito",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FAO: Food Composition in Southeast Asia", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
    ]},

  { food_id:"luya_001", name:"Luya / Salabat", aliases:["luya","ginger","salabat","ginger tea"], emoji:"🫚", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang gingerol ng luya ay nagpapababa ng blood sugar at nagpapabuti ng insulin sensitivity ayon sa mga pananaliksik. Mabuting kapalit ng kape.", badge:"DOH"},
      anemia:      {verdict:"kainin",    reason:"Nagpapalakas ng digestion at iron absorption. Pwedeng ihalo sa pagkain na may iron para mapalakas ang absorption.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Kinikilala ng Arthritis Foundation na ang luya ay natural anti-inflammatory — nagpapababa ng pain at swelling ng kasukasuan.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Ang gingerol at shogaol ng luya ay nagpapalakas ng blood circulation at tumutulong sa blood pressure control ayon sa WHO research.", badge:"WHO"},
      ckd:          {verdict:"kainin",    reason:"Ang luya ay mababa sa phosphorus at potassium. Ang KDIGO 2024 ay nagtataguyod ng natural anti-inflammatory foods tulad ng luya para sa CKD management.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang luya (salabat) ay kinikilala ng ACG at Johns Hopkins bilang natural na remedyo para sa GERD — nagpapalakas ng LES at nagpapabilis ng gastric emptying.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang luya ay natural anti-inflammatory na kinikilala ng Arthritis Foundation at ACR para sa gout pain management. Walang purines at ang gingerol nito ay nagpapababa ng uric acid crystal inflammation.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱20–40 / 100g",
    cooking_tip:"Ihalo sa tinola, sinigang, o gumawa ng salabat — mas mainam kaysa kape para sa lahat ng kalagayan",
    sources:[
      {label:"WHO: Traditional Medicine Global Strategy", url:"https://www.who.int/traditional-complementary-integrative-medicine/en/", badge:"WHO"},
      {label:"Arthritis Foundation: Ginger for Arthritis", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"PRA"},
      {label:"DOH: Traditional & Alternative Medicine", url:"https://doh.gov.ph/traditional-alternative-medicine", badge:"DOH"},
    ]},

  { food_id:"bawang_001", name:"Bawang", aliases:["bawang","garlic"], emoji:"🧄", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang allicin ng bawang ay nagpapababa ng blood sugar at nagpapabuti ng insulin sensitivity. Inirerekomenda ng WHO bilang functional food para sa NCDs.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Nagpapalakas ng iron absorption kapag ginamit sa pagluto ng iron-rich foods. Natural na enhancer ng non-heme iron.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Kinikilala ng Arthritis Foundation bilang natural anti-inflammatory na nagpapabawas ng cytokines na nagdudulot ng joint inflammation.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Pinakakilala ang bawang sa kakayahang magpababa ng blood pressure. Kinikilala ng WHO at WHF bilang evidence-based na functional food para sa hypertension.", badge:"WHF"},
      ckd:          {verdict:"kainin",    reason:"Ang bawang ay mababa sa phosphorus at potassium. Ayon sa KDIGO 2024, ang natural na anti-inflammatory foods tulad ng bawang ay may kidney-protective properties.", badge:"KDIGO"},
      gerd:         {verdict:"iwasan",    reason:"Ang bawang ay kinikilala ng ACG guidelines at Harvard Health bilang isa sa mga pangunahing GERD trigger — nagpapahina ng LES at nagpapalakas ng acid production. Kung may GERD, gamitin ang ibang pampalasa.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Mababa sa purines at may anti-inflammatory properties. Ayon sa Arthritis Foundation, ang bawang ay ligtas para sa gout at may potential protective effect sa uric acid levels.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱60–120 / kilo",
    cooking_tip:"Durugin ang bawang at hayaang huminga ng 10 minuto bago lutuin — nagpapalakas ng allicin content",
    sources:[
      {label:"WHO: Diet, Nutrition & Prevention of NCDs (916)", url:"https://www.who.int/publications/i/item/924120916X", badge:"WHO"},
      {label:"WHF: Healthy Diet & Heart Health", url:"https://world-heart-federation.org/what-we-do/healthy-diet/", badge:"WHF"},
      {label:"FAO: Iron Bioavailability Enhancers", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
    ]},

  // ── PROTINA (PROTEIN) ─────────────────────────────────────────────

  { food_id:"tokwa_001", name:"Tokwa / Tofu", aliases:["tokwa","tofu","bean curd","firm tofu"], emoji:"🧊", category:"Protina",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Mataas sa protina at walang carbohydrates. Ayon sa WHO at ADA, ang plant-based proteins tulad ng tofu ay mainam para sa blood sugar management.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Mataas sa non-heme iron (5.4mg/100g). Ayon sa FAO, ang pagkain ng tofu kasama ang Vitamin C (kalamansi) ay nagpapalakas ng iron absorption ng 2–3x.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Kinikilala ng Arthritis Foundation at National Kidney Foundation na ang tofu at legume-based proteins ay HINDI nagpapataas ng uric acid at ligtas para sa gout.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Mababa sa sodium at saturated fat. Kasama sa DASH diet na inirekomenda ng WHO at WHF. Ang isoflavones ng tofu ay may blood pressure-lowering effect.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Ang tokwa ay mataas sa phosphorus (190mg/100g). Ang KDIGO 2024 at NKF ay nagsasabi na ang tofu ay katanggap-tanggap sa moderate na dami para sa CKD — mas mababa sa bioavailable phosphorus kaysa animal proteins. Huwag hihigit sa 1 piraso bawat kain sa advanced CKD.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang tokwa ay lean, low-fat na protina na ligtas para sa GERD. Kinikilala ng ACG at Cleveland Clinic bilang magandang kapalit ng matabang karne para sa acid reflux patients.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang ACR at Arthritis Foundation (2024-2025 update) ay nagpapatunay na ang tofu at plant-based proteins ay HINDI nagpapataas ng uric acid at ligtas para sa gout -- kahit may moderate plant purines.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱15–25 / piraso",
    cooking_tip:"Igisa sa bawang — huwag labisan ng toyo. Para sa anemia: dagdag ng kalamansi para mas masipsip ang iron",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FAO: Iron Bioavailability — Plant Sources", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"Arthritis Foundation / National Kidney Foundation: Tofu & Gout", url:"https://www.kidney.org/news-stories/what-to-eat-and-avoid-if-you-have-gout", badge:"PRA"},
    ]},

  { food_id:"itlog_001", name:"Itlog", aliases:["itlog","egg","eggs","boiled egg","scrambled egg","pritong itlog","penoy"], emoji:"🥚", category:"Protina",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Walang carbohydrates — hindi nagpapataas ng blood sugar. Mataas sa protina na nagpapabusog ng mas matagal at nagpapababa ng post-meal glucose spike. Sinusuportahan ng ADA (2024).", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"May iron at B12 na kailangan sa hemoglobin formation. Ang FAO ay nagtatala na ang egg iron ay mas madaling masipsip kaysa plant iron, bagaman mababa sa bioavailability.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Napakababa sa purines. Kinikilala ng Arthritis Foundation at Mayo Clinic bilang isa sa pinakamainam na protein para sa arthritis patients.", badge:"PRA"},
      hypertension:{verdict:"limitahan", reason:"Ang pula ng itlog ay may 186mg cholesterol. Ang WHF at AHA ay nagrerekomenda ng maximum 1 itlog/araw para sa mga may cardiovascular risk. Ang puti ng itlog ay unlimited.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Ang itlog ay may phosphorus (86mg bawat itlog) at mataas na protina. Ayon sa KDIGO 2024, ang 1 itlog bawat araw ay katanggap-tanggap para sa early CKD. Sa advanced CKD, kumonsulta sa doktor. Ang puti ng itlog ay mas ligtas kaysa buong itlog.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang pinakuluang itlog o egg white ay ligtas para sa GERD. Ang egg yolk ay maaaring maging trigger dahil sa taba content — pero katamtaman lang sa most patients ayon sa ACG.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang itlog ay kinikilala ng Arthritis Foundation at Mayo Clinic bilang isa sa pinakamainam na protina para sa gout -- napakababa sa purines. Ligtas kumain ng 1 itlog bawat araw.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱7–10 / piraso",
    cooking_tip:"Pinakuluan (hard-boiled) o scrambled na walang mantika — pinakamainam para sa lahat ng kalagayan",
    sources:[
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"WHF: Healthy Diet & Heart Health", url:"https://world-heart-federation.org/what-we-do/healthy-diet/", badge:"WHF"},
      {label:"Arthritis Foundation: Safe Proteins for Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"PRA"},
      {label:"PHA Clinical Practice Guidelines", url:"https://www.pha.org.ph", badge:"PHA"},
    ]},

  { food_id:"monggo_001", name:"Monggo", aliases:["monggo","mung beans","munggo","ginisang monggo","mungo"], emoji:"🫘", category:"Protina",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Napababa sa glycemic index (GI 25). Mataas sa fiber at protina na nagpapabagal ng glucose absorption. Kinikilala ng WHO at ADA bilang isa sa pinakamainam na carbohydrate source para sa diabetes.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Isa sa pinakamataas na plant source ng iron sa Southeast Asia — 6.7mg/100g. Ayon sa FAO, ang monggo ay important na non-heme iron source para sa mga vegetarian.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Ang Arthritis Foundation ay malinaw na nagsasabing ang plant-based purines sa beans at lentils ay HINDI nagpapataas ng uric acid — ligtas para sa gout.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Napakataas sa potassium (369mg/100g) at mababa sa sodium. Kasama sa WHO at WHF recommendations para sa heart-healthy diet.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Ang monggo ay katamtaman sa phosphorus at potassium. Ayon sa KDIGO 2024, ang plant-based legumes ay preferred protein sa CKD dahil mas mababang phosphorus bioavailability kaysa animal protein. Limitahan ang dami sa advanced CKD.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang monggo at iba pang legumes ay mataas sa fiber at alkaline-forming. Kinikilala ng ACG at Cleveland Clinic bilang GERD-friendly na protina.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang Arthritis Foundation (2025) ay malinaw na nagsasabing ang beans at legumes kasama ang monggo ay HINDI nagpapataas ng uric acid -- at nagpoprotekta pa laban sa gout dahil sa mataas na fiber content.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱80–120 / kilo",
    cooking_tip:"Ginisang monggo na may dahon ng ampalaya o malunggay at sibuyas — para mapalakas ang iron absorption, dagdag ng kalamansi",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FAO: Legumes as Iron-Rich Foods", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"Arthritis Foundation: Legumes & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"PRA"},
      {label:"WHF: Healthy Diet & Heart Health", url:"https://world-heart-federation.org/what-we-do/healthy-diet/", badge:"WHF"},
    ]},

  { food_id:"garbanzos_001", name:"Garbanzos / Chickpeas", aliases:["garbanzos","chickpeas","garbanzo","chick peas"], emoji:"🫘", category:"Protina",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Napakababa sa glycemic index (GI 10). Ayon sa WHO at ADA (2024), ang legumes tulad ng chickpeas ay nagpapababa ng post-meal blood sugar at nagpapabuti ng A1C.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Mataas sa iron (2.9mg/100g) at folate. Ayon sa FAO, ang legumes ay isa sa pinakamahalagang non-heme iron source sa developing countries.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Kinikilala ng National Kidney Foundation at Arthritis Foundation na ang chickpeas at iba pang legumes ay excellent protein choice para sa gout — hindi nagpapataas ng uric acid.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Mataas sa potassium at fiber, mababa sa sodium. Kasama sa DASH diet na inirekomenda ng WHO at WHF para sa blood pressure management.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Ang garbanzos ay may phosphorus at potassium ngunit mas mababa sa bioavailability kaysa animal protein ayon sa KDIGO 2024. Katanggap-tanggap sa moderate na dami para sa CKD stages 1–3.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang garbanzos ay high-fiber at alkaline-forming. Ligtas para sa GERD ayon sa ACG at Cleveland Clinic GERD diet guidelines.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ayon sa ACR at Arthritis Foundation, ang chickpeas at lahat ng legumes ay ligtas para sa gout -- inirerekomenda bilang kapalit ng red meat. Hindi nagpapataas ng uric acid.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱60–100 / 400g lata",
    cooking_tip:"Luto ng mabuti — lutuin ng sinigang o ihalo sa gulay. Maaari ring gawing hummus na may kalamansi",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FAO: Legumes — Nutritional & Health Benefits", url:"https://www.fao.org/3/i3800e/i3800e.pdf", badge:"FAO"},
      {label:"National Kidney Foundation: Gout-Friendly Foods", url:"https://www.kidney.org/news-stories/what-to-eat-and-avoid-if-you-have-gout", badge:"PRA"},
    ]},

  // ── KANIN / BUTIL (GRAINS) ────────────────────────────────────────

  { food_id:"puting_kanin_001", name:"Puting Kanin", aliases:["kanin","rice","puting kanin","white rice","bigas","sinangag","fried rice"], emoji:"🍚", category:"Kanin",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Mataas sa glycemic index (GI 73) ang puting kanin. Ayon sa WHO at ADA (2024), ang refined grains ay dapat palitan ng whole grains o bawasan. 3/4 tasa lang bawat kain, kasama ng protina at gulay.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Walang direktang negatibong epekto sa anemia. Ang WHO ay nagrerekomenda ng fortified rice sa mga lugar na may mataas na anemia prevalence.", badge:"WHO"},
      arthritis:   {verdict:"kainin",    reason:"Walang purines. Ayon sa Mayo Clinic at Arthritis Foundation, ang kanin ay neutral para sa gout at arthritis.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Walang sodium. Okay lang kumain basta hindi labis. Ang WHO ay hindi nagbabawal ng kanin para sa hypertension — ang dami at ulam ang mahalaga.", badge:"WHO"},
      ckd:          {verdict:"kainin",    reason:"Ang puting kanin ay isa sa pinaka-ligtas na pagkain para sa CKD — mababa sa phosphorus, potassium, at sodium. Ayon sa NKF at American Kidney Fund, ang white rice ay explicitly recommended para sa renal diet.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang puting kanin ay complex carbohydrate na nagse-soak ng acid at hindi nagpapalakas ng reflux. Kinikilala ng ACG at Johns Hopkins bilang GERD-safe na grain.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang puting kanin ay napakababa sa purines. Ayon sa Mayo Clinic at Arthritis Foundation, ang pagpapalit sa whole grains ay mas mainam pa para sa blood sugar at weight management na nakakatulong din sa gout.", badge:"ACR"},
    },
    safe_alternative:"Brown rice (GI 50) o kamote (GI 44) — mas mababa sa glycemic index at mas mataas sa fiber para sa diabetes",
    price_estimate:"₱45–55 / kilo",
    cooking_tip:"Para sa diabetes: 3/4 tasa bawat kain kasama ng gulay at protina. Lutuin na malambot pero hindi sobra-kaya mas mababa ang GI",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"ADA Standards of Care in Diabetes 2024", url:"https://diabetesjournals.org/care/article/47/Supplement_1/S1/153948/Standards-of-Care-in-Diabetes-2024", badge:"WHO"},
      {label:"FNRI Dietary Reference Intakes for Filipinos", url:"https://fnri.dost.gov.ph", badge:"FNRI"},
    ]},

  { food_id:"brown_rice_001", name:"Brown Rice", aliases:["brown rice","buong trigo na bigas","red rice","whole grain rice"], emoji:"🍙", category:"Kanin",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Mas mababa sa glycemic index (GI 50) kaysa puting kanin. Mataas sa fiber. Ayon sa WHO at ADA, ang whole grains ay nagpapababa ng diabetes risk ng 10–22%.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"May iron at B vitamins. Ang bran layer ng brown rice ay nagbibigay ng karagdagang micronutrients kumpara sa white rice.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Walang purines. Ligtas para sa arthritis. Ang fiber nito ay nagpapababa ng overall inflammation.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Mas mataas sa fiber at magnesium kaysa white rice — parehong tumutulong sa blood pressure control ayon sa WHO.", badge:"WHO"},
      ckd:          {verdict:"limitahan",    reason:"Ang brown rice ay mas mataas sa phosphorus at potassium kaysa puting kanin. Ayon sa NKF, ang white rice ay mas mainam kaysa brown rice para sa renal diet. Para sa early CKD, okay pa ang brown rice.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang brown rice ay mataas sa fiber at alkaline-forming — nagpapababa ng acid. Kinikilala ng ACG at Harvard Health bilang preferred grain para sa GERD.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang whole grains tulad ng brown rice ay inirerekomenda ng Arthritis Foundation, ACR, at isang 2025 study sa Arthritis Care & Research -- nagpapababa ng gout risk at nagtutulong sa blood sugar regulation.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱70–90 / kilo",
    cooking_tip:"Palagan ang puting kanin ng brown rice — maaaring ihalo 50/50 para mas madaling tinanggap ang panlasa",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"European Diabetologia: Whole Grains for Diabetes", url:"https://link.springer.com/article/10.1007/s00125-023-05894-8", badge:"WHO"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
    ]},

  // ── PRUTAS (FRUITS) ───────────────────────────────────────────────

  { food_id:"dayap_001", name:"Kalamansi / Dayap", aliases:["kalamansi","dayap","calamansi","lime","lemon","citrus"], emoji:"🍋", category:"Prutas",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Napakababa sa sugar (1.7g/100g). Ang Vitamin C nito ay nagpapabuti ng insulin sensitivity. Ayon sa WHO at ADA, ang citrus fruits ay ligtas at mainam para sa diabetes.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Ang Vitamin C (53mg/100g) ng kalamansi ay nagpapalakas ng non-heme iron absorption ng 2–3x. Ito ang pinakamahalaga at pinaka-praktikal na iron absorption enhancer ayon sa FAO.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Mataas sa Vitamin C na nagpapababa ng uric acid levels. Ayon sa Arthritis Foundation, ang regular na Vitamin C intake ay nagbabawas ng gout risk.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Ang citrus bioflavonoids ay tumutulong sa blood vessel health at nagpapababa ng blood pressure. Kinikilala ng WHO at WHF.", badge:"WHF"},
      ckd:          {verdict:"kainin",    reason:"Ang kalamansi ay mababa sa phosphorus at potassium. Ligtas para sa CKD. Ang Vitamin C nito ay mahalaga rin sa CKD patients para sa immune function.", badge:"NKF"},
      gerd:         {verdict:"iwasan",    reason:"Ang kalamansi at iba pang citrus fruits ay isa sa mga pangunahing GERD trigger — ang asim nito ay direktang nagpapalakas ng acid reflux at nagmamasakit ng esophagus. Kinikilala ng ACG guidelines, Harvard Health, at Johns Hopkins.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang Vitamin C ng kalamansi ay nagpapababa ng uric acid levels. Ang Arthritis Foundation ay nagrerekomenda ng hindi bababa sa 500mg Vitamin C bawat araw para sa gout. Ang kalamansi ay pinakamainam na daily habit para sa gout prevention.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱10–20 / daan",
    cooking_tip:"Pigain sa isda, gulay, at monggo bago kumain — pinakamabisang paraan para mapalakas ang iron absorption ng hanggang 3x",
    sources:[
      {label:"FAO: Vitamin C as Iron Absorption Enhancer", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"Arthritis Foundation: Vitamin C & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"PRA"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
    ]},

  { food_id:"saging_001", name:"Saging na Saba", aliases:["saging","banana","saba","lakatan","saging na saba","banana cue"], emoji:"🍌", category:"Prutas",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang saging ay may carbohydrates (23g/100g). Ayon sa WHO at ADA, ang prutas ay dapat kainin sa katamtaman — 1 medium na saging (GI 51) bawat araw ay okay, pero hindi hihigit.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"May iron at Vitamin B6 na tumutulong sa hemoglobin synthesis. Ayon sa FAO, ang saging ay important na source ng micronutrients sa Southeast Asia.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Walang purines at mataas sa potassium at Vitamin B6. Ayon sa Arthritis Foundation, ang saging ay ligtas at beneficial para sa gout.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Napakataas sa potassium (358mg/100g). Kinikilala ng WHO at WHF na ang potassium ay nagpapababa ng blood pressure at nagpoprotekta sa stroke.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Ang saging ay mataas sa potassium (358mg/100g) — pangunahing alalahanin sa CKD. Ayon sa NKF at American Kidney Fund, ang saging ay nasa listahan ng high-potassium foods na dapat limitahan sa CKD stage 3–5.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang saging ay naturally alkaline at nagtatakip ng esophageal lining. Kinikilala ng ACG, Johns Hopkins, at Cleveland Clinic bilang isa sa pinaka-mainam na prutas para sa GERD.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang saging ay mababa sa purines at ligtas para sa gout ayon sa Mayo Clinic at Arthritis Foundation. Ang potassium nito ay nagpapalakas ng uric acid excretion sa ihi.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱5–10 / piraso",
    cooking_tip:"Nilaga o inihaw — mas mababa sa glycemic load kaysa banana cue na may asukal at mantika",
    sources:[
      {label:"WHO: Increasing Potassium Intake for Hypertension", url:"https://www.who.int/tools/elena/interventions/potassium-cvd-adults", badge:"WHO"},
      {label:"WHF: Hypertension & Heart Health", url:"https://world-heart-federation.org/what-we-do/hypertension/", badge:"WHF"},
      {label:"FAO: Nutritive Value of Tropical Fruits", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
    ]},

  { food_id:"mangga_001", name:"Mangga", aliases:["mangga","mango","hinog na mangga","ripe mango"], emoji:"🥭", category:"Prutas",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang hinog na mangga ay mataas sa natural na asukal (14g/100g). Ayon sa ADA (2024) at WHO, ang prutas ay okay pero sa katamtaman — kalahating tasa lang bawat araw para sa diabetes.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Mataas sa Vitamin C (36mg/100g) at folate na nagpapalakas ng non-heme iron absorption. Pinatunayan ng FAO na ang Vitamin C sa prutas ay epektibong iron absorption enhancer.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Walang purines. May anti-inflammatory antioxidants tulad ng mangiferin. Ligtas para sa arthritis at gout.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Nagbibigay ng potassium at magnesium na tumutulong sa blood pressure. Ang WHO ay nagrerekomenda ng pagkain ng prutas bilang bahagi ng heart-healthy diet.", badge:"WHO"},
      ckd:          {verdict:"limitahan",    reason:"Ang mangga ay mataas sa potassium (168mg/100g). Ayon sa NKF at American Kidney Fund, ang tropical fruits tulad ng mangga ay dapat bantayan sa CKD. Kalahating mangga bawat serving para sa CKD stage 3–5.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang hinog na mangga ay hindi highly acidic at generally tolerated ng GERD patients sa katamtamang dami. Ang ripeness ay mahalaga — mas hinog = mas mababa sa acidity.", badge:"ACG"},
      gout:         {verdict:"limitahan",    reason:"Ang mangga ay mataas sa fructose na nagpapataas ng uric acid production ayon sa Arthritis Foundation. Kalahating mangga bawat serving lang -- mas mainam ang kalamansi o papaya na mas mababa sa fructose.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱30–80 / piraso",
    cooking_tip:"Para sa diabetes: kalahating mangga (o mga 1/2 tasa ng hiwa) kasama ng meal — huwag kainin sa pagitan ng kainan",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FAO: Vitamin C Content of Tropical Fruits", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
    ]},

  { food_id:"papaya_001", name:"Papaya", aliases:["papaya","pawpaw","ripe papaya","green papaya"], emoji:"🍈", category:"Prutas",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Mas mababa sa glycemic index (GI 60) at mataas sa fiber. Ang WHO ay kinilala ang papaya bilang beneficial fruit para sa blood sugar management.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Pinakamataas sa Vitamin C sa mga lokal na prutas (62mg/100g) — nagpapalakas ng iron absorption ng hanggang 3x ayon sa FAO guidelines.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"May papain at chymopapain na may anti-inflammatory properties. Walang purines — ligtas para sa arthritis.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Mataas sa potassium (182mg/100g) at mababa sa sodium. Kinikilala ng WHO at WHF bilang heart-friendly fruit.", badge:"WHO"},
      ckd:          {verdict:"kainin",    reason:"Ang papaya ay katamtaman sa potassium at mababa sa phosphorus. Ayon sa American Kidney Fund, ang papaya ay isa sa mga kidney-friendly fruits na maaaring kainin ng may CKD.", badge:"NKF"},
      gerd:         {verdict:"kainin",    reason:"Ang papaya ay kilala sa papain enzyme nito na tumutulong sa digestion at nagpapababa ng acid. Kinikilala ng ACG at CHOP bilang isa sa pinakamainam na prutas para sa GERD.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang papaya ay mababa sa fructose at mataas sa Vitamin C na nagpapababa ng uric acid. Ayon sa Arthritis Foundation, ang prutas na mataas sa Vitamin C at mababa sa fructose ay pinakamainam para sa gout.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱20–50 / piraso",
    cooking_tip:"Hilaw na papaya (tinola o atchara) o hinog — parehong nutritious. Para sa anemia: kumain kasama ng iron-rich na pagkain",
    sources:[
      {label:"FAO: Vitamin C as Iron Absorption Enhancer", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
    ]},

  // ── INUMIN (DRINKS) ───────────────────────────────────────────────

  { food_id:"softdrinks_001", name:"Softdrinks / Soda", aliases:["softdrinks","soda","cola","coke","pepsi","sprite","royal","rc cola","mountain dew","softdrink"], emoji:"🥤", category:"Inumin",
    conditions:{
      diabetes:    {verdict:"iwasan",    reason:"Isang baso (330ml) ay may 35g asukal — katumbas ng 9 kutsarita. Ayon sa WHO, ang sugar-sweetened beverages ay dapat limitahan o iwasan dahil pangunahing sanhi ng obesity at type 2 diabetes.", badge:"WHO"},
      anemia:      {verdict:"iwasan",    reason:"Walang nutritional value. Ayon sa FAO research, ang phosphoric acid ng cola drinks ay pumipigil sa iron absorption. Ang fructose nito ay nagpapababa rin ng iron bioavailability.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Kinikilala ng Arthritis Foundation at Mayo Clinic na ang high-fructose corn syrup sa softdrinks ay nagpapataas ng uric acid sa katawan — pinakamapanganib para sa gout.", badge:"PRA"},
      hypertension:{verdict:"iwasan",    reason:"Ayon sa WHF, ang regular na pag-inom ng sweetened beverages ay direktang nagpapataas ng blood pressure at cardiovascular risk. Ito ang isa sa pinakamapanganib na inumin para sa puso.", badge:"WHF"},
      ckd:          {verdict:"iwasan",    reason:"Ang colas at dark sodas ay mataas sa phosphoric acid — direktang nagpapataas ng phosphorus sa dugo ng CKD patients. Ayon sa KDIGO 2024 at NKF, ang colas ay isa sa mga pinaka-mapanganib na inumin para sa CKD.", badge:"KDIGO"},
      gerd:         {verdict:"iwasan",    reason:"Ang carbonated beverages ay nagpapataas ng stomach pressure at nagpapahina ng LES. Ayon sa ACG guidelines at Harvard Health, ang softdrinks at soda ay isa sa mga pinaka-mapanganib na inumin para sa GERD.", badge:"ACG"},
      gout:         {verdict:"iwasan",    reason:"Isa sa pinaka-mapanganib na inumin para sa gout. Ang high-fructose corn syrup ng softdrinks ay direktang nagpapataas ng uric acid production sa atay. Ayon sa Arthritis Foundation, ACR, at NKF, ang regular na pag-inom ay nagdodoble ng gout risk.", badge:"ACR"},
    },
    safe_alternative:"Tubig na may piga ng kalamansi — libre, masustansya, at nagpapalakas pa ng iron absorption",
    price_estimate:"₱15–25 / bote", cooking_tip:null,
    sources:[
      {label:"WHO Healthy Diet — Free Sugars", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"Arthritis Foundation: Sugary Drinks & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"PRA"},
      {label:"FAO: Iron Absorption Inhibitors", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
    ]},

  { food_id:"kape_001", name:"Kape", aliases:["kape","coffee","3-in-1","kapeng barako","nescafe","kopiko","brewed coffee"], emoji:"☕", category:"Inumin",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang black coffee ay okay — may pananaliksik na nagpapakita ng lower diabetes risk. Pero ang 3-in-1 ay may 15–20g asukal bawat sachet na mapanganib para sa diabetes. Ayon sa WHO, ang mga added sugars ay dapat limitahan.", badge:"WHO"},
      anemia:      {verdict:"limitahan", reason:"Kinikilala ng FAO na ang tannins at polyphenols ng kape ay nagpapababa ng non-heme iron absorption ng hanggang 50%. Huwag uminom ng kape 1 oras bago o 2 oras pagkatapos kumain ng iron-rich na pagkain.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Ayon sa Arthritis Foundation at Mayo Clinic, ang regular na coffee drinkers ay may mas mababang risk ng gout. Ang antioxidants ng kape ay nagpapababa ng uric acid.", badge:"PRA"},
      hypertension:{verdict:"limitahan", reason:"Ang caffeine ay pansamantalang nagpapataas ng blood pressure. Ayon sa WHF, ang 1–2 tasa ng black coffee bawat araw ay pangkaraniwan ay okay para sa most people na may hypertension.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Ang kape ay acidic at maaaring nagpapabilis ng CKD progression sa ilang pag-aaral. Ayon sa KDIGO, ang 1–2 tasa ng black coffee bawat araw ay generally okay para sa early CKD pero iwasan ang 3-in-1 na may creamer.", badge:"KDIGO"},
      gerd:         {verdict:"iwasan",    reason:"Ang kape ay isa sa mga pinaka-kilalang GERD trigger — nagpapahina ng LES at nagpapataas ng acid secretion. Kinikilala ng ACG clinical guidelines, Harvard Health, at Johns Hopkins bilang food na dapat iwasan ng mga may GERD.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang kape ay nagpapababa ng uric acid -- isang positibong sorpresa. Ayon sa Arthritis Foundation at Cleveland Clinic, ang regular na coffee drinkers ay may mas mababang uric acid levels. Nagpapabagal ng purine breakdown at nagpapabilis ng uric acid excretion. 1-2 tasa ng black coffee bawat araw ay mainam para sa gout.", badge:"ACR"},
    },
    safe_alternative:"Salabat (luya tea) — walang caffeine, anti-inflammatory, at hindi pumipigil ng iron absorption",
    price_estimate:"₱5–10 / sachet",
    cooking_tip:"Black coffee lang — iwasan ang 3-in-1. Huwag uminom ng kape kasabay ng kumakain para hindi mabawasan ang iron absorption",
    sources:[
      {label:"FAO: Coffee Polyphenols & Iron Absorption Inhibition", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"Arthritis Foundation: Coffee & Gout Risk", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"PRA"},
      {label:"WHO Healthy Diet — Free Sugars", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"WHF: Hypertension & Heart Health", url:"https://world-heart-federation.org/what-we-do/hypertension/", badge:"WHF"},
    ]},

  { food_id:"tubig_001", name:"Tubig (Water)", aliases:["tubig","water","mineral water","drinking water"], emoji:"💧", category:"Inumin",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang WHO at ADA ay nagrerekomenda ng tubig bilang pangunahing inumin para sa lahat — lalo na para sa diabetes. Nagpapababa ng blood glucose concentration at nagpapalusog ng kidneys.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Mahalaga para sa lahat ng bodily functions kasama ang pagdadala ng oxygen. Ang sapat na hydration ay tumutulong sa iron transport sa katawan.", badge:"WHO"},
      arthritis:   {verdict:"kainin",    reason:"Kinikilala ng Arthritis Foundation at Mayo Clinic na ang sapat na tubig (8–16 baso/araw) ay nagtatanggal ng uric acid sa pamamagitan ng ihi — pinakamahalagang non-drug strategy para sa gout.", badge:"PRA"},
      hypertension:{verdict:"kainin",    reason:"Ang sapat na hydration ay mahalaga para sa blood pressure control. Ang WHO at WHF ay nagrerekomenda ng tubig bilang pinakamagandang inumin para sa lahat.", badge:"WHF"},
      ckd:          {verdict:"limitahan",    reason:"Para sa advanced CKD (stage 4–5) at dialysis patients, ang fluid intake ay dapat limitahan dahil hindi na kayang alisin ng bato ang sobrang tubig. Para sa early CKD (stage 1–3): 8 baso bawat araw ay okay. Kumonsulta sa doktor.", badge:"KDIGO"},
      gerd:         {verdict:"kainin",    reason:"Ang tubig ay pinakamagandang inumin para sa GERD — nagdidilute ng stomach acid at nagpapabilis ng gastric emptying. Kinikilala ng ACG at Stanford GERD guidelines.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang tubig ay pinakamahalaga sa gout management. Ayon sa Arthritis Foundation at Mayo Clinic, ang 8-16 baso ng tubig bawat araw ay nagtatanggal ng uric acid sa pamamagitan ng ihi at nagpipigil ng crystal formation sa mga kasukasuan.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"Libre (gripo) / ₱10–20 (bote)",
    cooking_tip:"Siguraduhing uminom ng 8–10 baso bawat araw. Para sa gout: 16 baso bawat araw kapag may atake",
    sources:[
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"Arthritis Foundation: Hydration & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"PRA"},
    ]},

  // ── PROCESSED / HIGH-RISK ─────────────────────────────────────────

  { food_id:"instant_noodles_001", name:"Instant Noodles", aliases:["lucky me","payless","instant noodles","noodles","pancit canton","mami","cup noodles","nissin"], emoji:"🍜", category:"Processed",
    conditions:{
      diabetes:    {verdict:"iwasan",    reason:"Napakataas sa refined carbohydrates (74g/pack) na nagpapataas ng blood sugar nang mabilis. Kinikilala ng WHO at ADA bilang ultra-processed food na dapat iwasan ng mga diabetic.", badge:"WHO"},
      anemia:      {verdict:"iwasan",    reason:"Ayon sa FAO, ang mataas na sodium content ng instant noodles ay nakakasagabal sa iron absorption. Pati na rin ang preservatives. Walang nutritional value para sa anemia.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Kinikilala ng WHO at Arthritis Foundation na ang ultra-processed foods ay nagpapalakas ng systemic inflammation na nagpapalala ng arthritis at gout symptoms.", badge:"WHO"},
      hypertension:{verdict:"iwasan",    reason:"Isang pack ay may 1,760–2,000mg sodium — na lampas na sa WHO daily limit na 2,000mg. Isa sa mga pinaka-mapanganib na pagkain para sa hypertension.", badge:"WHF"},
      ckd:          {verdict:"iwasan",    reason:"Ang instant noodles ay napakataas sa sodium (1,760mg/pack) at phosphate additives — parehong kritikal na alalahanin sa CKD. Ayon sa KDIGO 2024, ang ultra-processed foods na may phosphate additives ay pinaka-mapanganib para sa CKD.", badge:"KDIGO"},
      gerd:         {verdict:"iwasan",    reason:"Ang instant noodles ay mataas sa taba at ultra-processed — nagpapahina ng LES at nagpapalakas ng acid reflux. Kinikilala ng ACG at Cleveland Clinic bilang GERD trigger.", badge:"ACG"},
      gout:         {verdict:"iwasan",    reason:"Ang ultra-processed foods tulad ng instant noodles ay mataas sa sodium at preservatives na nagpapalakas ng systemic inflammation. Ayon sa ACR at WHO, ang processed foods ay nagpapalala ng gout at iba pang inflammatory conditions.", badge:"ACR"},
    },
    safe_alternative:"Lugaw na may itlog at malunggay — mas mura (₱5–10), mas masustansya, at ligtas sa lahat ng kalagayan",
    price_estimate:"₱8–15 / pack",
    cooking_tip:"Kung talagang kakain: gamitin lamang ang kalahating seasoning packet at dagdag ng maraming gulay",
    sources:[
      {label:"WHO Healthy Diet — Ultra-Processed Foods", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"WHF: Reducing Sodium Intake", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"FAO: Sodium and Iron Absorption", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"DOH Healthy Diet Campaign", url:"https://doh.gov.ph/node/7771", badge:"DOH"},
    ]},

  { food_id:"toyo_001", name:"Toyo / Patis", aliases:["toyo","soy sauce","patis","fish sauce","bagoong","suka"], emoji:"🫙", category:"Processed",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang toyo at patis ay walang carbohydrates kaya hindi nagpapataas ng blood sugar, pero ang regular na paggamit ay nagpapataas ng cardiovascular risk sa mga diabetic.", badge:"WHO"},
      anemia:      {verdict:"limitahan", reason:"Ang toyo ay may maliit na iron pero ang mataas na sodium nito ay hindi mainam para sa overall health. Huwag gamitin kasabay ng iron-rich na pagkain.", badge:"FAO"},
      arthritis:   {verdict:"limitahan", reason:"Walang purines ang toyo, pero ang mataas na sodium ay nagpapalakas ng systemic inflammation. Limitahan ang paggamit.", badge:"PRA"},
      hypertension:{verdict:"iwasan",    reason:"Ang 1 kutsara ng toyo ay may 900mg sodium — halos kalahati ng WHO daily limit. Ang WHF ay nagtuturo na ang soy sauce at fish sauce ay pangunahing sources ng sodium sa Southeast Asia.", badge:"WHF"},
      ckd:          {verdict:"iwasan",    reason:"Ang toyo at patis ay napakataas sa sodium at phosphorus additives. Ayon sa KDIGO 2024 at NKF, ang high-sodium condiments ay dapat iwasan ng lahat ng CKD patients dahil nagpapabilis ng kidney damage.", badge:"KDIGO"},
      gerd:         {verdict:"limitahan",    reason:"Ang toyo ay mataas sa sodium na maaaring magpalala ng GERD sa ilang tao. Gamitin ng katamtaman — ang maalat na pagkain ay nagpapalakas ng acid secretion.", badge:"ACG"},
      gout:         {verdict:"limitahan",    reason:"Walang purines ang toyo ngunit ang mataas na sodium ay nagpapalakas ng dehydration na nagkonkoncentrate ng uric acid sa dugo. Ayon sa Arthritis Foundation, ang pagbabawas ng sodium ay tumutulong din sa gout management.", badge:"ACR"},
    },
    safe_alternative:"Kalamansi at bawang para sa lasa — libre sa sodium at nagdadagdag pa ng flavor at iron absorption",
    price_estimate:"₱15–30 / bote",
    cooking_tip:"Gamitin ang low-sodium soy sauce, o kalamansi at bawang para sa lasa. Kalahating kutsara lang kung talagang kailangan",
    sources:[
      {label:"WHF: Reducing Sodium — Southeast Asia", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"WHO: Reducing Sodium Intake", url:"https://www.who.int/tools/elena/interventions/sodium-cvd-adults", badge:"WHO"},
      {label:"DOH Healthy Diet Guidelines", url:"https://doh.gov.ph/node/7771", badge:"DOH"},
    ]},

  { food_id:"asin_001", name:"Asin / Table Salt", aliases:["asin","salt","table salt","iodized salt","rock salt"], emoji:"🧂", category:"Processed",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang sobrang asin ay nagpapataas ng blood pressure na mas mapanganib para sa mga diabetic. Ang WHO ay nagrerekomenda ng <5g asin/araw para sa lahat.", badge:"WHO"},
      anemia:      {verdict:"kainin",    reason:"Ang iodized salt ay nagrerekumenda ng WHO bilang cost-effective na paraan ng iodine fortification. Hindi direktang nakaka-apekto sa anemia.", badge:"WHO"},
      arthritis:   {verdict:"limitahan", reason:"Walang purines ang asin, pero ang mataas na sodium intake ay nagpapalakas ng inflammation. Limitahan ang paggamit.", badge:"PRA"},
      hypertension:{verdict:"iwasan",    reason:"Ayon sa WHO at WHF, ang pagbabawas ng asin sa <5g/araw ay nagpapababa ng blood pressure ng higit sa 10mmHg. Ito ang pinaka-cost-effective na lifestyle change para sa hypertension.", badge:"WHF"},
      ckd:          {verdict:"iwasan",    reason:"Ang asin ay direktang nagpapabilis ng CKD progression sa pamamagitan ng pagpapataas ng blood pressure at renal filtration pressure. Ayon sa KDIGO 2024, ang <2,000mg sodium/araw ay kinakailangan para sa lahat ng CKD patients.", badge:"KDIGO"},
      gerd:         {verdict:"limitahan",    reason:"Ang sobrang maalat na pagkain ay maaaring nagpapalakas ng acid secretion. Ang ACG guidelines ay nagrerekomenda ng pangkalahatang pagbabawas ng processed at salty foods para sa GERD management.", badge:"ACG"},
      gout:         {verdict:"limitahan",    reason:"Ang sobrang sodium ay nagpapabawas ng uric acid excretion ng bato. Ayon sa ACR at Arthritis Foundation, ang mababang sodium diet ay tumutulong sa gout management bukod sa hypertension control.", badge:"ACR"},
    },
    safe_alternative:"Limon, kalamansi, bawang, luya, at sibuyas — nagbibigay ng lasa nang walang sodium",
    price_estimate:"₱5–15 / 250g",
    cooking_tip:"Gamiting pampakulay ng tubig kung nilalaga, pero huwag dagdag sa pagkain bago at pagkatapos magluto",
    sources:[
      {label:"WHO: Reducing Sodium to Reduce Blood Pressure", url:"https://www.who.int/tools/elena/interventions/sodium-cvd-adults", badge:"WHO"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"WHO Global Sodium Reduction Report 2023", url:"https://www.who.int/publications/i/item/9789240069985", badge:"WHO"},
    ]},

  // ── BAGONG ISDA (NEW FISH) ─────────────────────────────────────────

  { food_id:"salmon_001", name:"Salmon", aliases:["salmon","salmo","smoked salmon","salmon fillet","grilled salmon"], emoji:"🐟", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Walang carbohydrates at napakataas sa lean protein. Ang omega-3 DHA/EPA ng salmon ay nagpapabuti ng insulin sensitivity at nagbabawas ng cardiovascular risk sa diabetes ayon sa ADA (2024) at WHO.", badge:"WHO"},
      hypertension:{verdict:"kainin",    reason:"Ang omega-3 at potassium ng salmon ay nagpapababa ng triglycerides at blood pressure. Inirerekomenda ng WHF at WHO ang fatty fish na 2x bawat linggo para sa heart health. Inihaw lang — walang dagdag na asin.", badge:"WHF"},
      ckd:         {verdict:"limitahan", reason:"Ang salmon ay mataas sa phosphorus (~318mg/100g) at potassium (~628mg/100g). Ayon sa NKF at Fresenius Kidney Care, ang salmon ay okay sa moderate na dami para sa CKD stage 1–3. Para sa stage 4–5, limitahan ang 85–100g bawat pagkain at kumonsulta sa renal dietitian.", badge:"NKF"},
      anemia:      {verdict:"kainin",    reason:"Pinakamataas sa heme iron at B12 sa mga isda — tumutulong sa paggawa ng hemoglobin at myelin ng nerbo. Ayon sa FAO, ang fatty fish ay isa sa pinakamainam na iron at B12 source.", badge:"FAO"},
      arthritis:   {verdict:"limitahan", reason:"Ang salmon ay moderate sa purines (63–67mg/100g) at ang Gout Education Society ay nagsasabi na ang salmon ay isa sa mas ligtas na isda para sa gout. Ang omega-3 nito ay nagpapababa pa ng inflammation. Limitahan sa 85–115g bawat serving, 2–3x bawat linggo.", badge:"PRA"},
      gerd:        {verdict:"kainin",    reason:"Ang inihaw o nilaga na salmon ay lean protein na hindi nagpapalakas ng acid production. Kinikilala ng ACG at Harvard Health bilang GERD-safe na protina.", badge:"ACG"},
      gout:         {verdict:"limitahan",    reason:"Ang salmon ay moderate sa purines (63-67mg/100g). Ayon sa Arthritis Foundation (2025 update), ang cold-water fish ay maaaring magpataas ng uric acid ngunit ang heart benefits ay mas malaki kaysa panganib sa katamtamang dami. Limitahan sa 85-115g, 2-3x bawat linggo.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱400–700 / 100g (imported)",
    cooking_tip:"Inihaw o lutong oven — walang butter o maasim na sarsa. Para sa CKD: 85–100g bawat pagkain",
    sources:[
      {label:"NKF: Which Fish are Best to Eat with Kidney Disease?", url:"https://www.kidney.org/kidney-topics/fish", badge:"NKF"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"WHF: Healthy Diet & Heart Health", url:"https://world-heart-federation.org/what-we-do/healthy-diet/", badge:"WHF"},
      {label:"Arthritis Foundation: Gout and Fish", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"PRA"},
    ]},

  { food_id:"bangus_001", name:"Bangus (Milkfish)", aliases:["bangus","milkfish","bangus belly","daing na bangus","sinangag bangus","bangus sa sinigang","inihaw na bangus"], emoji:"🐟", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Walang carbohydrates at 22g protein bawat 100g. Ang omega-3 DHA ng bangus ay nagpapabuti ng insulin sensitivity at nagbabawas ng triglycerides ayon sa WHO. Bilang pambansang isda ng Pilipinas, ito ay isa sa pinaka-accessible na heart-healthy protein para sa mga Filipino.", badge:"WHO"},
      hypertension:{verdict:"limitahan", reason:"Ang sariwang o inihaw na bangus ay ligtas para sa hypertension. Pero ang daing na bangus at bangus belly na pinirito ay mataas sa sodium at saturated fat. Ayon sa WHF, piliin ang inihaw at iwasan ang binabad o piniritong bangus.", badge:"WHF"},
      ckd:         {verdict:"limitahan", reason:"Ang bangus ay may 177mg phosphorus at katamtamang potassium bawat 85g serving. Ayon sa NKF at KDIGO 2024, ang sariwang bangus ay okay sa moderate na dami para sa early CKD. Ang daing na bangus ay IWASAN — napakataas sa sodium.", badge:"KDIGO"},
      anemia:      {verdict:"kainin",    reason:"Nagbibigay ng heme iron (1.2mg/100g), B12 (116% Daily Value sa isang serving), at B6 na lahat ay kailangan sa hemoglobin synthesis. Kinikilala ng NNC Philippines at FAO bilang nutritious iron source.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Ang bangus ay moderate-purine fish na generally ligtas para sa gout. Ang omega-3 DHA nito ay may anti-inflammatory benefit na tumutulong sa joint health. Inihaw o nilaga — limitahan sa 115g bawat serving.", badge:"PRA"},
      gerd:        {verdict:"kainin",    reason:"Ang inihaw o nilagang bangus ay lean, low-acid na pagkain na hindi nagpapalakas ng acid reflux. Ang daing na bangus (pinirito, maasim na marinade) ay maaaring trigger — piliin ang sariwang inihaw.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang bangus ay moderate-low sa purines at kinikilala ng Arthritis Foundation bilang isa sa mas ligtas na isda para sa gout. Hindi kasing mataas ng sardinas o atay. Inihaw o nilaga at limitahan sa 115g bawat serving.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱180–250 / kilo",
    cooking_tip:"Inihaw o sinigang — ang pinakamainam. Para sa lahat ng kondisyon: iwasan ang daing at bangus belly na pinirito",
    sources:[
      {label:"NNC Philippines: Nutritional Value of Bangus", url:"https://nnc.gov.ph/mindanao-region/the-good-nutrients-we-get-from-bangus/", badge:"FNRI"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
    ]},

  { food_id:"tuna_001", name:"Tuna (Tambakol)", aliases:["tuna","tambakol","yellowfin tuna","canned tuna","tuna steak","tuna de lata","skipjack tuna","bluefin tuna"], emoji:"🐡", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Napakataas sa lean protein (30g/100g) at walang carbohydrates. Ang omega-3 ng tuna ay nagpapababa ng triglycerides at nagpapabuti ng insulin sensitivity ayon sa WHO at ADA (2024). Piliin ang low-sodium canned tuna para sa diabetes.", badge:"WHO"},
      hypertension:{verdict:"kainin",    reason:"Ang sariwang tuna ay mababa sa sodium at mataas sa omega-3 at potassium na nagpapababa ng blood pressure. Ang canned tuna na may mataas na sodium ay dapat limitahan. Inirerekomenda ng WHF ang fatty fish 2x sa isang linggo.", badge:"WHF"},
      ckd:         {verdict:"limitahan", reason:"Ang tuna ay moderate sa potassium at phosphorus. Ayon sa NKF at Fresenius Kidney Care, ang canned light tuna (skipjack) ay mas mainam kaysa white/albacore tuna para sa CKD — mas mababang mercury at sodium (kung low-sodium ang binili). Limitahan sa 85–100g bawat serving.", badge:"NKF"},
      anemia:      {verdict:"kainin",    reason:"Napakataas sa heme iron at B12 ang tuna — isa sa pinakamataas sa lahat ng isda. Ayon sa FAO, ang 100g ng tuna ay nagbibigay ng higit sa 50% ng Daily Value ng B12.", badge:"FAO"},
      arthritis:   {verdict:"limitahan", reason:"Ang tuna ay moderate-high sa purines (~150mg/100g). Ayon sa Arthritis Foundation, ang tuna ay nasa gray area — hindi kasing mapanganib ng sardinas o atay pero dapat limitahan sa 85–115g, 2–3x bawat linggo lang. Piliin ang skipjack o light tuna.", badge:"PRA"},
      gerd:        {verdict:"kainin",    reason:"Ang tuna ay lean protein na hindi kilalang GERD trigger. Inihaw, nilaga, o canned sa tubig — ligtas para sa acid reflux ayon sa ACG at Cleveland Clinic guidelines.", badge:"ACG"},
      gout:         {verdict:"limitahan",    reason:"Ang tuna ay moderate-high sa purines (~150mg/100g). Ayon sa Arthritis Foundation at ACR, ang light/skipjack tuna ay mas ligtas kaysa bluefin/albacore. Limitahan sa 85-115g, 2-3x bawat linggo lang.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱60–100 / lata (canned) | ₱300–500 / kilo (sariwang)",
    cooking_tip:"Para sa CKD at hypertension: piliin ang low-sodium canned light tuna sa tubig (hindi sa langis). Para sa arthritis: limitahan sa 1 lata bawat araw",
    sources:[
      {label:"NKF: Fish for Kidney Disease", url:"https://www.kidney.org/kidney-topics/fish", badge:"NKF"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"Arthritis Foundation: Tuna & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"PRA"},
      {label:"WHF: Healthy Diet & Heart Health", url:"https://world-heart-federation.org/what-we-do/healthy-diet/", badge:"WHF"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
    ]},

  { food_id:"blue_marlin_001", name:"Blue Marlin (Malasugi)", aliases:["blue marlin","malasugi","marlin","marlin steak","blue marlin steak"], emoji:"🐠", category:"Isda",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang blue marlin ay mataas sa lean protein at omega-3 na makakatulong sa blood sugar control. Gayunman, bilang malaking predatory fish, ito ay may mataas na mercury content. Ayon sa isang pag-aaral sa Diabetes Care, ang mataas na mercury exposure ay nagpapataas ng diabetes risk ng 65%. Limitahan sa 1 serving (150g) bawat linggo.", badge:"WHO"},
      hypertension:{verdict:"kainin",    reason:"Ang omega-3 ng blue marlin ay nagpapababa ng triglycerides at blood pressure. Ang NOAA ay nagtatala ng 200mg omega-3 DHA/EPA bawat serving ng Hawaii blue marlin. Ligtas para sa hypertension kung inihaw at walang asin.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang blue marlin ay isa sa mga high-mercury fish na dapat iwasan ng mga may CKD. Ang mercury ay direktang nakakapinsala sa mga natitirang nephrons ng bato. Ayon sa NKF at KDIGO 2024, ang mga may CKD ay dapat limitahan ang malalaking predatory fish dahil sa mercury at mataas na phosphorus content.", badge:"KDIGO"},
      anemia:      {verdict:"kainin",    reason:"Mataas sa heme iron at B12 ang blue marlin — tumutulong sa hemoglobin production at oxygen transport. Ayon sa NOAA nutrient analysis, ito ay significant source ng B12 at selenium.", badge:"FAO"},
      arthritis:   {verdict:"limitahan", reason:"Ang blue marlin ay moderate sa purines ngunit ang mataas na mercury content nito ay may sariling alalahanin. Ang Arthritis Foundation ay nagsasabi na ang moderate-purine fish ay okay sa katamtaman. Limitahan sa 1x bawat linggo.", badge:"PRA"},
      gerd:        {verdict:"kainin",    reason:"Ang inihaw o baked blue marlin ay lean, low-fat na pagkain na hindi nagpapalakas ng acid reflux. Ayon sa ACG guidelines, ang lean fish ay ligtas para sa GERD.", badge:"ACG"},
      gout:         {verdict:"limitahan",    reason:"Ang blue marlin ay moderate sa purines. Bukod sa purine content, ang mataas na mercury nito ay nagpapalakas ng kidney stress na nagpapataas ng uric acid. Limitahan sa 1 serving (150g) bawat linggo.", badge:"ACR"},
    },
    safe_alternative:"Bangus o tilapia — katulad na protina at omega-3 pero mas mababa sa mercury at mas mura",
    price_estimate:"₱250–450 / kilo",
    cooking_tip:"Inihaw o oven-baked lang — walang marinade na maasim o maalat. LIMITAHAN sa 1 serving (150g) bawat linggo dahil sa mercury",
    sources:[
      {label:"NOAA: Pacific Blue Marlin Nutrient Analysis", url:"https://www.fisheries.noaa.gov/species/pacific-blue-marlin/seafood", badge:"WHO"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"NKF: Fish for Kidney Disease", url:"https://www.kidney.org/kidney-topics/fish", badge:"NKF"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
    ]},

  { food_id:"karot_001", name:"Karot (Carrots)", aliases:["karot","carrot","carrots","kamatis na dilaw","orange carrot","baby carrots","nilagang karot"], emoji:"🥕", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang karot ay mababa sa glycemic index (GI 35–47 kung nilaga) at mataas sa fiber. Ayon sa WHO at ADA (2024), ang non-starchy vegetables tulad ng karot ay dapat kainin ng sagana para sa blood sugar control. Ang natural na asukal nito (6g/100g) ay mababa at napapalibutan ng fiber na nagpapabagal ng absorption.", badge:"WHO"},
      hypertension:{verdict:"kainin",    reason:"Ang karot ay mataas sa potassium (320mg/100g) at may beta-carotene na nagpoprotekta sa cardiovascular health. Ayon sa WHO at WHF, ang potassium-rich vegetables ay nagpapababa ng blood pressure. Napakababa sa sodium (69mg/100g).", badge:"WHF"},
      ckd:         {verdict:"kainin",    reason:"Ang karot ay isa sa mga kidney-friendly vegetables — mababa sa phosphorus (35mg/100g) at moderate sa potassium. Inirerekomenda ng NKF at American Kidney Fund bilang ligtas na gulay para sa CKD. Para sa advanced CKD (stage 4–5): limitahan sa 1/2 tasa bawat serving at lutuin (nagbabawas ng potassium).", badge:"NKF"},
      anemia:      {verdict:"kainin",    reason:"Ang karot ay nagbibigay ng beta-carotene (Vitamin A precursor) na tumutulong sa iron absorption at red blood cell production. Ayon sa FAO, ang Vitamin A deficiency ay kaugnay ng anemia — ang karot ay isa sa pinakamahalagang source nito sa Pilipinas.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Napakababa sa purines ang karot at mataas sa beta-carotene at antioxidants. Ayon sa Arthritis Foundation, ang lahat ng gulay kasama ang karot ay LIGTAS para sa arthritis at gout — hindi nagpapataas ng uric acid at nagpoprotekta pa sa inflammation.", badge:"PRA"},
      gerd:        {verdict:"kainin",    reason:"Ang karot ay alkaline-forming vegetable na tumutulong sa neutralizing ng stomach acid. Kinikilala ng ACG at Cleveland Clinic bilang isa sa pinakamainam na GERD-safe na gulay — mataas sa fiber, mababa sa acid, at nagpoprotekta sa esophageal lining.", badge:"ACG"},
      gout:         {verdict:"kainin",    reason:"Ang karot ay napakababa sa purines at explicitly nakalista ng Arthritis Foundation, Precision Rheumatology, at Mayo Clinic bilang gout-safe food. Nagpapababa ng uric acid levels at nagpapalakas ng kidney function para sa mas mahusay na uric acid excretion.", badge:"ACR"},
    },
    safe_alternative:null, price_estimate:"₱30–60 / kilo",
    cooking_tip:"Nilaga, inihaw, o hilaw bilang mirienda — ang hilaw na karot ay may mas mataas na Vitamin C pero ang nilaga ay mas madaling matunaw. Para sa CKD: nilaga at ibuhos ang sabaw para mabawasan ang potassium",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"NKF: Kidney-Friendly Vegetables", url:"https://www.kidney.org/kidney-topics/low-potassium-vegetables", badge:"NKF"},
      {label:"FAO/WHO: Vitamin A & Anemia Prevention", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"Arthritis Foundation: Carrots & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"ACR"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
    ]},
  
    { food_id:"tahong_001", name:"Tahong (Mussels)", aliases:["tahong","mussel","mussels","green mussel","green-lipped mussel","tahong sa gata","sinabawang tahong"], emoji:"🦪", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang tahong ay mataas sa lean protein (24g/100g) at walang carbohydrates — hindi nagpapataas ng blood sugar. Ayon sa WHO at ADA (2024), ang shellfish bilang lean protein ay katanggap-tanggap para sa diabetes management. Ang mataas na zinc nito ay nagpapabuti pa ng insulin sensitivity.", badge:"WHO"},
      hypertension:{verdict:"limitahan", reason:"Ang sariwang tahong ay may moderate na sodium (369mg/100g). Ayon sa WHF, ang shellfish ay okay sa katamtamang dami ngunit iwasan ang tahong na niluto sa toyo, patis, o may dagdag na asin. Inirerekomenda ng WHF na hugasan at lutuin nang walang dagdag na sodium.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang tahong ay mataas sa phosphorus (285mg/100g) at potassium (320mg/100g). Ayon sa NKF at KDIGO 2024, ang shellfish kasama ang tahong ay dapat iwasan ng mga may CKD stage 3–5 dahil sa mataas na phosphorus at potassium content na hindi na kayang i-filter ng mahinang bato.", badge:"KDIGO"},
      anemia:      {verdict:"kainin",    reason:"Ang tahong ay isa sa pinaka-iron-rich na pagkain sa Pilipinas — 6.7mg iron bawat 100g, katumbas ng halos 37% ng Daily Value. Ayon sa FAO at FNRI, ang green mussel ay exceptional source ng heme iron, B12 (over 300% DV), at folate na lahat ay kritikal sa hemoglobin production.", badge:"FAO"},
      arthritis:   {verdict:"limitahan", reason:"Ang tahong ay moderate sa purines. Gayunman, ang green-lipped mussel (Perna canaliculus) ay kinikilala ng Arthritis Foundation at ilang clinical studies bilang may anti-inflammatory omega-3 na tumutulong sa joint pain. Para sa gout: limitahan. Para sa osteoarthritis/rheumatoid: may potential benefit.", badge:"PRA"},
      gerd:        {verdict:"kainin",    reason:"Ang tahong ay mababa sa taba at hindi kilalang GERD trigger. Ayon sa ACG guidelines, ang lean shellfish ay ligtas para sa acid reflux kung niluto nang walang matabang sarsa o maasim na sangkap.", badge:"ACG"},
      gout:        {verdict:"limitahan", reason:"Ang tahong at iba pang shellfish ay moderate sa purines ngunit ang Arthritis Foundation at ACR ay nagsasabi na ang shellfish ay mas mapanganib kaysa isda para sa gout. Limitahan sa maliit na serving (85g), 1–2x bawat linggo lamang. Hindi kasing mapanganib ng sardinas o atay ngunit dapat bantayan.", badge:"ACR"},
    },
    safe_alternative:"Tilapia o bangus — katulad na iron at protina pero mas ligtas sa CKD at gout",
    price_estimate:"₱80–150 / kilo",
    cooking_tip:"Sinabawang tahong na may luya at tanglad — ang pinakamainam. Para sa anemia: dagdag ng kalamansi bago kumain para mapalakas ang iron absorption",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"NKF: Shellfish and Kidney Disease", url:"https://www.kidney.org/kidney-topics/fish", badge:"NKF"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"Arthritis Foundation: Mussels & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"ACR"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
    ]},

  { food_id:"kamatis_001", name:"Kamatis (Tomato)", aliases:["kamatis","tomato","tomatoes","tomato sauce","sarsa ng kamatis","sarsa","tomato juice","cherry tomato"], emoji:"🍅", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang kamatis ay mababa sa glycemic index (GI 15) at mataas sa lycopene at Vitamin C. Ayon sa WHO at ADA (2024), ang non-starchy vegetables tulad ng kamatis ay dapat kainin ng sagana. Ang chromium nito ay tumutulong pa sa insulin sensitivity.", badge:"WHO"},
      hypertension:{verdict:"kainin",    reason:"Ang kamatis ay mataas sa potassium (237mg/100g) at lycopene na nagpoprotekta sa cardiovascular health. Ayon sa WHO at WHF, ang lycopene-rich foods ay nagpapababa ng LDL cholesterol at blood pressure. Iwasan ang commercial tomato sauce na mataas sa sodium — sariwang kamatis o walang-asin na sarsa lang.", badge:"WHF"},
      ckd:         {verdict:"limitahan", reason:"Ang kamatis ay moderate sa potassium (237mg/100g). Ayon sa NKF at American Kidney Fund, ang kamatis ay nasa 'limitahan' para sa CKD stage 3–5 — okay ang maliit na halaga bilang sangkap ngunit huwag kakainin ng marami nang minsanan. Ang tomato sauce, tomato paste, at tomato juice ay mas mataas sa potassium at dapat iwasan sa advanced CKD.", badge:"NKF"},
      anemia:      {verdict:"kainin",    reason:"Ang Vitamin C ng kamatis (23mg/100g) ay nagpapalakas ng non-heme iron absorption ng 2–3x ayon sa FAO. Bilang karaniwang sangkap sa mga ulam tulad ng sinigang at ginisa, ang kamatis ay natural na iron absorption enhancer na hindi mo kailangang pag-isipang hiwalay.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Ang kamatis ay napakababa sa purines at mataas sa lycopene at Vitamin C na parehong nagbabawas ng inflammation. Ayon sa Arthritis Foundation, ang lahat ng gulay kasama ang kamatis ay LIGTAS para sa arthritis at gout — hindi nagpapataas ng uric acid.", badge:"PRA"},
      gerd:        {verdict:"iwasan",    reason:"Ang kamatis ay isa sa mga pangunahing GERD trigger — napaka-acidic (pH 4.0–4.5) at direktang nagpapalakas ng acid production sa tiyan. Kinikilala ng ACG guidelines, Harvard Health, at Johns Hopkins bilang top food na dapat iwasan ng mga may GERD. Kasama rin dito ang tomato sauce, catsup, at lahat ng tomato-based na produkto.", badge:"ACG"},
      gout:        {verdict:"kainin",    reason:"Ang kamatis ay napakababa sa purines at ang Vitamin C nito ay nagpapababa ng uric acid. Ayon sa Arthritis Foundation at ACR, ang kamatis ay generally ligtas para sa gout. Tandaan: may ilang tao na nire-report ang kamatis bilang personal gout trigger — kung napansin mo ito sa sarili mo, iwasan.", badge:"ACR"},
    },
    safe_alternative:"Para sa GERD: palitan ng sibuyas at bawang na ina-sauté para sa lasa nang hindi nagpapalakas ng acid",
    price_estimate:"₱30–60 / kilo",
    cooking_tip:"Para sa GERD: alisin sa mga recipe. Para sa lahat ng iba: sariwang kamatis ay mas mababa sa acidity kaysa cooked. Ang pagluluto ng kamatis ay nagpapalakas ng lycopene ngunit nagpapataas din ng acidity",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"NKF: Potassium and CKD", url:"https://www.kidney.org/kidney-topics/potassium", badge:"NKF"},
      {label:"FAO: Vitamin C as Iron Absorption Enhancer", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"Arthritis Foundation: Tomatoes & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"ACR"},
    ]},

  { food_id:"okra_001", name:"Okra", aliases:["okra","okras","lady fingers","ladies fingers","lady's finger","gumbo","pinakbet okra"], emoji:"🫛", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang okra ay isa sa pinakamainam na gulay para sa diabetes — ang myricetin at quercetin nito ay nagpapababa ng blood sugar at nagpapabuti ng insulin sensitivity. Ayon sa isang pag-aaral sa Journal of Pharmacy & BioAllied Sciences, ang okra extract ay nagpapababa ng post-meal glucose ng 40%. Ang mataas na fiber (soluble) nito ay nagpapabagal din ng sugar absorption ayon sa WHO at ADA.", badge:"WHO"},
      hypertension:{verdict:"kainin",    reason:"Ang okra ay mataas sa potassium (303mg/100g) at magnesium na parehong nagpapababa ng blood pressure. Napakababa sa sodium (7mg/100g). Ayon sa WHO at WHF, ang high-potassium, low-sodium vegetables ay pundasyon ng hypertension-friendly diet.", badge:"WHF"},
      ckd:         {verdict:"kainin",    reason:"Ang okra ay mababa sa phosphorus (61mg/100g) at moderate sa potassium. Kinikilala ng NKF at American Kidney Fund bilang isa sa mga kidney-friendly vegetables — ligtas para sa CKD stages 1–4. Ang soluble fiber nito ay nakakatulong pa sa pagpapababa ng phosphorus absorption.", badge:"NKF"},
      anemia:      {verdict:"kainin",    reason:"Ang okra ay nagbibigay ng folate (88mcg/100g — 22% Daily Value), iron (0.8mg), at Vitamin C na tumutulong sa non-heme iron absorption. Ayon sa FAO, ang folate ay kritikal para sa paggawa ng bagong red blood cells at madalas kulang sa mga babaeng may anemia.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Ang okra ay napakababa sa purines at mataas sa antioxidants tulad ng quercetin at rutin na may anti-inflammatory properties. Ayon sa Arthritis Foundation, ang lahat ng gulay ay ligtas para sa arthritis at hindi nagpapataas ng uric acid.", badge:"PRA"},
      gerd:        {verdict:"kainin",    reason:"Ang okra ay alkaline-forming at ang malagkit na mucilage nito ay nagtatakip at nagpoprotekta sa esophageal at gastric lining — natural na soothing effect para sa acid reflux. Kinikilala ng Cleveland Clinic at ACG bilang isa sa mga pinaka-mainam na gulay para sa GERD.", badge:"ACG"},
      gout:        {verdict:"kainin",    reason:"Ang okra ay napakababa sa purines at explicitly kinikilala ng Arthritis Foundation at ACR bilang gout-safe food. Ang Vitamin C nito ay nagpapababa pa ng uric acid levels. Ligtas kumain ng okra kahit araw-araw para sa mga may gout.", badge:"ACR"},
    },
    safe_alternative:null,
    price_estimate:"₱40–80 / kilo",
    cooking_tip:"Nilaga o igisa nang buo — huwag hiwain bago lutuin para mapanatili ang mucilage na kapaki-pakinabang para sa GERD at diabetes. Para sa pinakbet: huwag sobra-luto",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"NKF: Kidney-Friendly Vegetables", url:"https://www.kidney.org/kidney-topics/low-potassium-vegetables", badge:"NKF"},
      {label:"FAO/WHO: Folate & Anemia Prevention", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"Arthritis Foundation: Okra & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"ACR"},
    ]},
  { food_id:"kambing_001", name:"Kambing (Goat)", aliases:["kambing","goat","goat meat","kalderetang kambing","papaitan","kidang","kambing na inihaw","karekare ng kambing"], emoji:"🐐", category:"Karne",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang kambing ay mas mababa sa taba (3g/100g) kaysa baboy at baka — kinikilala ng WHO at ADA bilang lean red meat na katanggap-tanggap para sa diabetes sa katamtamang dami. Mataas sa protina (27g/100g) na nagpapabusog nang matagal at hindi nagpapataas ng blood sugar.", badge:"WHO"},
      hypertension:{verdict:"limitahan", reason:"Ang sariwang kambing ay mababa sa sodium at saturated fat kumpara sa baboy at baka — mas mainam na pagpipilian para sa hypertension. Gayunman, ang karamihang lutong kambing sa Pilipinas (kaldereta, papaitan, kilawin) ay may mataas na sodium mula sa toyo at patis. Ayon sa WHF, piliin ang inihaw o nilaga na walang dagdag na asin.", badge:"WHF"},
      ckd:         {verdict:"limitahan", reason:"Ang kambing ay moderate sa phosphorus (210mg/100g) at potassium. Ayon sa KDIGO 2024 at NKF, ang lean meats tulad ng kambing ay katanggap-tanggap sa maliit na serving (85g) para sa early CKD. Para sa advanced CKD (stage 4–5): kumonsulta sa renal dietitian — ang dami ng protina ay dapat kontrolin.", badge:"KDIGO"},
      anemia:      {verdict:"kainin",    reason:"Ang kambing ay napakataas sa heme iron (3.7mg/100g — higit sa baka at baboy) at B12. Ayon sa FAO, ang goat meat ay isa sa pinakamataas na iron-density na karne — traditionally ginagamit sa Pilipinas para sa postpartum recovery at anemia. Mas madaling masipsip ang heme iron nito kaysa plant sources.", badge:"FAO"},
      arthritis:   {verdict:"limitahan", reason:"Ang kambing ay moderate sa purines at saturated fat. Ayon sa Arthritis Foundation at ACR, ang lahat ng red meat kasama ang kambing ay dapat limitahan sa gout at inflammatory arthritis — hindi hihigit sa 85–115g bawat serving, 3–4x bawat linggo.", badge:"PRA"},
      gerd:        {verdict:"limitahan", reason:"Ang inihaw na kambing ay lean at hindi pangunahing GERD trigger. Gayunman, ang kaldereta at papaitan na may tomato sauce at suka ay mapanganib para sa GERD. Ayon sa ACG guidelines, ang lutong paraan ang pinaka-mahalaga — inihaw o nilaga lang.", badge:"ACG"},
      gout:        {verdict:"limitahan", reason:"Ang kambing ay moderate sa purines (~150mg/100g). Ayon sa ACR at Arthritis Foundation, ang lahat ng red meat kasama ang kambing ay dapat limitahan sa gout diet — maliit na serving (85g) lang, 3–4x bawat linggo. Hindi kasing mapanganib ng atay o sardinas ngunit mas mapanganib kaysa manok o isda.", badge:"ACR"},
    },
    safe_alternative:"Inihaw na manok na walang balat — katulad na protina ngunit mas mababa sa purines at saturated fat",
    price_estimate:"₱280–400 / kilo",
    cooking_tip:"Inihaw o nilaga na may luya at bawang — pinakamainam. Iwasan ang kalderetang may kamatis kung may GERD, at papaitan kung may gout o CKD",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"Arthritis Foundation: Red Meat & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"ACR"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
    ]},

  { food_id:"lettuce_001", name:"Lettuce (Litsugas)", aliases:["lettuce","litsugas","iceberg lettuce","romaine","romaine lettuce","green lettuce","lettuce wrap","salad","lettuce salad","pechay ng salad"], emoji:"🥬", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang lettuce ay halos walang carbohydrates (2g/100g) at napakataas sa water content (95%). Ayon sa WHO at ADA (2024), ang non-starchy vegetables tulad ng lettuce ay dapat kainin ng sagana — zero glycemic impact at nagpapabusog nang walang dagdag na calorie.", badge:"WHO"},
      hypertension:{verdict:"kainin",    reason:"Ang lettuce ay mataas sa potassium (194mg/100g), nitrates na nagre-relax ng blood vessels, at napakababa sa sodium (10mg/100g). Ayon sa WHO at WHF, ang nitrate-rich leafy greens ay nagpapababa ng systolic blood pressure ng 4–10mmHg.", badge:"WHF"},
      ckd:         {verdict:"kainin",    reason:"Ang lettuce ay isa sa mga pinaka-ligtas na gulay para sa CKD — napakababa sa phosphorus (29mg/100g) at potassium (194mg/100g). Inirerekomenda ng NKF at American Kidney Fund bilang top kidney-friendly vegetable. Pwedeng kainin ng sagana kahit sa advanced CKD.", badge:"NKF"},
      anemia:      {verdict:"kainin",    reason:"Ang romaine lettuce ay nagbibigay ng folate (136mcg/100g — 34% Daily Value) at Vitamin C na parehong tumutulong sa iron absorption at red blood cell production. Ayon sa FAO, ang folate deficiency ay pangalawang pinaka-karaniwang dahilan ng anemia sa Pilipinas pagkatapos ng iron deficiency.", badge:"FAO"},
      arthritis:   {verdict:"kainin",    reason:"Ang lettuce ay napakababa sa purines at mataas sa antioxidants. Ayon sa Arthritis Foundation at ACR, ang lahat ng leafy greens kasama ang lettuce ay LIGTAS para sa arthritis at gout — hindi nagpapataas ng uric acid at nagpoprotekta pa sa inflammation.", badge:"PRA"},
      gerd:        {verdict:"kainin",    reason:"Ang lettuce ay isa sa pinaka-alkaline na pagkain (pH 6.0–7.0) — naturally nagbabawas ng stomach acid. Kinikilala ng ACG, Cleveland Clinic, at Johns Hopkins bilang isa sa mga pinaka-inirerekomenda na pagkain para sa GERD. Mataas sa water content na nagdidilute ng acid.", badge:"ACG"},
      gout:        {verdict:"kainin",    reason:"Ang lettuce ay napakababa sa purines at explicitly nakalista ng Arthritis Foundation at ACR bilang gout-safe food. Pwedeng kainin ng sagana. Ang mataas na water content nito ay tumutulong pa sa pag-flush ng uric acid sa pamamagitan ng ihi.", badge:"ACR"},
    },
    safe_alternative:null,
    price_estimate:"₱30–60 / ulo",
    cooking_tip:"Hilaw bilang salad — pinaka-nutritious. Huwag lagyan ng mataas na sodium na dressing (mayo, thousand island). Para sa lahat ng kondisyon: olive oil at kalamansi lang bilang dressing",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"NKF: Kidney-Friendly Vegetables", url:"https://www.kidney.org/kidney-topics/low-potassium-vegetables", badge:"NKF"},
      {label:"FAO/WHO: Folate & Anemia Prevention", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"WHO Healthy Diet Fact Sheet", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"Arthritis Foundation: Lettuce & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"ACR"},
    ]},
  
  { food_id:"isaw_001", name:"Isaw (Chicken/Pork Intestines)", aliases:["isaw","isaw ng manok","isaw ng baboy","chicken intestine","pork intestine","bbq isaw","grilled isaw","inihaw na bituka"], emoji:"🍢", category:"Karne",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang isaw ay walang carbohydrates kaya hindi direktang nagpapataas ng blood sugar. Gayunman, ang mataas na taba at cholesterol nito ay nagpapabagal ng insulin sensitivity ayon sa WHO. Ang paraan ng pagluluto (inihaw vs pinirito) ay malaking bagay — ang inihaw ay mas mainam kaysa deep-fried. Limitahan sa 2–3 piraso lamang.", badge:"WHO"},
      hypertension:{verdict:"iwasan",    reason:"Ang isaw ay napakataas sa sodium lalo na kapag may sawsawang toyo-suka o may dagdag na seasoning. Ayon sa WHF, ang processed at street-cooked organ meats ay mataas sa sodium at saturated fat na direktang nagpapataas ng blood pressure. Ang ValuCare Health at DOH ay nagtaas ng alalahanin sa isaw para sa mga may cardiovascular conditions.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang bituka ng manok ay mataas sa phosphorus at potassium. Bilang organ meat, ito ay nasa pinaka-mapanganib na kategorya para sa CKD ayon sa KDIGO 2024 at NKF. Bukod sa phosphorus at potassium, ang mataas na purine at cholesterol content nito ay nagpapabigat pa sa nang-iiral na kidney damage.", badge:"KDIGO"},
      anemia:      {verdict:"kainin",    reason:"Ang isaw ay nagbibigay ng heme iron at B12 na kailangan sa hemoglobin production. Ang bituka ng manok ay kinikilala ng FNRI bilang affordable offal source ng iron sa Pilipinas. Para sa anemia lamang at walang ibang kondisyon, okay sa katamtamang dami — 3–4 piraso.", badge:"FNRI"},
      arthritis:   {verdict:"iwasan",    reason:"Ang bituka ay organ meat na napakataas sa purines. Ayon sa Arthritis Foundation at ACR, ang lahat ng organ meats kasama ang intestines ay nasa pinaka-mataas na purine category (>200mg/100g) — direktang nagdudulot ng gout flares at nagpapalala ng inflammatory arthritis.", badge:"ACR"},
      gerd:        {verdict:"iwasan",    reason:"Ang isaw ay mataas sa taba at kadalasang inihahain na may suka at seasoning na parehong GERD triggers. Ang matabang pagkain ay nagpapahina ng lower esophageal sphincter (LES) ayon sa ACG guidelines. Ang ulang na suka-based na sawsawan ay nagpapalakas pa ng acid reflux.", badge:"ACG"},
      gout:        {verdict:"iwasan",    reason:"Ang organ meats tulad ng bituka ay isa sa pinakamataas na purine foods. Kinikilala ng ACR, Arthritis Foundation, at Mayo Clinic bilang pangunahing dapat IWASAN ng mga may gout — mas mapanganib pa kaysa pula ng karne. Isang stick ng isaw ay sapat na para makapag-trigger ng gout attack.", badge:"ACR"},
    },
    safe_alternative:"Inihaw na manok na walang balat — katulad na kainan experience pero mas ligtas sa lahat ng kondisyon",
    price_estimate:"₱10–20 / stick",
    cooking_tip:"Kung kakain kahit paano: inihaw lang (hindi pinirito), limitahan sa 2–3 piraso, at iwasan ang toyo-based na sawsawan. Para sa anemia na walang ibang kondisyon: okay sa 3–4 piraso minsan sa isang linggo",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"ValuCare Health: Isaw at ang Iyong Kalusugan", url:"https://www.valucarehealth.com/healthtips/isaw.html", badge:"DOH"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"Arthritis Foundation: Organ Meats & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"ACR"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
    ]},

  { food_id:"dugo_001", name:"Dugo ng Manok (Chicken Blood)", aliases:["dugo","dugo ng manok","chicken blood","dinuguan","betamax","bbq blood","coagulated blood","dugo sa stick"], emoji:"🟫", category:"Karne",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang dugo ng manok ay walang carbohydrates at mataas sa protina — hindi direktang nagpapataas ng blood sugar. Gayunman, ang mataas na cholesterol nito ay nagpapababa ng insulin sensitivity sa matagal na panahon ayon sa WHO. Okay sa 1–2 piraso minsan sa isang linggo para sa diabetes na walang ibang komplikasyon.", badge:"WHO"},
      hypertension:{verdict:"iwasan",    reason:"Ang chicken blood ay mataas sa cholesterol at kadalasang niluluto o inihahain na may mataas na sodium na seasoning. Ayon sa WHF at PHA, ang mataas na dietary cholesterol ay nagpapataas ng cardiovascular risk na kritikal na para sa mga may hypertension. Inirerekomenda ng DOH na iwasan ang organ meats para sa mga may mataas na presyon.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang dugo ng manok ay napakataas sa phosphorus at potassium. Bilang blood product, ito ay isa sa pinaka-concentrated na sources ng mga mineral na ito. Ayon sa KDIGO 2024 at NKF, ang blood-based foods ay dapat iwasan ng lahat ng CKD patients — nagpapabilis ng mineral imbalance na nagpapalala ng kidney disease progression.", badge:"KDIGO"},
      anemia:      {verdict:"kainin",    reason:"Ang dugo ng manok ay isa sa pinakamataas na iron source sa lahat ng pagkain — hanggang 30mg iron bawat 100g na 3–4x mas mataas pa kaysa atay. Ayon sa FAO, ang animal blood ay tradisyonal na ginagamit para sa iron supplementation sa maraming kultura. Para sa anemia na walang ibang kondisyon, ito ay napaka-epektibo ngunit dapat mag-ingat sa iba pang risks.", badge:"FAO"},
      arthritis:   {verdict:"limitahan", reason:"Ang dugo ng manok ay may moderate na purine content. Hindi kasing mataas ng atay o sardinas. Ayon sa Arthritis Foundation, ang animal blood products ay nasa gray area — limitahan sa maliit na serving at bantayan ang personal na reaksyon. Para sa severe gout: iwasan na lang.", badge:"PRA"},
      gerd:        {verdict:"limitahan", reason:"Ang simpleng niluto na dugo ay hindi kilalang direktang GERD trigger. Gayunman, ang dinuguan (niluto sa suka at baboy na taba) ay mapanganib para sa GERD dahil sa suka at mataas na taba content. Ayon sa ACG, ang paraan ng pagluluto ang pinaka-mahalaga.", badge:"ACG"},
      gout:        {verdict:"limitahan", reason:"Ang dugo ng hayop ay may moderate na purine content ngunit mas mababa kaysa atay o sardinas. Ayon sa Arthritis Foundation at ACR, ang blood products ay dapat bantayan — limitahan sa maliit na serving (1–2 piraso), hindi regular na kainin. Mas mainam na kumain ng ibang iron source para sa gout patients.", badge:"ACR"},
    },
    safe_alternative:"Para sa anemia: kangkong at kalamansi — mas ligtas na iron source. Para sa iron-rich na karne: manok o bangus",
    price_estimate:"₱10–15 / stick (BBQ) | ₱50–80 / tasa (dinuguan)",
    cooking_tip:"Pinaka-ligtas na paraan: nilaga o inihaw na 'betamax' na walang dagdag na asin. Ang dinuguan ay hindi inirerekomenda sa mga may hypertension, CKD, at GERD dahil sa suka at taba ng baboy",
    sources:[
      {label:"FAO/WHO: Animal Blood as Iron Source", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"Arthritis Foundation: Gout Diet Dos and Don'ts", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"ACR"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
    ]},

  { food_id:"paa_manok_001", name:"Paa ng Manok (Chicken Feet)", aliases:["paa ng manok","chicken feet","adidas","paa","chicken paws","adobong paa","paa ng manok adobo","paa bbq","grilled chicken feet"], emoji:"🐾", category:"Karne",
    conditions:{
      diabetes:    {verdict:"limitahan", reason:"Ang paa ng manok ay mababa sa carbohydrates ngunit mataas sa taba (14g/100g) at cholesterol. Ayon sa ADA at WHO, ang mataas na saturated fat ay nagpapababa ng insulin sensitivity sa matagal na panahon. Okay ang 2–3 piraso minsan sa isang linggo para sa diabetes na walang komplikasyon — basta hindi pinirito.", badge:"WHO"},
      hypertension:{verdict:"limitahan", reason:"Ang sariwang nilagang paa ng manok ay moderate sa sodium, ngunit ang adobong paa at BBQ version ay napakataas sa sodium (1,285mg bawat serving ng adobo ayon sa recipe analysis). Ayon sa WHF, ang paraan ng pagluluto ang pinaka-mahalaga. Nilaga o tinolang paa ng manok ay mas ligtas kaysa adobo o pinirito.", badge:"WHF"},
      ckd:         {verdict:"limitahan", reason:"Ang paa ng manok ay moderate sa phosphorus at potassium. Ayon sa NKF at KDIGO 2024, ang chicken feet ay katanggap-tanggap sa maliit na serving (2–3 piraso) para sa early CKD stages 1–2 kung nilaga nang walang toyo o patis. Para sa advanced CKD (stage 3–5): kumonsulta sa renal dietitian.", badge:"NKF"},
      anemia:      {verdict:"kainin",    reason:"Ang paa ng manok ay nagbibigay ng heme iron at B12. Bagaman mas mababa sa iron content kaysa atay, ito ay kinikilala ng FNRI bilang accessible iron source. Ang bone broth mula sa paa ng manok ay nagbibigay din ng mineral support para sa overall health.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",    reason:"Ito ay isang sorpresa: ang paa ng manok ay mababa sa purines at NAPAKATAAS sa collagen (type II collagen) na direktang tumutulong sa cartilage health at joint lubrication. Ayon sa Arthritis Foundation at ilang clinical studies, ang collagen peptides mula sa chicken feet ay nagpapababa ng joint pain sa osteoarthritis ng hanggang 40%.", badge:"PRA"},
      gerd:        {verdict:"limitahan", reason:"Ang nilaga o tinolang paa ng manok ay okay para sa GERD — mababa sa acid at hindi kilalang trigger. Ang adobong paa na may suka at toyo ay mapanganib naman para sa GERD. Ayon sa ACG, ang lutong paraan ang pinaka-mahalaga — nilaga at sinigang lang.", badge:"ACG"},
      gout:        {verdict:"kainin",    reason:"Ang paa ng manok ay napakababa sa purines kumpara sa ibang organ meats — pangunahing binubuo ng collagen, tendon, at balat, hindi ng purine-rich na muscle meat o organ tissue. Ayon sa Arthritis Foundation at ACR, ang chicken feet ay mas ligtas kaysa sardinas, atay, o hipon para sa gout patients.", badge:"ACR"},
    },
    safe_alternative:"Para sa hypertension at CKD: piliin ang tinolang paa ng manok na may luya at papaya — walang toyo, walang patis",
    price_estimate:"₱60–100 / kilo | ₱15–25 / stick (BBQ)",
    cooking_tip:"Ang pinakamainam na paraan para sa lahat ng kondisyon: tinola o sinigang na may luya — walang toyo, walang patis. Para sa arthritis: ang bone broth mula sa paa ng manok ay nagbibigay ng maximum collagen benefit",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"NKF: Chicken and Kidney Disease", url:"https://www.kidney.org/kidney-topics/fish", badge:"NKF"},
      {label:"Arthritis Foundation: Collagen & Joint Health", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/which-foods-are-safe-for-gout", badge:"PRA"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
    ]},
  
  { food_id:"fishball_001", name:"Fishball", aliases:["fishball","fish ball","fishballs","fish balls","tusok tusok","tusok-tusok","street food","fishball sauce","manong fishball"], emoji:"🟡", category:"Processed",
    conditions:{
      diabetes:    {verdict:"iwasan",    reason:"Ang fishball ay ultra-processed food na mataas sa refined starch (cornstarch filler) at mataas sa glycemic index — mabilis na nagpapataas ng blood sugar. Ang matamis na fishball sauce ay nagdadagdag pa ng 8–12g asukal bawat serving. Ayon sa WHO at ADA, ang ultra-processed foods na may hidden starch at sugar ay dapat iwasan ng mga diabetic.", badge:"WHO"},
      hypertension:{verdict:"iwasan",    reason:"Ang fishball ay napakataas sa sodium — estimated 400–600mg bawat 5 piraso mula sa preservatives, salt brine, at sawsawan. Ayon sa WHF, ang processed street foods ay isa sa pangunahing hidden sodium sources sa Filipino diet. Ang matamis-maanghang na sawsawan ay nagdadagdag pa ng 200–300mg sodium.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang fishball ay mataas sa phosphate additives, sodium, at preservatives — lahat ay kritikal na dapat iwasan sa CKD. Ayon sa KDIGO 2024, ang processed foods na may phosphate additives ay mas mapanganib pa kaysa natural na high-phosphorus foods dahil ang inorganic phosphate ay 100% nasisipsip ng katawan.", badge:"KDIGO"},
      anemia:      {verdict:"limitahan", reason:"Ang fishball ay may kaunting iron mula sa fish content ngunit ang mataas na sodium at preservatives ay nakakasagabal sa iron absorption. Ayon sa FAO, ang processed fish products ay mas mababang iron bioavailability kaysa sariwang isda. Mas epektibong iron source ang sariwang bangus o tilapia.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Ang ultra-processed foods tulad ng fishball ay kinikilala ng Arthritis Foundation at WHO bilang pro-inflammatory — ang refined starch, preservatives, at trans fats ay nagpapalakas ng systemic inflammation na nagpapalala ng arthritis symptoms.", badge:"PRA"},
      gerd:        {verdict:"iwasan",    reason:"Ang piniritong fishball ay mataas sa taba na nagpapahina ng lower esophageal sphincter (LES). Ang matamis-maanghang at suka-based na sawsawan ay direktang GERD trigger. Ayon sa ACG guidelines, ang fried processed foods at acidic condiments ay pinaka-mapanganib na kombinasyon para sa acid reflux.", badge:"ACG"},
      gout:        {verdict:"limitahan", reason:"Ang fishball mismo ay moderate-low sa purines dahil sa diluted fish content. Gayunman, ang Arthritis Foundation ay nagbababala na ang ultra-processed foods ay nagpapalakas ng systemic inflammation na nagpapalala ng gout. Hindi kasing mapanganib ng sardinas o atay ngunit hindi rin inirerekomenda.", badge:"ACR"},
    },
    safe_alternative:"Inihaw na galunggong o tilapia — tunay na isda, mas mataas sa protina, mas mababa sa sodium at starch",
    price_estimate:"₱2–5 / piraso",
    cooking_tip:"Kung talagang kakain: limitahan sa 3–4 piraso lang at iwasan ang sawsawan. Ang fishball na may manong ay laging may sawsawan na puno ng asukal at sodium",
    sources:[
      {label:"WHO: Ultra-Processed Foods & NCDs", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"KDIGO 2024 CKD — Phosphate Additives", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"FAO: Iron Bioavailability in Processed Fish", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
    ]},

  { food_id:"squidball_001", name:"Squidball", aliases:["squidball","squid ball","squid balls","squidballs","pusit ball","bola ng pusit"], emoji:"⚪", category:"Processed",
    conditions:{
      diabetes:    {verdict:"iwasan",    reason:"Katulad ng fishball, ang squidball ay ultra-processed na mataas sa cornstarch filler at refined carbohydrates na mabilis na nagpapataas ng blood sugar. Ayon sa WHO at ADA, ang hidden starch sa processed street foods ay isa sa pinaka-hindi-pinapansin na dahilan ng blood sugar spikes sa mga Pilipino.", badge:"WHO"},
      hypertension:{verdict:"iwasan",    reason:"Ang squidball ay mataas sa sodium mula sa squid extract concentrate, salt brine, at preservatives. Ayon sa WHF at DOH, ang processed squid products ay mataas sa sodium — ang tunay na pusit ay okay ngunit ang processed version ay hindi. Ang sawsawan ay nagdadagdag pa ng malaking sodium.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang squid at lahat ng cephalopods ay naturally mataas sa phosphorus. Ang squidball bilang processed form ay may dagdag pang phosphate additives na nagpapataas ng phosphorus content. Ayon sa KDIGO 2024 at NKF, ang processed squid products ay dapat iwasan ng mga may CKD.", badge:"KDIGO"},
      anemia:      {verdict:"limitahan", reason:"Ang squid ay may iron content ngunit ang processing ng squidball ay nagpapababa ng iron bioavailability. Mas mainam ang sariwang pusit kaysa squidball para sa anemia — ngunit kahit sariwang pusit ay moderate lang sa iron.", badge:"FAO"},
      arthritis:   {verdict:"limitahan", reason:"Ang sariwang pusit ay moderate sa purines ngunit ang squidball bilang processed food ay may dagdag na pro-inflammatory ingredients. Ayon sa Arthritis Foundation, ang processed versions ng moderate-purine foods ay mas mapanganib kaysa sariwang form.", badge:"PRA"},
      gerd:        {verdict:"iwasan",    reason:"Ang piniritong squidball at ang acidic na sawsawan nito ay klasikong GERD trigger — mataas na taba ng pagpiprito nagpapahina ng LES, at ang suka-based na sawsawan ay direktang nagpapalakas ng acid reflux ayon sa ACG at Cleveland Clinic.", badge:"ACG"},
      gout:        {verdict:"limitahan", reason:"Ang squid ay moderate sa purines at ang Arthritis Foundation ay nagsasabi na ang squid ay mas ligtas kaysa shellfish para sa gout. Gayunman, ang processed squidball ay may dagdag na inflammation-promoting ingredients. Limitahan sa 3–4 piraso.", badge:"ACR"},
    },
    safe_alternative:"Sariwang pusit na inihaw — mas mataas sa protina, mas mababa sa starch at sodium kaysa squidball",
    price_estimate:"₱3–6 / piraso",
    cooking_tip:"Kung kakain: 3–4 piraso lang at huwag isawsaw. Ang tunay na squid (sariwang pusit na inihaw) ay mas masustansya at mas ligtas",
    sources:[
      {label:"WHO: Ultra-Processed Foods & NCDs", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"Arthritis Foundation: Squid & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"ACR"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"WHF: Reducing Sodium in Southeast Asia", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
    ]},

  { food_id:"kikiam_001", name:"Kikiam", aliases:["kikiam","quekiam","que kiam","kikiam ng tusok","fried kikiam","chinese kikiam","pork kikiam"], emoji:"🟤", category:"Processed",
    conditions:{
      diabetes:    {verdict:"iwasan",    reason:"Ang kikiam ay binubuo ng ground pork, shrimp paste, at harina na lahat ay nagpapataas ng blood sugar at nagpapabagal ng insulin sensitivity. Ayon sa WHO at ADA, ang processed meat products na may hidden refined flour ay dapat iwasan ng mga diabetic. Isa ito sa pinaka-triple-threat na street food: mataas sa refined carbs, mataas sa taba, at mataas sa sodium.", badge:"WHO"},
      hypertension:{verdict:"iwasan",    reason:"Ang kikiam ay napakataas sa sodium — ang combination ng ground pork, shrimp paste (bagoong), at pag-aatsara ay nagbibigay ng estimated 500–800mg sodium bawat 3 piraso. Ito ay isa sa pinaka-mataas na sodium street foods sa listahan. Ayon sa WHF at DOH, ang processed pork-shrimp products ay dapat iwasan ng lahat ng may hypertension.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang kikiam ay triple threat para sa CKD: mataas sa phosphorus (mula sa baboy at hipon), mataas sa potassium, at mataas sa sodium. Ayon sa KDIGO 2024, ang processed meats na may multiple organ-stressing minerals ay pinaka-mapanganib para sa kidney disease progression.", badge:"KDIGO"},
      anemia:      {verdict:"limitahan", reason:"Ang kikiam ay may kaunting iron mula sa baboy at hipon content ngunit ang mataas na sodium at phosphate preservatives ay nakakasagabal sa iron absorption. Ayon sa FAO, ang processed meat products ay mababang iron bioavailability — mas mainam kumain ng sariwang iron-rich food.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Ang kikiam ay mataas sa purines (mula sa baboy at hipon) at pro-inflammatory refined ingredients. Ayon sa Arthritis Foundation at ACR, ang processed meats na naglalaman ng high-purine ingredients ay dapat iwasan ng mga may arthritis at gout — mas mapanganib pa kaysa simpleng karne dahil sa concentrated na purine content.", badge:"ACR"},
      gerd:        {verdict:"iwasan",    reason:"Ang kikiam ay triple GERD trigger: pinirito (mataas na taba), bagoong/shrimp paste (highly acidic), at sawsawan na suka. Ayon sa ACG guidelines, ang kombinasyon ng fried food, fermented seafood paste, at acidic condiments ay pinaka-mapanganib na pattern para sa acid reflux.", badge:"ACG"},
      gout:        {verdict:"iwasan",    reason:"Ang kikiam ay naglalaman ng dalawang high-purine ingredients: baboy at hipon. Ayon sa ACR at Arthritis Foundation, ang processed foods na may multiple high-purine animal sources ay pinaka-mapanganib para sa gout — mas masama pa kaysa kumain ng iisang high-purine food dahil pinagsama ang mga purine content.", badge:"ACR"},
    },
    safe_alternative:"Inihaw na tilapia o tokwa — katulad na meryenda experience na walang multi-condition risks",
    price_estimate:"₱5–8 / piraso",
    cooking_tip:"Walang safe na paraan ng pagluluto ang makakapagpababa ng risk ng kikiam para sa lahat ng kondisyon — ang problema ay nasa ingredients mismo, hindi lang sa paraan ng pagluluto",
    sources:[
      {label:"WHO: Ultra-Processed Foods & NCDs", url:"https://www.who.int/news-room/fact-sheets/detail/healthy-diet", badge:"WHO"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"Arthritis Foundation: Processed Meats & Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"ACR"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
      {label:"FAO: Iron Bioavailability in Processed Foods", url:"https://www.fao.org/4/y8346m/y8346m07.htm", badge:"FAO"},
    ]},

  { food_id:"squid_fresh_001", name:"Pusit (Squid)", aliases:["pusit","squid","fresh squid","inihaw na pusit","adobong pusit","calamares","calamari","pusit sa gata"], emoji:"🦑", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",    reason:"Ang sariwang pusit ay mataas sa lean protein (18g/100g) at napakababa sa carbohydrates (3g/100g). Ayon sa WHO at ADA, ang lean seafood ay isa sa pinaka-inirerekomendang protein para sa diabetes — hindi nagpapataas ng blood sugar at nagpapabusog ng matagal.", badge:"WHO"},
      hypertension:{verdict:"limitahan", reason:"Ang sariwang pusit ay moderate sa sodium (230mg/100g) at may taurine na may blood pressure-lowering properties. Gayunman, ang adobong pusit, calamares, at pusit sa gata ay napakataas sa sodium. Ayon sa WHF, piliin ang inihaw na pusit na walang dagdag na asin o toyo.", badge:"WHF"},
      ckd:         {verdict:"limitahan", reason:"Ang sariwang pusit ay moderate sa phosphorus (210mg/100g) at potassium. Ayon sa NKF at KDIGO, ang sariwang squid ay katanggap-tanggap sa maliit na serving (85–100g) para sa early CKD. Ang processed squid products (squidball, calamares) ay mas mapanganib dahil sa phosphate additives.", badge:"NKF"},
      anemia:      {verdict:"kainin",    reason:"Ang pusit ay nagbibigay ng heme iron (1.1mg/100g), B12 (at 90% DV), at copper na lahat ay tumutulong sa hemoglobin at red blood cell production. Ayon sa FAO, ang cephalopods ay significant source ng bioavailable iron at B12 sa Southeast Asian diet.", badge:"FAO"},
      arthritis:   {verdict:"limitahan", reason:"Ang pusit ay moderate sa purines (~150mg/100g). Ayon sa Arthritis Foundation, ang squid ay mas ligtas kaysa shellfish para sa gout ngunit dapat limitahan sa 85–115g bawat serving, 2–3x bawat linggo. Hindi kasing mapanganib ng sardinas o atay.", badge:"PRA"},
      gerd:        {verdict:"kainin",    reason:"Ang inihaw na pusit ay lean at hindi kilalang direktang GERD trigger. Ayon sa ACG guidelines, ang lean seafood ay ligtas para sa acid reflux kung hindi pinirito at walang acidic na sarsa. Ang calamares at adobong pusit ang mapanganib — hindi ang sariwang inihaw.", badge:"ACG"},
      gout:        {verdict:"limitahan", reason:"Ang pusit ay moderate sa purines at ang Arthritis Foundation ay naglalagay nito sa 'moderate risk' category — mas ligtas kaysa sardinas, atay, o hipon ngunit dapat limitahan sa 85–115g bawat pagkain, 2–3x bawat linggo para sa mga may gout.", badge:"ACR"},
    },
    safe_alternative:"Tilapia o bangus — mas mababa sa purines at mas accessible. Para sa GERD: inihaw na manok",
    price_estimate:"₱150–250 / kilo",
    cooking_tip:"Inihaw na pusit na may kalamansi — pinaka-mainam para sa lahat ng kondisyon. Iwasan ang adobong pusit (toyo + suka) kung may GERD o hypertension, at calamares (pinirito + batter) para sa lahat ng kondisyon",
    sources:[
      {label:"FNRI Food Composition Tables", url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table", badge:"FNRI"},
      {label:"FAO/WHO: Human Vitamin & Mineral Requirements", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
      {label:"NKF: Seafood and Kidney Disease", url:"https://www.kidney.org/kidney-topics/fish", badge:"NKF"},
      {label:"Arthritis Foundation: Squid & Gout Risk", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"ACR"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"WHF: Use Heart to Season With Sense", url:"https://world-heart-federation.org/how-we-do-it/use-heart-to-season-with-sense/", badge:"WHF"},
    ]},
  
  { food_id:"gin_001", name:"Gin (Ginebra / Tanduay)", aliases:["gin","ginebra","tanduay","gin bulag","gin pomelo","gin tonic","hard liquor","distilled spirits","alak","spirits"], emoji:"🥃", category:"Inumin",
    conditions:{
      diabetes:    {verdict:"iwasan",    reason:"Ang gin at lahat ng distilled spirits ay nagdudulot ng hypoglycemia (mababang blood sugar) na mapanganib para sa mga diabetic na tumatake ng insulin o metformin, ayon sa ADA (2024) at WHO. Bukod dito, ang gin pomelo at gin na may juice ay nagdadagdag ng malaking asukal. Ang alkohol ay nagpapabagal ng glucose release ng atay at nagpapagulo ng blood sugar control.", badge:"WHO"},
      hypertension:{verdict:"iwasan",    reason:"Ang WHO at WHF ay malinaw: ang lahat ng uri ng alkohol ay nagpapataas ng blood pressure. Ang gin ay mataas sa alcohol content (35–40% ABV) na direktang nagpapataas ng systolic BP ng 5–10mmHg bawat 2 drinks. Ayon sa WHF, walang ligtas na dami ng alkohol para sa mga may hypertension.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang alkohol ay direktang nakakaracic sa mga bato — nagpapabagal ng kidney filtration at nagpapabilis ng CKD progression. Ayon sa KDIGO 2024, ang lahat ng uri ng alkohol ay dapat iwasan ng mga may CKD anumang stage. Ang dehydrating effect ng gin ay nagpapataas pa ng uric acid at toxin concentration sa dugo.", badge:"KDIGO"},
      anemia:      {verdict:"iwasan",    reason:"Ang alkohol ay nagpapababa ng iron absorption, nagpapigil ng folate metabolism, at direktang nagpapasuprime ng bone marrow na gumagawa ng red blood cells. Ayon sa FAO at WHO, ang regular na pag-inom ng alkohol ay isa sa mga pangunahing dahilan ng nutritional anemia sa Pilipinas.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Ang alkohol ay nagpapalakas ng systemic inflammation. Ayon sa Arthritis Foundation at ACR, ang lahat ng uri ng alkohol — kasama ang beer, wine, at spirits tulad ng gin — ay nagpapataas ng uric acid at nagpapalala ng inflammatory arthritis. Walang ligtas na uri ng alkohol para sa arthritis.", badge:"ACR"},
      gerd:        {verdict:"iwasan",    reason:"Ang alkohol ay isa sa pinakamalakas na GERD trigger — direktang nagpapahina ng lower esophageal sphincter (LES) at nagpapataas ng stomach acid production. Kinikilala ng ACG, Harvard Health, at Johns Hopkins bilang top dietary trigger ng GERD. Ang gin na may carbonated mixer (gin tonic, gin pomelo) ay mas mapanganib pa.", badge:"ACG"},
      gout:        {verdict:"iwasan",    reason:"Ang lahat ng uri ng alkohol ay nagpapataas ng uric acid sa dalawang paraan: nagpapabilis ng purine breakdown sa atay at nagpapabagal ng uric acid excretion ng bato. Ayon sa ACR at Arthritis Foundation, ang beer ay pinaka-mapanganib ngunit ang spirits tulad ng gin ay ikalawang pinaka-mapanganib. Kahit isang baso ay sapat na para mag-trigger ng gout attack.", badge:"ACR"},
    },
    safe_alternative:"Tubig na may kalamansi o salabat — nagbibigay ng similar na 'occasion drink' feeling nang walang health risks",
    price_estimate:"₱55–80 / 350ml",
    cooking_tip:"Walang ligtas na dami ng gin para sa lahat ng kondisyon sa listahang ito. Para sa special occasions: 1 shot maximum at sabayan ng maraming tubig",
    sources:[
      {label:"WHO: Alcohol and Health — No Safe Level", url:"https://www.who.int/news-room/fact-sheets/detail/alcohol", badge:"WHO"},
      {label:"WHF: Alcohol & Cardiovascular Disease", url:"https://world-heart-federation.org/what-we-do/hypertension/", badge:"WHF"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"ACR: Alcohol & Gout Risk", url:"https://www.rheumatology.org/I-Am-A/Patient-Caregiver/Diseases-Conditions/Gout", badge:"ACR"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"FAO/WHO: Alcohol & Nutritional Anemia", url:"https://www.fao.org/3/Y2809E/y2809e00.htm", badge:"FAO"},
    ]},

  { food_id:"redhorse_001", name:"Red Horse Beer", aliases:["redhorse","red horse","red horse beer","strong beer","extra strong beer","strong ale","beer na malakas"], emoji:"🍺", category:"Inumin",
    conditions:{
      diabetes:    {verdict:"iwasan",    reason:"Ang Red Horse ay double-threat para sa diabetes: mataas sa alcohol (6.9–7.0% ABV) na nagpapagulo ng blood sugar control, at may carbohydrates (13g/330ml) na nagpapataas ng glucose. Ayon sa ADA at WHO, ang malakas na beer ay mas mapanganib kaysa regular beer para sa mga diabetic dahil sa combined alcohol at carbohydrate load.", badge:"WHO"},
      hypertension:{verdict:"iwasan",    reason:"Ang Red Horse ay isa sa pinaka-mapanganib na inumin para sa hypertension — ang 6.9–7.0% ABV ay halos doble ng regular beer. Ayon sa WHF, ang bawat additional drink ay nagpapataas ng systolic BP ng 5mmHg. Ang isang bote ng Red Horse ay katumbas ng dalawang regular na beer sa cardiovascular impact.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang alcohol ay direktang nakakatoxic sa mga bato. Ang Red Horse na may mataas na ABV ay mas mapanganib pa kaysa regular beer para sa CKD progression. Ayon sa KDIGO 2024, walang ligtas na antas ng alkohol para sa lahat ng CKD stages — nagpapabilis ng kidney function decline.", badge:"KDIGO"},
      anemia:      {verdict:"iwasan",    reason:"Ang mataas na alcohol content ng Red Horse ay nagpapababa ng iron absorption at bone marrow function nang mas malala kaysa regular beer. Ayon sa FAO at WHO, ang malakas na alkohol ay direktang nag-iinhibit ng erythropoietin production na kailangan para sa red blood cell formation.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Ang beer — lalo na ang malakas na beer tulad ng Red Horse — ay pinakakilala sa lahat ng alkohol para sa pagpapataas ng uric acid. Ayon sa Arthritis Foundation at ACR, ang beer ay may purines mula sa yeast bukod pa sa alcohol-induced uric acid production. Red Horse ang pinaka-mapanganib na beer para sa gout.", badge:"ACR"},
      gerd:        {verdict:"iwasan",    reason:"Ang beer ay carbonated at acidic — dalawang major GERD triggers. Ang Red Horse ay mas mapanganib pa dahil sa mataas na ABV na nagpapahina ng LES nang mas malakas. Ayon sa ACG at Harvard Health, ang carbonated alcoholic beverages ay pinaka-mapanganib na kombinasyon para sa acid reflux.", badge:"ACG"},
      gout:        {verdict:"iwasan",    reason:"Ang beer ay kinikilala ng ACR, Mayo Clinic, at Arthritis Foundation bilang PINAKA-MAPANGANIB na inumin para sa gout — mas masama pa kaysa wine o spirits. Ang Red Horse na may mataas na ABV at yeast-derived purines ay pinaka-mapanganib sa lahat ng beer. Kahit kalahating bote ay sapat na para mag-trigger ng gout attack.", badge:"ACR"},
    },
    safe_alternative:"Tubig na may kalamansi o buko juice — pwedeng hawakan sa handaan nang hindi nagpapahiya",
    price_estimate:"₱45–65 / 330ml",
    cooking_tip:"Walang ligtas na dami ng Red Horse para sa lahat ng kondisyon sa listahang ito. Para sa espesyal na okasyon lamang at may pahintulot ng doktor",
    sources:[
      {label:"WHO: Alcohol and Health", url:"https://www.who.int/news-room/fact-sheets/detail/alcohol", badge:"WHO"},
      {label:"WHF: Alcohol & Cardiovascular Disease", url:"https://world-heart-federation.org/what-we-do/hypertension/", badge:"WHF"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"ACR: Beer, Gout & Uric Acid", url:"https://www.rheumatology.org/I-Am-A/Patient-Caregiver/Diseases-Conditions/Gout", badge:"ACR"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
      {label:"Arthritis Foundation: Beer is Worst for Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"ACR"},
    ]},

  { food_id:"sanmig_light_001", name:"San Miguel Light", aliases:["san miguel light","sanmig light","light beer","san mig light","low calorie beer","pale pilsen","san miguel pale pilsen","SMB","beer","pale beer","san miguel beer"], emoji:"🍻", category:"Inumin",
    conditions:{
      diabetes:    {verdict:"iwasan",    reason:"Kahit 'light' ang label, ang San Miguel Light ay may alkohol (5% ABV) at carbohydrates (7–8g/330ml). Ayon sa ADA (2024) at WHO, walang ligtas na dami ng alkohol para sa mga diabetic na tumatake ng glucose-lowering medications — ang alkohol ay nagpapagulo ng blood sugar control at nagtatago ng hypoglycemia symptoms.", badge:"WHO"},
      hypertension:{verdict:"iwasan",    reason:"Ang 'light' ay tumutukoy sa calorie content — hindi sa blood pressure effect. Ang alkohol ay nagpapataas ng blood pressure anuman ang uri. Ayon sa WHF at AHA, ang regular na pag-inom ng beer kahit 'light' ay nagpapataas ng hypertension risk ng 40%. Walang 'safe' na beer para sa hypertension.", badge:"WHF"},
      ckd:         {verdict:"iwasan",    reason:"Ang alcohol sa anumang konsentrasyon ay nakakatoxic sa mga bato. Ayon sa KDIGO 2024, walang ligtas na antas ng alkohol para sa lahat ng CKD stages. Ang 'light' label ay hindi nagpapababa ng kidney toxicity ng alkohol.", badge:"KDIGO"},
      anemia:      {verdict:"iwasan",    reason:"Kahit mababa sa calorie, ang alkohol ng San Miguel Light ay nagpapababa ng iron absorption, nagpipigil ng folate utilization, at nagpapasuprime ng bone marrow function. Ayon sa FAO at WHO, kahit moderate na pag-inom ng alkohol ay nagpapalala ng iron deficiency anemia.", badge:"FAO"},
      arthritis:   {verdict:"iwasan",    reason:"Ang beer — kahit light — ay naglalaman ng purines mula sa yeast at barley. Ayon sa Arthritis Foundation at ACR, ang beer ay mas mapanganib kaysa wine o spirits para sa arthritis at gout dahil sa dual source ng uric acid: alcohol at yeast purines. Walang 'safe' na beer para sa arthritis.", badge:"ACR"},
      gerd:        {verdict:"iwasan",    reason:"Ang San Miguel Light ay carbonated at acidic — dalawang klasikong GERD triggers. Ayon sa ACG at Cleveland Clinic, ang carbonated alcoholic beverages ay dapat iwasan ng lahat ng may GERD kahit 'light' ang label. Ang carbonation alone ay nagpapataas ng stomach pressure na nagdudulot ng acid reflux.", badge:"ACG"},
      gout:        {verdict:"iwasan",    reason:"Ang Arthritis Foundation at ACR ay malinaw: ang lahat ng beer kasama ang light beer ay PINAKA-MAPANGANIB na inumin para sa gout dahil sa yeast purines at alcohol. Ang 'light' ay tumutukoy sa calorie content lamang — hindi sa purine o uric acid impact. Regular na pag-inom ng light beer ay nagpapataas ng gout risk ng 58% ayon sa isang Harvard study.", badge:"ACR"},
    },
    safe_alternative:"Buko juice, calamansi juice, o tubig na may mint — ligtas para sa lahat ng kondisyon at pwedeng hawakan sa inuman",
    price_estimate:"₱35–50 / 330ml",
    cooking_tip:"Ang 'light' sa label ay nagpapababa ng calorie content (96 cal vs 150 cal ng regular beer) — hindi nagpapababa ng alcohol, purine, o acid content. Para sa lahat ng kondisyon sa listahang ito: iwasan",
    sources:[
      {label:"WHO: Alcohol and Health — No Safe Level", url:"https://www.who.int/news-room/fact-sheets/detail/alcohol", badge:"WHO"},
      {label:"WHF: Alcohol & Cardiovascular Disease", url:"https://world-heart-federation.org/what-we-do/hypertension/", badge:"WHF"},
      {label:"KDIGO 2024 CKD Clinical Practice Guideline", url:"https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf", badge:"KDIGO"},
      {label:"ACR: Gout & Alcohol", url:"https://www.rheumatology.org/I-Am-A/Patient-Caregiver/Diseases-Conditions/Gout", badge:"ACR"},
      {label:"Arthritis Foundation: Beer Worst for Gout", url:"https://www.arthritis.org/health-wellness/healthy-living/nutrition/healthy-eating/gout-diet-dos-and-donts", badge:"ACR"},
      {label:"ACG GERD Clinical Guideline 2022", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8754510/", badge:"ACG"},
    ]},
  


];

// ============================================
// HELPER FUNCTIONS
// ============================================
function findFoodInDB(query) {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  function wholeWordMatch(haystack, needle) {
    const hw = haystack.toLowerCase();
    const nw = needle.toLowerCase().trim();
    if (hw === nw) return true;
    return nw.split(/\s+/).every(w =>
      new RegExp(`(?:^|\\s|-)${w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\s|-|$)`).test(hw)
    );
  }

  // 1. Exact alias or name match
  let result = FOOD_DATABASE.find(f =>
    f.aliases.some(a => a.toLowerCase() === q) ||
    f.name.toLowerCase() === q
  );
  if (result) return result;

  // 2. Query contains a full alias as whole word (alias must be 4+ chars)
  result = FOOD_DATABASE.find(f =>
    f.aliases.some(a => {
      const al = a.toLowerCase();
      return al.length >= 4 && wholeWordMatch(q, al);
    }) ||
    (f.name.toLowerCase().length >= 4 && wholeWordMatch(q, f.name.toLowerCase()))
  );
  if (result) return result;

  // 3. Alias contains full query as whole words (query must be 4+ chars)
  if (q.length >= 4) {
    result = FOOD_DATABASE.find(f =>
      f.aliases.some(a => wholeWordMatch(a, q)) ||
      wholeWordMatch(f.name, q)
    );
    if (result) return result;
  }

  // 4. Short exact fallback (3-char minimum, no substring)
  if (q.length >= 3) {
    result = FOOD_DATABASE.find(f =>
      f.aliases.some(a => a.toLowerCase() === q) ||
      f.name.toLowerCase() === q
    );
    if (result) return result;
  }

  return null;
}

function getCombinedVerdict(food, conditions) {
  const verdicts = conditions.filter(c => food.conditions[c]).map(c => food.conditions[c].verdict);
  if (verdicts.includes("iwasan")) return "iwasan";
  if (verdicts.includes("limitahan")) return "limitahan";
  if (verdicts.length > 0 && verdicts.every(v => v === "kainin")) return "kainin";
  return "depende";
}

function getFoodsByVerdict(verdict, conditions) {
  return FOOD_DATABASE.filter(f => getCombinedVerdict(f, conditions) === verdict);
}

const QUICK_SUGGESTIONS = {
  diabetes:     ["Bangus","Tilapia","Kanin","Kamote","Ampalaya","Softdrinks","Salmon","Tuna"],
  hypertension: ["Toyo","Instant Noodles","Asin","Baboy","Bangus","Tilapia","Kamote","Saging"],
  ckd:          ["Tilapia","Bangus","Salmon","Sardinas","Instant Noodles","Toyo","Tuna","Blue Marlin"],
  anemia:       ["Bangus","Tuna","Atay","Kalamansi","Malunggay","Salmon","Tokwa","Kangkong"],
  arthritis:    ["Tilapia","Bangus","Sardinas","Salmon","Tuna","Hipon","Lechon","Atay"],
  gerd:         ["Tilapia","Bangus","Kape","Softdrinks","Lechon","Kalamansi","Salmon","Baboy"],
  gout:         ["Sardinas","Atay","Hipon","Softdrinks","Lechon","Tuna","Kalamansi","Karot"],
};

// ============================================
// OPENROUTER API - LLAMA 3.2 3B INSTRUCT (FREE)
// ============================================
const SYSTEM_PROMPT = `Ikaw si NutriNena — isang mapagkakatiwalaang nutritionist ng DOH Pilipinas. Sumasagot ka sa simpleng Filipino.

KALAGAYAN:
- DIABETES: Iwasan refined carbs, asukal, ultra-processed foods. Kainin: gulay, isda (tilapia, bangus, tuna, salmon, galunggong), manok, legumes, mababang glycemic index.
- HYPERTENSION: Iwasan: sodium (toyo, patis, instant noodles, asin). Kainin: potassium (saging, kamote, gulay).
- CKD (Chronic Kidney Disease): Iwasan: mataas na phosphorus (sardinas, dairy, instant noodles, colas), sobrang protein, mataas na sodium. Limitahan: mataas na potassium (saging, mangga, kamote, kamoteng kahoy) lalo sa advanced stage. Kainin: puting kanin (mababa sa phosphorus at potassium), mansanas, ubas, pechay, sitaw. MAHALAGANG PAALALA: ang CKD diet ay nakasalalay sa stage ng sakit at mga lab results — laging kumonsulta sa doktor.
- ANEMIA: Kainin: iron-rich (atay, kangkong, tokwa) + Vitamin C (dayap). Limitahan: kape at tsaa pagkatapos kumain.
- ARTHRITIS: Iwasan: purines (atay, sardinas, hipon, karne), inflammatory foods. Kainin: omega-3 (galunggong, tilapia), luya, bawang, gulay.
- GOUT: Iwasan: organ meats (atay, bato), shellfish (hipon), sardinas, pula ng karne, softdrinks, alcohol. Kainin: tubig (8–16 baso/araw), kalamansi (Vitamin C), lahat ng gulay, tokwa, itlog, manok, tilapia, kape (nagpapababa ng uric acid). IMPORTANTENG PAGKAKAIBA SA ARTHRITIS: Ang lahat ng gulay ay LIGTAS para sa gout — kahit 'high-purine' vegetables ay hindi nagpapataas ng uric acid ayon sa Arthritis Foundation (2025).
- GERD (Acid Reflux): Iwasan: maasim (kalamansi, kamatis), mataba na pagkain (lechon, prito), carbonated drinks (softdrinks), kape, sibuyas, bawang, maanghang na pagkain. Kainin: saging, papaya, mansanas, kangkong, pechay, brown rice, tokwa, manok. Tip: kumain ng maliit na dami pero madalas, huwag mahiga agad pagkatapos kumain.

JSON FORMAT LANG — walang iba:
{
  "food_name": "pangalan sa Filipino",
  "overall_verdict": "kainin"|"limitahan"|"iwasan"|"depende",
  "overall_reason": "isang pangungusap sa Filipino",
  "per_condition": [{"condition":"...","verdict":"...","reason":"2-3 pangungusap","portion_tip":"...o null"}],
  "safe_alternative": "konkretong kapalit na available sa palengke, o null",
  "confidence": "mataas"|"katamtaman"|"mababa",
  "disclaimer_needed": true|false
}

PANUNTUNAN: Iwasan sa kahit isa = overall iwasan. Hindi sigurado = confidence mababa + disclaimer true. Simpleng Filipino palagi. Konkretong dami kung limitahan. Kapalit na mabibili sa probinsya lang.`;

async function callClaude(foodName, conditions) {
  // Use serverless function in production for security, direct API in development
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    // Production: Use serverless function (API key hidden on server)
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodName, conditions })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API request failed');
    const raw = data.choices[0].message.content;
    const parsed = JSON.parse(raw.replace(/```json/g,"").replace(/```/g,"").trim());
    if (parsed.per_condition?.some(c => c.verdict==="iwasan")) parsed.overall_verdict = "iwasan";
    return parsed;
  } else {
    // Development: Direct API call (faster, no serverless overhead)
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "KainKlinikal"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Pagkain: ${foodName}\nKalagayan: ${conditions.join(", ")}\n\nJSON format lang ang sagot.` }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    const data = await res.json();
    const raw = data.choices[0].message.content;
    const parsed = JSON.parse(raw.replace(/```json/g,"").replace(/```/g,"").trim());
    if (parsed.per_condition?.some(c => c.verdict==="iwasan")) parsed.overall_verdict = "iwasan";
    return parsed;
  }
}

// ============================================
// SCREEN 1 — WELCOME
// ============================================
function ScreenWelcome({ onStart, onBHW }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const features = [
    { icon:"🩺", text:"Para sa diabetes, anemia, at arthritis" },
    { icon:"🇵🇭", text:"Mga pagkaing makukuha sa palengke" },
    { icon:"📚", text:"Batay sa FNRI, DOH, WHO, WHF, at FAO" },
    { icon:"💬", text:"Sa Filipino — libre at offline-friendly" },
  ];

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(160deg, #0A1F13 0%, #0D2B1A 40%, #1A4731 100%)",
      display:"flex", flexDirection:"column", position:"relative", overflow:"hidden",
      fontFamily:"'DM Sans', sans-serif",
    }}>
      {/* Decorative orbs */}
      {[
        {top:"-60px",right:"-40px",size:200,opacity:0.06},
        {top:"30%",left:"-60px",size:180,opacity:0.04},
        {bottom:"20%",right:"-20px",size:140,opacity:0.05},
      ].map((orb,i) => (
        <div key={i} style={{
          position:"absolute", width:orb.size, height:orb.size, borderRadius:"50%",
          background:`radial-gradient(circle, rgba(45,158,107,${orb.opacity*3}) 0%, transparent 70%)`,
          top:orb.top, left:orb.left, right:orb.right, bottom:orb.bottom,
          animation:`float ${4+i}s ease-in-out infinite ${i*0.8}s`,
        }}/>
      ))}

      {/* Grain texture */}
      <div style={{
        position:"absolute", inset:0, opacity:0.03, pointerEvents:"none",
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      }}/>

      <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"40px 28px 20px", position:"relative", zIndex:1}}>
        {/* App badge */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(45,158,107,0.15)", border:"1px solid rgba(45,158,107,0.3)",
          borderRadius:30, padding:"6px 14px", marginBottom:28, alignSelf:"flex-start",
        }}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#2D9E6B",display:"inline-block",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:11,fontWeight:700,color:"#6FCF97",letterSpacing:1,textTransform:"uppercase"}}>
            Libreng Gabay sa Pagkain
          </span>
        </div>

        {/* Headline */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.6s 0.1s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{fontSize:52, marginBottom:4, animation:"float 4s ease-in-out infinite"}}>🥗</div>
          <h1 style={{
            fontSize:38, fontWeight:900, lineHeight:1.1, marginBottom:8,
            fontFamily:"'Playfair Display', Georgia, serif",
            background:"linear-gradient(135deg, #FFFFFF 0%, #A8DFBF 60%, #6FCF97 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text",
          }}>
            Kain<span style={{fontStyle:"italic"}}>Klinikal</span>
          </h1>
          <p style={{fontSize:16, color:"rgba(255,255,255,0.65)", lineHeight:1.6, marginBottom:32, maxWidth:320}}>
            Ang tamang pagkain para sa iyong katawan — sa Filipino, para sa mga Pilipino.
          </p>
        <p style={{fontSize:4, color:"rgba(255,255,255,0.65)", lineHeight:1.6, marginBottom:32, maxWidth:320}}>
            Prototype: JKOB
          </p>
        </div>

        {/* Feature list */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.6s 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          marginBottom:36,
        }}>
          {features.map((f,i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12, marginBottom:12,
              animation:`fadeUp 0.5s ${0.3+i*0.08}s both`,
            }}>
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:"rgba(45,158,107,0.15)", border:"1px solid rgba(45,158,107,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
              }}>{f.icon}</div>
              <span style={{fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.4}}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          display:"flex", flexDirection:"column", gap:10,
        }}>
          <button onClick={onStart} style={{
            width:"100%", padding:"18px", borderRadius:16, border:"none",
            background:"linear-gradient(135deg, #1A6644 0%, #2D9E6B 50%, #3DBEA0 100%)",
            backgroundSize:"200% 200%", animation:"gradShift 4s ease infinite",
            color:"#fff", fontSize:17, fontWeight:800, cursor:"pointer",
            letterSpacing:0.3, boxShadow:"0 8px 32px rgba(45,158,107,0.4)",
            transition:"transform 0.15s, box-shadow 0.15s",
            fontFamily:"'DM Sans', sans-serif",
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(45,158,107,0.55)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 8px 32px rgba(45,158,107,0.4)";}}>
            Magsimula Na →
          </button>

          <button onClick={onBHW} style={{
            width:"100%", padding:"14px", borderRadius:16,
            border:"1.5px solid rgba(45,158,107,0.4)",
            background:"rgba(45,158,107,0.08)", backdropFilter:"blur(10px)",
            color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600, cursor:"pointer",
            transition:"all 0.15s", fontFamily:"'DM Sans', sans-serif",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,158,107,0.18)";e.currentTarget.style.borderColor="rgba(45,158,107,0.6)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(45,158,107,0.08)";e.currentTarget.style.borderColor="rgba(45,158,107,0.4)";}}>
            👩‍⚕️ Para sa Barangay Health Worker
          </button>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div style={{
        padding:"16px 28px 32px", textAlign:"center", position:"relative", zIndex:1,
        opacity: visible ? 1 : 0, transition:"opacity 0.6s 0.6s",
      }}>
        <p style={{fontSize:10, color:"rgba(255,255,255,0.3)", lineHeight:1.6}}>
          Para sa kaalaman lamang. Hindi kapalit ng medikal na payo. Kumonsulta sa iyong doktor.
        </p>
        
      </div>
    </div>
  );
}

// ============================================
// SCREEN 2 — CONDITION INTAKE
// ============================================
function ScreenConditions({ onNext, onBack }) {
  const [selected, setSelected] = useState([]);
  const [budget, setBudget] = useState(200);
  const [warning, setWarning] = useState(false);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
    setWarning(false);
  };

  const handleNext = () => {
    if (selected.length === 0) { setWarning(true); return; }
    onNext(selected, budget);
  };

  const budgets = [
    {val:100,label:"₱100",sublabel:"Tipid"},
    {val:200,label:"₱200",sublabel:"Katamtaman"},
    {val:300,label:"₱300",sublabel:"Komportable"},
  ];

  return (
    <div style={{
      minHeight:"100vh", background:"#F7FDF9",
      display:"flex", flexDirection:"column",
      fontFamily:"'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg, #0D3B26, #1A6644, #2D9E6B)",
        padding:"20px 20px 36px", position:"relative", overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
        <div style={{position:"absolute",bottom:-20,left:20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
        <button onClick={onBack} style={{
          background:"rgba(255,255,255,0.15)", border:"none", borderRadius:10,
          padding:"6px 12px", color:"#fff", fontSize:13, fontWeight:600,
          cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:20,
        }}>← Bumalik</button>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>
          Hakbang 1 ng 2
        </div>
        <h2 style={{fontSize:26,fontWeight:900,color:"#fff",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.2,marginBottom:8}}>
          Ano ang iyong kalagayan?
        </h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",margin:0}}>
          Maaaring pumili ng higit sa isa
        </p>

        {/* Selection counter */}
        {selected.length > 0 && (
          <div style={{
            marginTop:12, display:"inline-flex", alignItems:"center", gap:6,
            background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.3)",
            borderRadius:20, padding:"4px 12px", animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>{selected.length} napili ✓</span>
          </div>
        )}
      </div>

      {/* Multi-condition warning banner */}
      {selected.length > 1 && (
        <div style={{
          margin:"16px 20px 0",
          background:"#FEF8EC", border:"1.5px solid #F6C86A", borderRadius:12,
          padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-start",
          animation:"fadeIn 0.3s ease",
        }}>
          <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
          <p style={{margin:0,fontSize:12,color:"#7D6608",lineHeight:1.5}}>
            Ang ilang pagkain ay maaaring magkasalungat sa iyong mga kalagayan. Ipapakita namin kung alin ang ligtas para sa lahat.
          </p>
        </div>
      )}

      <div style={{flex:1, overflowY:"auto", padding:"20px 20px 0"}}>
        {/* Condition cards */}
        <div style={{marginBottom:28}}>
          {CONDITIONS.map((c, i) => {
            const isSelected = selected.includes(c.id);
            return (
              <button key={c.id} onClick={() => toggle(c.id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:14,
                padding:"16px 18px", marginBottom:10, borderRadius:16, border:"none",
                background: isSelected ? `linear-gradient(135deg, ${c.bg}, #fff)` : "#fff",
                outline: isSelected ? `2px solid ${c.color}` : "2px solid #E8F0EC",
                cursor:"pointer", textAlign:"left",
                transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                transform: isSelected ? "scale(1.01)" : "scale(1)",
                boxShadow: isSelected ? `0 4px 20px ${c.color}22` : "0 2px 8px rgba(0,0,0,0.04)",
                animation:`fadeUp 0.4s ${i*0.07}s both`,
              }}>
                <div style={{
                  width:52, height:52, borderRadius:14, flexShrink:0,
                  background: isSelected ? c.bg : "#F8FAF9",
                  border:`2px solid ${isSelected ? c.color : "#E8F0EC"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:24, transition:"all 0.2s",
                }}>{c.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16, fontWeight:700, color: isSelected ? c.color : "#2C3E50", fontFamily:"'Playfair Display',Georgia,serif"}}>
                    {c.label}
                  </div>
                  <div style={{fontSize:12, color:"#7F8C8D", marginTop:2}}>{c.sublabel}</div>
                </div>
                <div style={{
                  width:26, height:26, borderRadius:"50%", flexShrink:0,
                  background: isSelected ? c.color : "#F0F0F0",
                  border:`2px solid ${isSelected ? c.color : "#E0E0E0"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, color:"#fff",
                  transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                  animation: isSelected ? "checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none",
                }}>
                  {isSelected && "✓"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Budget selector */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:700,color:"#566573",letterSpacing:0.5,textTransform:"uppercase",marginBottom:12}}>
            💰 Budget sa pagkain bawat araw:
          </div>
          <div style={{display:"flex", gap:8}}>
            {budgets.map(b => (
              <button key={b.val} onClick={()=>setBudget(b.val)} style={{
                flex:1, padding:"12px 8px", borderRadius:12, border:"none",
                background: budget===b.val ? "linear-gradient(135deg,#1A6644,#2D9E6B)" : "#fff",
                outline: budget===b.val ? "none" : "2px solid #E8F0EC",
                color: budget===b.val ? "#fff" : "#566573",
                cursor:"pointer", textAlign:"center",
                transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif",
                boxShadow: budget===b.val ? "0 4px 16px rgba(45,158,107,0.3)" : "none",
              }}>
                <div style={{fontSize:15,fontWeight:800}}>{b.label}</div>
                <div style={{fontSize:10,opacity:0.8,marginTop:2}}>{b.sublabel}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{padding:"16px 20px 32px", background:"rgba(247,253,249,0.95)", backdropFilter:"blur(10px)", borderTop:"1px solid #E8F0EC"}}>
        {warning && (
          <div style={{
            background:"#FDECEA", border:"1.5px solid #F1948A", borderRadius:10,
            padding:"10px 14px", marginBottom:10, fontSize:12, color:"#A93226",
            display:"flex", gap:6, alignItems:"center", animation:"fadeIn 0.2s ease",
          }}>
            <span>⚠️</span> Piliin muna ang iyong kalagayan bago magpatuloy.
          </div>
        )}
        <button onClick={handleNext} style={{
          width:"100%", padding:"16px", borderRadius:14, border:"none",
          background: selected.length > 0 ? "linear-gradient(135deg,#1A6644,#2D9E6B)" : "#D5D8DC",
          color:"#fff", fontSize:16, fontWeight:800, cursor: selected.length > 0 ? "pointer" : "not-allowed",
          boxShadow: selected.length > 0 ? "0 6px 24px rgba(45,158,107,0.35)" : "none",
          transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif",
        }}>
          Ipakita ang Pagkain Ko →
        </button>
      </div>
    </div>
  );
}

// ============================================
// SCREEN 3 — FOOD GUIDE
// ============================================
function ScreenFoodGuide({ selectedConditions, budget, onPwedeBaTo, onBack }) {
  const [activeTab, setActiveTab] = useState("kainin");
  const [selectedFood, setSelectedFood] = useState(null);
  const [search, setSearch] = useState("");

  const tabs = [
    {id:"kainin",   label:"Kainin",   icon:"✅", activeColor:"#2D9E6B"},
    {id:"limitahan",label:"Limitahan",icon:"⚠️", activeColor:"#E67E22"},
    {id:"iwasan",   label:"Iwasan",   icon:"❌", activeColor:"#C0392B"},
  ];

  const ligstasFoods = getFoodsByVerdict("kainin", selectedConditions);
  const tabFoods = getFoodsByVerdict(activeTab, selectedConditions);
  const filteredFoods = search.trim()
    ? tabFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : tabFoods;

  const condMeta = selectedConditions.map(c => CONDITIONS.find(x=>x.id===c)).filter(Boolean);

  return (
    <>
      <div style={{fontFamily:"'DM Sans',sans-serif",background:"#F7FDF9",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#1A4731,#2D9E6B)",padding:"20px 20px 24px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
            ← Bumalik
          </button>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>
            Ang iyong gabay sa pagkain
          </div>
          <h2 style={{fontSize:24,fontWeight:900,color:"#fff",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.2,marginBottom:12}}>
            Ano ang mainam para sa iyo?
          </h2>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {condMeta.map(c=>(
              <span key={c.id} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,color:"#fff",display:"flex",alignItems:"center",gap:4}}>
                {c.emoji} {c.label}
              </span>
            ))}
            <span style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>
              💰 ₱{budget}/araw
            </span>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",paddingBottom:100}}>
          {/* Ligtas sa lahat */}
          {selectedConditions.length > 1 && ligstasFoods.length > 0 && (
            <div style={{padding:"16px 20px 0",animation:"fadeUp 0.4s ease"}}>
              <div style={{background:"linear-gradient(135deg,#F0FBF6,#E8F8F0)",border:"1.5px solid #A8DFBF",borderRadius:16,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:18}}>⭐</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:"#1A4731"}}>LIGTAS SA LAHAT NG KALAGAYAN MO</div>
                    <div style={{fontSize:11,color:"#2D9E6B",fontWeight:500}}>Pwedeng kainin nang walang alalahanin</div>
                  </div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {ligstasFoods.slice(0,8).map(f=>(
                    <button key={f.food_id} onClick={()=>setSelectedFood(f)} style={{
                      background:"#fff",border:"1.5px solid #A8DFBF",borderRadius:10,
                      padding:"6px 12px",fontSize:12,fontWeight:600,color:"#1A4731",
                      cursor:"pointer",display:"flex",alignItems:"center",gap:4,
                      transition:"transform 0.15s",fontFamily:"'DM Sans',sans-serif",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                      {f.emoji} {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{padding:"16px 20px 0"}}>
            {/* Tabs */}
            <div style={{display:"flex",background:"#fff",borderRadius:14,padding:4,border:"1.5px solid #E8F0EC",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              {tabs.map(tab=>{
                const count = getFoodsByVerdict(tab.id, selectedConditions).length;
                const isActive = activeTab===tab.id;
                const activeBg = tab.id==="kainin"?"#2D9E6B":tab.id==="limitahan"?"#E67E22":"#C0392B";
                return (
                  <button key={tab.id} onClick={()=>{setActiveTab(tab.id);setSearch("");}} style={{
                    flex:1,padding:"10px 4px",borderRadius:10,border:"none",
                    background:isActive?activeBg:"transparent",
                    color:isActive?"#fff":"#7F8C8D",
                    fontSize:12,fontWeight:700,cursor:"pointer",
                    transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                    fontFamily:"'DM Sans',sans-serif",
                  }}>
                    <span style={{fontSize:14}}>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span style={{fontSize:10,background:isActive?"rgba(255,255,255,0.25)":"#F0F0F0",borderRadius:10,padding:"1px 6px",color:isActive?"#fff":"#95A5A6"}}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{position:"relative",marginBottom:12}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#95A5A6"}}>🔍</span>
              <input type="text" placeholder="Hanapin ang pagkain..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{width:"100%",padding:"11px 16px 11px 36px",borderRadius:12,border:"1.5px solid #E8F0EC",background:"#fff",fontSize:13,color:"#2C3E50",outline:"none"}}/>
            </div>

            {/* Food list */}
            {filteredFoods.length === 0 ? (
              <div style={{textAlign:"center",padding:"40px 20px",background:"#fff",borderRadius:14,border:"1.5px dashed #D5D8DC"}}>
                <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                <div style={{fontSize:14,color:"#7F8C8D",fontWeight:500}}>Walang nahanap</div>
              </div>
            ) : filteredFoods.map(food=>{
              const combined = getCombinedVerdict(food, selectedConditions);
              const cfg = VERDICT_CFG[combined];
              const relConds = selectedConditions.filter(c=>food.conditions[c]);
              return (
                <button key={food.food_id} onClick={()=>setSelectedFood(food)} style={{
                  width:"100%",background:"#fff",border:`1.5px solid ${cfg.border}`,borderRadius:14,
                  padding:"14px 16px",marginBottom:8,cursor:"pointer",textAlign:"left",
                  transition:"transform 0.15s,box-shadow 0.15s",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                  fontFamily:"'DM Sans',sans-serif",
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)";}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                    <span style={{fontSize:30,flexShrink:0}}>{food.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                        <span style={{fontSize:15,fontWeight:700,color:"#1A2E1A",fontFamily:"'Playfair Display',Georgia,serif"}}>{food.name}</span>
                        <span style={{fontSize:11,fontWeight:800,color:cfg.color,background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:20,padding:"3px 10px",flexShrink:0}}>{cfg.icon} {cfg.label}</span>
                      </div>
                      <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>
                        {relConds.map(c=>{
                          const condCfg = VERDICT_CFG[food.conditions[c].verdict];
                          const condMeta = CONDITIONS.find(x=>x.id===c);
                          return (
                            <span key={c} style={{fontSize:11,fontWeight:600,color:condCfg.color,background:condCfg.bg,border:`1px solid ${condCfg.border}`,borderRadius:20,padding:"2px 8px"}}>
                              {condMeta?.emoji} {condMeta?.label} {condCfg.icon}
                            </span>
                          );
                        })}
                      </div>
                      <div style={{marginTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:11,color:"#95A5A6"}}>{food.price_estimate}</span>
                        <span style={{fontSize:11,color:cfg.color,fontWeight:600}}>Tingnan ang detalye →</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky bottom */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(247,253,249,0.95)",backdropFilter:"blur(10px)",borderTop:"1px solid #E8F0EC",padding:"12px 20px 20px",display:"flex",flexDirection:"column",gap:8}}>
          <button onClick={onPwedeBaTo} style={{
            width:"100%",padding:"15px",borderRadius:14,border:"none",
            background:"linear-gradient(135deg,#1A4731,#2D9E6B)",color:"#fff",
            fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow:"0 4px 20px rgba(45,158,107,0.35)",transition:"transform 0.15s",fontFamily:"'DM Sans',sans-serif",
          }}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            🤔 Pwede Ba To? — Magtanong ng Pagkain
          </button>
        </div>
      </div>

      {/* Food detail bottom sheet */}
      {selectedFood && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div onClick={()=>setSelectedFood(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"relative",background:"#FAFDF9",borderRadius:"24px 24px 0 0",maxHeight:"85vh",overflowY:"auto",padding:"0 0 32px",animation:"slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 -8px 40px rgba(0,0,0,0.15)"}}>
            <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}>
              <div style={{width:40,height:4,borderRadius:2,background:"#D5D8DC"}}/>
            </div>
            <div style={{padding:"16px 24px 0"}}>
              {(()=>{
                const food = selectedFood;
                const combined = getCombinedVerdict(food, selectedConditions);
                const cfg = VERDICT_CFG[combined];
                const relConds = selectedConditions.filter(c=>food.conditions[c]);
                return (
                  <>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:42}}>{food.emoji}</span>
                        <div>
                          <div style={{fontSize:20,fontWeight:800,color:"#1A2E1A",fontFamily:"'Playfair Display',Georgia,serif"}}>{food.name}</div>
                          <div style={{fontSize:12,color:"#7F8C8D",marginTop:2}}>{food.category}</div>
                        </div>
                      </div>
                      <button onClick={()=>setSelectedFood(null)} style={{width:32,height:32,borderRadius:"50%",background:"#EAEDED",border:"none",fontSize:16,cursor:"pointer",color:"#566573",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                    </div>

                    <div style={{background:cfg.bg,border:`1.5px solid ${cfg.border}`,borderRadius:14,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22}}>{cfg.icon}</span>
                      <div>
                        <div style={{fontSize:15,fontWeight:800,color:cfg.color}}>{cfg.label}</div>
                        <div style={{fontSize:12,color:cfg.color,opacity:0.8}}>{cfg.tagline}</div>
                      </div>
                    </div>

                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#566573",letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Para sa Bawat Kalagayan</div>
                      {relConds.map(c=>{
                        const condData = food.conditions[c];
                        const condCfg = VERDICT_CFG[condData.verdict];
                        const condMeta = CONDITIONS.find(x=>x.id===c);
                        return (
                          <div key={c} style={{background:"#fff",border:`1.5px solid ${condCfg.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span>{condMeta?.emoji}</span>
                                <span style={{fontSize:13,fontWeight:700,color:"#2C3E50"}}>{condMeta?.label}</span>
                              </div>
                              <span style={{fontSize:11,fontWeight:800,color:condCfg.color,background:condCfg.bg,border:`1px solid ${condCfg.border}`,borderRadius:20,padding:"2px 10px"}}>{condCfg.icon} {condCfg.label}</span>
                            </div>
                            <p style={{margin:0,fontSize:13,color:"#4A5568",lineHeight:1.6}}>{condData.reason}</p>
                          </div>
                        );
                      })}
                    </div>

                    {food.safe_alternative && (
                      <div style={{background:"#F0FBF6",border:"1.5px solid #A8DFBF",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#2D9E6B",marginBottom:4}}>💡 KAPALIT NA PAGKAIN</div>
                        <p style={{margin:0,fontSize:13,color:"#2C7A4B",lineHeight:1.6}}>{food.safe_alternative}</p>
                      </div>
                    )}
                    {food.cooking_tip && (
                      <div style={{background:"#FFFBF0",border:"1.5px solid #F0D080",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#D4820A",marginBottom:4}}>👨‍🍳 PARAAN NG PAGLUTO</div>
                        <p style={{margin:0,fontSize:13,color:"#7D6608",lineHeight:1.6}}>{food.cooking_tip}</p>
                      </div>
                    )}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                      <span style={{fontSize:13}}>🏪</span>
                      <span style={{fontSize:13,color:"#566573"}}>Presyo: <strong style={{color:"#2C3E50"}}>{food.price_estimate}</strong></span>
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#566573",letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>📚 Pinagmulan</div>
                      {food.sources.map((s,i)=>{
                        const bc = BADGE_COLORS[s.badge]||{bg:"#F4F6F7",text:"#566573"};
                        return (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:bc.bg,border:`1px solid ${bc.text}22`,borderRadius:10,textDecoration:"none",marginBottom:6,transition:"transform 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
                          onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
                            <span style={{fontSize:10,fontWeight:800,color:bc.text,background:`${bc.text}20`,padding:"2px 7px",borderRadius:4,letterSpacing:0.5,flexShrink:0}}>{s.badge}</span>
                            <span style={{fontSize:12,color:bc.text,fontWeight:500}}>{s.label}</span>
                            <span style={{marginLeft:"auto",fontSize:12,color:bc.text,opacity:0.6}}>→</span>
                          </a>
                        );
                      })}
                    </div>
                    {selectedConditions.includes("ckd") && (
                      <div style={{margin:"0 0 8px",background:"#EAF4FB",border:"1.5px solid #85C1E9",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#1A6B8A",lineHeight:1.5}}>
                        🫘 <strong>Paalala para sa CKD:</strong> Ang CKD diet ay nag-iiba ayon sa stage ng sakit at lab results mo (potassium, phosphorus, BUN). Ang gabay na ito ay para sa pangkalahatang impormasyon lamang — kumonsulta sa iyong nephrologist o renal dietitian.
                      </div>
                    )}
                    {selectedConditions.includes("gout") && (
                      <div style={{margin:"0 0 8px",background:"#F4ECF7",border:"1.5px solid #C39BD3",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#4A235A",lineHeight:1.5}}>
                        🦶 <strong>Paalala para sa Gout:</strong> Ang diet ay isa lamang sa pamamahala ng gout — kailangan din ang gamot para sa uric acid control. Maging sapat ang tubig (8–16 baso/araw) at kumonsulta sa iyong rheumatologist o doktor.
                      </div>
                    )}
                    {selectedConditions.includes("gerd") && (
                      <div style={{margin:"0 0 8px",background:"#FEF9E7",border:"1.5px solid #F9D56E",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#B7770D",lineHeight:1.5}}>
                        🔥 <strong>Paalala para sa GERD:</strong> Ang GERD triggers ay nag-iiba sa bawat tao. Kung hindi nag-trigger ang isang pagkain sa iyo, okay lang ito kumain. Kumonsulta sa iyong gastroenterologist.
                      </div>
                    )}
                    <p style={{margin:"12px 0 0",fontSize:11,color:"#95A5A6",lineHeight:1.6,textAlign:"center"}}>Ang gabay na ito ay pangkaalaman lamang. Kumonsulta sa iyong doktor.</p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// SCREEN 4 — PWEDE BA TO?
// ============================================
function ScreenPwedeBaTo({ selectedConditions, onBack, onGoToFoodGuide }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [dots, setDots] = useState(".");
  const inputRef = useRef(null);
  const resultRef = useRef(null);
  const [expandedConds, setExpandedConds] = useState(true);

  useEffect(()=>{
    if(!loading) return;
    const iv = setInterval(()=>setDots(d=>d.length>=3?".":d+"."),400);
    return ()=>clearInterval(iv);
  },[loading]);

  useEffect(()=>{ if(result && resultRef.current) resultRef.current.scrollIntoView({behavior:"smooth",block:"start"}); },[result]);

  const getSuggestions = () => {
    const seen = new Set(); const out = [];
    selectedConditions.forEach(c=>(QUICK_SUGGESTIONS[c]||[]).forEach(s=>{if(!seen.has(s)){seen.add(s);out.push(s);}}));
    return out.slice(0,8);
  };

  const submit = async (q) => {
    const fq = (q||query).trim(); if(!fq) return;
    setQuery(fq); setLoading(true); setResult(null); setError(null);
    try {
      const dbFood = findFoodInDB(fq);
      let res;
      if(dbFood){
        const combined = getCombinedVerdict(dbFood, selectedConditions);
        res = {
          food_name:dbFood.name, overall_verdict:combined,
          overall_reason:dbFood.conditions[selectedConditions[0]]?.reason||"Tingnan ang detalye sa ibaba.",
          per_condition:selectedConditions.filter(c=>dbFood.conditions[c]).map(c=>({condition:c,verdict:dbFood.conditions[c].verdict,reason:dbFood.conditions[c].reason,portion_tip:null})),
          safe_alternative:dbFood.safe_alternative, confidence:"mataas", disclaimer_needed:false, from_database:true,
        };
      } else {
        res = await callClaude(fq, selectedConditions);
        res.from_database = false;
      }
      setResult(res);
      setHistory(prev=>[{query:fq,result:res},...prev.slice(0,4)]);
    } catch(e) {
      setError("Hindi ko masagot ang tanong na iyon ngayon. Subukan muli o kumonsulta sa iyong doktor.");
    } finally { setLoading(false); }
  };

  const clear = () => { setQuery(""); setResult(null); setError(null); inputRef.current?.focus(); };

  const condMeta = selectedConditions.map(c=>CONDITIONS.find(x=>x.id===c)).filter(Boolean);

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#F7FDF9",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0D3B26,#1A6644,#2D9E6B)",padding:"20px 20px 32px",position:"relative",overflow:"hidden"}}>
        {[{top:"-30px",right:"-30px",s:120},{bottom:0,left:"-20px",s:90},{top:"20px",right:"60px",s:50}].map((o,i)=>(
          <div key={i} style={{position:"absolute",width:o.s,height:o.s,borderRadius:"50%",background:`rgba(255,255,255,0.05)`,top:o.top,left:o.left,right:o.right,bottom:o.bottom}}/>
        ))}
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
          ← Bumalik
        </button>
        <div style={{fontSize:34,marginBottom:4}}>🤔</div>
        <h2 style={{margin:"0 0 6px",fontSize:26,fontWeight:900,color:"#fff",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.1}}>Pwede Ba To?</h2>
        <p style={{margin:"0 0 14px",fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.5}}>I-type ang kahit anong pagkain at sasabihin ko kung ligtas para sa iyo.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {condMeta.map(c=>(
            <span key={c.id} style={{background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,color:"#fff",display:"flex",alignItems:"center",gap:4}}>
              {c.emoji} {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Floating input */}
      <div style={{padding:"0 20px",marginTop:-20,position:"relative",zIndex:10}}>
        <div style={{background:"#fff",borderRadius:18,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",border:"2px solid #E8F0EC",overflow:"hidden",transition:"border-color 0.2s,box-shadow 0.2s"}}
          onFocusCapture={e=>{e.currentTarget.style.borderColor="#2D9E6B";e.currentTarget.style.boxShadow="0 8px 32px rgba(45,158,107,0.18)";}}
          onBlurCapture={e=>{e.currentTarget.style.borderColor="#E8F0EC";e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.12)";}}>
          <div style={{display:"flex",alignItems:"center",padding:"4px 6px 4px 16px",gap:8}}>
            <span style={{fontSize:18,flexShrink:0}}>🍽️</span>
            <input ref={inputRef} type="text" placeholder="Halimbawa: lechon, kanin, kape, tuna..." value={query}
              onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
              style={{flex:1,border:"none",background:"transparent",fontSize:15,color:"#2C3E50",padding:"14px 0",fontFamily:"'DM Sans',sans-serif"}}/>
            {query && <button onClick={clear} style={{background:"#EEF0F0",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#7F8C8D"}}>✕</button>}
            <button onClick={()=>submit()} disabled={!query.trim()||loading} style={{
              background:query.trim()&&!loading?"linear-gradient(135deg,#1A6644,#2D9E6B)":"#D5D8DC",
              border:"none",borderRadius:12,padding:"10px 18px",color:"#fff",fontSize:13,fontWeight:700,
              cursor:query.trim()&&!loading?"pointer":"not-allowed",transition:"all 0.2s",flexShrink:0,fontFamily:"'DM Sans',sans-serif",
            }}>
              {loading?"...":"Tanungin →"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 40px"}}>

        {/* Empty state */}
        {!result && !loading && (
          <div style={{animation:"fadeIn 0.4s ease"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#95A5A6",letterSpacing:0.5,textTransform:"uppercase",marginBottom:10}}>Mga madalas na tanungin:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
              {getSuggestions().map(s=>(
                <button key={s} onClick={()=>submit(s)} style={{
                  background:"#fff",border:"1.5px solid #D5ECE0",borderRadius:20,padding:"7px 14px",
                  fontSize:13,fontWeight:600,color:"#2C7A4B",cursor:"pointer",transition:"all 0.15s",
                  fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={e=>{e.currentTarget.style.background="#F0FBF6";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.transform="translateY(0)";}}>
                  {s}
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <>
                <div style={{fontSize:12,fontWeight:700,color:"#95A5A6",letterSpacing:0.5,textTransform:"uppercase",marginBottom:10}}>Mga nakaraang tanong:</div>
                {history.map((item,i)=>{
                  const cfg = VERDICT_CFG[item.result?.overall_verdict]||VERDICT_CFG.kainin;
                  return (
                    <button key={i} onClick={()=>{setQuery(item.query);submit(item.query);}} style={{
                      display:"flex",alignItems:"center",gap:10,width:"100%",background:"#fff",
                      border:`1.5px solid ${cfg.border}`,borderRadius:12,padding:"10px 14px",marginBottom:6,
                      cursor:"pointer",textAlign:"left",transition:"transform 0.15s",fontFamily:"'DM Sans',sans-serif",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
                      <span style={{fontSize:18,flexShrink:0}}>{cfg.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#2C3E50",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.query}</div>
                        <div style={{fontSize:11,color:cfg.color,fontWeight:600}}>{cfg.label}</div>
                      </div>
                      <span style={{fontSize:12,color:"#95A5A6"}}>↩</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",animation:"fadeIn 0.3s ease"}}>
            <div style={{width:56,height:56,borderRadius:"50%",border:"3px solid #E8F0EC",borderTop:"3px solid #2D9E6B",animation:"spin 0.8s linear infinite",marginBottom:20}}/>
            <div style={{fontSize:16,fontWeight:700,color:"#1A4731",fontFamily:"'Playfair Display',Georgia,serif",marginBottom:8}}>Hinahanap ang sagot{dots}</div>
            <div style={{fontSize:13,color:"#7F8C8D",textAlign:"center"}}>Sinusuri ang "{query}"</div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{background:"#FDECEA",border:"1.5px solid #F1948A",borderRadius:16,padding:"20px",animation:"fadeIn 0.3s ease",marginBottom:16}}>
            <div style={{fontSize:24,marginBottom:8}}>😔</div>
            <div style={{fontSize:14,fontWeight:700,color:"#A93226",marginBottom:6}}>Hindi ko nasagot ang tanong</div>
            <div style={{fontSize:13,color:"#922B21",lineHeight:1.6,marginBottom:12}}>{error}</div>
            <button onClick={()=>submit()} style={{background:"#A93226",border:"none",borderRadius:10,padding:"10px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Subukan Muli</button>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div ref={resultRef} style={{animation:"fadeIn 0.4s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <span style={{fontSize:10,fontWeight:800,color:result.from_database?"#1A5276":"#6C3483",background:result.from_database?"#EBF5FB":"#F5EEF8",border:`1px solid ${result.from_database?"#1A527622":"#6C348322"}`,borderRadius:6,padding:"3px 8px",letterSpacing:0.5}}>
                {result.from_database?"📚 FNRI DATABASE":"🤖 AI ANALYSIS"}
              </span>
              <span style={{fontSize:11,color:"#95A5A6"}}>{result.from_database?"Mula sa aming verified na database":"Sinuri ng AI"}</span>
            </div>

            {(()=>{
              const cfg = VERDICT_CFG[result.overall_verdict]||VERDICT_CFG.kainin;
              const relConds = result.per_condition?.filter(c=>selectedConditions.includes(c.condition))||[];
              return (
                <div style={{background:"#fff",borderRadius:20,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.10)",border:`2px solid ${cfg.border}`,marginBottom:14}}>
                  <div style={{background:`linear-gradient(135deg,${cfg.bg},#fff)`,padding:"18px 20px 14px",borderBottom:`1.5px solid ${cfg.border}`}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                      <div>
                        <div style={{fontSize:12,color:"#95A5A6",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>{result.food_name}</div>
                        <div style={{fontSize:26,fontWeight:900,color:cfg.color,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1}}>{cfg.label}</div>
                        <div style={{fontSize:13,color:cfg.color,opacity:0.8,marginTop:4,lineHeight:1.4}}>{result.overall_reason}</div>
                      </div>
                      <div style={{width:50,height:50,borderRadius:"50%",background:cfg.bg,border:`2px solid ${cfg.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{cfg.icon}</div>
                    </div>
                    <div style={{marginTop:10,display:"flex",flexWrap:"wrap"}}>
                      {relConds.map(c=>{
                        const condCfg = VERDICT_CFG[c.verdict]||VERDICT_CFG.kainin;
                        const condMeta = CONDITIONS.find(x=>x.id===c.condition);
                        return (
                          <span key={c.condition} style={{fontSize:11,fontWeight:700,color:condCfg.color,background:condCfg.bg,border:`1.5px solid ${condCfg.border}`,borderRadius:20,padding:"3px 10px",marginRight:4,marginBottom:4}}>
                            {condMeta?.emoji} {condMeta?.label} {condCfg.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {relConds.length > 0 && (
                    <div style={{padding:"0 20px"}}>
                      <button onClick={()=>setExpandedConds(!expandedConds)} style={{width:"100%",background:"none",border:"none",padding:"12px 0",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,fontWeight:700,color:"#7F8C8D",letterSpacing:0.5,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>
                        Para sa Bawat Kalagayan
                        <span style={{transition:"transform 0.2s",transform:expandedConds?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
                      </button>
                      {expandedConds && (
                        <div style={{paddingBottom:16}}>
                          {relConds.map(c=>{
                            const condCfg = VERDICT_CFG[c.verdict]||VERDICT_CFG.kainin;
                            const condMeta = CONDITIONS.find(x=>x.id===c.condition);
                            return (
                              <div key={c.condition} style={{background:condCfg.bg,border:`1.5px solid ${condCfg.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    <span>{condMeta?.emoji}</span>
                                    <span style={{fontSize:13,fontWeight:700,color:"#2C3E50"}}>{condMeta?.label}</span>
                                  </div>
                                  <span style={{fontSize:11,fontWeight:800,color:condCfg.color,background:"#fff",border:`1px solid ${condCfg.border}`,borderRadius:20,padding:"2px 10px"}}>{condCfg.icon} {condCfg.label}</span>
                                </div>
                                <p style={{margin:0,fontSize:13,color:"#4A5568",lineHeight:1.6}}>{c.reason}</p>
                                {c.portion_tip && <div style={{marginTop:8,padding:"6px 10px",background:"#fff",borderRadius:8,fontSize:12,color:condCfg.color,fontWeight:600,border:`1px dashed ${condCfg.border}`}}>📏 {c.portion_tip}</div>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {result.safe_alternative && (
                    <div style={{margin:"0 20px 16px",background:"#F0FBF6",border:"1.5px solid #A8DFBF",borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:11,fontWeight:800,color:"#1A7A4A",marginBottom:4,letterSpacing:0.5}}>💡 SUBUKAN MO ITO SA HALIP</div>
                      <p style={{margin:0,fontSize:13,color:"#1A4731",lineHeight:1.6}}>{result.safe_alternative}</p>
                    </div>
                  )}

                  {result.disclaimer_needed && (
                    <div style={{margin:"0 20px 16px",background:"#FEF9E7",border:"1.5px solid #F9E79F",borderRadius:12,padding:"10px 14px",fontSize:12,color:"#7D6608",lineHeight:1.5}}>
                      ⚠️ Kumonsulta pa rin sa iyong doktor o nutritionist para sa mas tiyak na gabay.
                    </div>
                  )}

                  <div style={{borderTop:"1px solid #F0F0F0",padding:"10px 20px",display:"flex",alignItems:"center",gap:6}}>
                    {["FNRI","DOH","WHO","WHF","FAO","KDIGO","ACG","NKF"].map(b=>{const bc=BADGE_COLORS[b];return <span key={b} style={{fontSize:10,fontWeight:800,color:bc.text,background:bc.bg,border:`1px solid ${bc.text}22`,borderRadius:4,padding:"2px 7px",letterSpacing:0.5}}>{b}</span>;})}
                    <span style={{fontSize:11,color:"#95A5A6",marginLeft:4}}>Batay sa FNRI, DOH, WHO, WHF, at FAO</span>
                  </div>
                </div>
              );
            })()}

            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={clear} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#0D3B26,#2D9E6B)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(45,158,107,0.3)",fontFamily:"'DM Sans',sans-serif",transition:"transform 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                🔄 Magtanong ng Iba Pang Pagkain
              </button>
              <button onClick={onGoToFoodGuide} style={{width:"100%",padding:"12px",borderRadius:14,border:"1.5px solid #A8DFBF",background:"#fff",color:"#2D9E6B",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"'DM Sans',sans-serif",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F0FBF6"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                📋 Tingnan ang Buong Listahan ng Pagkain
              </button>
            </div>

            <p style={{margin:"16px 0 0",fontSize:11,color:"#95A5A6",lineHeight:1.6,textAlign:"center"}}>
              Ang gabay na ito ay pangkaalaman lamang at hindi kapalit ng medikal na payo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// BHW MODE
// ============================================
function ScreenBHW({ onBack }) {
  const [conditions, setConditions] = useState([]);
  const [generated, setGenerated] = useState(false);

  const toggle = (id) => setConditions(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  const ligtas = getFoodsByVerdict("kainin", conditions);
  const limitahan = getFoodsByVerdict("limitahan", conditions);
  const iwasan = getFoodsByVerdict("iwasan", conditions);

  if(generated && conditions.length > 0) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#fff",minHeight:"100vh",padding:"24px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:"#1A4731",fontFamily:"'Playfair Display',Georgia,serif",margin:0}}>Gabay sa Pagkain</h2>
          <div style={{fontSize:11,color:"#7F8C8D",marginTop:4}}>Batay sa: FNRI at DOH Pilipinas</div>
        </div>
        <button onClick={()=>setGenerated(false)} style={{background:"#F0F0F0",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>← Bumalik</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
        {conditions.map(c=>{const m=CONDITIONS.find(x=>x.id===c);return <span key={c} style={{background:m.bg,border:`1px solid ${m.border}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,color:m.color}}>{m.emoji} {m.label}</span>;})}
      </div>
      {[{list:ligtas,label:"✅ KAININ",color:"#1A7A4A",bg:"#E8F8F0",border:"#6FCF97"},{list:limitahan,label:"⚠️ LIMITAHAN",color:"#B8620A",bg:"#FEF8EC",border:"#F6C86A"},{list:iwasan,label:"❌ IWASAN",color:"#A93226",bg:"#FDECEA",border:"#F1948A"}].map(({list,label,color,bg,border})=>(
        list.length > 0 && (
          <div key={label} style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color,background:bg,border:`1.5px solid ${border}`,borderRadius:8,padding:"6px 12px",marginBottom:8,display:"inline-block"}}>{label}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {list.map(f=><span key={f.food_id} style={{background:"#F8F9FA",border:"1px solid #E0E0E0",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:600,color:"#2C3E50"}}>{f.emoji} {f.name}</span>)}
            </div>
          </div>
        )
      ))}
      <p style={{fontSize:10,color:"#95A5A6",marginTop:20,lineHeight:1.6,borderTop:"1px solid #E0E0E0",paddingTop:12}}>Para sa kaalaman lamang. Kumonsulta sa iyong doktor o nutritionist.</p>
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#F7FDF9",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"linear-gradient(135deg,#1A4731,#2D9E6B)",padding:"20px 20px 28px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:16}}>← Bumalik</button>
        <div style={{fontSize:22,marginBottom:4}}>👩‍⚕️</div>
        <h2 style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"'Playfair Display',Georgia,serif",margin:"0 0 6px"}}>BHW Mode</h2>
        <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.75)"}}>Para sa Barangay Health Workers — gumawa ng printable na gabay</p>
      </div>
      <div style={{flex:1,padding:"20px",overflowY:"auto"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#566573",letterSpacing:0.5,textTransform:"uppercase",marginBottom:12}}>Piliin ang kalagayan ng pasyente:</div>
        {CONDITIONS.map(c=>{
          const isSel = conditions.includes(c.id);
          return (
            <button key={c.id} onClick={()=>toggle(c.id)} style={{
              width:"100%",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",marginBottom:8,
              borderRadius:14,border:"none",background:isSel?`linear-gradient(135deg,${c.bg},#fff)`:"#fff",
              outline:isSel?`2px solid ${c.color}`:"2px solid #E8F0EC",
              cursor:"pointer",textAlign:"left",transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif",
            }}>
              <span style={{fontSize:24,flexShrink:0}}>{c.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:isSel?c.color:"#2C3E50"}}>{c.label}</div>
                <div style={{fontSize:11,color:"#7F8C8D"}}>{c.sublabel}</div>
              </div>
              <div style={{width:24,height:24,borderRadius:"50%",background:isSel?c.color:"#F0F0F0",border:`2px solid ${isSel?c.color:"#E0E0E0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",transition:"all 0.2s"}}>
                {isSel&&"✓"}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{padding:"16px 20px 32px",background:"rgba(247,253,249,0.95)",backdropFilter:"blur(10px)",borderTop:"1px solid #E8F0EC"}}>
        <button onClick={()=>{if(conditions.length>0)setGenerated(true);}} style={{
          width:"100%",padding:"15px",borderRadius:14,border:"none",
          background:conditions.length>0?"linear-gradient(135deg,#1A4731,#2D9E6B)":"#D5D8DC",
          color:"#fff",fontSize:15,fontWeight:700,cursor:conditions.length>0?"pointer":"not-allowed",
          fontFamily:"'DM Sans',sans-serif",
        }}>
          🖨️ Gumawa ng Gabay sa Pagkain
        </button>
      </div>
    </div>
  );
}

// ============================================
// APP — ROOT ROUTER
// ============================================
const SCREENS = { WELCOME:"welcome", CONDITIONS:"conditions", FOOD_GUIDE:"food_guide", PWEDE_BA_TO:"pwede_ba_to", BHW:"bhw" };

export default function KainKlinikal() {
  const [screen, setScreen] = useState(SCREENS.WELCOME);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [budget, setBudget] = useState(200);

  const navigate = (s) => setScreen(s);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{maxWidth:480,margin:"0 auto",position:"relative",minHeight:"100vh",boxShadow:"0 0 60px rgba(0,0,0,0.3)"}}>

        {screen === SCREENS.WELCOME && (
          <ScreenWelcome
            onStart={() => navigate(SCREENS.CONDITIONS)}
            onBHW={() => navigate(SCREENS.BHW)}
          />
        )}

        {screen === SCREENS.CONDITIONS && (
          <ScreenConditions
            onBack={() => navigate(SCREENS.WELCOME)}
            onNext={(conds, bud) => {
              setSelectedConditions(conds);
              setBudget(bud);
              navigate(SCREENS.FOOD_GUIDE);
            }}
          />
        )}

        {screen === SCREENS.FOOD_GUIDE && (
          <ScreenFoodGuide
            selectedConditions={selectedConditions}
            budget={budget}
            onBack={() => navigate(SCREENS.CONDITIONS)}
            onPwedeBaTo={() => navigate(SCREENS.PWEDE_BA_TO)}
          />
        )}

        {screen === SCREENS.PWEDE_BA_TO && (
          <ScreenPwedeBaTo
            selectedConditions={selectedConditions}
            onBack={() => navigate(SCREENS.FOOD_GUIDE)}
            onGoToFoodGuide={() => navigate(SCREENS.FOOD_GUIDE)}
          />
        )}

        {screen === SCREENS.BHW && (
          <ScreenBHW onBack={() => navigate(SCREENS.WELCOME)} />
        )}
      </div>
    </>
  );
}
