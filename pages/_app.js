import { useState } from 'react'
import Head from 'next/head'
import { GoogleAnalytics } from '@next/third-parties/google'
import CookieBanner from '../components/CookieBanner'

export default function App({ Component, pageProps }) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)

  return (
    <>
      <Head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DecisionPilot" />
      </Head>
      <Component {...pageProps} />
      <CookieBanner
        onAccept={() => setAnalyticsEnabled(true)}
        onReject={() => setAnalyticsEnabled(false)}
      />
      {analyticsEnabled && <GoogleAnalytics gaId="G-81B4YGZXMD" />}
    </>
  )
}