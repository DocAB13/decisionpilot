import Head from 'next/head'
import dynamic from 'next/dynamic'
const App = dynamic(() => import('../components/App'), { ssr: false })
export default function Home() {
  return (
    <>
      <Head>
        <title>DecisionPilot – AI Decision Making</title>
        <meta name="description" content="AI-powered decision making for vacations, phones, cars, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='15' fill='%231A56DB'/><ellipse cx='16' cy='16' rx='6' ry='14' fill='none' stroke='%2393C5FD' stroke-width='1' opacity='.7'/><line x1='2' y1='16' x2='30' y2='16' stroke='%2393C5FD' stroke-width='1' opacity='.7'/><text x='16' y='20' text-anchor='middle' font-family='Arial' font-weight='900' font-size='9' fill='white'>DP</text><polygon points='22,21 22,29 24,26 26,30 28,29 26,25 28,25' fill='white'/></svg>" />
        <meta name="theme-color" content="#1A56DB" />
        <meta property="og:title" content="DecisionPilot – AI-Powered Decision Making" />
        <meta property="og:description" content="Get personalized AI recommendations for any decision. 66+ categories, 30+ languages." />
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