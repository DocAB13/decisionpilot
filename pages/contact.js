import Head from "next/head";
import LegalLayout from "../components/LegalLayout";

const C = { accent: "#1A56DB", accentLight: "#EEF3FF", border: "#E8ECF4", text: "#0F172A", muted: "#94A3B8" };
const CONTACT_EMAIL = "bolos_abel@yahoo.com";

const REASONS = [
  { label: "General question", subject: "General question" },
  { label: "Billing / subscription help", subject: "Billing help" },
  { label: "Partnership inquiry", subject: "Partnership inquiry" },
  { label: "Report an issue", subject: "Bug report" },
];

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact — DecisionPilot</title>
      </Head>
      <LegalLayout title="Get in touch">
        <p>
          Question, feedback, or something not working right? We read everything that comes in — pick the option below that
          fits best and it'll open your email app with the subject pre-filled.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, margin: "28px 0" }}>
          {REASONS.map(r => (
            <a key={r.subject} href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(r.subject)}`}
              style={{
                display: "block", background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 14,
                padding: "16px 18px", textDecoration: "none", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ color: C.text, fontWeight: 700, fontSize: 14.5, marginBottom: 2 }}>{r.label}</div>
              <div style={{ color: C.accent, fontSize: 12.5, fontWeight: 600 }}>{CONTACT_EMAIL} →</div>
            </a>
          ))}
        </div>

        <p style={{ color: C.muted, fontSize: 13.5 }}>
          We typically reply within 1–2 business days. For privacy or data requests, see our{" "}
          <a href="/privacy" style={{ color: C.accent }}>Privacy Policy</a> for the right contact path.
        </p>
      </LegalLayout>
    </>
  );
}
