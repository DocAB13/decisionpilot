import { useState, useEffect, useRef } from "react";

const SLIDES = [
  { id: "vacation", emoji: "🏖️", image: "photo-1507525428034-b723cf961d3e", color: "#0055AA" },
  { id: "phone", emoji: "📱", image: "photo-1511707171634-5f897ff02aa9", color: "#7C3AED" },
  { id: "laptop", emoji: "💻", image: "photo-1496181133206-80ce9b88a853", color: "#0891B2" },
  { id: "tv", emoji: "📺", image: "photo-1593784991095-a205069470b6", color: "#059669" },
  { id: "car", emoji: "🚗", image: "photo-1494976388531-d1058494cdd8", color: "#DC2626" },
  { id: "fitness", emoji: "🏋️", image: "photo-1517836357463-d25dfeac3438", color: "#D97706" },
  { id: "pet", emoji: "🐕", image: "photo-1587300003388-59208cc962cb", color: "#7C3AED" },
  { id: "dining", emoji: "🍽️", image: "photo-1414235077428-338989a2e8c0", color: "#DB2777" },
  { id: "career", emoji: "💼", image: "photo-1454165804606-c3d57bc86b40", color: "#0066CC" },
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

export function HeroBanner({ onStart, t, lang }) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const CATEGORIES = [
    { id: "vacation", label: t.categories_data?.vacation ? "🏖️ Vacation" : "🏖️ Vacation" },
    { id: "phone", label: "📱 Smartphone" },
    { id: "laptop", label: "💻 Laptop" },
    { id: "tv", label: "📺 TV" },
    { id: "car", label: "🚗 Car" },
    { id: "fitness", label: "🏋️ Fitness" },
    { id: "pet", label: "🐕 Pet" },
    { id: "dining", label: "🍽️ Dining" },
    { id: "career", label: "💼 Career" },
  ];

  function goTo(idx) {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => { setCurrent(idx); setIsAnimating(false); }, 300);
  }

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      goTo((current + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [current, isPaused]);

  const slide = SLIDES[current];
  const quote = t.categories_data?.[slide.id]?.quote || "";

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 0 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}>

      {/* Background image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(https://images.unsplash.com/${slide.image}?w=1400&h=600&fit=crop&auto=format)`,
        backgroundSize: "cover", backgroundPosition: "center",
        transition: "opacity 0.5s ease",
        opacity: isAnimating ? 0 : 1,
      }} />

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${slide.color}EE 0%, ${slide.color}99 40%, rgba(0,0,0,0.3) 100%)`,
        transition: "background 0.5s ease",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 1100, margin: "0 auto",
        padding: "60px 32px",
        display: "flex", alignItems: "center", gap: 40,
        minHeight: 420,
      }}>
        {/* Left text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 24, padding: "6px 16px", marginBottom: 20,
            color: "#fff", fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", display: "inline-block", boxShadow: "0 0 8px #4ADE80" }} />
            {t.tagline}
          </div>

          <h1 style={{
            color: "#fff", fontSize: "clamp(32px, 5vw, 58px)",
            fontWeight: 900, lineHeight: 1.08, letterSpacing: -2,
            margin: "0 0 8px", textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            opacity: isAnimating ? 0 : 1, transition: "opacity 0.3s ease",
          }}>
            {t.hero_title}
          </h1>

          <h2 style={{
            fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 900,
            lineHeight: 1.08, letterSpacing: -2, margin: "0 0 20px",
            background: "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            opacity: isAnimating ? 0 : 1, transition: "opacity 0.3s ease 0.05s",
          }}>
            {t.hero_subtitle}
          </h2>

          {/* Quote */}
          {quote && (
            <div style={{
              background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderLeft: "3px solid rgba(255,255,255,0.6)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 28,
              color: "rgba(255,255,255,0.9)", fontSize: 14, fontStyle: "italic",
              lineHeight: 1.6, maxWidth: 480,
              opacity: isAnimating ? 0 : 1, transition: "opacity 0.3s ease 0.1s",
            }}>
              "{quote}"
            </div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => onStart("tree", slide.id)} style={{
              background: "#fff", color: slide.color,
              border: "none", borderRadius: 10, padding: "13px 24px",
              fontSize: 15, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              {SLIDES[current].emoji} {t.banner_cta || "Decide now →"}
            </button>
            <button onClick={() => onStart("chat")} style={{
              background: "rgba(255,255,255,0.15)", color: "#fff",
              border: "2px solid rgba(255,255,255,0.4)",
              borderRadius: 10, padding: "13px 24px",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              backdropFilter: "blur(8px)", transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
              {t.btn_chat}
            </button>
          </div>
        </div>

        {/* Right: category thumbnails */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          {SLIDES.map((s, i) => (
            <button key={s.id} onClick={() => goTo(i)} style={{
              width: 120, height: 36, borderRadius: 8, overflow: "hidden",
              border: `2px solid ${i === current ? "#fff" : "rgba(255,255,255,0.3)"}`,
              cursor: "pointer", padding: 0, position: "relative",
              opacity: i === current ? 1 : 0.6,
              transform: i === current ? "scale(1.05)" : "scale(1)",
              transition: "all 0.2s",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url(https://images.unsplash.com/${s.image}?w=120&h=36&fit=crop&auto=format)`,
                backgroundSize: "cover", backgroundPosition: "center",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: i === current ? `${s.color}99` : "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11, fontWeight: 700,
                gap: 4,
              }}>
                <span>{s.emoji}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom dots */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6,
      }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === current ? 24 : 8, height: 8, borderRadius: 4,
            background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
            border: "none", cursor: "pointer", padding: 0,
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Progress bar */}
      {!isPaused && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.2)" }}>
          <div style={{
            height: "100%", background: "#fff",
            animation: "progress 4.5s linear infinite",
          }} />
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
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
              { value: "9", label: "Categories" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ color: "#66ffaa", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{s.value}</div>
                <div style={{ color: "rgba(180,210,255,0.7)", fontSize: 13, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
