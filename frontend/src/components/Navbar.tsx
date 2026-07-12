import { Bell, LogOut, Menu, Search } from 'lucide-react'

type NavbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  onMenuClick?: () => void
  onLogout?: () => void
  activeRole: string
  currentUser?: { name: string; email: string; role: string } | null
  title?: string
  subtitle?: string
}

function Navbar({
  searchQuery,
  onSearchChange,
  onMenuClick,
  onLogout,
  activeRole,
  currentUser,
  title = 'Dashboard Overview',
  subtitle = 'Real-time transit operations monitoring'
}: NavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between px-4 sm:px-8 bg-bg-card border-b border-border-custom transition-all duration-300 gap-4 shrink-0">
      
      {/* Left section: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-xl transition-colors lg:hidden cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-base sm:text-xl font-bold text-text-primary tracking-tight whitespace-nowrap">{title}</h1>
          <span className="hidden sm:inline text-xs text-text-secondary">{subtitle}</span>
        </div>
      </div>

      {/* Middle section: Search input (hidden on small viewports) */}
      <div className="hidden md:block relative w-60 lg:w-80 max-w-lg">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          placeholder="Search by trip, driver, vehicle..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-4 py-2 text-sm rounded-2xl bg-bg-main border border-border-custom text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-200"
        />
      </div>

      {/* Right section: Profile + Actions */}
      <div className="flex items-center gap-2 sm:gap-4">

        <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-xl transition-all duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-orange" />
        </button>

        <div className="h-6 w-px bg-border-custom" />

        <div className="flex items-center gap-2 sm:gap-3 pl-1 group cursor-pointer">
          <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-brand-orange overflow-hidden transition-transform duration-200 group-hover:scale-105">
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
              {activeRole === 'FLEET_MANAGER' ? 'FM' : activeRole === 'DISPATCHER' ? 'DS' : activeRole === 'SAFETY_OFFICER' ? 'SO' : 'FA'}
            </span>
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-sm font-semibold text-text-primary group-hover:text-brand-orange transition-colors">
              {currentUser?.name || (activeRole === 'FLEET_MANAGER' ? 'Fleet Manager' : activeRole === 'DISPATCHER' ? 'Dispatcher' : activeRole === 'SAFETY_OFFICER' ? 'Safety Officer' : 'Financial Analyst')}
            </span>
            <span className="text-[10px] font-medium text-text-secondary uppercase">{activeRole.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  )
}

export default Navbar
export type { NavbarProps }
