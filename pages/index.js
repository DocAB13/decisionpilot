import Head from 'next/head'
import dynamic from 'next/dynamic'

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
      </Head>
      <App />
    </>
  )
}
