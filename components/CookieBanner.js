import { useState, useEffect } from 'react'

export default function CookieBanner({ onAccept, onReject }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setVisible(true)
    } else if (consent === 'accepted') {
      onAccept()
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
    onAccept()
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setVisible(false)
    onReject()
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#1a1a2e',
      color: '#fff',
      padding: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      zIndex: 9999,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.3)'
    }}>
      <p style={{ margin: 0, flex: '1 1 300px', fontSize: '14px' }}>
        Folosim cookie-uri pentru a analiza traficul și a îmbunătăți experiența ta. Poți accepta sau refuza utilizarea lor.
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleReject} style={{
          padding: '10px 20px',
          background: 'transparent',
          color: '#fff',
          border: '1px solid #fff',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          Refuz
        </button>
        <button onClick={handleAccept} style={{
          padding: '10px 20px',
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          Accept
        </button>
      </div>
    </div>
  )
}