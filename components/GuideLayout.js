import Head from 'next/head'
import Link from 'next/link'

const C = {
  bg: "#F8F9FC", accent: "#1A56DB", accentDark: "#1240A8",
  accentLight: "#EEF3FF", text: "#0F172A", textSecondary: "#475569",
  border: "#E8ECF4",
}

export default function GuideLayout({ title, description, children, ctaText, ctaTool }) {
  return (
    <>
      <Head>
        <title>{title} | DecisionPilot</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | DecisionPilot`} />
        <meta property="og:description" content={description} />
      </Head>
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <header style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, background: '#fff' }}>
          <Link href="/" style={{ textDecoration: 'none', color: C.accent, fontWeight: 700, fontSize: '18px' }}>
            🧭 DecisionPilot
          </Link>
        </header>
        <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ color: C.text, fontSize: '32px', marginBottom: '16px' }}>{title}</h1>
          <div style={{ color: C.textSecondary, fontSize: '17px', lineHeight: '1.7' }}>
            {children}
          </div>
          {ctaTool && (
            <div style={{
              marginTop: '48px', padding: '28px', background: C.accentLight,
              borderRadius: '12px', textAlign: 'center'
            }}>
              <p style={{ color: C.text, marginBottom: '16px', fontWeight: 600 }}>
                {ctaText || "Still not sure? Let our AI help you decide."}
              </p>
              <Link href={`/?tool=${ctaTool}`} style={{
                display: 'inline-block', background: C.accent, color: '#fff',
                padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600
              }}>
                Try the AI Decision Tool →
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  )
}