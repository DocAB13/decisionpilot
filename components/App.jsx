import { useState, useEffect, useRef } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-6";

const C = {
  bg: "#0A0A0F",
  surface: "#12121A",
  card: "#1A1A28",
  border: "#2A2A40",
  accent: "#7C6AF7",
  accentGlow: "#7C6AF733",
  gold: "#F0B429",
  goldGlow: "#F0B42920",
  text: "#F0EFF8",
  muted: "#8887A4",
  success: "#34D399",
  tag: "#1E1E30",
};

const TREE = {
  id: "root",
  question: "What do you want to decide?",
  emoji: "🧭",
  options: [
    {
      label: "🏖️ Vacation",
      id: "vacation",
      question: "What's your travel style?",
      emoji: "✈️",
      options: [
        {
          label: "🌊 Beach & Relax",
          id: "beach",
          question: "What's your budget per person?",
          emoji: "💰",
          options: [
            {
              label: "Under $800",
              id: "beach_budget",
              result: {
                title: "Albania Riviera or Bulgaria – Black Sea",
                description: "Hidden gems with stunning beaches at a fraction of the cost.",
                picks: [
                  { name: "Ksamil, Albania", tag: "Best Value", desc: "Crystal clear water, authentic food, almost zero crowds.", link: "https://www.booking.com/searchresults.html?ss=Ksamil&aid=decisionpilot" },
                  { name: "Sunny Beach, Bulgaria", tag: "Party Scene", desc: "Lively atmosphere, affordable hotels, warm Black Sea water.", link: "https://www.booking.com/searchresults.html?ss=Sunny+Beach&aid=decisionpilot" },
                  { name: "Ulcinj, Montenegro", tag: "Underrated", desc: "Long sandy beach, warm Adriatic water, very affordable.", link: "https://www.booking.com/searchresults.html?ss=Ulcinj&aid=decisionpilot" },
                ],
              },
            },
            {
              label: "$800 – $1,500",
              id: "beach_mid",
              result: {
                title: "Crete or Mallorca",
                description: "Classic Mediterranean excellence at mid-range prices.",
                picks: [
                  { name: "Crete, Greece", tag: "Best Overall", desc: "Diverse landscapes, incredible food, warm locals.", link: "https://www.booking.com/searchresults.html?ss=Crete&aid=decisionpilot" },
                  { name: "Mallorca, Spain", tag: "Best Nightlife", desc: "Stunning coves, world-class clubs, easy transport.", link: "https://www.booking.com/searchresults.html?ss=Mallorca&aid=decisionpilot" },
                  { name: "Algarve, Portugal", tag: "Hidden Gem", desc: "Dramatic cliffs, golden beaches, excellent seafood.", link: "https://www.booking.com/searchresults.html?ss=Algarve&aid=decisionpilot" },
                ],
              },
            },
            {
              label: "Over $1,500",
              id: "beach_luxury",
              result: {
                title: "Santorini, Maldives or Bali",
                description: "World-class luxury destinations where every detail is perfected.",
                picks: [
                  { name: "Santorini, Greece", tag: "Most Iconic", desc: "Caldera sunsets, infinity pools, romantic atmosphere.", link: "https://www.booking.com/searchresults.html?ss=Santorini&aid=decisionpilot" },
                  { name: "Maldives", tag: "Ultimate Luxury", desc: "Overwater bungalows, private beaches, world-class diving.", link: "https://www.booking.com/searchresults.html?ss=Maldives&aid=decisionpilot" },
                  { name: "Bali, Indonesia", tag: "Best Value Luxury", desc: "Luxury at mid-range prices. Seminyak for nightlife, Ubud for culture.", link: "https://www.booking.com/searchresults.html?ss=Bali&aid=decisionpilot" },
                ],
              },
            },
          ],
        },
        {
          label: "🏛️ Culture & City",
          id: "culture",
          question: "Which region appeals to you?",
          emoji: "🗺️",
          options: [
            {
              label: "🇪🇺 Europe",
              id: "europe_culture",
              result: {
                title: "Rome, Prague or Lisbon",
                description: "Europe's finest cultural cities.",
                picks: [
                  { name: "Rome, Italy", tag: "Most Historic", desc: "Colosseum, Vatican, incredible food.", link: "https://www.booking.com/searchresults.html?ss=Rome&aid=decisionpilot" },
                  { name: "Prague, Czech Republic", tag: "Best Value", desc: "Fairy-tale architecture, craft beer culture.", link: "https://www.booking.com/searchresults.html?ss=Prague&aid=decisionpilot" },
                  { name: "Lisbon, Portugal", tag: "Most Underrated", desc: "Trams, Fado music, epic Atlantic views.", link: "https://www.booking.com/searchresults.html?ss=Lisbon&aid=decisionpilot" },
                ],
              },
            },
            {
              label: "🌏 Asia",
              id: "asia_culture",
              result: {
                title: "Tokyo, Kyoto or Bangkok",
                description: "Asia's most captivating cultural destinations.",
                picks: [
                  { name: "Tokyo, Japan", tag: "Most Unique", desc: "Futuristic and traditional at once.", link: "https://www.booking.com/searchresults.html?ss=Tokyo&aid=decisionpilot" },
                  { name: "Kyoto, Japan", tag: "Most Traditional", desc: "Geishas, temples, bamboo forests.", link: "https://www.booking.com/searchresults.html?ss=Kyoto&aid=decisionpilot" },
                  { name: "Bangkok, Thailand", tag: "Best Value", desc: "Street food, temples, rooftop bars.", link: "https://www.booking.com/searchresults.html?ss=Bangkok&aid=decisionpilot" },
                ],
              },
            },
          ],
        },
        {
          label: "🥾 Adventure",
          id: "adventure",
          result: {
            title: "New Zealand, Patagonia or Norway",
            description: "The world's ultimate adventure destinations.",
            picks: [
              { name: "New Zealand", tag: "Best All-Round", desc: "Bungee jumping, hiking, hobbit holes.", link: "https://www.booking.com/searchresults.html?ss=New+Zealand&aid=decisionpilot" },
              { name: "Patagonia, Argentina", tag: "Most Dramatic", desc: "Torres del Paine, glaciers, end of the world.", link: "https://www.booking.com/searchresults.html?ss=Patagonia&aid=decisionpilot" },
              { name: "Norway", tag: "Best in Europe", desc: "Fjords, Northern Lights, midnight sun.", link: "https://www.booking.com/searchresults.html?ss=Norway&aid=decisionpilot" },
            ],
          },
        },
      ],
    },
    {
      label: "📱 Smartphone",
      id: "phone",
      question: "What matters most to you?",
      emoji: "📱",
      options: [
        {
          label: "📸 Best Camera",
          id: "phone_camera",
          result: {
            title: "Top Camera Phones 2026",
            description: "If photos and videos are your priority, these are the champions.",
            picks: [
              { name: "iPhone 16 Pro Max", tag: "Best Overall", desc: "Cinematic mode, ProRes video, titanium build.", link: "https://www.amazon.com/s?k=iPhone+16+Pro+Max&tag=decisionpilot-20" },
              { name: "Google Pixel 9 Pro", tag: "Best AI Camera", desc: "Google's AI magic makes every photo look professional.", link: "https://www.amazon.com/s?k=Google+Pixel+9+Pro&tag=decisionpilot-20" },
              { name: "Samsung Galaxy S25 Ultra", tag: "Most Versatile", desc: "200MP sensor, 10x optical zoom, S Pen included.", link: "https://www.amazon.com/s?k=Samsung+Galaxy+S25+Ultra&tag=decisionpilot-20" },
            ],
          },
        },
        {
          label: "🔋 Best Battery",
          id: "phone_battery",
          result: {
            title: "All-Day Battery Champions",
            description: "Never worry about charging again.",
            picks: [
              { name: "OnePlus 13", tag: "Fastest Charging", desc: "100W charging, full charge in 25 minutes.", link: "https://www.amazon.com/s?k=OnePlus+13&tag=decisionpilot-20" },
              { name: "Samsung Galaxy S25+", tag: "Best Balance", desc: "All-day battery with premium features.", link: "https://www.amazon.com/s?k=Samsung+Galaxy+S25%2B&tag=decisionpilot-20" },
              { name: "iPhone 16 Plus", tag: "Best iOS Battery", desc: "2 days of normal use.", link: "https://www.amazon.com/s?k=iPhone+16+Plus&tag=decisionpilot-20" },
            ],
          },
        },
        {
          label: "💰 Best Value",
          id: "phone_value",
          result: {
            title: "Premium Features, Smart Price",
            description: "You don't need $1,000+ for an excellent phone.",
            picks: [
              { name: "Google Pixel 8a", tag: "Best Under $500", desc: "Flagship AI features, pure Android, excellent camera.", link: "https://www.amazon.com/s?k=Google+Pixel+8a&tag=decisionpilot-20" },
              { name: "Samsung Galaxy A55", tag: "Best Mid-Range", desc: "Beautiful display, solid camera, 5G.", link: "https://www.amazon.com/s?k=Samsung+Galaxy+A55&tag=decisionpilot-20" },
              { name: "Nothing Phone 3a", tag: "Most Unique", desc: "Glyph interface, clean design, excellent specs.", link: "https://www.amazon.com/s?k=Nothing+Phone+3a&tag=decisionpilot-20" },
            ],
          },
        },
      ],
    },
    {
      label: "🚗 Car",
      id: "car",
      question: "What type of car are you looking for?",
      emoji: "🚗",
      options: [
        {
          label: "⚡ Electric",
          id: "car_electric",
          result: {
            title: "Best Electric Cars 2026",
            description: "The EV market has matured. These are worth buying now.",
            picks: [
              { name: "Tesla Model 3", tag: "Best All-Round", desc: "500km range, supercharger network, autopilot.", link: "https://www.autoscout24.com/lst/tesla/model-3" },
              { name: "Volkswagen ID.4", tag: "Most Practical", desc: "SUV form factor, comfortable, VW reliability.", link: "https://www.autoscout24.com/lst/volkswagen/id.4" },
              { name: "Hyundai Ioniq 6", tag: "Best Range", desc: "800V ultra-fast charging, 600km+ range.", link: "https://www.autoscout24.com/lst/hyundai/ioniq-6" },
            ],
          },
        },
        {
          label: "🏎️ Performance",
          id: "car_performance",
          result: {
            title: "Performance Cars Worth Every Euro",
            description: "Driving pleasure above all else.",
            picks: [
              { name: "BMW M3 Competition", tag: "Best Driver's Car", desc: "503hp inline-6, perfect balance, daily usable.", link: "https://www.autoscout24.com/lst/bmw/m3" },
              { name: "Porsche 911", tag: "Most Iconic", desc: "Timeless, appreciates in value, usable every day.", link: "https://www.autoscout24.com/lst/porsche/911" },
              { name: "Toyota GR86", tag: "Best Value Fun", desc: "Pure driving joy, lightweight, affordable.", link: "https://www.autoscout24.com/lst/toyota/gr86" },
            ],
          },
        },
        {
          label: "👨‍👩‍👧 Family SUV",
          id: "car_family",
          result: {
            title: "Best Family SUVs 2026",
            description: "Space, safety, and comfort without sacrificing everything else.",
            picks: [
              { name: "Skoda Kodiaq", tag: "Best Value", desc: "7 seats, huge boot, VW group reliability.", link: "https://www.autoscout24.com/lst/skoda/kodiaq" },
              { name: "Volvo XC60", tag: "Safest Choice", desc: "World-class safety, beautiful Scandinavian interior.", link: "https://www.autoscout24.com/lst/volvo/xc60" },
              { name: "Kia EV9", tag: "Future-Proof", desc: "7-seat electric SUV, 500km range.", link: "https://www.autoscout24.com/lst/kia/ev9" },
            ],
          },
        },
      ],
    },
    {
      label: "💼 Career Move",
      id: "career",
      question: "What's your situation?",
      emoji: "💼",
      options: [
        {
          label: "🚀 Switch Jobs",
          id: "career_switch",
          result: {
            title: "How to Navigate a Job Switch",
            description: "A structured approach to making the right career move.",
            picks: [
              { name: "Evaluate Total Compensation", tag: "Step 1", desc: "Salary + equity + benefits + remote flexibility.", link: "https://www.levels.fyi" },
              { name: "Research Company Culture", tag: "Step 2", desc: "Glassdoor, Blind, LinkedIn. Talk to people who work there.", link: "https://www.glassdoor.com" },
              { name: "Negotiate Before Signing", tag: "Step 3", desc: "Always negotiate. First offer is rarely the best.", link: "https://www.linkedin.com/jobs" },
            ],
          },
        },
        {
          label: "🌍 Relocate",
          id: "career_relocate",
          result: {
            title: "Best Cities for Career Growth 2026",
            description: "Location matters enormously for salary and opportunities.",
            picks: [
              { name: "Dubai, UAE", tag: "Tax Free", desc: "Zero income tax, international hub, growing tech scene.", link: "https://www.linkedin.com/jobs/search/?location=Dubai" },
              { name: "Berlin, Germany", tag: "Tech Hub", desc: "Strong startup ecosystem, good salaries, high quality of life.", link: "https://www.linkedin.com/jobs/search/?location=Berlin" },
              { name: "Lisbon, Portugal", tag: "Best Quality of Life", desc: "Tech visa available, lower cost, sun, safety.", link: "https://www.linkedin.com/jobs/search/?location=Lisbon" },
            ],
          },
        },
      ],
    },
  ],
};

function findNode(tree, path) {
  let node = tree;
  for (const id of path) {
    if (!node.options) return null;
    node = node.options.find((o) => o.id === id);
    if (!node) return null;
  }
  return node;
}

function Orb({ style }) {
  return (
    <div style={{
      position: "absolute", borderRadius: "50%",
      filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
      ...style,
    }} />
  );
}

function Badge({ children, color = C.accent }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      letterSpacing: 0.5, textTransform: "uppercase",
    }}>{children}</span>
  );
}

function ResultCard({ pick, index }) {
  const colors = [C.gold, C.accent, C.success];
  const c = colors[index % 3];
  return (
    <div style={{
      background: C.card, border: `1px solid ${c}33`,
      borderRadius: 16, padding: "20px 22px", marginBottom: 12,
      boxShadow: `0 0 24px ${c}11`, transition: "transform 0.15s", cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{pick.name}</span>
        <Badge color={c}>{pick.tag}</Badge>
      </div>
      <p style={{ color: C.muted, fontSize: 14, margin: "0 0 8px", lineHeight: 1.6 }}>{pick.desc}</p>
      <a href={pick.link} target="_blank" rel="noopener noreferrer"
        style={{ color: c, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
        View deals →
      </a>
    </div>
  );
}

function Landing({ onStart }) {
  const features = [
    { icon: "🌳", label: "Decision Trees", desc: "Click-by-click guided decisions" },
    { icon: "🤖", label: "AI Advisor", desc: "Chat with your personal AI" },
    { icon: "🌍", label: "Global Coverage", desc: "Recommendations worldwide" },
    { icon: "⚡", label: "Instant Results", desc: "No waiting, no signup needed" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <Orb style={{ width: 600, height: 600, background: C.accent, opacity: 0.12, top: -200, left: -200 }} />
      <Orb style={{ width: 400, height: 400, background: C.gold, opacity: 0.07, top: 100, right: -100 }} />
      <Orb style={{ width: 300, height: 300, background: C.success, opacity: 0.06, bottom: 0, left: "40%" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>🧭</div>
            <span style={{ color: C.text, fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>DecisionPilot</span>
          </div>
          <Badge color={C.gold}>Free Beta</Badge>
        </div>
        <div style={{ textAlign: "center", paddingTop: 80, paddingBottom: 60 }}>
          <div style={{
            display: "inline-block", background: C.accentGlow, border: `1px solid ${C.accent}44`,
            borderRadius: 20, padding: "6px 16px", marginBottom: 28,
            color: C.accent, fontSize: 13, fontWeight: 600,
          }}>AI-Powered Decision Making ✦</div>
          <h1 style={{
            color: C.text, fontSize: "clamp(38px, 7vw, 72px)", fontWeight: 900,
            lineHeight: 1.05, letterSpacing: -2, margin: "0 0 12px",
          }}>
            Stop hesitating.<br />
            <span style={{
              background: `linear-gradient(135deg, ${C.accent} 0%, ${C.gold} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Start deciding.</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 18, maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7 }}>
            From choosing your next vacation to picking the perfect phone — DecisionPilot guides you to the right answer, every time.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => onStart("tree")} style={{
              background: `linear-gradient(135deg, ${C.accent} 0%, #9B8BFF 100%)`,
              color: "#fff", border: "none", borderRadius: 14, padding: "16px 32px",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 8px 32px ${C.accent}44`,
            }}>🌳 Use Decision Tree</button>
            <button onClick={() => onStart("chat")} style={{
              background: "transparent", color: C.text,
              border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 32px",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>🤖 Chat with AI</button>
          </div>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16, paddingBottom: 80,
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: "20px 18px",
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.label}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeScreen({ onBack }) {
  const [path, setPath] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const currentNode = findNode(TREE, path);

  function choose(optionId) { setPath(p => [...p, optionId]); setAnimKey(k => k + 1); }
  function back() { if (path.length === 0) { onBack(); return; } setPath(p => p.slice(0, -1)); setAnimKey(k => k + 1); }

  const hasResult = currentNode?.result;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <Orb style={{ width: 500, height: 500, background: C.accent, opacity: 0.08, top: -150, right: -150 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "28px 0 0" }}>
          <button onClick={back} style={{
            background: C.card, border: `1px solid ${C.border}`, color: C.muted,
            borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>← Back</button>
          <span style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>🧭 DecisionPilot</span>
          {path.length > 0 && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              {path.map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i === path.length - 1 ? C.accent : C.border,
                }} />
              ))}
            </div>
          )}
        </div>
        <div key={animKey} style={{ paddingTop: 48, paddingBottom: 60 }}>
          {!hasResult ? (
            <>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>{currentNode?.emoji || "🧭"}</div>
              <h2 style={{ color: C.text, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, textAlign: "center", marginBottom: 8, letterSpacing: -0.5 }}>
                {currentNode?.question}
              </h2>
              <p style={{ color: C.muted, textAlign: "center", marginBottom: 40, fontSize: 15 }}>Choose the option that fits you best</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {currentNode?.options?.map((opt) => (
                  <button key={opt.id} onClick={() => choose(opt.id)} style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 14, padding: "18px 22px", textAlign: "left",
                    cursor: "pointer", color: C.text, fontSize: 16, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "border-color 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentGlow; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
                  >
                    <span>{opt.label}</span>
                    <span style={{ color: C.muted }}>→</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{
                background: `linear-gradient(135deg, ${C.accent}22, ${C.gold}11)`,
                border: `1px solid ${C.accent}33`, borderRadius: 20, padding: "24px",
                marginBottom: 28, textAlign: "center",
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                <h2 style={{ color: C.text, fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>
                  {currentNode.result.title}
                </h2>
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                  {currentNode.result.description}
                </p>
              </div>
              {currentNode.result.picks.map((pick, i) => <ResultCard key={i} pick={pick} index={i} />)}
              <button onClick={() => { setPath([]); setAnimKey(k => k + 1); }} style={{
                marginTop: 20, width: "100%",
                background: `linear-gradient(135deg, ${C.accent}, #9B8BFF)`,
                color: "#fff", border: "none", borderRadius: 14, padding: "14px",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}>Make another decision →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatScreen({ onBack }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your DecisionPilot. Tell me about a decision you're facing — vacation, car, phone, career, or anything else. I'll ask a few questions and give you a personalized recommendation. 🧭",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <Orb style={{ width: 400, height: 400, background: C.accent, opacity: 0.07, top: -100, left: -100 }} />
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", gap: 12,
        padding: "18px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface,
      }}>
        <button onClick={onBack} style={{
          background: C.card, border: `1px solid ${C.border}`, color: C.muted,
          borderRadius: 10, padding: "7px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🧭</div>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>DecisionPilot AI</div>
            <div style={{ color: C.success, fontSize: 11, fontWeight: 600 }}>● Online</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", position: "relative", zIndex: 1 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
            {m.role === "assistant" && (
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, marginRight: 10, marginTop: 2,
              }}>🧭</div>
            )}
            <div style={{
              maxWidth: "75%", padding: "12px 16px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? `linear-gradient(135deg, ${C.accent}, #9B8BFF)` : C.card,
              border: m.role === "user" ? "none" : `1px solid ${C.border}`,
              color: C.text, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>🧭</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: C.muted,
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ position: "relative", zIndex: 1, padding: "16px 24px", borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 680, margin: "0 auto" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Describe your decision..."
            style={{
              flex: 1, background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "12px 16px", color: C.text, fontSize: 14,
              outline: "none", fontFamily: "inherit",
            }}
          />
          <button onClick={send} disabled={loading || !input.trim()} style={{
            background: input.trim() ? `linear-gradient(135deg, ${C.accent}, #9B8BFF)` : C.card,
            color: input.trim() ? "#fff" : C.muted,
            border: "none", borderRadius: 12, padding: "12px 20px",
            cursor: input.trim() ? "pointer" : "default", fontSize: 16,
          }}>↑</button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  if (screen === "tree") return <TreeScreen onBack={() => setScreen("landing")} />;
  if (screen === "chat") return <ChatScreen onBack={() => setScreen("landing")} />;
  return <Landing onStart={mode => setScreen(mode)} />;
}
