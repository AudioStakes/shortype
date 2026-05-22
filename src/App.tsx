import { useMemo, useState } from 'preact/hooks'

import About from '@/components/About'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import createModalStore from '@/stores/modal'
import ModalKey from '@/stores/modal-key'
import GameView from '@/views/GameView'
import Unsupported from '@/views/Unsupported'

export default function App() {
  const [, forceUpdate] = useState(0)
  const modal = useMemo(
    () => createModalStore(() => forceUpdate((value) => value + 1)),
    [],
  )

  const isUnsupportedBrowser = !navigator.userAgent.includes('Chrome')
  const isUnsupportedOs = !navigator.userAgent.includes('Mac')
  const [isUnsupported, setIsUnsupported] = useState(
    isUnsupportedBrowser || isUnsupportedOs,
  )

  return (
    <ModalKey.Provider value={modal}>
      <div class="font-sans antialiased text-slate-700 min-h-dvh flex flex-col text-center">
        <Header />
        <main class="flex-1 flex flex-col justify-start sm:justify-center">
          {isUnsupported ? (
            <Unsupported
              isUnsupportedBrowser={isUnsupportedBrowser}
              isUnsupportedOs={isUnsupportedOs}
              onProceed={() => setIsUnsupported(false)}
            />
          ) : (
            <GameView />
          )}
          <About isShow={modal.modalState.isAboutModalVisible} />
        </main>
        <Footer />
      </div>
    </ModalKey.Provider>
  )
}
