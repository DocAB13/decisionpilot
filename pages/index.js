import Head from 'next/head'
import dynamic from 'next/dynamic'
import Link from 'next/link'
const App = dynamic(() => import('../components/App'), { ssr: false })
export default function Home() {
  return (
    <>
      <Head>
        <title>DecisionPilot – AI Decision Making</title>
        <meta name="description" content="AI-powered decision making for vacations, phones, cars, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%231A56DB'/%3E%3Cellipse cx='50' cy='50' rx='18' ry='46' fill='none' stroke='%2393C5FD' stroke-width='1.8' opacity='0.7'/%3E%3Cline x1='4' y1='50' x2='96' y2='50' stroke='%2393C5FD' stroke-width='1.8' opacity='0.7'/%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='%2360A5FA' stroke-width='2'/%3E%3Ctext x='50' y='56' text-anchor='middle' font-family='Arial,sans-serif' font-weight='900' font-size='26' fill='white'%3EDP%3C/text%3E%3Cpolygon points='74,68 74,90 78,83 83,94 87,92 82,81 88,81' fill='white' opacity='0.95'/%3E%3C/svg%3E" />
        <meta name="theme-color" content="#0066CC" />
        <meta property="og:title" content="DecisionPilot – AI Decision Making" />
        <meta property="og:description" content="Get personalized AI recommendations for any decision." />
        <meta property="og:url" content="https://decisionpilot.tech" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; overflow-x: hidden; }

          /* ── Mobile responsive ── */
          @media (max-width: 640px) {
            /* Hide hero thumbnails on mobile */
            .hero-thumbs { display: none !important; }

            /* Hero content full width */
            .hero-content { flex-direction: column !important; padding: 32px 16px 56px !important; min-height: 340px !important; }

            /* Pros/cons stack vertically on mobile */
            .pros-cons-grid { grid-template-columns: 1fr !important; }

            /* Pricing cards single column */
            .pricing-grid { grid-template-columns: 1fr !important; max-width: 400px !important; margin: 0 auto !important; }

            /* Categories 2 columns on mobile */
            .cats-grid { grid-template-columns: repeat(2, 1fr) !important; }

            /* Steps 1 column on mobile */
            .steps-grid { grid-template-columns: 1fr !important; }

            /* Testimonials 1 column */
            .testimonials-grid { grid-template-columns: 1fr !important; }

            /* Chat screen full width */
            .chat-messages { padding: 16px !important; }
            .chat-bubble { max-width: 90% !important; }

            /* General spacing */
            .section-padding { padding: 40px 16px !important; }
            .content-max { padding-left: 16px !important; padding-right: 16px !important; }
          }

          @media (max-width: 768px) {
            .hero-thumbs { display: none !important; }
            .hero-content { gap: 20px !important; }
            .pricing-grid { grid-template-columns: 1fr !important; }
          }

          /* Smooth image loading */
          img { max-width: 100%; }
          
          /* Touch targets */
          button { min-height: 44px; }
        `}</style>
      </Head>
      <App />
      <div style={{ textAlign: 'center', padding: '24px', background: '#F8F9FC' }}>
        <Link href="/guides" style={{ color: '#1A56DB', fontSize: '14px', textDecoration: 'none' }}>
          📚 Browse our Decision Guides →
        </Link>
      </div>
    </>
  )
}