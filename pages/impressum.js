import { useState } from "react";
import LegalLayout from "../components/LegalLayout";

export default function Impressum() {
  const [showAddress, setShowAddress] = useState(false);

  return (
    <LegalLayout title="Impressum" lastUpdated="January 2026">

      <p style={{ color: "#64748B", fontSize: 14, background: "#F8FAFF", border: "1px solid #E8ECF4", borderRadius: 8, padding: "10px 16px", marginBottom: 28 }}>
        This legal notice is provided in accordance with § 5 TMG (German Telemedia Act) and § 55 RStV.
      </p>

      <h2>Service Provider</h2>
      <p>DecisionPilot.tech is operated by an individual entrepreneur (Privatperson) based in Germany.</p>
      <p><strong>Contact:</strong> <a href="mailto:contact@decisionpilot.tech" style={{ color: "#1A56DB" }}>contact@decisionpilot.tech</a></p>

      {/* Address — hidden by default, accessible on request (2-click rule compliant) */}
      <div style={{ marginTop: 24, marginBottom: 28 }}>
        <button
          onClick={() => setShowAddress(!showAddress)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "1px solid #E2E8F0",
            borderRadius: 8, padding: "8px 14px", cursor: "pointer",
            fontSize: 13, color: "#64748B", fontFamily: "inherit",
          }}>
          <span>{showAddress ? "▲" : "▼"}</span>
          {showAddress ? "Hide full legal address" : "Show full legal address (§ 5 TMG)"}
        </button>

        {showAddress && (
          <div style={{
            marginTop: 12, padding: "16px 20px",
            background: "#FAFAFA", border: "1px solid #E2E8F0",
            borderRadius: 8, fontSize: 14, lineHeight: 2,
            color: "#475569",
          }}>
            <strong style={{ color: "#1A1A2E" }}>Nicolae-Abel Bolos-Ardeleanu</strong><br />
            Leipziger Str. 35C<br />
            01097 Dresden<br />
            Germany<br /><br />
            <strong>Email:</strong> contact@decisionpilot.tech<br />
            <strong>Website:</strong> https://decisionpilot.tech
          </div>
        )}
      </div>

      <h2>Responsible for Content</h2>
      <p>Responsible for content according to § 55 Abs. 2 RStV: Nicolae-Abel Bolos-Ardeleanu, address as above.</p>

      <h2>Dispute Resolution</h2>
      <p>
        The European Commission provides a platform for online dispute resolution (OS):{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: "#1A56DB" }}>
          https://ec.europa.eu/consumers/odr
        </a>. We are not obligated to participate in dispute resolution proceedings before a consumer arbitration board.
      </p>

      <h2>Liability for Content</h2>
      <p>
        As a service provider, we are responsible for our own content on these pages in accordance with general law (§ 7 Abs.1 TMG).
        According to §§ 8 to 10 TMG, however, we are not obligated as a service provider to monitor transmitted or stored third-party information
        or to investigate circumstances indicating illegal activity.
      </p>

      <h2>Affiliate Disclosure</h2>
      <p>
        This website contains affiliate links. If you click on such a link and make a purchase, we may receive a commission.
        This does not affect the price you pay. Our recommendations are based on genuine AI analysis, not on commission rates.
      </p>

      <p style={{ fontSize: 12, color: "#94A3B8", borderTop: "1px solid #F1F5F9", paddingTop: 20, marginTop: 32 }}>
        Note: This Impressum will be updated with a registered business address once Gewerbe registration is complete.
      </p>
    </LegalLayout>
  );
}
