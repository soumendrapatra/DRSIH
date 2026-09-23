import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  imageUrl: string
  onComplete: () => void
}

const LOG_LINES = [
  'Initializing retina analysis pipeline...',
  'Loading model weights [ retina-cnn-v3 ]',
  'Segmenting vasculature...',
  'Detecting optic disc margins...',
  'Cross-referencing pathology database...',
  'Mapping microvascular lesions...',
  'Finalizing report... Done.',
]

export default function ScanningSequence({ imageUrl, onComplete }: Props) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [scanDone, setScanDone] = useState(false)

  useEffect(() => {
    // Stagger log lines over ~1.6s
    const delays = LOG_LINES.map((_, i) => i * 220 + 200)
    const timers = delays.map((d, i) =>
      setTimeout(() => setVisibleLines(i + 1), d)
    )

    // Mark scan complete slightly after last line
    const total = delays[delays.length - 1] + 500
    const doneTimer = setTimeout(() => {
      setScanDone(true)
    }, total)

    // Call onComplete after brief pause to let fade out run
    const completeTimer = setTimeout(onComplete, total + 400)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(doneTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {!scanDone && (
        <motion.div
          key="scan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Image + sweep */}
          <div className="lg:w-3/5">
            <div
              className="relative bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden"
              style={{ aspectRatio: '1/1' }}
            >
              <img
                src={imageUrl}
                alt="Scanning..."
                className="w-full h-full object-cover opacity-70"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />

              {/* Scan line sweeping down */}
              <div className="scan-sweep" />

              {/* Corner markers */}
              {[
                'top-2 left-2 border-t border-l',
                'top-2 right-2 border-t border-r',
                'bottom-2 left-2 border-b border-l',
                'bottom-2 right-2 border-b border-r',
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-5 h-5 border-[var(--color-accent)] ${cls}`}
                />
              ))}

              {/* Status overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2 font-mono text-xs text-[var(--color-accent)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse flex-shrink-0" />
                SCANNING...
              </div>
            </div>
          </div>

          {/* Terminal log panel */}
          <div className="lg:w-2/5">
            <div className="border border-[var(--color-border)] bg-[var(--color-bg-card)] h-full p-4 font-mono text-xs">
              {/* Terminal header */}
              <div className="flex items-center gap-1.5 pb-3 border-b border-[var(--color-border)] mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-[var(--color-text-dim)] text-[10px]">
                  retina-ai — analysis
                </span>
              </div>

              {/* Log lines */}
              <div className="space-y-1.5">
                {LOG_LINES.slice(0, visibleLines).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-2"
                  >
                    <span className="text-[var(--color-text-dim)] select-none">$</span>
                    <span
                      className={
                        i === visibleLines - 1
                          ? 'text-[var(--color-accent)]'
                          : 'text-[var(--color-text-dim)]'
                      }
                    >
                      {line}
                      {i === visibleLines - 1 && (
                        <span className="cursor-blink ml-0.5 text-[var(--color-accent)]">█</span>
                      )}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-6 space-y-1">
                <div className="flex justify-between text-[var(--color-text-dim)] text-[10px]">
                  <span>Progress</span>
                  <span>{Math.round((visibleLines / LOG_LINES.length) * 100)}%</span>
                </div>
                <div className="h-1 bg-[var(--color-border)] overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--color-accent)]"
                    style={{ boxShadow: '0 0 8px rgba(0,212,204,0.6)' }}
                    animate={{ width: `${(visibleLines / LOG_LINES.length) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
