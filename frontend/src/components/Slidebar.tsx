import {
  BarChart3,
  Fuel,
  LayoutDashboard,
  Moon,
  Route,
  Settings,
  Truck,
  Users,
  Wrench,
  Sun,
  X,
  Eye,
  type LucideIcon,
} from 'lucide-react'
import { getAccess, type AppModule } from '../utils/permissions'

type SidebarItem = {
  name: AppModule
  icon: LucideIcon
  section: string
}

type SlidebarProps = {
  activeTab: string
  onTabChange: (tab: string) => void
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  isSidebarOpen: boolean
  onClose: () => void
  activeRole: string
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard',       icon: LayoutDashboard, section: 'Overview'    },
  { name: 'Fleet',           icon: Truck,           section: 'Operations'  },
  { name: 'Drivers',         icon: Users,           section: 'Operations'  },
  { name: 'Trips',           icon: Route,           section: 'Operations'  },
  { name: 'Maintenance',     icon: Wrench,          section: 'Operations'  },
  { name: 'Fuel & Expenses', icon: Fuel,            section: 'Finance'     },
  { name: 'Analytics',       icon: BarChart3,       section: 'Finance'     },
  { name: 'Settings',        icon: Settings,        section: 'System'      },
]

const sections = ['Overview', 'Operations', 'Finance', 'System']

function Slidebar({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  isSidebarOpen,
  onClose,
  activeRole,
}: SlidebarProps) {
  const handleNav = (name: string) => {
    onTabChange(name)
    onClose()
  }

  // Filter items to only those the role can access
  const visibleItems = sidebarItems.filter(
    (item) => getAccess(activeRole, item.name) !== 'none'
  )

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col
        bg-bg-sidebar border-r border-slate-800/80
        transition-transform duration-300 ease-in-out shrink-0
        lg:relative lg:translate-x-0 lg:z-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white font-black text-base shadow-lg shadow-orange-500/30 select-none">
            T
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-black tracking-tight text-white">TransitOps</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              {activeRole.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section) => {
          const items = visibleItems.filter((i) => i.section === section)
          if (!items.length) return null
          return (
            <div key={section}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {section}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.name
                  const access = getAccess(activeRole, item.name)
                  const isViewOnly = access === 'view'

                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNav(item.name)}
                      className={`
                        relative flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl
                        transition-all duration-200 group cursor-pointer text-left
                        ${isActive
                          ? 'bg-brand-orange/15 text-brand-orange'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        }
                      `}
                    >
                      {/* Active left indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-orange rounded-r-full" />
                      )}

                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 transition-all duration-200
                          ${isActive
                            ? 'text-brand-orange'
                            : 'text-slate-500 group-hover:text-white group-hover:scale-110'
                          }
                        `}
                      />

                      <span className={`flex-1 transition-colors duration-200 ${isActive ? 'font-semibold' : ''}`}>
                        {item.name}
                      </span>

                      {/* View-only badge */}
                      {isViewOnly && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-700/60 text-slate-400">
                          <Eye className="h-2.5 w-2.5" />
                          View
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <div className="flex bg-slate-900/70 p-1 rounded-xl gap-1">
          <button
            onClick={() => onThemeChange('light')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
              theme === 'light'
                ? 'bg-brand-orange text-white shadow-md shadow-orange-500/20'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
              theme === 'dark'
                ? 'bg-brand-orange text-white shadow-md shadow-orange-500/20'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Slidebar
export type { SlidebarProps }
