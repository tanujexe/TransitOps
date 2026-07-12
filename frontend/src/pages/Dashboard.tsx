import { AlertTriangle, ArrowDownRight, BarChart3, CheckCircle, Clock, Play, Truck, TrendingUp, Users, Wrench, X } from 'lucide-react'
import { type Vehicle } from './fleet'

export interface Trip {
	dbId?: number
	id: string
	vehicle: string
	driver: string
	status: 'On Trip' | 'Completed' | 'Dispatched' | 'Draft' | 'In Maintenance' | 'Cancelled'
	eta: string
	vehicleType: 'Van' | 'Truck' | 'Mini' | 'Sedan' | '—'
	region: 'North' | 'South' | 'East' | 'West' | '—'
}

type DashboardProps = {
	activeTab: string
	trips: Trip[]
	filteredTrips: Trip[]
	searchQuery: string
	filterVehicleType: string
	filterStatus: string
	filterRegion: string
	onFilterVehicleTypeChange: (value: string) => void
	onFilterStatusChange: (value: string) => void
	onFilterRegionChange: (value: string) => void
	onClearFilters: () => void
	activeVehiclesCount: number
	availableVehiclesCount: number
	maintenanceCount: number
	activeTripsCount: number
	pendingTripsCount: number
	driversOnDuty: number
	fleetUtilization: number
	isModalOpen: boolean
	onCloseModal: () => void
	onDispatchSubmit: (e: React.FormEvent) => void
	newTripId: string
	newVehicle: string
	onNewVehicleChange: (value: string) => void
	newDriver: string
	onNewDriverChange: (value: string) => void
	newStatus: 'On Trip' | 'Completed' | 'Dispatched' | 'Draft'
	onNewStatusChange: (value: 'On Trip' | 'Completed' | 'Dispatched' | 'Draft') => void
	newEta: string
	onNewEtaChange: (value: string) => void
	newVehicleType: 'Van' | 'Truck' | 'Mini' | 'Sedan'
	onNewVehicleTypeChange: (value: 'Van' | 'Truck' | 'Mini' | 'Sedan') => void
	newRegion: 'North' | 'South' | 'East' | 'West'
	onNewRegionChange: (value: 'North' | 'South' | 'East' | 'West') => void
	vehicles: Vehicle[]
}

function Dashboard({
	activeTab,
	filteredTrips,
	searchQuery,
	filterVehicleType,
	filterStatus,
	filterRegion,
	onFilterVehicleTypeChange,
	onFilterStatusChange,
	onFilterRegionChange,
	onClearFilters,
	activeVehiclesCount,
	availableVehiclesCount,
	maintenanceCount,
	activeTripsCount,
	pendingTripsCount,
	driversOnDuty,
	fleetUtilization,
	isModalOpen,
	onCloseModal,
	onDispatchSubmit,
	newTripId,
	newVehicle,
	onNewVehicleChange,
	newDriver,
	onNewDriverChange,
	newStatus,
	onNewStatusChange,
	newEta,
	onNewEtaChange,
	newVehicleType,
	onNewVehicleTypeChange,
	newRegion,
	onNewRegionChange,
	vehicles
}: DashboardProps) {
	const statusStyles = {
		'On Trip': 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30',
		Completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30',
		Dispatched: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30',
		Draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/30',
		'In Maintenance': 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/30',
		Cancelled: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30',
	} as const

	return (
		<>
			{activeTab !== 'Dashboard' ? (
				<div className="flex flex-col items-center justify-center h-96 bg-bg-card rounded-[24px] border border-border-custom p-8 shadow-custom text-center">
					<div className="h-16 w-16 bg-orange-100 dark:bg-orange-950/40 text-brand-orange flex items-center justify-center rounded-2xl mb-4">
						<AlertTriangle className="h-8 w-8" />
					</div>
					<h2 className="text-xl font-bold text-text-primary mb-2">Section Under Construction</h2>
					<p className="text-text-secondary max-w-md">
						The {activeTab} view is currently being customized. Select the Dashboard link in the sidebar to review the operational KPIs and trips grid.
					</p>
				</div>
			) : (
				<>
					<div className="flex flex-wrap items-center gap-4 p-4 bg-bg-card rounded-[22px] border border-border-custom shadow-custom transition-all duration-300">
						<div className="text-xs font-semibold text-text-secondary uppercase tracking-wider pl-2">
							Filters
						</div>

						<div className="flex items-center gap-2">
							<span className="text-xs text-text-secondary">Vehicle:</span>
							<select
								value={filterVehicleType}
								onChange={(e) => onFilterVehicleTypeChange(e.target.value)}
								className="text-sm bg-bg-main border border-border-custom rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange cursor-pointer"
							>
								<option value="All">All Vehicles</option>
								<option value="Van">Van</option>
								<option value="Truck">Truck</option>
								<option value="Mini">Mini</option>
								<option value="Sedan">Sedan</option>
							</select>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-xs text-text-secondary">Status:</span>
							<select
								value={filterStatus}
								onChange={(e) => onFilterStatusChange(e.target.value)}
								className="text-sm bg-bg-main border border-border-custom rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange cursor-pointer"
							>
								<option value="All">All Statuses</option>
								<option value="On Trip">On Trip</option>
								<option value="Completed">Completed</option>
								<option value="Dispatched">Dispatched</option>
								<option value="Draft">Draft</option>
								<option value="In Maintenance">In Maintenance</option>
							</select>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-xs text-text-secondary">Region:</span>
							<select
								value={filterRegion}
								onChange={(e) => onFilterRegionChange(e.target.value)}
								className="text-sm bg-bg-main border border-border-custom rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange cursor-pointer"
							>
								<option value="All">All Regions</option>
								<option value="North">North</option>
								<option value="South">South</option>
								<option value="East">East</option>
								<option value="West">West</option>
							</select>
						</div>

						{(filterVehicleType !== 'All' || filterStatus !== 'All' || filterRegion !== 'All' || searchQuery !== '') && (
							<button
								onClick={onClearFilters}
								className="text-xs font-semibold text-brand-orange hover:text-brand-orange-hover hover:underline ml-auto pr-2"
							>
								Clear All Filters
							</button>
						)}
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
						<div className="bg-bg-card p-5 rounded-[22px] border border-border-custom shadow-custom transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group">
							<div className="absolute top-0 left-0 h-1.5 w-full bg-blue-500" />
							<div className="flex justify-between items-start">
								<span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Active Vehicles</span>
								<span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-500"><Truck className="h-4.5 w-4.5" /></span>
							</div>
							<div className="mt-2">
								<span className="text-3xl font-bold text-text-primary tracking-tight">{activeVehiclesCount}</span>
								<div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-medium">
									<TrendingUp className="h-3 w-3" />
									<span>+12.1% than last year</span>
								</div>
							</div>
						</div>

						<div className="bg-bg-card p-5 rounded-[22px] border border-border-custom shadow-custom transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group">
							<div className="absolute top-0 left-0 h-1.5 w-full bg-emerald-500" />
							<div className="flex justify-between items-start">
								<span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Available Vehicles</span>
								<span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500"><CheckCircle className="h-4.5 w-4.5" /></span>
							</div>
							<div className="mt-2">
								<span className="text-3xl font-bold text-text-primary tracking-tight">{availableVehiclesCount}</span>
								<div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-medium">
									<TrendingUp className="h-3 w-3" />
									<span>+18.0% than last year</span>
								</div>
							</div>
						</div>

						<div className="bg-bg-card p-5 rounded-[22px] border border-border-custom shadow-custom transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group">
							<div className="absolute top-0 left-0 h-1.5 w-full bg-brand-orange" />
							<div className="flex justify-between items-start">
								<span className="text-xs font-semibold uppercase tracking-wider text-text-secondary text-left leading-tight">In Maintenance</span>
								<span className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-brand-orange"><Wrench className="h-4.5 w-4.5" /></span>
							</div>
							<div className="mt-2">
								<span className="text-3xl font-bold text-text-primary tracking-tight">{maintenanceCount.toString().padStart(2, '0')}</span>
								<div className="flex items-center gap-1 mt-1 text-[10px] text-rose-500 font-medium">
									<ArrowDownRight className="h-3 w-3" />
									<span>-25.2% than last year</span>
								</div>
							</div>
						</div>

						<div className="bg-bg-card p-5 rounded-[22px] border border-border-custom shadow-custom transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group">
							<div className="absolute top-0 left-0 h-1.5 w-full bg-cyan-500" />
							<div className="flex justify-between items-start">
								<span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Active Trips</span>
								<span className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500"><Play className="h-4.5 w-4.5" /></span>
							</div>
							<div className="mt-2">
								<span className="text-3xl font-bold text-text-primary tracking-tight">{activeTripsCount}</span>
								<div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-medium">
									<TrendingUp className="h-3 w-3" />
									<span>+8.4% since monday</span>
								</div>
							</div>
						</div>

						<div className="bg-bg-card p-5 rounded-[22px] border border-border-custom shadow-custom transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group">
							<div className="absolute top-0 left-0 h-1.5 w-full bg-slate-500" />
							<div className="flex justify-between items-start">
								<span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Pending Trips</span>
								<span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-500"><Clock className="h-4.5 w-4.5" /></span>
							</div>
							<div className="mt-2">
								<span className="text-3xl font-bold text-text-primary tracking-tight">{pendingTripsCount.toString().padStart(2, '0')}</span>
								<div className="flex items-center gap-1 mt-1 text-[10px] text-text-secondary font-medium">
									<span>Awaiting dispatchers</span>
								</div>
							</div>
						</div>

						<div className="bg-bg-card p-5 rounded-[22px] border border-border-custom shadow-custom transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group">
							<div className="absolute top-0 left-0 h-1.5 w-full bg-indigo-500" />
							<div className="flex justify-between items-start">
								<span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Drivers on Duty</span>
								<span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500"><Users className="h-4.5 w-4.5" /></span>
							</div>
							<div className="mt-2">
								<span className="text-3xl font-bold text-text-primary tracking-tight">{driversOnDuty}</span>
								<div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-medium">
									<TrendingUp className="h-3 w-3" />
									<span>+3 new drivers today</span>
								</div>
							</div>
						</div>

						<div className="bg-bg-card p-5 rounded-[22px] border border-border-custom shadow-custom transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group">
							<div className="absolute top-0 left-0 h-1.5 w-full bg-emerald-600" />
							<div className="flex justify-between items-start">
								<span className="text-xs font-semibold uppercase tracking-wider text-text-secondary text-left leading-tight">Fleet Util.</span>
								<span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600"><BarChart3 className="h-4.5 w-4.5" /></span>
							</div>
							<div className="mt-2">
								<span className="text-3xl font-bold text-text-primary tracking-tight">{fleetUtilization}%</span>
								<div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-medium">
									<TrendingUp className="h-3 w-3" />
									<span>Optimal range (+5%)</span>
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 bg-bg-card rounded-[24px] border border-border-custom shadow-custom p-6 transition-all duration-300">
							<div className="flex justify-between items-center mb-6">
								<div>
									<h2 className="text-lg font-bold text-text-primary">Recent Trips</h2>
									<span className="text-xs text-text-secondary">Showing {filteredTrips.length} entries</span>
								</div>
								<span className="text-xs text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full font-semibold">Live Feed</span>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="border-b border-border-custom text-xs text-text-secondary font-semibold uppercase tracking-wider">
											<th className="pb-3.5 pl-4">Trip</th>
											<th className="pb-3.5">Vehicle</th>
											<th className="pb-3.5">Driver</th>
											<th className="pb-3.5">Status</th>
											<th className="pb-3.5 pr-4">ETA</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border-custom/50 text-sm">
										{filteredTrips.length === 0 ? (
											<tr>
												<td colSpan={5} className="py-8 text-center text-text-secondary">
													No trips matched your search or filters.
												</td>
											</tr>
										) : (
											filteredTrips.map((trip) => (
												<tr key={trip.id} className="group hover:bg-bg-main/40 transition-colors duration-150">
													<td className="py-3.5 pl-4 font-bold text-text-primary group-hover:text-brand-orange transition-colors">
														{trip.id}
													</td>
													<td className="py-3.5 font-medium text-text-primary">
														{trip.vehicle === '—' ? (
															<span className="text-slate-400 font-normal">{trip.vehicle}</span>
														) : (
															<div className="flex items-center gap-1.5">
																<Truck className="h-4 w-4 text-text-secondary" />
																<span>{trip.vehicle}</span>
															</div>
														)}
													</td>
													<td className="py-3.5 font-medium text-text-primary">{trip.driver}</td>
													<td className="py-3.5">
														<span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg ${statusStyles[trip.status] || 'bg-slate-100 text-slate-800'}`}>
															{trip.status}
														</span>
													</td>
													<td className="py-3.5 pr-4 text-text-secondary font-medium">
														{trip.eta === '—' || trip.eta === 'Awaiting vehicle' ? (
															<span className="text-slate-400 font-normal">{trip.eta}</span>
														) : (
															<span>{trip.eta}</span>
														)}
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>

						<div className="bg-bg-card rounded-[24px] border border-border-custom shadow-custom p-6 transition-all duration-300 flex flex-col justify-between">
							<div>
								<h2 className="text-lg font-bold text-text-primary mb-1">Vehicle Status</h2>
								<p className="text-xs text-text-secondary mb-6">Active distribution of the operational fleet</p>

								<div className="space-y-5">
									<div>
										<div className="flex justify-between items-center text-xs font-semibold mb-1.5">
											<span className="text-text-primary">Available</span>
											<span className="text-emerald-500">42 Vehicles (63%)</span>
										</div>
										<div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
											<div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '63%' }} />
										</div>
									</div>

									<div>
										<div className="flex justify-between items-center text-xs font-semibold mb-1.5">
											<span className="text-text-primary">On Trip</span>
											<span className="text-blue-500">18 Vehicles (27%)</span>
										</div>
										<div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
											<div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '27%' }} />
										</div>
									</div>

									<div>
										<div className="flex justify-between items-center text-xs font-semibold mb-1.5">
											<span className="text-text-primary">In Shop</span>
											<span className="text-brand-orange">5 Vehicles (7%)</span>
										</div>
										<div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
											<div className="bg-brand-orange h-full rounded-full transition-all duration-500" style={{ width: '7%' }} />
										</div>
									</div>

									<div>
										<div className="flex justify-between items-center text-xs font-semibold mb-1.5">
											<span className="text-text-primary">Retired</span>
											<span className="text-rose-500">2 Vehicles (3%)</span>
										</div>
										<div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
											<div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: '3%' }} />
										</div>
									</div>
								</div>
							</div>

							<div className="mt-8 pt-4 border-t border-border-custom/60 flex items-center justify-between text-xs">
								<span className="text-text-secondary font-medium">Total Fleet Capacity</span>
								<span className="font-bold text-text-primary">67 Registered</span>
							</div>
						</div>
					</div>
				</>
			)}

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
					<div className="relative w-full max-w-md bg-bg-card rounded-[26px] border border-border-custom p-6 shadow-2xl animate-scale-up">
						<div className="flex justify-between items-center mb-6">
							<div>
								<h3 className="text-lg font-bold text-text-primary">Dispatch New Trip</h3>
								<p className="text-xs text-text-secondary">Register a route and assign a vehicle to service</p>
							</div>
							<button
								onClick={onCloseModal}
								className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-main transition-all cursor-pointer"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={onDispatchSubmit} className="space-y-4 text-left">
							<div>
								<label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Trip ID</label>
								<input
									type="text"
									value={newTripId}
									disabled
									className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-main border border-border-custom text-text-secondary focus:outline-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Vehicle Tag</label>
									<select
										value={newVehicle}
										onChange={(e) => onNewVehicleChange(e.target.value)}
										required
										className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer"
									>
										<option value="">Select vehicle...</option>
										{vehicles
											.filter((v) => v.status === 'Available')
											.map((v) => (
												<option key={v.regNo} value={v.nameModel}>
													{v.nameModel} ({v.type})
												</option>
											))}
									</select>
								</div>

								<div>
									<label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Type</label>
									<select
										value={newVehicleType}
										onChange={(e) => onNewVehicleTypeChange(e.target.value as 'Van' | 'Truck' | 'Mini' | 'Sedan')}
										className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer"
									>
										<option value="Van">Van</option>
										<option value="Truck">Truck</option>
										<option value="Mini">Mini</option>
										<option value="Sedan">Sedan</option>
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Driver Name</label>
									<input
										type="text"
										placeholder="e.g. Clara"
										value={newDriver}
										onChange={(e) => onNewDriverChange(e.target.value)}
										required
										className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
									/>
								</div>

								<div>
									<label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Region</label>
									<select
										value={newRegion}
										onChange={(e) => onNewRegionChange(e.target.value as 'North' | 'South' | 'East' | 'West')}
										className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer"
									>
										<option value="North">North</option>
										<option value="South">South</option>
										<option value="East">East</option>
										<option value="West">West</option>
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-semibold text-text-secondary uppercase mb-1">ETA</label>
									<input
										type="text"
										placeholder="e.g. 50 min"
										value={newEta}
										onChange={(e) => onNewEtaChange(e.target.value)}
										className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
									/>
								</div>

								<div>
									<label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Status</label>
									<select
										value={newStatus}
										onChange={(e) => onNewStatusChange(e.target.value as 'On Trip' | 'Completed' | 'Dispatched' | 'Draft')}
										className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer"
									>
										<option value="Dispatched">Dispatched</option>
										<option value="On Trip">On Trip</option>
										<option value="Draft">Draft</option>
									</select>
								</div>
							</div>

							<div className="flex gap-3.5 pt-4">
								<button
									type="button"
									onClick={onCloseModal}
									className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-border-custom hover:bg-bg-main transition-colors text-center text-text-primary cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-brand-orange text-white hover:bg-brand-orange-hover transition-colors text-center cursor-pointer shadow-lg shadow-orange-500/10"
								>
									Dispatch
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}

export default Dashboard
