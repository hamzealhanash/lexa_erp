import { FileText, Wallet, Database, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@lib/language-context"
import type { TabsNavProps } from "@/src/global-types"

const tabs = [
  { id: "bills", labelKey: "bills", icon: FileText },
  { id: "collection", labelKey: "collection", icon: Wallet },
  { id: "records", labelKey: "records", icon: Database },
  { id: "catalog", labelKey: "catalog", icon: Package },
]

export function TabsNav({ activeTab, onTabChange }: TabsNavProps) {
  const { t } = useTranslation()

  return (
    <nav className="flex items-center gap-2 px-6 py-2 bg-card border-b border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors select-none",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {t(tab.labelKey)}
          </button>
        )
      })}
    </nav>
  )
}
