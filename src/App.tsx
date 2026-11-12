import { useEffect, useState } from 'react'
import { BackToTop } from './components/BackToTop'
import { ScrollPig } from './components/ScrollPig'
import { DesignPreview } from './components/DesignPreview'
import { Benefits } from './components/sections/Benefits'
import { DataSection } from './components/sections/DataSection'
import { Faq } from './components/sections/Faq'
import { Footer } from './components/sections/Footer'
import { Header } from './components/sections/Header'
import { Hero } from './components/sections/Hero'
import { HowItWorks } from './components/sections/HowItWorks'
import { Moods } from './components/sections/Moods'
import { Shelf } from './components/sections/Shelf'
import { Stats } from './components/sections/Stats'
import { YourPigs } from './components/sections/YourPigs'
import { CreatePigProvider } from './components/modals/CreatePigProvider'
import { StorageBanner } from './components/StorageBanner'
import { ToastProvider } from './components/ui/Toast'
import { AppProvider } from './state/AppProvider'

const PREVIEW_HASH = '#design-system'

export default function App() {
  const [showPreview, setShowPreview] = useState(
    () => window.location.hash === PREVIEW_HASH,
  )

  useEffect(() => {
    const onHash = () => setShowPreview(window.location.hash === PREVIEW_HASH)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <ToastProvider>
      <AppProvider>
        <CreatePigProvider>
          <div id="top" />
          <StorageBanner />
          {showPreview ? (
            <DesignPreview />
          ) : (
            <>
              <Header />
              <main>
                <Hero />
                <HowItWorks />
                <YourPigs />
                <Shelf />
                <Moods />
                <Stats />
                <Benefits />
                <DataSection />
                <Faq />
              </main>
              <Footer />
              <ScrollPig />
              <BackToTop />
            </>
          )}
        </CreatePigProvider>
      </AppProvider>
    </ToastProvider>
  )
}
