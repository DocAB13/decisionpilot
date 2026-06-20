import Head from 'next/head'
import Link from 'next/link'

const C = {
  bg: "#F8F9FC", accent: "#1A56DB", text: "#0F172A",
  textSecondary: "#475569", border: "#E8ECF4",
}

const guides = [
  { slug: "how-to-choose-a-laptop", title: "How to Choose a Laptop", category: "Tech" },
  { slug: "how-to-choose-a-vacation", title: "How to Choose Your Next Vacation", category: "Travel" },
  { slug: "how-to-choose-a-hotel", title: "How to Choose the Right Hotel", category: "Travel" },
  { slug: "how-to-make-a-purchase-decision", title: "How to Make a Purchase Decision", category: "Shopping" },
  { slug: "how-to-choose-between-job-offers", title: "How to Choose Between Job Offers", category: "Career" },
  { slug: "how-to-choose-furniture", title: "How to Choose Furniture", category: "Home" },
  { slug: "how-to-buy-a-used-car", title: "How to Buy a Used Car", category: "Auto" },
  { slug: "how-to-make-financial-decisions", title: "How to Make Financial Decisions", category: "Finance" },
  { slug: "how-to-choose-a-gift", title: "How to Choose the Perfect Gift", category: "Shopping" },
  { slug: "how-to-decide-to-relocate", title: "How to Decide to Relocate", category: "Life" },
  { slug: "how-to-make-medical-decisions", title: "How to Approach a Medical Decision", category: "Health" },
  { slug: "how-to-navigate-relationship-decisions", title: "How to Navigate Relationship Decisions", category: "Relationships" },
  { slug: "how-to-plan-major-life-decisions", title: "How to Plan Major Life Decisions", category: "Life" },
  { slug: "how-to-choose-an-outfit", title: "How to Choose the Right Outfit", category: "Style" },
  { slug: "how-to-develop-your-personal-style", title: "How to Develop Your Personal Style", category: "Style" },
  { slug: "how-to-choose-makeup", title: "How to Choose Makeup", category: "Style" },
  { slug: "how-to-choose-a-perfume", title: "How to Choose a Perfume", category: "Style" },
]

export default function GuidesIndex() {
  return (
    <>
      <Head>
        <title>Decision Guides | DecisionPilot</title>
        <meta name="description" content="Practical guides for life's everyday decisions — from choosing a laptop to planning a major life change." />
      </Head>
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <header style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, background: '#fff' }}>
          <Link href="/" style={{ textDecoration: 'none', color: C.accent, fontWeight: 700, fontSize: '18px' }}>
            🧭 DecisionPilot
          </Link>
        </header>
        <main style={{ maxWidth: '880px', margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ color: C.text, fontSize: '32px', marginBottom: '8px' }}>Decision Guides</h1>
          <p style={{ color: C.textSecondary, fontSize: '17px', marginBottom: '40px' }}>
            Practical frameworks for the decisions that matter — big and small.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {guides.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} style={{
                display: 'block', background: '#fff', border: `1px solid ${C.border}`,
                borderRadius: '10px', padding: '20px', textDecoration: 'none'
              }}>
                <span style={{ color: C.accent, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{g.category}</span>
                <h3 style={{ color: C.text, fontSize: '16px', marginTop: '6px', marginBottom: 0 }}>{g.title}</h3>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}