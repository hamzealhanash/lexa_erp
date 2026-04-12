import translationsJson from "./translations.json"
import { createContext, useContext, type ReactNode } from "react"
import type { Language, TranslationContext, Translations } from "@types"
import { useSettings } from "./settings-context"

const translations: Translations = translationsJson

const TranslationContext = createContext<TranslationContext | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { settings, updateSetting } = useSettings()
  const language = settings.language

  const setLanguage = (lang: Language) => {
    updateSetting("language", lang)
  }

  const t = (key: string): string => {
    return (translations[key] as any)?.[language] || key
  }

  const isRTL = language === "ar"

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }
  return context
}
