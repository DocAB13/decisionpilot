import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const C = {
    bg: "#F8F9FC", accent: "#1A56DB", text: "#0F172A",
    muted: "#94A3B8", card: "#fff", border: "#E8ECF4",
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif", padding: 24,
    }}>
      <div style={{
        background: C.card, borderRadius: 24, padding: "52px 48px",
        maxWidth: 480, width: "100%", textAlign: "center",
        boxShadow: "0 12px 40px rgba(15,23,42,0.12)",
        border: `1px solid ${C.border}`,
      }}>
        {loading ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 24, animation: "spin 1s linear infinite" }}>🧭</div>
            <h2 style={{ color: C.text, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Activating your account...
            </h2>
            <p style={{ color: C.muted, fontSize: 15 }}>Just a moment please</p>
          </>
        ) : (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#ECFDF5", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 40, margin: "0 auto 24px",
            }}>✅</div>
            <h2 style={{ color: C.text, fontSize: 28, fontWeight: 900, marginBottom: 12, letterSpacing: -0.5 }}>
              Welcome to Pro! 🎉
            </h2>
            <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
              Your DecisionPilot Pro subscription is now active. Enjoy unlimited AI decisions with no daily limits.
            </p>
            <div style={{
              background: "#EEF3FF", borderRadius: 16, padding: "20px 24px",
              marginBottom: 32, textAlign: "left",
            }}>
              <div style={{ color: C.accent, fontWeight: 800, fontSize: 14, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>✦ Pro Benefits</div>
              {[
                "Unlimited AI decisions per day",
                "All 9 categories unlocked",
                "Priority AI processing",
                "Save & compare decisions",
                "30 languages supported",
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ color: "#059669", fontSize: 16 }}>✓</span>
                  <span style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{b}</span>
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/')}
              style={{
                width: "100%", background: `linear-gradient(135deg, ${C.accent}, #3B5BDB)`,
                color: "#fff", border: "none", borderRadius: 14,
                padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: `0 8px 24px ${C.accent}44`,
              }}>
              Start making decisions →
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
