import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface Props {
  value: number // 0..1
}

const SIZE = 160
const STROKE = 10
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

export default function ConfidenceMeter({ value }: Props) {
  const pct = Math.round(value * 100)
  const progress = useMotionValue(0)
  const dashoffset = useTransform(progress, [0, 100], [CIRC, 0])
  const displayPct = useMotionValue(0)

  // Ref for the displayed number to avoid re-renders
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const anim1 = animate(progress, pct, { duration: 1.6, ease: 'easeOut' })
    const anim2 = animate(displayPct, pct, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (numRef.current) numRef.current.textContent = `${Math.round(v)}`
      },
    })
    return () => { anim1.stop(); anim2.stop() }
  }, [pct])

  const color =
    pct >= 90 ? '#34d399'
    : pct >= 70 ? '#00d4cc'
    : pct >= 50 ? '#fbbf24'
    : '#f87171'

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDasharray={CIRC}
            style={{ strokeDashoffset: dashoffset }}
            filter={`drop-shadow(0 0 6px ${color})`}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold text-white">
            <span ref={numRef}>0</span>
            <span className="text-sm text-[var(--color-text-dim)]">%</span>
          </span>
          <span className="font-mono text-[9px] text-[var(--color-text-dim)] uppercase tracking-widest mt-0.5">
            confidence
          </span>
        </div>
      </div>

      <div className="space-y-2 font-mono text-xs">
        <div>
          <div className="text-[var(--color-text-dim)] text-[10px] mb-0.5">raw score</div>
          <div className="text-white">{value.toFixed(4)}</div>
        </div>
        <div>
          <div className="text-[var(--color-text-dim)] text-[10px] mb-0.5">threshold</div>
          <div className="text-[var(--color-accent)]">≥ 0.80 flag</div>
        </div>
        <div>
          <div className="text-[var(--color-text-dim)] text-[10px] mb-0.5">status</div>
          <div style={{ color }}>
            {pct >= 90 ? 'HIGH' : pct >= 70 ? 'MODERATE' : pct >= 50 ? 'LOW' : 'UNCERTAIN'}
          </div>
        </div>
      </div>
    </div>
  )
}
