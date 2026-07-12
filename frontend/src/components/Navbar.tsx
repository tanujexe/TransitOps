import { Bell, ChevronDown, Plus, Search } from 'lucide-react'

type NavbarProps = {
	searchQuery: string
	onSearchChange: (value: string) => void
	onDispatchClick: () => void
	title?: string
	subtitle?: string
}

function Navbar({
	searchQuery,
	onSearchChange,
	onDispatchClick,
	title = 'Dashboard Overview',
	subtitle = 'Real-time transit operations monitoring'
}: NavbarProps) {
	return (
		<header className="flex h-16 items-center justify-between px-8 bg-bg-card border-b border-border-custom transition-all duration-300">
			<div className="flex flex-col">
				<h1 className="text-xl font-bold text-text-primary tracking-tight">{title}</h1>
				<span className="text-xs text-text-secondary">{subtitle}</span>
			</div>

			<div className="relative w-80 max-w-lg">
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

			<div className="flex items-center gap-4">
				<button
					onClick={onDispatchClick}
					className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover active:scale-95 rounded-2xl shadow-lg shadow-orange-500/20 transition-all duration-200 cursor-pointer"
				>
					<Plus className="h-4.5 w-4.5" />
					<span>Dispatch Trip</span>
				</button>

				<button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-xl transition-all duration-200">
					<Bell className="h-5 w-5" />
					<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-orange" />
				</button>

				<div className="h-6 w-px bg-border-custom" />

				<div className="flex items-center gap-3 pl-1 group cursor-pointer">
					<div className="relative h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-brand-orange overflow-hidden transition-transform duration-200 group-hover:scale-105">
						<span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
							RK
						</span>
					</div>
					<div className="hidden md:flex flex-col text-left">
						<span className="text-sm font-semibold text-text-primary group-hover:text-brand-orange transition-colors">
							Raven K.
						</span>
						<span className="text-[10px] font-medium text-text-secondary">Dispatcher</span>
					</div>
					<ChevronDown className="h-4 w-4 text-text-secondary group-hover:text-text-primary transition-colors" />
				</div>
			</div>
		</header>
	)
}

export default Navbar
