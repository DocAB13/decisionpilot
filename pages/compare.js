export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured in Vercel" });
  }

  const { products = [], lang = "en" } = req.body;
  const filtered = products.filter(p => p && p.trim());

  if (filtered.length < 2) {
    return res.status(400).json({ error: "Need at least 2 products" });
  }

  const langName = { en:"English",de:"German",ro:"Romanian",es:"Spanish",fr:"French",it:"Italian",pt:"Portuguese",nl:"Dutch",pl:"Polish",ru:"Russian",zh:"Chinese",ar:"Arabic",tr:"Turkish",sv:"Swedish",ko:"Korean",ja:"Japanese" }[lang] || "English";

  const prompt = `Compare these products for a consumer. Respond with ONLY a JSON object, no markdown:
${filtered.map((p, i) => `${i+1}. ${p}`).join("\n")}

{"products":[{"name":"exact name","score":8.5,"price_range":"€500-800","winner_badge":"","best_for":"ideal buyer 8 words max"}],"rows":[{"label":"Display","values":["val1","val2"],"winner":0},{"label":"Camera / Main feature","values":["val1","val2"],"winner":1},{"label":"Performance","values":["val1","val2"],"winner":0},{"label":"Battery / Autonomy","values":["val1","val2"],"winner":1},{"label":"Price","values":["val1","val2"],"winner":1},{"label":"Build quality","values":["val1","val2"],"winner":0},{"label":"Software / Ecosystem","values":["val1","val2"],"winner":-1},{"label":"Unique strength","values":["val1","val2"],"winner":-1}],"summary":"one sentence verdict"}

Rules: winner = product index (0,1,2) or -1 for tie. winner_badge one of: ""|"Top pick"|"Best value"|"Best specs" (only one product). scores honest 1-10. Respond in ${langName}.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await r.json();

    if (data.error || data.type === "error") {
      throw new Error(data.error?.message || "Anthropic API error");
    }

    const raw = (data.content || []).map(b => b.text || "").join("");

    // Extract JSON robustly
    let parsed;
    const attempts = [
      () => JSON.parse(raw.trim()),
      () => JSON.parse(raw.replace(/^```(?:json)?\s*/m,"").replace(/\s*```\s*$/m,"").trim()),
      () => { const m = raw.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); throw new Error("no match"); }
    ];
    for (const attempt of attempts) {
      try { parsed = attempt(); break; } catch {}
    }
    if (!parsed) throw new Error("Could not parse response: " + raw.slice(0, 150));

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("/api/compare error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
