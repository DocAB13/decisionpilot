const C = {
  bg: "#F8F9FC", card: "#FFFFFF", border: "#E8ECF4",
  accent: "#1A56DB", accentLight: "#EEF3FF",
  text: "#0F172A", textSecondary: "#475569", muted: "#94A3B8",
};

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`h1, h2, h3 { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>

      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, #6B8EFF)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🧭</div>
            <span style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>DecisionPilot</span>
          </a>
          <a href="/" style={{ color: C.accent, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>← Back to home</a>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 80px" }}>
        <h1 style={{ color: C.text, fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 8px" }}>{title}</h1>
        {lastUpdated && (
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 36 }}>Last updated: {lastUpdated}</p>
        )}
        <div className="legal-content" style={{ color: C.textSecondary, fontSize: 15.5, lineHeight: 1.75 }}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#0F172A", padding: "32px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#475569", fontSize: 12 }}>© 2026 DecisionPilot. All rights reserved.</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {LEGAL_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{ color: "#94A3B8", fontSize: 12.5, textDecoration: "none" }}>{l.label}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .legal-content h2 { color: ${C.text}; font-size: 21px; font-weight: 800; margin: 32px 0 12px; letter-spacing: -0.3px; }
        .legal-content p { margin: 0 0 14px; }
        .legal-content ul { margin: 0 0 14px; padding-left: 20px; }
        .legal-content li { margin-bottom: 6px; }
        .legal-content strong { color: ${C.text}; }
        .legal-fill { background: #FEF3C7; color: #92400E; padding: 1px 6px; border-radius: 4px; font-weight: 600; font-size: 14px; }
      `}</style>
    </div>
  );
}
