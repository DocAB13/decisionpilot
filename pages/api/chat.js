export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { mode, category, answers, lang, market, currency, profile, messages: chatMessages } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in Vercel Environment Variables" });
  }

  const langName = { en:"English",de:"German",ro:"Romanian",es:"Spanish",fr:"French",it:"Italian",pt:"Portuguese",nl:"Dutch",pl:"Polish",ru:"Russian",zh:"Chinese",ar:"Arabic",tr:"Turkish",sv:"Swedish",ko:"Korean",ja:"Japanese" }[lang] || "English";

  async function claude(messages, system, maxTokens=1200) {
    const body = { model:"claude-sonnet-4-6", max_tokens:maxTokens, messages };
    if (system) body.system = system;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-api-key":process.env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (d.type==="error"||d.error) throw new Error(d.error?.message||"Anthropic error");
    if (!d.content?.length) throw new Error("Empty response");
    return d.content.map(b=>b.text||"").join("");
  }

  function extractJSON(raw) {
    try { return JSON.parse(raw.trim()); } catch {}
    try { return JSON.parse(raw.replace(/^```(?:json)?\s*/m,"").replace(/\s*```\s*$/m,"").trim()); } catch {}
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch {} }
    throw new Error("Cannot parse JSON: " + raw.slice(0,150));
  }

  // Build profile context string for AI prompts
  function buildProfileContext(profile) {
    if (!profile) return "";
    const budgetLabel = { tight:"tight (<€100/mo)", medium:"medium (€100-500/mo)", comfort:"comfortable (€500-2000/mo)", premium:"premium (€2000+/mo)" }[profile.budget] || "";
    const techLabel = profile.techLevel || "";
    const prios = (profile.priorities||[]).join(", ");
    const statusLabel = profile.status ? `${profile.status} ${profile.nickname||""}`.trim() : profile.nickname || "";
    let ctx = "";
    if (statusLabel) ctx += `User: ${statusLabel}. `;
    if (budgetLabel) ctx += `Budget: ${budgetLabel}. `;
    if (techLabel) ctx += `Tech level: ${techLabel}. `;
    if (prios) ctx += `Priorities: ${prios}. `;
    return ctx ? `\n\nUSER PROFILE (use this to personalize further): ${ctx}` : "";
  }

  try {
    // ── Compare ──────────────────────────────────────────────────────────────
    if (mode === "compare") {
      const products = (req.body.products||[]).filter(Boolean);
      if (products.length < 2) return res.status(400).json({ error:"Need at least 2 products" });

      const prompt = `Compare these products: ${products.map((p,i)=>`${i+1}. ${p}`).join(", ")}

Return ONLY a JSON object (no markdown):
{"products":[{"name":"product name","score":8.5,"price_range":"€500-800","winner_badge":"","best_for":"ideal user 8 words"}],"rows":[{"label":"Display","values":["val1","val2"],"winner":0},{"label":"Camera","values":["val1","val2"],"winner":1},{"label":"Performance","values":["val1","val2"],"winner":0},{"label":"Battery","values":["val1","val2"],"winner":1},{"label":"Price","values":["val1","val2"],"winner":1},{"label":"Build quality","values":["val1","val2"],"winner":0},{"label":"Software","values":["val1","val2"],"winner":-1},{"label":"Unique strength","values":["val1","val2"],"winner":-1}],"summary":"one sentence verdict"}
winner=index (0,1,2) or -1 for tie. winner_badge=""|"Top pick"|"Best value"|"Best specs" (one only). Respond in ${langName}.`;

      const raw = await claude([{ role:"user", content:prompt }]);
      return res.status(200).json(extractJSON(raw));
    }

    // ── Tree recommendations ─────────────────────────────────────────────────
    if (mode === "tree_result") {
      const isCarCat = ["auto","new_car","used_car","car_rental"].includes(category);
      const answerSummary = Object.entries(answers||{}).map(([q,a])=>`${q}: ${a}`).join(", ");
      const profileCtx = buildProfileContext(profile);
      const system = `You are DecisionPilot AI. ALL text in ${langName}. Currency: ${currency||"EUR"}. Market: ${market||"EU"}. Return ONLY valid JSON.`;
      const carTip = isCarCat ? `,"car_tip":{"verdict":"BUY NEW or BUY USED or EITHER WORKS","verdict_color":"green or blue or amber","headline":"short verdict","reason":"2-3 sentences about depreciation and maintenance","saving":"e.g. €8,000-14,000","depreciation":"fast or moderate or slow"}` : "";
      const prompt = `Category: ${category}. User answers: ${answerSummary}.${profileCtx}

Return ONLY JSON (no markdown):
{"title":"personalized title for [context]","subtitle":"based on [key preferences]","picks":[{"name":"Product","price":"€X-Y","why":"2-3 sentences referencing their specific answers AND profile if available","pros":["p1","p2","p3","p4","p5"],"cons":["c1","c2"],"badge":"BEST OVERALL","stars":"4.8","source":"Source"${carTip}}]}
badge: BEST OVERALL|BEST VALUE|PREMIUM PICK|BUDGET PICK|EDITOR'S PICK. Return 3 picks. ALL TEXT IN ${langName.toUpperCase()}.
${profile ? `The user has a profile — make the "why" explanation explicitly reference their profile preferences (budget: ${profile.budget||"unset"}, priorities: ${(profile.priorities||[]).join(", ")||"unset"}).` : ""}`;

      const raw = await claude([{ role:"user", content:prompt }], system, 2500);
      return res.status(200).json(extractJSON(raw));
    }

    // ── Chat ─────────────────────────────────────────────────────────────────
    const msgs = chatMessages||[];
    const profileCtx = buildProfileContext(profile);
    const system = `You are Ai·sel from DecisionPilot. Help users make better decisions. Be concise and friendly. Respond in ${langName}.${profileCtx}`;
    const raw = await claude(msgs, system);
    return res.status(200).json({ content:[{ type:"text", text:raw }] });

  } catch(err) {
    console.error("chat.js error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
