import Head from 'next/head'
import dynamic from 'next/dynamic'
const App = dynamic(() => import('../components/App'), { ssr: false })
export default function Home() {
  return (
    <>
      <Head>
        <title>DecisionPilot – AI-Powered Comparison Platform for Smarter Buying Decisions</title>
        <meta name="description" content="AI-powered comparison platform for smarter buying decisions. Personalized recommendations across 66+ categories — free, unbiased, instant. Available in 30 languages." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />

        {/* 3-Market hreflang — EN / DE / ES */}
        <link rel="alternate" hrefLang="en" href="https://decisionpilot.tech/" />
        <link rel="alternate" hrefLang="de" href="https://decisionpilot.tech/?lang=de" />
        <link rel="alternate" hrefLang="es" href="https://decisionpilot.tech/?lang=es" />
        <link rel="alternate" hrefLang="fr" href="https://decisionpilot.tech/?lang=fr" />
        <link rel="alternate" hrefLang="x-default" href="https://decisionpilot.tech/" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1A56DB" />
        <meta property="og:title" content="DecisionPilot – AI-Powered Comparison Platform" />
        <meta property="og:description" content="AI-powered comparison platform for smarter buying decisions. 66+ categories, 30 languages. Free forever." />
        <meta property="og:url" content="https://decisionpilot.tech" />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
          body { margin: 0; overflow-x: hidden; background: #F8F9FC; }

          @media (max-width: 900px) {
            .nav-stats { display: none !important; }
          }
          @media (max-width: 640px) {
            .hero-thumbs { display: none !important; }
            .hero-content { flex-direction: column !important; padding: 32px 16px 56px !important; min-height: 340px !important; }
            .pros-cons-grid { grid-template-columns: 1fr !important; }
            .pricing-grid { grid-template-columns: 1fr !important; max-width: 400px !important; margin: 0 auto !important; }
            .cats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .steps-grid { grid-template-columns: 1fr !important; }
            .testimonials-grid { grid-template-columns: 1fr !important; }
            .chat-messages { padding: 16px !important; }
            .chat-bubble { max-width: 90% !important; }
            .section-padding { padding: 40px 16px !important; }
          }
          @media (max-width: 768px) {
            .hero-thumbs { display: none !important; }
            .hero-content { gap: 20px !important; }
            .pricing-grid { grid-template-columns: 1fr !important; }
          }
          img { max-width: 100%; }
          button { min-height: 44px; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        `}</style>
      </Head>
      <App />
    </>
  )
}