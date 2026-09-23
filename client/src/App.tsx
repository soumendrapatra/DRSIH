import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Explorer from './pages/Explorer'
import AnalysisView from './pages/AnalysisView'

export type Route =
  | { screen: 'explorer' }
  | { screen: 'analysis'; id: string }

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: 'explorer' })

  const navigate = (next: Route) => setRoute(next)

  return (
    <div className="bg-grid bg-scanlines min-h-screen">
      <AnimatePresence mode="wait" initial={false}>
        {route.screen === 'explorer' ? (
          <motion.div
            key="explorer"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Explorer onSelect={(id) => navigate({ screen: 'analysis', id })} />
          </motion.div>
        ) : (
          <motion.div
            key={`analysis-${(route as { screen: 'analysis'; id: string }).id}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <AnalysisView
              id={(route as { screen: 'analysis'; id: string }).id}
              onBack={() => navigate({ screen: 'explorer' })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
