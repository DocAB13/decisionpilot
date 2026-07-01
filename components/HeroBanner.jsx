import { useState, useEffect, useRef } from "react";

const ASEL_ACCESSORY = {
  vacation: "beach", car: "auto", realestate: "career",
};

const SLIDES = [
  {
    id: "vacation",
    label: "Vacations",
    emoji: "✈️",
    image: "photo-1514282401047-d79a71a590e8",
    color: "#0369A1",
    gradient: "linear-gradient(120deg, rgba(3,105,161,0.68) 0%, rgba(6,182,212,0.42) 100%)",
    price: null,
    slowZoom: false,
  },
  {
    id: "car",
    label: "Cars",
    emoji: "🚗",
    image: "photo-1555215695-3004980ad54e",
    color: "#0A0A1A",
    gradient: "linear-gradient(120deg, rgba(10,10,26,0.78) 0%, rgba(30,41,59,0.48) 100%)",
    price: null,
    slowZoom: false,
  },
  {
    id: "realestate",
    label: "Houses",
    emoji: "🏡",
    image: "photo-1613977257363-707ba9348227",
    color: "#064E3B",
    gradient: "linear-gradient(120deg, rgba(6,78,59,0.65) 0%, rgba(16,185,129,0.38) 100%)",
    price: null,
    slowZoom: true,
  },
];

const GLOBE_POINTS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  lat: Math.random() * 160 - 80,
  lng: Math.random() * 360 - 180,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 3,
}));

const CONNECTIONS = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  from: Math.floor(Math.random() * 40),
  to: Math.floor(Math.random() * 40),
  delay: Math.random() * 4,
}));

function latLngToXY(lat, lng, cx, cy, r) {
  const x = cx + r * Math.cos((lat * Math.PI) / 180) * Math.sin((lng * Math.PI) / 180);
  const y = cy - r * Math.sin((lat * Math.PI) / 180);
  return { x, y };
}

export function AnimatedGlobe({ t }) {
  const [tick, setTick] = useState(0);
  const [activePoints, setActivePoints] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setTick(k => k + 1), 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const newPoint = Math.floor(Math.random() * 40);
      setActivePoints(prev => [...prev.slice(-5), newPoint]);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  const cx = 160, cy = 160, r = 130;
  const rotation = (tick * 0.3) % 360;

  const rotatedPoints = GLOBE_POINTS.map(p => {
    const adjustedLng = p.lng + rotation;
    return { ...p, ...latLngToXY(p.lat, adjustedLng, cx, cy, r) };
  });

  return (
    <div style={{ position: "relative", width: 320, height: 320 }}>
      {/* Glow */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, rgba(0,102,204,0.3), rgba(0,102,204,0.05) 70%)",
        filter: "blur(20px)",
      }} />

      <svg width="320" height="320" viewBox="0 0 320 320">
        {/* Globe base */}
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#1a6bd4" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#0a3d8f" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#061e4a" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4499ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0066cc" stopOpacity="0" />
          </radialGradient>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Outer glow */}
        <circle cx={cx} cy={cy} r={r + 15} fill="url(#glowGrad)" />

        {/* Globe sphere */}
        <circle cx={cx} cy={cy} r={r} fill="url(#globeGrad)" />

        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map(lat => {
          const ry = r * Math.cos((lat * Math.PI) / 180);
          const yPos = cy - r * Math.sin((lat * Math.PI) / 180);
          return ry > 0 ? (
            <ellipse key={lat} cx={cx} cy={yPos} rx={ry} ry={ry * 0.15}
              fill="none" stroke="#4499ff" strokeWidth="0.5" strokeOpacity="0.25"
              clipPath="url(#globeClip)" />
          ) : null;
        })}

        {/* Longitude lines */}
        {[0, 30, 60, 90, 120, 150].map(lng => {
          const adjustedLng = (lng + rotation) % 360;
          const x1 = cx + r * Math.sin((adjustedLng * Math.PI) / 180);
          return (
            <ellipse key={lng} cx={cx} cy={cy} rx={Math.abs(r * Math.cos((adjustedLng * Math.PI) / 180))} ry={r}
              fill="none" stroke="#4499ff" strokeWidth="0.5" strokeOpacity="0.2"
              clipPath="url(#globeClip)" />
          );
        })}

        {/* Connection lines */}
        {CONNECTIONS.map(conn => {
          const from = rotatedPoints[conn.from];
          const to = rotatedPoints[conn.to];
          if (!from || !to) return null;
          const visible = from.x > cx - r && from.x < cx + r && to.x > cx - r && to.x < cx + r;
          if (!visible) return null;
          return (
            <line key={conn.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="#66aaff" strokeWidth="0.8" strokeOpacity="0.3"
              clipPath="url(#globeClip)">
              <animate attributeName="stroke-opacity" values="0;0.4;0" dur={`${3 + conn.delay}s`} repeatCount="indefinite" />
            </line>
          );
        })}

        {/* Points */}
        {rotatedPoints.map(p => {
          const visible = p.x > cx - r + 10 && p.x < cx + r - 10;
          const isActive = activePoints.includes(p.id);
          if (!visible) return null;
          return (
            <g key={p.id}>
              {isActive && (
                <circle cx={p.x} cy={p.y} r={p.size + 4} fill="#66ffaa" fillOpacity="0.3">
                  <animate attributeName="r" values={`${p.size + 2};${p.size + 8};${p.size + 2}`} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={p.x} cy={p.y} r={p.size}
                fill={isActive ? "#66ffaa" : "#88bbff"}
                fillOpacity={visible ? (isActive ? 1 : 0.7) : 0}
                clipPath="url(#globeClip)" />
            </g>
          );
        })}

        {/* Shine */}
        <ellipse cx={cx - 35} cy={cy - 40} rx={45} ry={30}
          fill="white" fillOpacity="0.06" />

        {/* Border */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4499ff" strokeWidth="1" strokeOpacity="0.4" />
      </svg>

      {/* Floating stats */}
      {[
        { label: "🇺🇸 USA", x: "70%", y: "20%", delay: "0s" },
        { label: "🇩🇪 DE", x: "-10%", y: "30%", delay: "0.5s" },
        { label: "🇨🇳 CN", x: "75%", y: "55%", delay: "1s" },
        { label: "🇧🇷 BR", x: "15%", y: "75%", delay: "1.5s" },
        { label: "🇮🇳 IN", x: "60%", y: "70%", delay: "2s" },
      ].map((dot, i) => (
        <div key={i} style={{
          position: "absolute", left: dot.x, top: dot.y,
          background: "rgba(0,40,100,0.85)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(100,160,255,0.4)",
          borderRadius: 8, padding: "3px 8px",
          color: "#fff", fontSize: 11, fontWeight: 600,
          animation: `floatBadge 3s ease-in-out ${dot.delay} infinite`,
          whiteSpace: "nowrap",
        }}>{dot.label}</div>
      ))}

      <style>{`
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); opacity: 0.8; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Rebuilt for DecisionOS (formerly a rotating product-comparison carousel with stock
// photos, fabricated review counts, and per-slide affiliate-quiz CTAs). Static hero,
// honest copy, single CTA into the real wizard at /decision/new.
export function HeroBanner({ onStart }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #1A56DB 0%, #3B5BDB 55%, #7048E8 100%)" }}>
      <div className="hero-content" style={{
        position: "relative", zIndex: 1,
        maxWidth: 1100, margin: "0 auto",
        padding: "72px 32px",
        display: "flex", alignItems: "center", gap: 40,
        minHeight: 360,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,
            background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",
            border:"1px solid rgba(255,255,255,0.3)",
            borderRadius:24,padding:"6px 16px",marginBottom:20,
            color:"#fff",fontSize:13,fontWeight:600 }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:"#4ADE80",display:"inline-block",boxShadow:"0 0 8px #4ADE80" }} />
            AI-powered decision assistant
          </div>

          <h1 style={{
            color: "#fff", fontSize: "clamp(32px, 5vw, 54px)",
            fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5,
            margin: "0 0 16px", textShadow: "0 2px 20px rgba(0,0,0,0.2)",
          }}>
            Make your biggest decisions with confidence
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.85)", fontSize: "clamp(15px,1.8vw,18px)", fontWeight: 500,
            margin: "0 0 28px", lineHeight: 1.6, maxWidth: 520,
          }}>
            DecisionOS walks you through your context, goals, constraints, and alternatives, then gives you an AI-generated recommendation, an action plan, and outcome tracking — for financial, career, health, and other major life decisions.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => onStart("new-decision")} style={{
              background: "#fff", color: "#1A56DB",
              border: "none", borderRadius: 10, padding: "14px 28px",
              fontSize: 16, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              Start a Decision →
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
            {["Free to start", "AI recommendation with reasoning", "Track the outcome"].map(label => (
              <span key={label} style={{
                background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.9)",
                borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600,
              }}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorldwideSection({ t }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #061e4a 0%, #0a3d8f 50%, #1a6bd4 100%)",
      padding: "60px 24px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.05,
        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }} />

      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 60,
        flexWrap: "wrap", position: "relative", zIndex: 1,
      }}>
        {/* Globe */}
        <div style={{ flexShrink: 0, margin: "0 auto" }}>
          <AnimatedGlobe t={t} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(100,160,255,0.15)", border: "1px solid rgba(100,160,255,0.3)",
            borderRadius: 24, padding: "6px 16px", marginBottom: 20,
            color: "#88bbff", fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#66ffaa", display: "inline-block", boxShadow: "0 0 8px #66ffaa" }} />
            {t.worldwide || "Used Worldwide"}
          </div>

          <h2 style={{
            color: "#fff", fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5,
            margin: "0 0 16px",
          }}>
            {t.worldwide || "Used Worldwide"}
          </h2>

          <p style={{
            color: "rgba(180,210,255,0.8)", fontSize: 17, lineHeight: 1.7,
            margin: "0 0 32px", maxWidth: 420,
          }}>
            {t.worldwide_desc || "Millions of decisions made across the globe"}
          </p>

          {/* Live stats */}
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { value: "30+", label: "Languages" },
              { value: "190+", label: "Countries" },
              { value: "1M+", label: "Decisions" },
              { value: "21+", label: "Categories" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ color: "#66ffaa", fontSize: 28, fontWeight: 900, letterSpacing: -1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                <div style={{ color: "rgba(180,210,255,0.7)", fontSize: 13, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
