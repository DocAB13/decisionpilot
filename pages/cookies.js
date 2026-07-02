import Head from "next/head";
import LegalLayout from "../components/LegalLayout";

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Cookie Policy — DecisionOS</title>
        <meta name="robots" content="noindex" />
      </Head>
      <LegalLayout title="Cookie Policy" lastUpdated="July 2, 2026">
        <p>
          This Cookie Policy explains how DecisionOS uses cookies and similar technologies (such as local storage), and how you
          can control them. It should be read alongside our <a href="/privacy" style={{ color: "#1A56DB" }}>Privacy Policy</a>.
        </p>

        <h2>1. What are cookies</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help the site function correctly
          and, where you allow it, help us understand how the Service is used.
        </p>

        <h2>2. The cookies we use</h2>
        <ul>
          <li>
            <strong>Strictly necessary cookies</strong> — required for the Service to work, including the session cookie that
            keeps you signed in (for up to 30 days) and your cookie-consent choice, which we remember using your browser's local
            storage. These cannot be switched off.
          </li>
          <li>
            <strong>Analytics cookies (Google Analytics)</strong> — help us understand which pages and categories are used most,
            so we can improve the Service. These are only set after you give consent via our cookie banner, and they never
            receive the content of your Decisions.
          </li>
        </ul>

        <h2>3. Managing your consent</h2>
        <p>
          When you first visit DecisionOS, you can choose to accept or decline non-essential cookies via our consent banner.
          You can change your choice at any time by clearing your browser's site data for decisionpilot.tech and reloading the
          page, which will show the consent banner again.
        </p>

        <h2>4. Third-party cookies</h2>
        <p>
          If you click an affiliate link to a product or service you chose as your Final Decision (via Amazon Associates, CJ
          Affiliate, or Awin), the destination site may set its own cookies once you land there. Their own cookie and privacy
          policies apply from that point on — we don't control them.
        </p>

        <h2>5. Cookie duration</h2>
        <p>
          Necessary cookies persist for the length of your session or, for your login, up to 30 days. Your cookie-consent
          choice is kept until you clear your browser's site data. Analytics cookies, where consented to, follow Google
          Analytics' standard retention period.
        </p>

        <h2>6. Questions</h2>
        <p>
          If you have questions about our use of cookies, contact us at contact@decisionpilot.tech.
        </p>
      </LegalLayout>
    </>
  );
}
