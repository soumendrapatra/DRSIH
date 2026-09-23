import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { api, Analysis } from '../api'
import ScanningSequence from '../components/ScanningSequence'
import ConfidenceMeter from '../components/ConfidenceMeter'
import FundusImage from '../components/FundusImage'
import TypewriterText from '../components/TypewriterText'

interface Props {
  id: string
  onBack: () => void
}

type Phase = 'loading' | 'scanning' | 'results' | 'error'

// ─── Small reusable section wrapper ──────────────────────────────────────────
// whileInView drives staggered scroll-reveal for all below-fold sections.
function Section({
  label,
  delay = 0,
  accent = false,
  children,
}: {
  label: string
  delay?: number
  accent?: boolean
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
      className={`border bg-[var(--color-bg-surface)] p-4 ${
        accent
          ? 'border-[var(--color-amber)]'
          : 'border-[var(--color-border)]'
      }`}
      style={accent ? { boxShadow: '0 0 16px rgba(240,165,0,0.06)' } : undefined}
    >
      <div
        className={`font-mono text-[10px] mb-3 uppercase tracking-widest ${
          accent ? 'text-[var(--color-amber)]' : 'text-[var(--color-text-dim)]'
        }`}
      >
        {label}
      </div>
      {children}
    </motion.div>
  )
}

export default function AnalysisView({ id, onBack }: Props) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [phase, setPhase]       = useState<Phase>('loading')
  const [error, setError]       = useState<string | null>(null)

  // Scroll-trigger refs for findings (inside right panel, near-fold)
  const findingsRef    = useRef<HTMLDivElement>(null)
  const findingsInView = useInView(findingsRef, { once: true, margin: '-60px' })

  useEffect(() => {
    setPhase('loading')
    setAnalysis(null)
    api.getAnalysis(id)
      .then((data) => {
        setAnalysis(data)
        setPhase('scanning')
      })
      .catch((e) => {
        setError(e.message)
        setPhase('error')
      })
  }, [id])

  const onScanComplete = () => setPhase('results')

  // Severity → accent colour (free-text field; fallback to red for unknowns)
  const severityColor =
    analysis?.severity === 'None'       ? '#34d399'
    : analysis?.severity === 'Mild'     ? '#fbbf24'
    : analysis?.severity === 'Moderate' ? '#fb923c'
    : '#f87171'

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-6">

      {/* ── Breadcrumb / Back ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-6 font-mono text-xs text-[var(--color-text-dim)]"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors duration-150 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-150 inline-block">←</span>
          Explorer
        </button>
        <span>/</span>
        <span className="text-[var(--color-text)]">Sample {id}</span>
      </motion.div>

      {/* ── Page header — shown after data loads (reveals category) ── */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 pb-4 border-b border-[var(--color-border)]"
        >
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white">{analysis.displayName}</h2>
                {/* Category badge — first real data the viewer sees */}
                <span className="font-mono text-[10px] px-2 py-0.5 border border-[var(--color-accent)] text-[var(--color-accent)]">
                  {analysis.category}
                </span>
              </div>
              <p className="font-mono text-xs text-[var(--color-text-dim)] mt-0.5">
                id:{analysis.id}
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[var(--color-text-dim)]">proc:</span>
              <span className="text-[var(--color-accent)]">{analysis.processingTimeMs}ms</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Error ── */}
      {phase === 'error' && (
        <div className="border border-red-800 bg-red-950/30 px-4 py-3 text-red-400 font-mono text-sm">
          ERR: {error ?? 'Failed to load analysis.'}
        </div>
      )}

      {/* ── Loading spinner ── */}
      {phase === 'loading' && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
          <span className="font-mono text-xs text-[var(--color-text-dim)] animate-pulse">
            Fetching analysis data...
          </span>
        </div>
      )}

      {/* ── Scan sequence (unchanged choreography) ── */}
      <AnimatePresence>
        {phase === 'scanning' && analysis && (
          <ScanningSequence
            imageUrl={analysis.originalImage}
            onComplete={onScanComplete}
          />
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence>
        {phase === 'results' && analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >

            {/* ── Two-column layout: image left, panel right ── */}
            {/* Image column is wider (lg:w-3/5) since no heatmap occupies space */}
            <div className="flex flex-col lg:flex-row gap-6">

              {/* ── Left: single fundus image ── */}
              <div className="lg:w-3/5">
                <FundusImage url={analysis.originalImage} />
              </div>

              {/* ── Right: analysis panel ── */}
              <div className="lg:w-2/5 space-y-4">

                {/* Diagnosis block */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
                >
                  <div className="font-mono text-[10px] text-[var(--color-text-dim)] mb-1 uppercase tracking-widest">
                    Diagnosis
                  </div>
                  <div className="font-mono text-[10px] text-[var(--color-accent)] mb-1 tracking-wider">
                    {analysis.category}
                  </div>
                  <h3 className="text-lg font-bold text-white">{analysis.condition}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="font-mono text-xs px-2 py-0.5 border"
                      style={{ borderColor: severityColor, color: severityColor }}
                    >
                      {analysis.severity.toUpperCase()}
                    </span>
                    <span className="text-[var(--color-text-dim)] font-mono text-xs">severity</span>
                  </div>
                </motion.div>

                {/* Confidence meter */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
                >
                  <div className="font-mono text-[10px] text-[var(--color-text-dim)] mb-3 uppercase tracking-widest">
                    Confidence
                  </div>
                  <ConfidenceMeter value={analysis.confidence} />
                </motion.div>

                {/* Findings list — scroll-triggered stagger */}
                <div ref={findingsRef}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={findingsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 }}
                    className="border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
                  >
                    <div className="font-mono text-[10px] text-[var(--color-text-dim)] mb-3 uppercase tracking-widest">
                      Findings [{analysis.findings.length}]
                    </div>
                    <ul className="space-y-2">
                      {analysis.findings.map((f, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={findingsInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.15 + i * 0.1 }}
                          className="flex gap-2 text-sm text-[var(--color-text)]"
                        >
                          <span className="text-[var(--color-accent)] font-mono mt-0.5 flex-shrink-0">
                            {String(i + 1).padStart(2, '0')}.
                          </span>
                          <span>{f}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Recommendation — typewriter */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border border-[var(--color-amber)] bg-[var(--color-bg-surface)] p-4"
                  style={{ boxShadow: '0 0 16px rgba(240,165,0,0.06)' }}
                >
                  <div className="font-mono text-[10px] text-[var(--color-amber)] mb-2 uppercase tracking-widest">
                    Recommendation
                  </div>
                  <TypewriterText
                    text={analysis.recommendation}
                    className="text-sm text-[var(--color-text)] leading-relaxed"
                    speed={18}
                  />
                </motion.div>

              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                Below-fold sections — all scroll-triggered via whileInView
                ═══════════════════════════════════════════════════════════════ */}
            <div className="mt-6 space-y-4">

              {/* Analysis Summary */}
              <Section label="Analysis Summary" delay={0}>
                <p className="text-sm text-[var(--color-text)] leading-7">
                  {analysis.analysisSummary}
                </p>
                <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex justify-between font-mono text-[10px] text-[var(--color-text-dim)]">
                  <span>MODEL: retina-cnn-v3 (mock)</span>
                  <span>PROC: {analysis.processingTimeMs}ms</span>
                </div>
              </Section>

              {/* Vessel Analysis — optional */}
              {analysis.vesselAnalysis && (
                Object.values(analysis.vesselAnalysis).some(Boolean)
              ) && (
                <Section label="Vessel Analysis" delay={0.08}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {analysis.vesselAnalysis.arteriovenousRatio && (
                      <div className="border border-[var(--color-border)] px-3 py-2">
                        <div className="font-mono text-[9px] text-[var(--color-text-dim)] mb-1 uppercase tracking-widest">
                          A/V Ratio
                        </div>
                        <p className="text-sm text-white font-medium">
                          {analysis.vesselAnalysis.arteriovenousRatio}
                        </p>
                      </div>
                    )}
                    {analysis.vesselAnalysis.tortuosity && (
                      <div className="border border-[var(--color-border)] px-3 py-2">
                        <div className="font-mono text-[9px] text-[var(--color-text-dim)] mb-1 uppercase tracking-widest">
                          Tortuosity
                        </div>
                        <p className="text-sm text-white font-medium">
                          {analysis.vesselAnalysis.tortuosity}
                        </p>
                      </div>
                    )}
                    {analysis.vesselAnalysis.neovascularization && (
                      <div className="border border-[var(--color-border)] px-3 py-2">
                        <div className="font-mono text-[9px] text-[var(--color-text-dim)] mb-1 uppercase tracking-widest">
                          Neovascularization
                        </div>
                        <p className="text-sm text-white font-medium">
                          {analysis.vesselAnalysis.neovascularization}
                        </p>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Macula + Optic Disc — optional, side by side when both present */}
              {(analysis.maculaStatus || analysis.opticDiscStatus) && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {analysis.maculaStatus && (
                    <div className="border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
                      <div className="font-mono text-[10px] text-[var(--color-text-dim)] mb-2 uppercase tracking-widest">
                        Macula Status
                      </div>
                      <p className="text-sm text-[var(--color-text)] leading-relaxed">
                        {analysis.maculaStatus}
                      </p>
                    </div>
                  )}
                  {analysis.opticDiscStatus && (
                    <div className="border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
                      <div className="font-mono text-[10px] text-[var(--color-text-dim)] mb-2 uppercase tracking-widest">
                        Optic Disc Status
                      </div>
                      <p className="text-sm text-[var(--color-text)] leading-relaxed">
                        {analysis.opticDiscStatus}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Risk Indicators — optional */}
              {analysis.riskIndicators && analysis.riskIndicators.length > 0 && (
                <Section label={`Risk Indicators [${analysis.riskIndicators.length}]`} delay={0.12}>
                  <ul className="space-y-2">
                    {analysis.riskIndicators.map((r, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08 + i * 0.07 }}
                        className="flex gap-2 text-sm text-[var(--color-text)]"
                      >
                        <span className="text-red-400 font-mono mt-0.5 flex-shrink-0">⚠</span>
                        <span>{r}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Differential Considerations — optional */}
              {analysis.differentialConsiderations && (
                <Section label="Differential Considerations" delay={0.16}>
                  <p className="text-sm text-[var(--color-text)] leading-7">
                    {analysis.differentialConsiderations}
                  </p>
                </Section>
              )}

            </div>
            {/* ── end below-fold ── */}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
