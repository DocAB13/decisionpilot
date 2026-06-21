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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230066CC'/><text y='.9em' font-size='70' x='15'>🧭</text></svg>" />
        <meta name="theme-color" content="#0066CC" />
        <meta property="og:title" content="DecisionPilot – AI Decision Making" />
        <meta property="og:description" content="Get personalized AI recommendations for any decision." />
        <meta property="og:url" content="https://decisionpilot.tech" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
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