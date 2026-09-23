import { motion } from 'framer-motion'
import { ImageEntry } from '../api'

interface Props {
  entry: ImageEntry  // { id: string; slotLabel: string }
  delay: number
  onClick: () => void
}

/**
 * Blind card — shows only the generic slotLabel + a retina icon + a neutral dot.
 * NO thumbnail, NO category, NO condition, NO confidence badge.
 * All real data is revealed only after the card is clicked and the scan runs.
 */
export default function ImageCard({ entry, delay, onClick }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="image-card bg-[var(--color-bg-card)] text-left w-full cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
    >
      {/* Icon area — generic placeholder, no real image */}
      <div className="relative aspect-square bg-[var(--color-bg-base)] overflow-hidden border-b border-[var(--color-border)] flex flex-col items-center justify-center gap-4">

        {/* Retina / scan icon — purely decorative, reveals nothing */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-30"
        >
          <circle cx="32" cy="32" r="28" stroke="#00d4cc" strokeWidth="1" />
          <circle cx="32" cy="32" r="18" stroke="#00d4cc" strokeWidth="0.75" strokeDasharray="4 3" />
          <circle cx="32" cy="32" r="9"  stroke="#00d4cc" strokeWidth="1" />
          <circle cx="32" cy="32" r="2.5" fill="#00d4cc" />
          <line x1="32" y1="2"  x2="32" y2="14" stroke="#00d4cc" strokeWidth="1" />
          <line x1="32" y1="50" x2="32" y2="62" stroke="#00d4cc" strokeWidth="1" />
          <line x1="2"  y1="32" x2="14" y2="32" stroke="#00d4cc" strokeWidth="1" />
          <line x1="50" y1="32" x2="62" y2="32" stroke="#00d4cc" strokeWidth="1" />
        </svg>

        {/* Watermark label */}
        <span className="font-mono text-[9px] tracking-[0.25em] text-[var(--color-border-hi)] uppercase select-none">
          PENDING ANALYSIS
        </span>

        {/* Corner markers */}
        {(
          ['top-2 left-2 border-t border-l',
           'top-2 right-2 border-t border-r',
           'bottom-2 left-2 border-b border-l',
           'bottom-2 right-2 border-b border-r'] as const
        ).map((cls, i) => (
          <div key={i} className={`absolute w-3.5 h-3.5 border-[var(--color-border-hi)] ${cls}`} />
        ))}
      </div>

      {/* Info — only id + slotLabel, neutral status dot */}
      <div className="px-3 py-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[var(--color-text-dim)] truncate">
            id:{entry.id}
          </span>
          {/* Neutral dot — no severity colour leaked */}
          <span className="w-2 h-2 rounded-full bg-[var(--color-border-hi)] flex-shrink-0" />
        </div>

        <p className="text-sm font-semibold text-white leading-tight">
          {entry.slotLabel}
        </p>

        <p className="font-mono text-[10px] text-[var(--color-text-dim)]">
          Click to begin analysis
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
          <span className="font-mono text-[10px] px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-text-dim)]">
            SEALED
          </span>
          <span className="font-mono text-[10px] text-[var(--color-text-dim)]">
            OPEN →
          </span>
        </div>
      </div>
    </motion.button>
  )
}

