import { useState } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import CookieBanner from '../components/CookieBanner'

export default function App({ Component, pageProps }) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)

  return (
    <>
      <Component {...pageProps} />
      <CookieBanner
        onAccept={() => setAnalyticsEnabled(true)}
        onReject={() => setAnalyticsEnabled(false)}
      />
      {analyticsEnabled && <GoogleAnalytics gaId="G-81B4YGZXMD" />}
    </>
  )
}