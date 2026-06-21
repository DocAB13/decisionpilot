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

        <h2>Independent by design</h2>
        <p>
          We work with comparison partners like AutoScout24, CHECK24, Booking.com, Wayfair, Sixt, and Europcar, and may earn a
          small commission when you complete a booking through us. That commission never decides what we recommend — our goal
          is to be the tool you'd want a sharp, honest friend to be when you're stuck choosing between options.
        </p>

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
