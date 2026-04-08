import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UserSettings, SettingsContextType } from "@/types"

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<UserSettings>({
        username: "User",
        theme: "system",
        language: "en"
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedSettings = await window.electron.getSettings()
                if (storedSettings) {
                    setSettings(storedSettings)
                }
            } catch (error) {
                console.error("Failed to load settings:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadSettings()
    }, [])

    const updateSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        try {
            await window.electron.setSetting(key, value)
        } catch (error) {
            console.error(`Failed to save setting ${key}:`, error)
        }
    }

    // Apply theme whenever it changes
    useEffect(() => {
        const root = window.document.documentElement
        const theme = settings.theme

        if (theme === 'system') {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light'
            root.classList.remove("light", "dark")
            root.classList.add(systemTheme)
        } else {
            root.classList.remove("light", "dark")
            root.classList.add(theme)
        }
    }, [settings.theme])

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, isLoading }}>
            {!isLoading && children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider")
    }
    return context
}
