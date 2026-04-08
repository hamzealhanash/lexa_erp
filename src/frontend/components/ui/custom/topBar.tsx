import Logo from "@/assets/Logo.png"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/language-context"
import type { Language } from "@/src/global-types"
import { Globe, User, ChevronDown, Sun, Moon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"




const languages: { code: Language, name: string }[] = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
]



export function TopBar() {
  const { settings, updateSetting } = useSettings()
  const { language, t } = useTranslation()
  const currentLanguage = languages.find(l => l.code === language)

  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = () => {
    updateSetting('theme', isDark ? 'light' : 'dark')
  }

  const handleLanguageChange = (lang: Language) => {
    updateSetting('language', lang)
  }

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10">
          <img className="text-lg font-bold text-primary-foreground" src={Logo} alt="" />
        </div>
        <span className="text-xl font-semibold text-foreground">Lexa ERP</span>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button {...props} variant="ghost" size="sm" className="gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLanguage?.name}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            )}
          />
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code as Language)}>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-9 h-9 p-0"
        >
          {isDark ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>


        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button {...props} variant="ghost" size="sm" className="gap-2 h-10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-foreground">{settings.username}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            )}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t("profile")}</DropdownMenuItem>
            <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">{t("logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
