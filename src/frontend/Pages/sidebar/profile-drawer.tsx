import { Button } from "@components/ui/button"
import { useSettings } from "@lib/settings-context"
import { useTranslation } from "@lib/language-context"
import { Avatar, AvatarImage, AvatarFallback } from "@components/ui/avatar"
import { User, Shield, Moon, HelpCircle, ChevronRight, LogOut, ChevronLeft } from "lucide-react"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@components/ui/drawer"
import { generateGradient } from "@lib/utils"
import { useState } from "react"
import { AppearanceMenu, HelpAndSupportMenu, PrivacyAndSecurityMenu, ProfileMenu } from "./subMenus"

type MenuId = "main" | "profile" | "privacy" | "appearance" | "help"

export function SideBar() {
  const { settings } = useSettings()
  const { language, t, isRTL } = useTranslation()

  const [activeMenu, setActiveMenu] = useState<MenuId>("main")
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left")

  const initials = (settings.username || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleMenuClick = (menuId: MenuId) => {
    setSlideDirection("left")
    setIsAnimating(true)
    setTimeout(() => {
      setActiveMenu(menuId)
      setIsAnimating(false)
    }, 150)
  }

  const handleBack = () => {
    setSlideDirection("right")
    setIsAnimating(true)
    setTimeout(() => {
      setActiveMenu("main")
      setIsAnimating(false)
    }, 150)
  }

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setActiveMenu("main")
        setIsAnimating(false)
      }, 300)
    }
  }


  const fallbackGradient = { background: generateGradient(initials) }

  const menuItems: { id: MenuId, subMenu: React.ReactNode, icon: any, label: string, description: string }[] = [
    { id: "profile", subMenu: <ProfileMenu onBack={handleBack} />, icon: User, label: t("editProfile"), description: t("updatePersonalInfo") },
    { id: "privacy", subMenu: <PrivacyAndSecurityMenu />, icon: Shield, label: t("privacyAndSecurity"), description: t("password2FAandMore") },
    { id: "appearance", subMenu: <AppearanceMenu />, icon: Moon, label: t("appearance"), description: t("themeAndDisplaySettings") },
    { id: "help", subMenu: <HelpAndSupportMenu />, icon: HelpCircle, label: t("helpAndSupport"), description: t("getHelpOrContactUs") },
  ]

  return (
    <Drawer direction={language === "ar" ? "right" : "left"} handleOnly onOpenChange={handleDrawerOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full gap-2 p-4">
          <Avatar className="size-6">
            <AvatarImage src={settings.profilePicture} alt={settings.username} />
            <AvatarFallback className="text-primary-foreground" style={fallbackGradient}>
              {initials}
            </AvatarFallback>
          </Avatar>
          {settings.username}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full">
        <div className="relative flex h-full flex-col overflow-hidden">
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-150 ease-out ${activeMenu !== "main"
              ? "-translate-x-full"
              : isAnimating && slideDirection === "right"
                ? "translate-x-full"
                : "translate-x-0"
              }`}
          >
            <DrawerHeader className="border-b pb-6">
              <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : "text-left"}`}>
                <Avatar className="size-16">
                  <AvatarImage src={settings.profilePicture} alt={settings.username} />
                  <AvatarFallback className="text-primary-foreground text-xl" style={fallbackGradient}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col  ${isRTL ? "items-end" : "items-start"}`}>
                  <DrawerTitle className="text-lg">{settings.username}</DrawerTitle>
                  <DrawerDescription className="text-sm">{settings.email}</DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4">
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => (
                  <Button variant="ghost" size={null} key={item.label}
                    onClick={() => handleMenuClick(item.id)}
                    className={`flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-accent
                     ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}>

                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <item.icon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {isRTL ? (
                      <ChevronLeft className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                ))}
              </nav>
            </div>

            <DrawerFooter className="border-t">
              <Button variant="destructive" className="w-full gap-2">
                <LogOut className="size-4" />
                {t("logout")}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  {t("close")}
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-200 ease-out ${activeMenu === "main"
              ? "translate-x-full"
              : isAnimating && slideDirection === "left"
                ? "-translate-x-full"
                : "translate-x-0"
              }`}
          >
            {menuItems.find((item) => item.id === activeMenu)?.subMenu}
            <DrawerFooter className="border-t">
              <Button onClick={handleBack} variant="outline" className="w-full gap-2">
                <ChevronLeft className="size-4" />
                {t("backToMenu")}
              </Button>
            </DrawerFooter>
          </div>

        </div>
      </DrawerContent>
    </Drawer>
  )
}
