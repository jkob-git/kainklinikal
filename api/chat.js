// Vercel Serverless Function - keeps API key secure on server
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { foodName, conditions } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
        "X-Title": "KainKlinikal"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          { 
            role: "system", 
            content: `Ikaw si NutriNena — isang mapagkakatiwalaang nutritionist ng DOH Pilipinas. Sumasagot ka sa simpleng Filipino.

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

PANUNTUNAN: Iwasan sa kahit isa = overall iwasan. Hindi sigurado = confidence mababa + disclaimer true. Simpleng Filipino palagi. Konkretong dami kung limitahan. Kapalit na mabibili sa probinsya lang.`
          },
          { 
            role: "user", 
            content: `Pagkain: ${foodName}\nKalagayan: ${conditions.join(", ")}\n\nJSON format lang ang sagot.` 
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
