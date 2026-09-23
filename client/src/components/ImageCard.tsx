import { motion } from 'framer-motion'
import type { ImageEntry } from '../api'

interface Props {
  entry: ImageEntry
  delay: number
  onClick: () => void
}

export default function ImageCard({ entry, delay, onClick }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="image-card group bg-[var(--color-bg-card)] text-left w-full cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
    >
      {/* Image Preview Container */}
      <div className="relative aspect-square bg-[var(--color-bg-base)] overflow-hidden border-b border-[var(--color-border)] flex items-center justify-center">
        {entry.thumbnail ? (
          <img
            src={entry.thumbnail}
            alt={entry.slotLabel}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
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
        )}

        {/* Subtle vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 65%, rgba(9,12,16,0.6) 100%)',
          }}
        />

        {/* Reticle Corner Markers */}
        <div className="absolute top-2 left-2 border-t border-l w-3.5 h-3.5 border-[var(--color-accent)] opacity-75" />
        <div className="absolute top-2 right-2 border-t border-r w-3.5 h-3.5 border-[var(--color-accent)] opacity-75" />
        <div className="absolute bottom-2 left-2 border-b border-l w-3.5 h-3.5 border-[var(--color-accent)] opacity-75" />
        <div className="absolute bottom-2 right-2 border-b border-r w-3.5 h-3.5 border-[var(--color-accent)] opacity-75" />
      </div>

      {/* Card Info */}
      <div className="px-3 py-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[var(--color-text-dim)] truncate">
            id:{entry.id}
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] flex-shrink-0 animate-pulse" />
        </div>

        <p className="text-sm font-semibold text-white leading-tight">
          {entry.slotLabel}
        </p>

        <p className="font-mono text-[10px] text-[var(--color-text-dim)]">
          Click to analyze image
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
          <span className="font-mono text-[10px] px-1.5 py-0.5 border border-[var(--color-accent)] text-[var(--color-accent)]">
            READY
          </span>
          <span className="font-mono text-[10px] text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform inline-block">
            ANALYZE →
          </span>
        </div>
      </div>
    </motion.button>
  )
}
