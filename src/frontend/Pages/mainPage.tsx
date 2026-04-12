import { Toaster } from "sonner"
import { useState, lazy, Suspense, useEffect } from "react"
import { useSettings } from "@lib/settings-context"
import { TopBar } from "@components/ui/custom/topBar"
import { TabsNav } from "@components/ui/custom/navBar"
import { useTranslation, LanguageProvider } from "@lib/language-context"

const Bills = lazy(() => import('./cards/bills'))
const Collection = lazy(() => import('./cards/collection'))
const Records = lazy(() => import('./cards/records'))
const Catalog = lazy(() => import('./cards/catalog'))

function MainPage() {
  const [activeTab, setActiveTab] = useState("bills")
  const { isRTL } = useTranslation()
  useEffect(() => {
    window.electron.onTabChange((tab: string) => {
      setActiveTab(tab)
    })
  }, [])


  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <TopBar />
      <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="p-6">
        <Suspense fallback={null}>
          {activeTab === "bills" && <Bills />}
          {activeTab === "collection" && <Collection />}
          {activeTab === "records" && <Records />}
          {activeTab === "catalog" && <Catalog />}
        </Suspense>
      </main>
    </div>
  )
}


export default function ERPPage() {
  const { settings } = useSettings()

  return (
    <LanguageProvider>
      <MainPage />
      <Toaster richColors theme={settings.theme} position="top-center" />
    </LanguageProvider>
  )
}

