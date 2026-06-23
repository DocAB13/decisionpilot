import Head from "next/head";
import LegalLayout from "../components/LegalLayout";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — DecisionPilot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <LegalLayout title="Privacy Policy" lastUpdated="June 21, 2026">
        <p>
          This Privacy Policy explains how Nicolae-Abel Bolos-Ardeleanu ("DecisionPilot", "we", "us")
          collects, uses, and protects your information when you use decisionpilot.tech (the "Service"). We built DecisionPilot to help
          you make decisions faster — this policy explains exactly what that involves on the data side.
        </p>

        <h2>1. Who is responsible for your data</h2>
        <p>
          The data controller responsible for this website is:<br />
          Nicolae-Abel Bolos-Ardeleanu<br />
          Leipziger Str. 35C, 01097 Dresden, Saxony, Germany<br />
          contact@decisionpilot.tech
        </p>

        <h2>2. What data we collect</h2>
        <ul>
          <li><strong>Decision answers:</strong> the choices you make when answering questions in a category (e.g. vacation, car, phone) so we can generate a recommendation. These are processed to produce your result and are not linked to your real-world identity.</li>
          <li><strong>AI chat messages:</strong> if you use the "Chat with AI" feature, your messages are sent to our AI provider (Anthropic) to generate a response.</li>
          <li><strong>Usage and analytics data:</strong> pages visited, approximate location (country/city level), device and browser type, collected via Google Analytics — only after you consent via our cookie banner.</li>
          <li><strong>Account and billing data:</strong> if you subscribe to Pro or Premium, our payment processor (Stripe) collects your payment details directly. We do not store your full card number.</li>
          <li><strong>Communications:</strong> if you contact us directly, we keep the content of that exchange to respond to you.</li>
        </ul>

        <h2>3. Legal basis for processing</h2>
        <p>We process personal data under the following legal bases (Art. 6 GDPR):</p>
        <ul>
          <li><strong>Consent</strong> — for analytics cookies and similar non-essential tracking.</li>
          <li><strong>Contract</strong> — to provide the Service you sign up for, including paid subscriptions.</li>
          <li><strong>Legitimate interest</strong> — to keep the Service secure, prevent abuse, and improve our recommendations.</li>
        </ul>

        <h2>4. Third parties we work with</h2>
        <ul>
          <li><strong>Anthropic</strong> — processes your AI chat messages to generate responses.</li>
          <li><strong>Stripe</strong> — processes subscription payments securely.</li>
          <li><strong>Google Analytics</strong> — provides aggregated usage statistics, only with your consent.</li>
          <li><strong>Vercel</strong> — hosts our website and infrastructure.</li>
          <li><strong>Affiliate partners</strong> (AutoScout24, CHECK24, Booking.com, Wayfair, Sixt, Europcar, and similar) — if you click through to a partner site, that partner's own privacy policy applies to what happens from that point on. We may receive a commission, which never affects which option we recommend to you.</li>
        </ul>
        <p>
          Some of these providers are based outside the European Economic Area. Where that's the case, we rely on appropriate
          safeguards such as Standard Contractual Clauses to ensure your data remains protected.
        </p>

        <h2>5. Cookies</h2>
        <p>
          We use cookies for essential site functionality and, with your consent, for analytics. You can manage your preferences
          at any time — see our <a href="/cookies" style={{ color: "#1A56DB" }}>Cookie Policy</a> for full details.
        </p>

        <h2>6. How long we keep your data</h2>
        <p>
          Decision answers and chat messages are kept only as long as needed to provide the Service and are not used to build a
          long-term profile of you unless you have a registered account. Billing records are kept as required by law (typically
          up to 10 years for tax purposes in Germany). Analytics data is retained according to Google Analytics' standard
          retention settings.
        </p>

        <h2>7. Your rights</h2>
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
          To exercise any of these rights, contact us at contact@decisionpilot.tech.
        </p>

        <h2>8. Children's privacy</h2>
        <p>DecisionPilot is not directed at children under 16, and we do not knowingly collect personal data from them.</p>

        <h2>9. Changes to this policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be reflected by updating the date at the top of this page.</p>

        <h2>10. Contact</h2>
        <p>
          Questions about this policy or your data? Reach us at contact@decisionpilot.tech or via our{" "}
          <a href="/contact" style={{ color: "#1A56DB" }}>Contact page</a>.
        </p>
      </LegalLayout>
    </>
  );
}
