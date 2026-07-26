import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'
import { intervalToDuration, format } from 'date-fns'
import confetti from 'canvas-confetti'
import { Howl } from 'howler'
import gallery3 from './assets/Media (3).jpeg'
import gallery4 from './assets/Media (4).jpeg'
import gallery6 from './assets/Media (6).jpeg'
import gallery7 from './assets/Media (7).jpeg'
import gallery8 from './assets/Media (8).jpeg'
import sharedImage from './assets/shared image.jpeg'
import sharedImage1 from './assets/shared image (1).jpeg'

const BIRTH_DATE = new Date(2003, 6, 31, 0, 0, 0) // July 31, 2003 · 12:00 AM
const BIRTH_DATE_SUBTITLE = `Born ${format(BIRTH_DATE, 'MMMM do, yyyy')} · ${format(BIRTH_DATE, 'h:mm a')}`

const GALLERY_PHOTOS = [
  { src: gallery3, alt: 'Traditional elegance', label: 'Graceful Moments', objectPosition: 'center 30%' },
  { src: gallery4, alt: 'Childhood sweet moment', label: 'Little Joys', objectPosition: 'center 20%' },
  { src: sharedImage1, alt: 'Childhood portrait outdoors', label: 'Precious Years', objectPosition: 'center center' },
  { src: sharedImage, alt: 'Playful portrait in red saree', label: 'Radiant Charm', objectPosition: 'center 25%' },
  { src: gallery6, alt: 'Garden celebration in pink saree', label: 'Garden Grace', objectPosition: 'center 15%' },
  { src: gallery7, alt: 'Graduation celebration', label: 'Proud Day', objectPosition: 'center 20%' },
  { src: gallery8, alt: 'Warm candid portrait', label: 'Golden Memory', objectPosition: 'center 30%' },
]

// ─── Opening confetti + title reveal ───────────────────────────────────────────
const CONFETTI_COLORS = ['#FFD700', '#FFA500', '#FF6B8A', '#FFE87C', '#FF4500', '#C8960C']

function fireOpeningConfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: CONFETTI_COLORS, startVelocity: 42 })
  setTimeout(() => {
    confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors: CONFETTI_COLORS })
    confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors: CONFETTI_COLORS })
  }, 250)
  setTimeout(() => {
    confetti({ particleCount: 90, spread: 100, origin: { y: 0.35 }, colors: CONFETTI_COLORS, scalar: 0.9 })
  }, 600)
}

function OpeningReveal({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'title' | 'exit'>('intro')

  useEffect(() => {
    fireOpeningConfetti()
    const showTitle = setTimeout(() => setPhase('title'), 400)
    const startExit = setTimeout(() => setPhase('exit'), 3400)
    const finish = setTimeout(onComplete, 4400)
    return () => {
      clearTimeout(showTitle)
      clearTimeout(startExit)
      clearTimeout(finish)
    }
  }, [onComplete])

  return (
    <div className={`opening-overlay${phase === 'exit' ? ' opening-overlay-exit' : ''}`}>
      <div className={`opening-title${phase !== 'intro' ? ' opening-title-visible' : ''}`}>
        <div className="opening-subtitle">🎊 Celebrating You 🎊</div>
        <h1 className="gold-shimmer opening-heading">Happy Birthday,</h1>
        <h2 className="gold-shimmer opening-name birthday-name">
          <span className="birthday-name-text">Madhu!</span>
          <span className="wave birthday-name-emoji">🎂</span>
        </h2>
      </div>
    </div>
  )
}

// ─── Background birthday music ─────────────────────────────────────────────────
function BirthdayMusic({ visible }: { visible: boolean }) {
  const howlRef = useRef<Howl | null>(null)
  const [playing, setPlaying] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)

  useEffect(() => {
    const sound = new Howl({
      src: ['/riverbend-serenade.mp3'],
      loop: true,
      volume: 0.35,
      html5: true,
      onplay: () => setPlaying(true),
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
    })
    howlRef.current = sound
    return () => { sound.unload() }
  }, [])

  useEffect(() => {
    if (!visible) return
    const sound = howlRef.current
    if (!sound) return

    sound.play()

    const onPlayError = () => setHintVisible(true)
    sound.on('playerror', onPlayError)

    const fallbackHint = setTimeout(() => {
      if (!sound.playing()) setHintVisible(true)
    }, 400)

    return () => {
      clearTimeout(fallbackHint)
      sound.off('playerror', onPlayError)
    }
  }, [visible])

  const toggle = () => {
    const sound = howlRef.current
    if (!sound) return
    if (sound.playing()) {
      sound.pause()
    } else {
      sound.play()
      setHintVisible(false)
    }
  }

  if (!visible) return null

  return (
    <div className="music-controls">
      {hintVisible && !playing && (
        <div className="music-hint">Tap 🎵 for birthday music</div>
      )}
      <button
        type="button"
        className={`music-toggle${playing ? ' music-toggle-playing' : ''}`}
        onClick={toggle}
        aria-label={playing ? 'Pause birthday music' : 'Play birthday music'}
      >
        {playing ? '🔊' : '🎵'}
      </button>
    </div>
  )
}

// ─── Polymorphic time-unit types ───────────────────────────────────────────────
type TimeUnitKind = 'Years' | 'Months' | 'Weeks' | 'Days' | 'Hours' | 'Minutes'

const UNIT_ORDER: TimeUnitKind[] = ['Years','Months','Weeks','Days','Hours','Minutes']

// ─── Life duration hook (since birth) ──────────────────────────────────────────
function useLifeDuration(birthDate: Date) {
  const calc = () => {
    const { years = 0, months = 0, days = 0, hours = 0, minutes = 0 } =
      intervalToDuration({ start: birthDate, end: new Date() })
    return {
      Years: years,
      Months: months,
      Weeks: Math.floor(days / 7),
      Days: days % 7,
      Hours: hours,
      Minutes: minutes,
    }
  }
  const [duration, setDuration] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setDuration(calc()), 1000)
    return () => clearInterval(id)
  }, [birthDate])
  return duration
}

// ─── Streamers ────────────────────────────────────────────────────────────────
const STREAMER_COLORS = ['#FFD700','#FFA500','#FF6B8A','#FF4500','#FFE87C','#C8960C','#FF8C00','#FFDB58']

function Streamers() {
  return (
    <>
      {Array.from({ length: 28 }).map((_, i) => {
        const color = STREAMER_COLORS[i % STREAMER_COLORS.length]
        const left = `${(i * 41 + 7) % 100}%`
        const w = 4 + (i % 4) * 2
        const h = i % 3 === 0 ? w : w * 0.4
        const dur = 5 + (i % 5)
        const delay = -(i * 0.5)
        return (
          <div
            key={i}
            className="streamer"
            style={{
              left, width: w, height: h, background: color,
              borderRadius: i % 5 === 0 ? '50%' : '1px',
              animationDuration: `${dur}s, ${2 + (i%3)}s`,
              animationDelay: `${delay}s, ${delay*0.3}s`,
            }}
          />
        )
      })}
    </>
  )
}

// ─── Bokeh background ─────────────────────────────────────────────────────────
function BokehBg() {
  const orbs = [
    { w: 300, h: 300, top: '-80px', left: '-60px', bg: 'rgba(200,120,0,0.22)', dur: '7s' },
    { w: 200, h: 200, top: '30%',   right: '-40px', bg: 'rgba(180,60,30,0.18)', dur: '9s', delay: '2s' },
    { w: 250, h: 250, bottom: '10%', left: '20%',   bg: 'rgba(160,80,10,0.2)', dur: '8s', delay: '1s' },
    { w: 180, h: 180, top: '60%',   right: '10%',   bg: 'rgba(220,150,0,0.15)', dur: '6s', delay: '3s' },
    { w: 220, h: 220, top: '15%',   left: '50%',    bg: 'rgba(200,60,60,0.12)', dur: '10s', delay: '4s' },
  ] as const
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {orbs.map((o, i) => (
        <div
          key={i}
          className="bokeh"
          style={{
            width: o.w, height: o.h,
            top: (o as any).top, left: (o as any).left,
            right: (o as any).right, bottom: (o as any).bottom,
            background: o.bg,
            animationDuration: o.dur,
            animationDelay: (o as any).delay ?? '0s',
          }}
        />
      ))}
    </div>
  )
}

// ─── Polymorphic Countdown Card ────────────────────────────────────────────────
// Each kind gets a distinct visual variant while sharing the same props contract.
type CDVariant = 'arc' | 'flat' | 'diamond' | 'rounded' | 'tag' | 'gem'

const KIND_VARIANT: Record<TimeUnitKind, CDVariant> = {
  Years: 'arc', Months: 'flat', Weeks: 'diamond',
  Days: 'rounded', Hours: 'tag', Minutes: 'gem',
}
const KIND_GLOW: Record<TimeUnitKind, string> = {
  Years: 'rgba(255,215,0,0.5)', Months: 'rgba(255,100,0,0.4)',
  Weeks: 'rgba(255,80,130,0.4)', Days: 'rgba(255,200,0,0.45)',
  Hours: 'rgba(255,140,0,0.4)', Minutes: 'rgba(255,220,60,0.5)',
}

interface CDCardProps { kind: TimeUnitKind; value: number }

function CDCard({ kind, value }: CDCardProps) {
  const variant = KIND_VARIANT[kind]
  const glow    = KIND_GLOW[kind]
  const [prev, setPrev] = useState(value)
  const [key, setKey]   = useState(0)

  useEffect(() => {
    if (value !== prev) { setKey(k => k + 1); setPrev(value) }
  }, [value])

  const shapeStyle = (): CSSProperties => {
    const base: CSSProperties = {
      background: 'linear-gradient(160deg, rgba(30,12,8,0.92), rgba(18,6,4,0.98))',
      border: '1px solid rgba(255,215,0,0.28)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      width: '100%', aspectRatio: '1',
      position: 'relative', overflow: 'hidden',
    }
    switch (variant) {
      case 'arc':     return { ...base, borderRadius: '50%' }
      case 'flat':    return { ...base, borderRadius: '8px' }
      case 'diamond': return { ...base, borderRadius: '6px', transform: 'rotate(45deg)' }
      case 'rounded': return { ...base, borderRadius: '20px' }
      case 'tag':     return { ...base, borderRadius: '12px 12px 12px 0' }
      case 'gem':     return { ...base, borderRadius: '6px 20px 6px 20px' }
    }
  }

  const innerRotate = variant === 'diamond' ? { transform: 'rotate(-45deg)' } : {}

  return (
    <div className="cd-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      <div
        style={{
          ...shapeStyle(),
          boxShadow: `0 4px 20px ${glow}, inset 0 1px 0 rgba(255,215,0,0.1)`,
        }}
      >
        {/* Subtle inner glow bar */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'rgba(255,215,0,0.3)' }} />

        <div style={innerRotate}>
          <div
            key={key}
            className="flip-in"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 22, fontWeight: 700,
              color: '#FFD700',
              lineHeight: 1, textShadow: `0 0 16px ${glow}`,
            }}
          >
            {String(value).padStart(2, '0')}
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'rgba(255,215,0,0.65)',
      }}>
        {kind}
      </div>
    </div>
  )
}

// ─── Photo Gallery ─────────────────────────────────────────────────────────────

function PhotoGallery() {
  const [active, setActive] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div>
      {/* Horizontal strip */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: 12, overflowX: 'auto',
          paddingBottom: 8, paddingLeft: 2, paddingRight: 2,
        }}
      >
        {GALLERY_PHOTOS.map((p, i) => (
          <div
            key={i}
            className="photo-card"
            onClick={() => setActive(i)}
            style={{
              flex: '0 0 140px', height: 160,
              borderRadius: 16, overflow: 'hidden',
              border: active === i
                ? '2px solid #FFD700'
                : '1.5px solid rgba(255,215,0,0.2)',
              boxShadow: active === i
                ? '0 0 20px rgba(255,215,0,0.4)'
                : '0 4px 16px rgba(0,0,0,0.5)',
              position: 'relative', background: '#1c0b10',
            }}
          >
            <img
              src={p.src}
              alt={p.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Label overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(10,4,8,0.85))',
              padding: '18px 8px 8px',
              fontFamily: "'Nunito', sans-serif",
              fontSize: 11, fontWeight: 700, color: '#FFD700',
              textAlign: 'center',
            }}>
              {p.label}
            </div>
          </div>
        ))}
      </div>

      {/* Expanded view */}
      {active !== null && (
        <div
          style={{
            marginTop: 14, borderRadius: 20, overflow: 'hidden',
            position: 'relative', height: 220,
            border: '1.5px solid rgba(255,215,0,0.3)',
            boxShadow: '0 0 40px rgba(255,160,0,0.2)',
          }}
        >
          <img
            src={GALLERY_PHOTOS[active].src}
            alt={GALLERY_PHOTOS[active].alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,4,8,0.8) 0%, transparent 60%)',
            display: 'flex', alignItems: 'flex-end', padding: '16px 18px',
          }}>
            <div>
              <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 20, color: '#FFD700' }}>
                {GALLERY_PHOTOS[active].label}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(240,230,200,0.65)', marginTop: 2 }}>
                {GALLERY_PHOTOS[active].alt}
              </div>
            </div>
            <button
              onClick={() => setActive(null)}
              style={{
                marginLeft: 'auto', background: 'rgba(255,215,0,0.15)',
                border: '1px solid rgba(255,215,0,0.4)', borderRadius: 20,
                color: '#FFD700', fontSize: 12, padding: '4px 10px', cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {GALLERY_PHOTOS.map((_, i) => (
          <div
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: active === i ? 18 : 7,
              height: 7, borderRadius: 4,
              background: active === i ? '#FFD700' : 'rgba(255,215,0,0.3)',
              transition: 'all 0.3s', cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Ornate Message Container ──────────────────────────────────────────────────
function MessageContainer() {
  const [msg, setMsg] = useState(
    "On this special day, I want you to know how grateful I am to have you in my life. Your laughter fills my days with joy, your presence makes everything better. You are not just my dearest friend — you are my best partner and the love of my life.\n\nHappy Birthday, my love! Here is to many more years of laughter, love, and beautiful memories together. 🎂✨"
  )
  const [sent, setSent] = useState(false)
  const [editing, setEditing] = useState(false)

  const handleSend = () => {
    if (msg.trim()) { setSent(true); setTimeout(() => setSent(false), 3000) }
  }

  return (
    <div
      className="ornate-card"
      style={{
        background: 'linear-gradient(160deg, rgba(18,6,4,0.95), rgba(28,11,8,0.9))',
        border: '1.5px solid rgba(255,215,0,0.3)',
        borderRadius: 24, padding: '28px 22px 22px',
        position: 'relative',
        boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,215,0,0.1)',
      }}
    >
      {/* Corner ornaments */}
      <div style={{ position: 'absolute', top: 10, left: 12, color: 'rgba(200,150,12,0.7)', fontSize: 14 }}>✦</div>
      <div style={{ position: 'absolute', top: 10, right: 12, color: 'rgba(200,150,12,0.7)', fontSize: 14 }}>✦</div>
      <div style={{ position: 'absolute', bottom: 10, left: 12, color: 'rgba(200,150,12,0.7)', fontSize: 14 }}>✦</div>
      <div style={{ position: 'absolute', bottom: 10, right: 12, color: 'rgba(200,150,12,0.7)', fontSize: 14 }}>✦</div>

      {/* Top ornament line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.35))' }} />
        <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 19, color: '#FFD700', textShadow: '0 0 12px rgba(255,215,0,0.5)' }}>
          ✉ A Special Message for You
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,215,0,0.35), transparent)' }} />
      </div>

      {/* Message body */}
      <div
        onClick={() => setEditing(true)}
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 14,
          padding: '14px 16px',
          border: editing ? '1px solid rgba(255,215,0,0.4)' : '1px solid rgba(255,215,0,0.12)',
          minHeight: 130,
          transition: 'border-color 0.2s',
          cursor: editing ? 'text' : 'pointer',
        }}
      >
        {editing ? (
          <textarea
            autoFocus
            rows={7}
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onBlur={() => setEditing(false)}
          />
        ) : (
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13.5, lineHeight: 1.8,
            color: 'rgba(240,230,200,0.85)',
            whiteSpace: 'pre-line',
          }}>
            {msg}
          </p>
        )}
      </div>

      {/* Edit hint */}
      {!editing && (
        <div style={{ fontSize: 11, color: 'rgba(255,215,0,0.4)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
          Tap to personalise your message
        </div>
      )}

      {/* Bottom ornament */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 14px' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.25), transparent)' }} />
        <span style={{ fontSize: 16 }}>💌</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.25), transparent)' }} />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        style={{
          width: '100%', padding: '14px 0',
          borderRadius: 14, border: 'none', cursor: 'pointer',
          fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15,
          letterSpacing: '0.06em',
          background: sent
            ? 'linear-gradient(90deg, #78FF44, #00CC88)'
            : 'linear-gradient(90deg, #C8960C, #FFD700, #FFA500)',
          color: sent ? '#fff' : '#1a0508',
          boxShadow: sent
            ? '0 4px 20px rgba(120,255,68,0.35)'
            : '0 4px 24px rgba(255,165,0,0.45)',
          transition: 'all 0.3s',
        }}
      >
        {sent ? '🎉 Message Delivered!' : '💝 Send Birthday Message'}
      </button>
    </div>
  )
}

// ─── Wish cards ────────────────────────────────────────────────────────────────
type WishVariant = 'warm-glow' | 'dark-glass' | 'rose-border'

interface WishCardProps { variant: WishVariant; emoji: string; heading: string; body: string }

function WishCard({ variant, emoji, heading, body }: WishCardProps) {
  const styles: Record<WishVariant, CSSProperties> = {
    'warm-glow': {
      background: 'linear-gradient(135deg, rgba(30,12,4,0.9), rgba(40,18,6,0.9))',
      border: '1.5px solid rgba(255,200,0,0.3)',
      borderRadius: 20,
      boxShadow: '0 0 30px rgba(255,150,0,0.12)',
    },
    'dark-glass': {
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,215,0,0.15)',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    },
    'rose-border': {
      background: 'linear-gradient(135deg, rgba(28,8,14,0.92), rgba(22,6,10,0.95))',
      border: '1.5px solid rgba(255,107,138,0.35)',
      borderRadius: 18,
      boxShadow: '0 0 24px rgba(255,80,120,0.12)',
    },
  }

  const accentColor = variant === 'rose-border' ? '#FF6B8A' : '#FFD700'

  return (
    <div style={{ ...styles[variant], padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 40, opacity: 0.1 }}>{emoji}</div>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 18, color: accentColor, marginBottom: 6 }}>
        {heading}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(240,230,200,0.75)' }}>{body}</div>
    </div>
  )
}

// ─── Hero slideshow ────────────────────────────────────────────────────────────
function HeroSlideshow() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % GALLERY_PHOTOS.length), 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="candle-glow"
      style={{
        borderRadius: 24, overflow: 'hidden',
        border: '2px solid rgba(255,200,0,0.3)',
        margin: '0 auto 24px',
        width: '100%', maxWidth: 394, aspectRatio: '16 / 16',
        background: '#000',
        position: 'relative',
      }}
    >
      {GALLERY_PHOTOS.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={img.alt}
          className={i === index ? 'hero-slide hero-slide-active' : 'hero-slide'}
          style={{ objectPosition: img.objectPosition }}
        />
      ))}
    </div>
  )
}

// ─── Tap hearts / stars ────────────────────────────────────────────────────────
const TAP_EMOJIS = ['💖', '💕', '❤️', '💗', '✨', '⭐', '🌟', '💫']

interface TapParticle {
  id: number
  x: number
  y: number
  emoji: string
  drift: number
  rise: number
  size: number
  duration: number
}

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [role="button"], .music-controls, .photo-card'

function TapSparkles({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<TapParticle[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    if (!active) return

    const spawn = (clientX: number, clientY: number) => {
      const count = 5 + Math.floor(Math.random() * 4)
      const batch: TapParticle[] = Array.from({ length: count }, () => ({
        id: ++idRef.current,
        x: clientX + (Math.random() - 0.5) * 36,
        y: clientY + (Math.random() - 0.5) * 24,
        emoji: TAP_EMOJIS[Math.floor(Math.random() * TAP_EMOJIS.length)],
        drift: (Math.random() - 0.5) * 72,
        rise: 90 + Math.random() * 70,
        size: 14 + Math.random() * 14,
        duration: 1.1 + Math.random() * 0.7,
      }))
      setParticles(prev => [...prev, ...batch].slice(-48))
    }

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(INTERACTIVE_SELECTOR)) return
      spawn(e.clientX, e.clientY)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [active])

  const remove = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id))
  }, [])

  if (!active) return null

  return (
    <div className="tap-sparkles-layer" aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className="tap-sparkle"
          style={{
            left: p.x,
            top: p.y,
            fontSize: p.size,
            ['--drift' as string]: `${p.drift}px`,
            ['--rise' as string]: `${p.rise}px`,
            animationDuration: `${p.duration}s`,
          }}
          onAnimationEnd={() => remove(p.id)}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const life = useLifeDuration(BIRTH_DATE)
  const [introDone, setIntroDone] = useState(false)
  const handleIntroComplete = useCallback(() => setIntroDone(true), [])

  const WISHES: WishCardProps[] = [
    {
      variant: 'warm-glow', emoji: '🎂',
      heading: 'Wishing You Endless Joy',
      body: "May every candle you blow out carry a wish straight to the stars, and may the universe conspire to make every single one come true.",
    },
    {
      variant: 'dark-glass', emoji: '🥂',
      heading: 'Celebrate Every Moment',
      body: "Another year of beautiful stories, bold adventures, and love that only grows deeper. You deserve every bit of happiness this world holds.",
    },
    {
      variant: 'rose-border', emoji: '🌹',
      heading: 'You Are My Everything',
      body: "You make ordinary days feel extraordinary. On this day, the whole universe pauses to celebrate how wonderfully rare you are.",
    },
  ]

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(180deg, #0e0508 0%, #1c0b10 40%, #0e0508 100%)' }}>
      {!introDone && <OpeningReveal onComplete={handleIntroComplete} />}
      {introDone && <BirthdayMusic visible={introDone} />}
      <TapSparkles active={introDone} />
      <BokehBg />
      <Streamers />

      {/* ── Content ── */}
      <div
        className={introDone ? 'main-content-revealed' : 'main-content-waiting'}
        style={{ position: 'relative', zIndex: 1, maxWidth: 430, margin: '0 auto', padding: '0 18px 52px' }}
      >

        {/* ── Hero Header ─────────────────────────────── */}
        <div style={{ textAlign: 'center', paddingTop: 44, paddingBottom: 4 }}>

          {/* Balloons row */}
          <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: 6, fontSize: 28 }}>
            {['🎈','🎈','🎈','🎈'].map((b, i) => (
              <span
                key={i}
                className="balloon-float"
                style={{ animationDuration: `${3 + i*0.4}s`, animationDelay: `${i*0.3}s`, display: 'inline-block', filter: 'drop-shadow(0 0 8px rgba(255,150,0,0.6))' }}
              >
                {b}
              </span>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(255,215,0,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            🎊 Celebrating You 🎊
          </div>

          <h1
            className="gold-shimmer"
            style={{ fontFamily: "'Dancing Script', cursive", fontSize: 44, lineHeight: 1.15, marginBottom: 4 }}
          >
            Happy Birthday,
          </h1>
          <h2
            className="gold-shimmer birthday-name"
            style={{ fontFamily: "'Dancing Script', cursive", fontSize: 50, lineHeight: 1.1, marginBottom: 18 }}
          >
            <span className="birthday-name-text">Madhu!</span>
            <span className="wave birthday-name-emoji">🎂</span>
          </h2>

          {/* ── Hero portrait ── */}
          <HeroSlideshow />
        </div>

        {/* ── Life duration ─────────────────────────────── */}
        <section style={{ marginBottom: 32 }}>
          <div className="ornament-divider" style={{ marginBottom: 8, fontFamily: "'Dancing Script', cursive", fontSize: 16, color: '#FFD700' }}>
            🌅 Every Second Since That Morning
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,215,0,0.5)', marginBottom: 18, letterSpacing: '0.04em' }}>
            {BIRTH_DATE_SUBTITLE}
          </div>

          <div
            style={{
              background: 'linear-gradient(160deg, rgba(18,6,4,0.9), rgba(28,11,8,0.85))',
              border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: 24, padding: '22px 14px 18px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Top glow strip */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px 8px' }}>
              {UNIT_ORDER.map(kind => (
                <CDCard key={kind} kind={kind} value={life[kind]} />
              ))}
            </div>

            {/* Connector timeline */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16, padding: '0 6px' }}>
              {UNIT_ORDER.map((kind, i) => (
                <div key={kind} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFD700', boxShadow: '0 0 8px rgba(255,215,0,0.8)', flexShrink: 0 }} />
                  {i < 5 && <div style={{ flex: 1, height: '1px', background: 'rgba(255,215,0,0.3)' }} />}
                </div>
              ))}
            </div>
          </div>
        </section>

        

        {/* ── Extra Celebration Banner ─────────────────── */}
        <section style={{ marginBottom: 32 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(28,10,4,0.9), rgba(40,16,6,0.9))',
            border: '1px solid rgba(255,200,0,0.22)',
            borderRadius: 22, padding: '22px 18px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10, lineHeight: 1.4 }}>
              {['🎆','🎇','🧨','🪅','🎠','🎡'].map((e, i) => (
                <span key={i} className="balloon-float" style={{ animationDuration: `${2.5 + i*0.25}s`, animationDelay: `${i*0.18}s`, display: 'inline-block', marginRight: 4 }}>{e}</span>
              ))}
            </div>
            <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 22, color: '#FFD700', marginBottom: 10 }}>
              Happy Birthday Madhu! 🥂
            </div>
            <p style={{ fontSize: 13, color: 'rgba(240,230,200,0.72)', lineHeight: 1.8, margin: 0 }}>
              May you have a wonderful birthday and a wonderful year ahead!
            </p>
            {/* Corner sparkles */}
            {[{ top: 12, left: 14 },{ top: 12, right: 14 },{ bottom: 12, left: 14 },{ bottom: 12, right: 14 }].map((pos, i) => (
              <span key={i} className="sparkle-spin" style={{ ...pos, color: 'rgba(200,150,12,0.6)', fontSize: 12, animationDuration: `${2 + i*0.5}s`, animationDelay: `${i*0.4}s` }}>✦</span>
            ))}
          </div>
        </section>
        

        {/* ── Footer ──────────────────────────────────── */}
        <div style={{ textAlign: 'center', paddingTop: 8, color: 'rgba(255,215,0,0.35)', fontSize: 12, lineHeight: 2 }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🎂 🎊 🎉 🎈 🌟 ✨</div>
          Made with 💖 for someone extra special
        </div>
      </div>
    </div>
  )
}
