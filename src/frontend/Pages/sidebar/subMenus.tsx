import { useState, useEffect } from "react"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Switch } from "@components/ui/switch"
import { Button } from "@components/ui/button"
import { useSettings } from "@lib/settings-context"
import { useTranslation } from "@lib/language-context"
import { Check, Globe, HelpCircle, Mail, Moon, RefreshCcw, User, X } from "lucide-react"
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@components/ui/drawer"


export function ProfileMenu({ onBack }: { onBack?: () => void }) {
    const { settings, updateSetting } = useSettings()
    const { t, isRTL } = useTranslation()

    const [draft, setDraft] = useState({
        username: settings.username,
        email: settings.email || "",
        profilePicture: settings.profilePicture || "",
    })

    useEffect(() => {
        setDraft({
            username: settings.username,
            email: settings.email || "",
            profilePicture: settings.profilePicture || "",
        })
    }, [settings.username, settings.email, settings.profilePicture])

    const isDirty =
        draft.username !== settings.username ||
        draft.email !== (settings.email || "") ||
        draft.profilePicture !== (settings.profilePicture || "")

    const handleSave = () => {
        updateSetting("username", draft.username)
        updateSetting("email", draft.email)
        updateSetting("profilePicture", draft.profilePicture)
        onBack?.()
    }

    const handleCancel = () => {
        setDraft({
            username: settings.username,
            email: settings.email || "",
            profilePicture: settings.profilePicture || "",
        })
        onBack?.()
    }

    const fields: { id: keyof typeof draft, icon: any, label: string, type: string }[] = [
        { id: "username", icon: User, label: t("username"), type: "text" },
        { id: "email", icon: Mail, label: t("email"), type: "email" },
        { id: "profilePicture", icon: User, label: t("profilePicture"), type: "file" },
    ]

    return (<>
        <DrawerHeader className={`border-b pb-6 ${isRTL ? "items-end" : "items-start"}`}>
            <DrawerTitle>{t("editProfile")}</DrawerTitle>
            <DrawerDescription>{t("updatePersonalInfo")}</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto">
            {fields.map((field) => (
                <div key={field.id} className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${isRTL ? "flex-row-reverse" : "text-left"}`}>
                    {field.type === "file" && draft[field.id] ?
                        <img src={draft[field.id] as string} alt="Profile" className="w-10 h-10 rounded-full object-cover border" />
                        :
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                            <field.icon className="size-5 text-muted-foreground" />
                        </div>
                    }
                    <div className={`flex-1 flex flex-col gap-2 ${isRTL ? "items-end" : "items-start"}`}>
                        <Label htmlFor={field.id}>{field.label}</Label>
                        {field.type === "file" ? (
                            <div className={`flex gap-4 items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={async () => {
                                        const newPath = await window.electron.chooseAndSaveProfilePicture();
                                        if (newPath) {
                                            setDraft(prev => ({ ...prev, [field.id]: newPath }))
                                        }
                                    }}
                                >
                                    {t("chooseProfilePicture")}
                                </Button>
                            </div>
                        ) : (
                            <Input
                                dir={isRTL ? "rtl" : "ltr"}
                                id={field.id}
                                type={field.type}
                                value={draft[field.id] as string}
                                onChange={(e: any) => setDraft(prev => ({ ...prev, [field.id]: e.target.value }))}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
        <DrawerFooter className="border-t flex-row gap-2">
            <Button onClick={handleCancel} variant="outline" className="flex-1 gap-2">
                <X className="size-4" />
                {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!isDirty} className="flex-1 gap-2">
                <Check className="size-4" />
                {t("save")}
            </Button>
        </DrawerFooter>
    </>
    )
}


export function PrivacyAndSecurityMenu() {
    const { t, isRTL } = useTranslation()
    return (
        <>
            <DrawerHeader className={`border-b pb-6 ${isRTL ? "items-end" : "items-start"}`}>
                <DrawerTitle>{t("privacyAndSecurity")}</DrawerTitle>
                <DrawerDescription>{t("password2FAandMore")}</DrawerDescription>
            </DrawerHeader>
        </>
    )
}

export function AppearanceMenu() {
    const { settings, updateSetting } = useSettings()
    const { t, isRTL } = useTranslation()
    return (
        <>
            <DrawerHeader className={`border-b pb-6 ${isRTL ? "items-end" : "items-start"}`}>
                <DrawerTitle>{t("appearance")}</DrawerTitle>
                <DrawerDescription>{t("themeAndDisplaySettings")}</DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto">
                <div className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${isRTL ? "flex-row-reverse" : "text-left"}`}>
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <Moon className="size-5 text-muted-foreground" />
                    </div>
                    <div className={`flex-1 ${isRTL ? "text-end" : "text-start"}`}>
                        <p className="text-sm font-medium text-foreground">{t("darkTheme")}</p>
                        <p className="text-xs text-muted-foreground">{t("themeAndDisplaySettings")}</p>
                    </div>
                    <Switch checked={settings.theme === "dark"}
                        onCheckedChange={(checked) => updateSetting("theme", checked ? "dark" : "light")}
                        className={isRTL ? "rotate-180" : ""} />
                </div>
                <div className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${isRTL ? "flex-row-reverse" : "text-left"}`}>
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <Globe className="size-5 text-muted-foreground" />
                    </div>
                    <div className={`flex-1 ${isRTL ? "text-end" : "text-start"}`}>
                        <p className="text-sm font-medium text-foreground">{t("language")}</p>
                        <p className="text-xs text-muted-foreground">{t("changeLanguage")}</p>
                    </div>
                    <div className="flex bg-muted/50 rounded-lg p-1">
                        <Button
                            variant={settings.language === "en" ? "default" : "ghost"}
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => updateSetting("language", "en")}>
                            English
                        </Button>
                        <Button
                            variant={settings.language === "ar" ? "default" : "ghost"}
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => updateSetting("language", "ar")}>
                            العربية
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export function HelpAndSupportMenu() {
    const { t, isRTL } = useTranslation()
    const [version, setVersion] = useState("")
    const [status, setStatus] = useState<"idle" | "checking" | "downloading" | "downloaded" | "up-to-date" | "error">("idle")
    const [downloadPercent, setDownloadPercent] = useState(0)
    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const appVersion = await window.electron.getAppVersion()
                setVersion(appVersion)
            } catch (error) {
                setStatus("error")
                console.error("Error fetching version:", error)
            }
        }
        fetchVersion()

        window.electron.onUpdateDownloadProgress((progress) => {
            if (progress && typeof progress.percent === 'number') {
                setDownloadPercent(progress.percent)
            }
        })
    }, [])

    const checkForUpdates = async () => {
        setStatus("checking")
        setDownloadPercent(0)
        try {
            const updateStatus = await window.electron.checkForUpdates()
            console.log(updateStatus)
            if (updateStatus.status === "up-to-date") {
                setStatus("up-to-date")
            } else if (updateStatus.status === "update-available") {
                setStatus("downloading")
                const downloadStatus = await window.electron.downloadUpdate()
                if (downloadStatus.status === "downloaded") {
                    setStatus("downloaded")
                } else if (downloadStatus.status === "error") {
                    setStatus("error")
                }
            } else if (updateStatus.status === "error") {
                setStatus("error")
            }
        } catch (error) {
            setStatus("error")
            console.error("Error checking for updates:", error)
        }
    }

    const installAndRestart = () => {
        window.electron.installUpdate()
    }
    return (
        <>
            <DrawerHeader className={`border-b pb-6 ${isRTL ? "items-end" : "items-start"}`}>
                <DrawerTitle>{t("helpAndSupport")}</DrawerTitle>
                <DrawerDescription>{t("getHelpOrContactUs")}</DrawerDescription>
            </DrawerHeader>

            <div className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${isRTL ? "flex-row-reverse" : "text-left"}`}>
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <HelpCircle className="size-5 text-muted-foreground" />
                </div>
                <div className={`flex-1 ${isRTL ? "text-end" : "text-start"}`}>
                    <p className="text-sm font-medium text-foreground">{t("helpAndSupport")}</p>
                    <p className="text-xs text-muted-foreground">{t("getHelpOrContactUs")}</p>
                </div>
            </div>
            <div className={`flex flex-col gap-2 rounded-lg p-3 transition-colors ${status === "up-to-date" ? "bg-green-500/10 border border-green-100/20" : status === "error" ? "bg-destructive/10 border border-destructive/20" : status === "downloading" ? "bg-primary/10 border border-primary/20" : ""}`}>
                <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : "text-left"}`}>
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <RefreshCcw className={`size-5 text-muted-foreground`} />
                    </div>
                    <div className={`flex-1 ${isRTL ? "text-end" : "text-start"}`}>
                        <p className="text-sm font-medium text-foreground">{t("checkForUpdates")}</p>
                        <div className="flex flex-col gap-0.5">
                            <p className="text-xs text-muted-foreground">{t("youAreOnVersion")} {version}</p>
                        </div>
                    </div>
                    <Button variant="default"
                        size="sm"
                        onClick={status === "downloaded" ? installAndRestart : checkForUpdates}
                        disabled={status === "checking" || status === "downloading"}
                        className={`transition-all duration-300 ${status === "up-to-date"
                            ? "bg-green-500/40 border-green-500 text-green-950 dark:text-green-50 hover:bg-green-500/60"
                            : status === "error"
                                ? "bg-red-500/30 border-red-500 text-red-950 dark:text-red-50 hover:bg-red-500/60"
                                : "bg-primary text-primary-foreground hover:bg-primary/60"
                            }`}
                    >
                        {status === "checking" ? (
                            <div className="flex items-center gap-2">
                                <RefreshCcw className="size-3 animate-spin-reverse" />
                                <span>{t("checkingForUpdates")}</span>
                            </div>
                        ) : status === "downloading" ? (
                            <div className="flex items-center gap-2">
                                <RefreshCcw className="size-3 animate-spin-reverse" />
                                <span>{t("downloadingUpdate")} ({downloadPercent}%)</span>
                            </div>
                        ) : status === "downloaded" ? (
                            <div className="flex items-center gap-1.5 animate-pulse">
                                <Check className="size-3.5" />
                                <span>{t("installRestart")}</span>
                            </div>
                        ) : status === "up-to-date" ? (
                            <div className="flex items-center gap-1.5">
                                <Check className="size-3.5" />
                                <span>{t("youAreAllUpdated")}</span>
                            </div>
                        ) : status === "error" ? (
                            <div className="flex items-center gap-1.5">
                                <X className="size-3.5" />
                                <span>{t("errorCheckingForUpdates")}</span>
                            </div>
                        ) : (
                            t("checkForUpdates")
                        )}
                    </Button>
                </div>

                {status === "downloading" && (
                    <div className="w-full bg-secondary h-1 mt-2 rounded">
                        <div className="bg-primary h-1 rounded transition-all duration-300" style={{ width: `${downloadPercent}%` }}></div>
                    </div>
                )}
            </div>
        </>
    )
}
