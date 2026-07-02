import Head from "next/head";
import LegalLayout from "../components/LegalLayout";
import { useState } from "react";

export default function Privacy() {
  const [showContact, setShowContact] = useState(false);
  return (
    <>
      <Head>
        <title>Privacy Policy — DecisionOS</title>
        <meta name="robots" content="noindex" />
      </Head>
      <LegalLayout title="Privacy Policy" lastUpdated="July 2, 2026">
        <p>
          This Privacy Policy explains how DecisionOS ("we", "us") collects, uses, and protects your information when you use
          decisionpilot.tech. DecisionOS helps you work through a real decision — context, goal, constraints, and alternatives —
          with AI-assisted analysis, a recommendation, and follow-up tracking of what you decided and how it turned out. This
          policy explains exactly what that involves on the data side.
        </p>

        <h2>1. What data we collect</h2>
        <ul>
          <li><strong>Your Decision content:</strong> the information you provide about your situation, goal, constraints, and the alternatives you're weighing, plus the AI-generated analysis, risks, recommendation, and — if you choose to record them — your final decision, action plan, outcome, and reflection. This is what lets us generate a recommendation and, if you have an account, remember it for you.</li>
          <li><strong>AI chat messages:</strong> if you use the AI Chat feature within a Decision, your messages and the AI's responses are sent to our AI provider (Anthropic) to generate a response, and are stored as part of that Decision.</li>
          <li><strong>Account data:</strong> if you create an account, we collect your email address and a securely hashed password. No other profile information is required.</li>
          <li><strong>Usage and analytics data:</strong> pages visited, approximate location (country/city level), device and browser type, collected via Google Analytics — only after you consent via our cookie banner.</li>
          <li><strong>Billing data:</strong> if you subscribe to Pro or Premium, our payment processor (Stripe) collects your payment details directly. We never see or store your full card number.</li>
          <li><strong>Communications:</strong> if you contact us directly, we keep the content of that exchange to respond to you.</li>
        </ul>

        <h2>2. Anonymous and authenticated use</h2>
        <p>
          You do not need an account to start or complete a Decision. If you use DecisionOS without signing in, your Decision is
          stored temporarily and is automatically deleted after 48 hours if you haven't created an account and claimed it. If you
          create an account before that window closes, any Decision you started anonymously is transferred to your account
          automatically.
        </p>
        <p>
          If you have an account, your Decisions are kept for as long as your account exists (see Section 6), and you can access
          your full Decision History, subject to your plan's limits.
        </p>

        <h2>3. Legal basis for processing</h2>
        <p>We process personal data under the following legal bases (Art. 6 GDPR):</p>
        <ul>
          <li><strong>Consent</strong> — for analytics cookies and similar non-essential tracking.</li>
          <li><strong>Contract</strong> — to provide the Service you sign up for, including paid subscriptions.</li>
          <li><strong>Legitimate interest</strong> — to keep the Service secure, prevent abuse, and improve our recommendations.</li>
        </ul>

        <h2>4. How AI processing works</h2>
        <p>
          When you request an analysis, a recommendation, or use AI Chat, the relevant content from your Decision is sent to our
          AI provider, Anthropic, to generate a response. Only the content needed to answer that specific request is sent — not
          your full account history. Before it is sent, your text is structured and sanitized so it cannot be misread as an
          instruction to the AI rather than information about your decision. The AI never has access to your account, cannot
          take any action beyond generating a response, and never makes the decision for you — every recommendation is something
          you choose to accept, adapt, or reject.
        </p>

        <h2>5. Third parties we work with</h2>
        <ul>
          <li><strong>Supabase</strong> — hosts our database and handles account authentication. Your data is stored in the EU (Frankfurt).</li>
          <li><strong>Anthropic</strong> — processes your Decision content and AI chat messages to generate analysis, recommendations, and responses.</li>
          <li><strong>Stripe</strong> — processes subscription payments securely. We never receive or store your card details.</li>
          <li><strong>Vercel</strong> — hosts our website and application infrastructure.</li>
          <li><strong>Google Analytics</strong> — provides aggregated usage statistics, only with your consent, and never receives your Decision content.</li>
          <li><strong>Affiliate networks</strong> (Amazon Associates, CJ Affiliate, Awin) — only used when your own Final Decision maps to a purchasable product; a link may be shown to the specific option you chose, which may carry a commission to us at no extra cost to you. This never influences what the AI recommends, and is only ever a link to the option you yourself chose — never a sponsored alternative.</li>
        </ul>
        <p>
          Some of these providers are based outside the European Economic Area. Where that's the case, we rely on appropriate
          safeguards such as Standard Contractual Clauses to ensure your data remains protected.
        </p>

        <h2>6. Cookies</h2>
        <p>
          We use cookies for essential site functionality and, with your consent, for analytics. You can manage your preferences
          at any time — see our <a href="/cookies" style={{ color: "#1A56DB" }}>Cookie Policy</a> for full details.
        </p>

        <h2>7. How long we keep your data</h2>
        <p>
          An anonymous Decision is deleted automatically after 48 hours if not claimed by signing in. You can permanently delete
          any individual Decision from your Dashboard at any time — this is immediate and cannot be undone. If you want your
          entire account and all associated data deleted, contact us at contact@decisionpilot.tech and we will delete it. Billing
          records are kept as required by law (typically up to 10 years for tax purposes in Germany). Analytics data is retained
          according to Google Analytics' standard retention settings.
        </p>

        <h2>8. Your rights</h2>
        <p>Under the GDPR, you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data ("right to be forgotten")</li>
          <li>Restrict or object to certain processing</li>
          <li>Receive your data in a portable format</li>
          <li>Withdraw consent at any time, without affecting prior processing</li>
          <li>Lodge a complaint with your local data protection authority</li>
        </ul>
        <p>
          You can delete individual Decisions yourself at any time from your Dashboard. To exercise any other right — including
          full account deletion or a copy of your data — contact us at contact@decisionpilot.tech.
        </p>

        <h2>9. Children's privacy</h2>
        <p>DecisionOS is not directed at children under 16, and we do not knowingly collect personal data from them.</p>

        <h2>10. Changes to this policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be reflected by updating the date at the top of this page.</p>

        <h2>11. Contact</h2>
        <p>
          Questions about this policy or your data? Reach us at <a href="mailto:contact@decisionpilot.tech" style={{ color:"#1A56DB" }}>contact@decisionpilot.tech</a> or via our{" "}
          <a href="/contact" style={{ color:"#1A56DB" }}>Contact page</a>.
        </p>

        <div style={{ marginTop:48, paddingTop:24, borderTop:"1px solid #E2E8F0" }}>
          <button onClick={()=>setShowContact(c=>!c)}
            style={{ background:"none",border:"none",color:"#94A3B8",fontSize:11,cursor:"pointer",padding:0,textDecoration:"underline" }}>
            {showContact ? "Hide legal information ▲" : "Legal information (GDPR Art. 13) ▼"}
          </button>
          {showContact && (
            <div style={{ marginTop:12, padding:"14px 16px", background:"#F8FAFC", borderRadius:8, fontSize:12, color:"#64748B", lineHeight:1.8 }}>
              <strong style={{ display:"block", marginBottom:4, color:"#475569" }}>Data controller (Art. 4 No. 7 GDPR):</strong>
              DecisionOS<br />
              Owner: N. A. Bolos-Ardeleanu<br />
              Dresden, Germany<br />
              <a href="mailto:contact@decisionpilot.tech" style={{ color:"#1A56DB" }}>contact@decisionpilot.tech</a>
            </div>
          )}
        </div>
      </LegalLayout>
    </>
  );
}
