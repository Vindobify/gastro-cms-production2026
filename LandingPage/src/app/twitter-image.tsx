import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Pizzeria Da Corrado 1140 Wien'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #111827 0%, #7f1d1d 100%)',
          color: 'white',
          padding: 48,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, opacity: 0.85 }}>PIZZERIA RISTORANTE</div>
        <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1, marginTop: 16 }}>Da Corrado</div>
        <div style={{ fontSize: 34, marginTop: 18, opacity: 0.95 }}>Authentische italienische Küche</div>
        <div style={{ fontSize: 24, marginTop: 10, opacity: 0.8 }}>1140 Wien</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
