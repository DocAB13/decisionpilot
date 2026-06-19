export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages, lang, mode, category, answers } = req.body;

  let systemPrompt = "";

  if (mode === "tree_result") {
    systemPrompt = `You are DecisionPilot, a world-class AI recommendation engine. 
    
The user has answered a series of questions about their ${category} decision. Based on their answers, you must provide exactly 5 personalized recommendations.

CRITICAL RULES:
- Recommendations must be REAL products/services that exist in 2025-2026
- Base recommendations on actual reviews from CNET, TechRadar, GSMArena, Booking.com, AutoScout24, Wirecutter, etc.
- Each recommendation must be genuinely different and suited to different aspects of their answers
- Never repeat the same product twice
- Be specific: include real model names, real prices in USD/EUR, real pros and cons
- Vary your recommendations: include a best overall, best value, premium pick, hidden gem, and practical choice

Respond ONLY with a valid JSON object, no markdown, no backticks, exactly this structure:
{
  "title": "Your personalized recommendations for [category]",
  "subtitle": "Based on your preferences: [brief summary of their answers]",
  "picks": [
    {
      "rank": 1,
      "badge": "Best Overall",
      "name": "Product Name",
      "price": "$XXX - $XXX",
      "image_query": "product name high quality photo",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "why": "One sentence explaining why this matches their specific answers",
      "link": "https://real-url.com",
      "source": "CNET / TechRadar / GSMArena / etc"
    }
  ]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: `User answers: ${JSON.stringify(answers)}` }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map(b => b.text || "").join("") || "{}";
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      return res.status(200).json({ type: "recommendations", data: parsed });
    } catch {
      return res.status(200).json({ type: "error", reply: "Could not generate recommendations. Please try again." });
    }
  }

  // Regular chat mode
  systemPrompt = `You are DecisionPilot, a premium AI decision advisor. Help users make better decisions about vacations, phones, cars, careers, fitness, pets, dining, laptops, and TVs.

Be warm, direct, and specific. Ask 1-2 clarifying questions first, then give specific actionable recommendations with clear winners. Include real product names, real prices, and real pros/cons. Serve users globally. Respond in the same language the user writes in.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  const data = await response.json();
  const reply = data.content?.map(b => b.text || "").join("") || "Please try again.";
  res.status(200).json({ type: "chat", reply });
}
