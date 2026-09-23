import { motion } from 'framer-motion'

interface Props {
  /** Resolved URL to the original fundus image, e.g. /images/01.jpg */
  url: string
}

/**
 * Single-image fundus viewer.
 * Replaces the old ImageComparison component after heatmap removal.
 * Retains the clinical-tech aesthetic: corner reticles, mono labels,
 * entrance animation.
 */
export default function FundusImage({ url }: Props) {
  const noImg = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const t = e.currentTarget
    t.style.display = 'none'
    const p = t.parentElement
    if (p && !p.querySelector('.no-img-ph')) {
      const ph = document.createElement('div')
      ph.className =
        'no-img-ph absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#090c10]'
      ph.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.25">
          <circle cx="32" cy="32" r="28" stroke="#00d4cc" stroke-width="1.5"/>
          <circle cx="32" cy="32" r="9" stroke="#00d4cc" stroke-width="1.5"/>
          <circle cx="32" cy="32" r="2.5" fill="#00d4cc"/>
          <line x1="32" y1="2" x2="32" y2="14" stroke="#00d4cc" stroke-width="1.5"/>
          <line x1="32" y1="50" x2="32" y2="62" stroke="#00d4cc" stroke-width="1.5"/>
          <line x1="2" y1="32" x2="14" y2="32" stroke="#00d4cc" stroke-width="1.5"/>
          <line x1="50" y1="32" x2="62" y2="32" stroke="#00d4cc" stroke-width="1.5"/>
        </svg>
        <span style="font-family:monospace;font-size:11px;color:#6b7a8d">[ IMAGE NOT LOADED ]</span>
      `
      p.appendChild(ph)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-base)] select-none"
      style={{ aspectRatio: '1/1' }}
    >
      <img
        src={url}
        alt="Original fundus image"
        draggable={false}
        onError={noImg}
        className="w-full h-full object-cover"
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(9,12,16,0.55) 100%)',
        }}
      />

      {/* Corner reticles */}
      {[
        'top-3 left-3 border-t-2 border-l-2',
        'top-3 right-3 border-t-2 border-r-2',
        'bottom-3 left-3 border-b-2 border-l-2',
        'bottom-3 right-3 border-b-2 border-r-2',
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-5 h-5 border-[var(--color-accent)] pointer-events-none ${cls}`}
        />
      ))}

      {/* Bottom label */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] text-white/60 bg-black/50 px-2 py-0.5 tracking-widest pointer-events-none">
        FUNDUS · ORIGINAL
      </div>
    </motion.div>
  )
}
