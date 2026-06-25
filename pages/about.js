import Head from "next/head";
import LegalLayout from "../components/LegalLayout";

export default function About() {
  return (
    <>
      <Head>
        <title>About — DecisionPilot</title>
      </Head>
      <LegalLayout title="About DecisionPilot">
        <p>
          DecisionPilot exists for one reason: too many of us spend hours comparing reviews, opening dozens of tabs, and still
          feel unsure before booking a trip, buying a phone, or choosing a car. We built an AI-powered decision assistant that
          asks a few smart questions and gives you a clear, personalized answer in under a minute.
        </p>

        <h2>Our approach</h2>
        <p>
          Instead of burying you in options, DecisionPilot narrows things down. You answer a short series of questions about
          what matters to you — budget, priorities, timing — and our AI compares trusted sources to surface the picks that
          actually fit, complete with pros, cons, and a direct link to act on it.
        </p>

        <h2>How we make money — fully transparent</h2>
        <p>
          Some recommendations on DecisionPilot contain affiliate links. When you click through and make a purchase,
          we may earn a small commission — at <strong>no extra cost to you</strong>.
        </p>
        <p>
          <strong>Our rankings are determined exclusively by compatibility with your profile</strong> — never by commission rates.
          The algorithm considers your answers to questions about budget, usage, priorities, and preferences.
          A product that pays us a higher commission will never rank above a product that fits you better.
        </p>
        <p>
          We partner with: AutoScout24, CHECK24, Booking.com, Wayfair, Sixt, Europcar, Amazon Associates,
          and others — all through Awin (Publisher ID: 2942851) and CJ Affiliate networks.
        </p>

        <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12, padding:"16px 20px", margin:"24px 0" }}>
          <strong style={{ color:"#15803D" }}>Our commitment:</strong>
          <ul style={{ color:"#166534", margin:"8px 0 0", paddingLeft:20, lineHeight:2 }}>
            <li>Rankings are based on match score, not commission value</li>
            <li>We disclose affiliate relationships on every results page</li>
            <li>You can always use the "Chat with Ai·sel" option for unfiltered advice</li>
            <li>We never sell your personal data or search history</li>
          </ul>
        </div>

        <h2>Where we are today</h2>
        <p>
          DecisionPilot currently covers 9 categories — vacations, smartphones, laptops, TVs, cars, fitness gear, pets, dining,
          and career decisions — available in over 30 languages, and trusted by 50,000+ people worldwide. We're a small,
          independent team and we're just getting started.
        </p>

        <p>
          Built by Nicolae-Abel Bolos-Ardeleanu. Have feedback or an idea for a category we should add?
          We'd genuinely like to hear it — see our <a href="/contact" style={{ color: "#1A56DB" }}>Contact page</a>.
        </p>
      </LegalLayout>
    </>
  );
}
