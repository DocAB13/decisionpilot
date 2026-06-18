export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;

  try {
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
        system: `You are DecisionPilot, a premium AI decision advisor. Help users make better decisions about vacations, phones, cars, careers, and any major life choice. Be warm, direct, and concise. Ask 1-2 clarifying questions first, then give specific actionable recommendations with clear winners. Serve users globally.`,
        messages,
      }),
    });

    const data = await response.json();
    const reply = data.content?.map((b) => b.text || "").join("") || "Please try again.";
    res.status(200).json({ reply });
  } catch {
    res.status(500).json({ reply: "Server error. Please try again." });
  }
}
