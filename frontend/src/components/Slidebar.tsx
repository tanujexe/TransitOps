import { BarChart3, Fuel, LayoutDashboard, Moon, Route, Settings, Truck, Users, Wrench, type LucideIcon, Sun } from 'lucide-react'

type SidebarItem = {
	name: string
	icon: LucideIcon
}

type SlidebarProps = {
	activeTab: string
	onTabChange: (tab: string) => void
	theme: 'light' | 'dark'
	onThemeChange: (theme: 'light' | 'dark') => void
}

const sidebarItems: SidebarItem[] = [
	{ name: 'Dashboard', icon: LayoutDashboard },
	{ name: 'Fleet', icon: Truck },
	{ name: 'Drivers', icon: Users },
	{ name: 'Trips', icon: Route },
	{ name: 'Maintenance', icon: Wrench },
	{ name: 'Fuel & Expenses', icon: Fuel },
	{ name: 'Analytics', icon: BarChart3 },
	{ name: 'Settings', icon: Settings }
]

function Slidebar({ activeTab, onTabChange, theme, onThemeChange }: SlidebarProps) {
	return (
		<aside className="flex w-64 flex-col bg-bg-sidebar text-slate-300 border-r border-slate-800 transition-all duration-300 shrink-0">
			<div className="flex h-16 items-center px-6 gap-3 border-b border-slate-800">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white font-bold text-lg shadow-lg shadow-orange-500/20">
					T
				</div>
				<span className="text-xl font-bold tracking-wide text-white font-sans">TransitOps</span>
			</div>

			<nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
				{sidebarItems.map((item) => {
					const Icon = item.icon
					const isActive = activeTab === item.name

					return (
						<button
							key={item.name}
							onClick={() => onTabChange(item.name)}
							className={`flex w-full items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
								isActive
									? 'bg-brand-orange text-white shadow-lg shadow-orange-500/30'
									: 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
							}`}
						>
							<Icon
								className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
									isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
								}`}
							/>
							<span>{item.name}</span>
						</button>
					)
				})}
			</nav>

			<div className="p-4 border-t border-slate-800">
				<div className="flex bg-slate-900/60 p-1.5 rounded-2xl gap-1">
					<button
						onClick={() => onThemeChange('light')}
						className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-300 ${
							theme === 'light'
								? 'bg-brand-orange text-white shadow-md'
								: 'text-slate-400 hover:text-white'
						}`}
					>
						<Sun className="h-4 w-4" />
						<span>Light</span>
					</button>
					<button
						onClick={() => onThemeChange('dark')}
						className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-300 ${
							theme === 'dark'
								? 'bg-brand-orange text-white shadow-md'
								: 'text-slate-400 hover:text-white'
						}`}
					>
						<Moon className="h-4 w-4" />
						<span>Dark</span>
					</button>
				</div>
			</div>
		</aside>
	)
}

export default Slidebar
