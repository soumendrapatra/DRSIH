import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api'
import type { ImageEntry } from '../api'
import ImageCard from '../components/ImageCard'

interface Props {
  onSelect: (id: string) => void
}

export default function Explorer({ onSelect }: Props) {
  const [images, setImages] = useState<ImageEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listImages()
      .then((data) => setImages(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen px-6 py-8 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[var(--color-accent)] font-mono text-xs tracking-widest uppercase">
            sys:retina-ai-v1
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="text-[var(--color-text-dim)] font-mono text-xs">READY</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Retina AI{' '}
          <span className="text-[var(--color-accent)] glow-text">Analysis Viewer</span>
        </h1>
        <p className="text-[var(--color-text-dim)] text-sm mt-1 font-mono">
          Select a fundus scan to launch deep-learning diagnostic evaluation
        </p>
      </motion.header>

      {/* ── Status bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-6 mb-8 px-4 py-2 border border-[var(--color-border)] bg-[var(--color-bg-surface)] font-mono text-xs text-[var(--color-text-dim)]"
      >
        <span>
          SAMPLES: <span className="text-[var(--color-accent)]">{images.length}</span>
        </span>
        <span className="border-l border-[var(--color-border)] pl-4">
          PIPELINE: <span className="text-[var(--color-accent)]">ACTIVE</span>
        </span>
        <span className="ml-auto">
          {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
        </span>
      </motion.div>

      {/* ── Error state ── */}
      {error && (
        <div className="border border-red-800 bg-red-950/30 px-4 py-3 text-red-400 font-mono text-sm mb-8">
          ERR: {error}
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-64 border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && images.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-12 text-center"
        >
          <svg
            className="mx-auto mb-4 opacity-20"
            width="56"
            height="56"
            viewBox="0 0 64 64"
            fill="none"
          >
            <circle cx="32" cy="32" r="28" stroke="#00d4cc" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="9"  stroke="#00d4cc" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="2.5" fill="#00d4cc" />
            <line x1="32" y1="2"  x2="32" y2="14" stroke="#00d4cc" strokeWidth="1.5" />
            <line x1="32" y1="50" x2="32" y2="62" stroke="#00d4cc" strokeWidth="1.5" />
            <line x1="2"  y1="32" x2="14" y2="32" stroke="#00d4cc" strokeWidth="1.5" />
            <line x1="50" y1="32" x2="62" y2="32" stroke="#00d4cc" strokeWidth="1.5" />
          </svg>
          <p className="font-mono text-sm text-[var(--color-text-dim)]">No samples available</p>
          <p className="font-mono text-xs text-[var(--color-border-hi)] mt-2">
            Drop image files into{' '}
            <span className="text-[var(--color-accent)]">sample-folder/images/</span>
            {' '}and matching JSON into{' '}
            <span className="text-[var(--color-accent)]">sample-folder/data/</span>
          </p>
        </motion.div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <ImageCard
              key={img.id}
              entry={img}
              delay={i * 0.07 + 0.35}
              onClick={() => onSelect(img.id)}
            />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 border-t border-[var(--color-border)] pt-4 text-[var(--color-text-dim)] font-mono text-xs flex justify-between"
      >
        <span>Retina AI — Automated Diagnostic Screening Viewer</span>
        <span>© {new Date().getFullYear()}</span>
      </motion.footer>
    </div>
  )
}
