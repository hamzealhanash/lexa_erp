import Logo from "@assets/Logo.png"
import { SideBar } from "@/src/frontend/Pages/sidebar/profile-drawer"

export function TopBar() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10">
          <img className="text-lg font-bold text-primary-foreground" src={Logo} alt="" />
        </div>
        <span className="text-xl font-semibold text-foreground">Lexa ERP</span>
      </div>

      <div className="flex items-center gap-2">
        <SideBar />
      </div>
    </header>
  )
}
