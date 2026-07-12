import React, { useState } from 'react'
import { Search, Plus, X, Edit, User, Phone, Calendar, Shield, CreditCard, Star } from 'lucide-react'

export interface Driver {
	id: string
	name: string
	licenseNo: string
	category: 'LMV' | 'HMV'
	expiryDate: string // Format: YYYY-MM-DD or MM/YYYY
	contact: string
	safetyScore: number // out of 100
	status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended'
}

type DriversProps = {
	drivers: Driver[]
	setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>
}

// Utility to check if expiry date is in the past compared to July 12, 2026
export const isLicenseExpired = (expiryDateStr: string): boolean => {
	if (!expiryDateStr) return false

	const currentDate = new Date('2026-07-12')

	// Check MM/YYYY format
	const mmYyyyRegex = /^(\d{1,2})\/(\d{4})$/
	const match = expiryDateStr.match(mmYyyyRegex)
	if (match) {
		const month = parseInt(match[1], 10)
		const year = parseInt(match[2], 10)
		// Last day of the month
		const expiryDate = new Date(year, month, 0)
		return expiryDate < currentDate
	}

	// Check YYYY-MM-DD format
	const d = new Date(expiryDateStr)
	if (!isNaN(d.getTime())) {
		return d < currentDate
	}

	return false
}

// Utility to display dates in MM/YYYY format
export const formatDisplayDate = (dateStr: string): string => {
	if (!dateStr) return '—'

	if (/^\d{1,2}\/\d{4}$/.test(dateStr)) {
		return dateStr
	}

	if (dateStr.includes('-')) {
		const parts = dateStr.split('-')
		if (parts.length >= 2) {
			const year = parts[0]
			const month = parts[1]
			return `${month}/${year}`
		}
	}

	const d = new Date(dateStr)
	if (!isNaN(d.getTime())) {
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const year = d.getFullYear()
		return `${month}/${year}`
	}

	return dateStr
}

function Drivers({ drivers, setDrivers }: DriversProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [activeFilterStatus, setActiveFilterStatus] = useState<string>('All')

	// Edit modal state
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
	const [editContact, setEditContact] = useState('')
	const [editStatus, setEditStatus] = useState<Driver['status']>('Available')
	const [editLicenseNo, setEditLicenseNo] = useState('')
	const [editCategory, setEditCategory] = useState<'LMV' | 'HMV'>('LMV')
	const [editExpiryDate, setEditExpiryDate] = useState('')

	// Add modal state
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [newName, setNewName] = useState('')
	const [newContact, setNewContact] = useState('')
	const [newStatus, setNewStatus] = useState<Driver['status']>('Available')
	const [newLicenseNo, setNewLicenseNo] = useState('')
	const [newCategory, setNewCategory] = useState<'LMV' | 'HMV'>('LMV')
	const [newExpiryDate, setNewExpiryDate] = useState('')
	const [newSafetyScore, setNewSafetyScore] = useState('90')

	const [validationError, setValidationError] = useState<string | null>(null)

	// Status badge style configuration
	const statusStyles = {
		Available: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30',
		'On Trip': 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30',
		'Off Duty': 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50',
		Suspended: 'bg-orange-50 dark:bg-orange-950/40 text-brand-orange dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30'
	} as const

	// Open Edit Modal
	const handleOpenEdit = (driver: Driver) => {
		setSelectedDriver(driver)
		setEditContact(driver.contact)
		setEditLicenseNo(driver.licenseNo)
		setEditCategory(driver.category)
		
		// Convert expiry date to YYYY-MM-DD if MM/YYYY for input type="date"
		let rawDate = driver.expiryDate
		if (/^\d{2}\/\d{4}$/.test(rawDate)) {
			const [mm, yyyy] = rawDate.split('/')
			rawDate = `${yyyy}-${mm}-28` // Approximate date to allow editing in standard picker
		}
		setEditExpiryDate(rawDate)
		
		// Force status to Suspended if license is already expired, otherwise use driver status
		const expired = isLicenseExpired(driver.expiryDate)
		setEditStatus(expired ? 'Suspended' : driver.status)
		setValidationError(null)
		setIsEditModalOpen(true)
	}

	// Submit Edit Driver form
	const handleEditSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedDriver) return

		if (!editContact.trim() || !editLicenseNo.trim() || !editExpiryDate.trim()) {
			setValidationError('Please fill out all fields.')
			return
		}

		// Check if updated license is expired
		const expired = isLicenseExpired(editExpiryDate)
		const finalStatus = expired ? 'Suspended' : editStatus

		setDrivers((prev) =>
			prev.map((d) =>
				d.id === selectedDriver.id
					? {
							...d,
							contact: editContact.trim(),
							licenseNo: editLicenseNo.trim(),
							category: editCategory,
							expiryDate: editExpiryDate,
							status: finalStatus
					  }
					: d
			)
		)

		setIsEditModalOpen(false)
		setSelectedDriver(null)
	}

	// Submit Add Driver form
	const handleAddSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setValidationError(null)

		const scoreNum = parseInt(newSafetyScore, 10)

		if (!newName.trim() || !newContact.trim() || !newLicenseNo.trim() || !newExpiryDate.trim() || isNaN(scoreNum)) {
			setValidationError('Please fill out all fields correctly.')
			return
		}

		if (scoreNum < 0 || scoreNum > 100) {
			setValidationError('Safety Score must be between 0 and 100.')
			return
		}

		// Expiry Logic: Auto force to Suspended if the date is in the past
		const expired = isLicenseExpired(newExpiryDate)
		const finalStatus = expired ? 'Suspended' : newStatus

		const nextId = `DRV${(drivers.length + 1).toString().padStart(3, '0')}`
		const newDriverItem: Driver = {
			id: nextId,
			name: newName.trim(),
			contact: newContact.trim(),
			licenseNo: newLicenseNo.trim(),
			category: newCategory,
			expiryDate: newExpiryDate,
			safetyScore: scoreNum,
			status: finalStatus
		}

		setDrivers([newDriverItem, ...drivers])

		// Reset form
		setNewName('')
		setNewContact('')
		setNewStatus('Available')
		setNewLicenseNo('')
		setNewCategory('LMV')
		setNewExpiryDate('')
		setNewSafetyScore('90')
		setIsAddModalOpen(false)
	}

	// Filter and Search logic
	const filteredDrivers = drivers.filter((driver) => {
		const matchesSearch =
			driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			driver.licenseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
			driver.contact.toLowerCase().includes(searchQuery.toLowerCase())

		// Effective status check (license expired forces status to Suspended)
		const expired = isLicenseExpired(driver.expiryDate)
		const effectiveStatus = expired ? 'Suspended' : driver.status

		const matchesFilterStatus = activeFilterStatus === 'All' || effectiveStatus === activeFilterStatus

		return matchesSearch && matchesFilterStatus
	})

	const getSafetyColorClass = (score: number) => {
		if (score >= 85) return 'bg-emerald-500'
		if (score >= 70) return 'bg-amber-500'
		return 'bg-rose-500'
	}

	const getSafetyTextClass = (score: number) => {
		if (score >= 85) return 'text-emerald-600 dark:text-emerald-400'
		if (score >= 70) return 'text-amber-600 dark:text-amber-400'
		return 'text-rose-600 dark:text-rose-400'
	}

	return (
		<div className="space-y-6">
			{/* Top Action Bar */}
			<div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-bg-card rounded-[22px] border border-border-custom shadow-custom transition-all duration-300">
				<div className="flex items-center gap-3 pl-2 flex-1 min-w-[280px]">
					<div className="relative w-full max-w-md">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
						<input
							type="text"
							placeholder="Search by name, license, contact..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-bg-main border border-border-custom text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange placeholder-text-secondary transition-all"
						/>
					</div>
				</div>

				<button
					onClick={() => {
						setValidationError(null)
						setIsAddModalOpen(true)
					}}
					className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-orange text-white hover:bg-brand-orange-hover transition-colors shadow-md shadow-orange-500/10 cursor-pointer"
				>
					<Plus className="h-4 w-4" />
					<span>Add Driver</span>
				</button>
			</div>

			{/* Main Grid Table Container */}
			<div className="bg-bg-card rounded-[24px] border border-border-custom shadow-custom p-6 transition-all duration-300">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-border-custom text-xs text-text-secondary font-semibold uppercase tracking-wider">
								<th className="pb-3.5 pl-4">Driver</th>
								<th className="pb-3.5">License No.</th>
								<th className="pb-3.5">Category</th>
								<th className="pb-3.5">Expiry</th>
								<th className="pb-3.5">Contact</th>
								<th className="pb-3.5">Safety Score</th>
								<th className="pb-3.5">Status</th>
								<th className="pb-3.5 pr-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border-custom/50 text-sm">
							{filteredDrivers.length === 0 ? (
								<tr>
									<td colSpan={8} className="py-12 text-center text-text-secondary font-medium">
										No drivers found matching search queries or filters.
									</td>
								</tr>
							) : (
								filteredDrivers.map((driver) => {
									const expired = isLicenseExpired(driver.expiryDate)
									const effectiveStatus = expired ? 'Suspended' : driver.status

									return (
										<tr key={driver.id} className="group hover:bg-bg-main/40 transition-colors duration-150">
											{/* Name avatar representation */}
											<td className="py-3.5 pl-4 font-bold text-text-primary">
												<div className="flex items-center gap-3">
													<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm border border-border-custom uppercase">
														{driver.name.substring(0, 2)}
													</div>
													<div className="flex flex-col">
														<span className="group-hover:text-brand-orange transition-colors duration-150">
															{driver.name}
														</span>
														<span className="text-[10px] text-text-secondary font-normal font-sans">
															{driver.id}
														</span>
													</div>
												</div>
											</td>
											<td className="py-3.5 font-medium text-text-primary">{driver.licenseNo}</td>
											<td className="py-3.5 font-semibold">
												<span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-md text-text-secondary border border-border-custom">
													{driver.category}
												</span>
											</td>
											<td className="py-3.5 font-medium text-text-primary">
												<div className="flex items-center gap-2">
													<span>{formatDisplayDate(driver.expiryDate)}</span>
													{expired && (
														<span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30">
															EXPIRED
														</span>
													)}
												</div>
											</td>
											<td className="py-3.5 text-text-secondary font-medium font-sans">
												{driver.contact}
											</td>
											<td className="py-3.5">
												<div className="flex flex-col gap-1 w-28">
													<div className="flex justify-between items-center text-[11px] font-semibold">
														<span className={getSafetyTextClass(driver.safetyScore)}>
															{driver.safetyScore}%
														</span>
													</div>
													<div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
														<div
															className={`${getSafetyColorClass(driver.safetyScore)} h-full rounded-full transition-all duration-500`}
															style={{ width: `${driver.safetyScore}%` }}
														/>
													</div>
												</div>
											</td>
											<td className="py-3.5">
												<span
													className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg ${
														statusStyles[effectiveStatus] || 'bg-slate-100 text-slate-800'
													}`}
												>
													{effectiveStatus}
												</span>
											</td>
											<td className="py-3.5 pr-4 text-right">
												<button
													onClick={() => handleOpenEdit(driver)}
													className="p-1.5 rounded-lg text-text-secondary hover:text-brand-orange hover:bg-bg-main/60 transition-all cursor-pointer"
													title="Edit Driver"
												>
													<Edit className="h-4.5 w-4.5" />
												</button>
											</td>
										</tr>
									)
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* BOTTOM STATUS TOGGLE FILTER BUTTONS */}
			<div className="flex flex-col gap-3 p-5 bg-bg-card rounded-[22px] border border-border-custom shadow-custom transition-all duration-300">
				<div className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">
					Toggle Status Filter
				</div>
				<div className="flex flex-wrap gap-3">
					<button
						onClick={() => setActiveFilterStatus('All')}
						className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
							activeFilterStatus === 'All'
								? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-700'
								: 'bg-transparent text-text-secondary border-border-custom hover:bg-bg-main'
						}`}
					>
						All Drivers
					</button>

					<button
						onClick={() => setActiveFilterStatus(activeFilterStatus === 'Available' ? 'All' : 'Available')}
						className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
							activeFilterStatus === 'Available'
								? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
								: 'bg-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/25'
						}`}
					>
						Available
					</button>

					<button
						onClick={() => setActiveFilterStatus(activeFilterStatus === 'On Trip' ? 'All' : 'On Trip')}
						className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
							activeFilterStatus === 'On Trip'
								? 'bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-500/20'
								: 'bg-transparent text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-50/20 dark:hover:bg-blue-950/25'
						}`}
					>
						On Trip
					</button>

					<button
						onClick={() => setActiveFilterStatus(activeFilterStatus === 'Off Duty' ? 'All' : 'Off Duty')}
						className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
							activeFilterStatus === 'Off Duty'
								? 'bg-slate-500 text-white border-slate-600 shadow-md shadow-slate-500/20'
								: 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-500/30 hover:bg-slate-50/20 dark:hover:bg-slate-800/25'
						}`}
					>
						Off Duty
					</button>

					<button
						onClick={() => setActiveFilterStatus(activeFilterStatus === 'Suspended' ? 'All' : 'Suspended')}
						className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
							activeFilterStatus === 'Suspended'
								? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
								: 'bg-transparent text-brand-orange border-orange-500/30 hover:bg-orange-50/20 dark:hover:bg-orange-950/25'
						}`}
					>
						Suspended
					</button>
				</div>
				<div className="text-[11px] text-text-secondary pl-1 font-medium italic">
					Rule: Expired license or Suspended status → blocked from trip assignment
				</div>
			</div>

			{/* EDIT DRIVER MODAL */}
			{isEditModalOpen && selectedDriver && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="relative w-full max-w-md bg-bg-card rounded-[26px] border border-border-custom p-6 shadow-2xl animate-scale-up text-left">
						<div className="flex justify-between items-center mb-5">
							<div>
								<h3 className="text-lg font-bold text-text-primary">Edit Driver Profile</h3>
								<p className="text-xs text-text-secondary">Update credentials and operation status</p>
							</div>
							<button
								onClick={() => setIsEditModalOpen(false)}
								className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-main transition-all cursor-pointer"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{validationError && (
							<div className="p-3 mb-4 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30">
								{validationError}
							</div>
						)}

						<form onSubmit={handleEditSubmit} className="space-y-4">
							<div>
								<label className="block text-xs font-bold text-text-secondary uppercase mb-1">Driver Name</label>
								<div className="flex items-center gap-2 px-3.5 py-2 text-sm rounded-xl bg-bg-main border border-border-custom text-text-secondary">
									<User className="h-4 w-4" />
									<span>{selectedDriver.name}</span>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-text-secondary uppercase mb-1">Contact Number</label>
								<div className="relative">
									<Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
									<input
										type="text"
										value={editContact}
										onChange={(e) => setEditContact(e.target.value)}
										required
										className="block w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-bold text-text-secondary uppercase mb-1">License No.</label>
									<div className="relative">
										<CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
										<input
											type="text"
											value={editLicenseNo}
											onChange={(e) => setEditLicenseNo(e.target.value)}
											required
											className="block w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
										/>
									</div>
								</div>

								<div>
									<label className="block text-xs font-bold text-text-secondary uppercase mb-1">Category</label>
									<select
										value={editCategory}
										onChange={(e) => setEditCategory(e.target.value as 'LMV' | 'HMV')}
										className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer"
									>
										<option value="LMV">LMV (Light)</option>
										<option value="HMV">HMV (Heavy)</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-text-secondary uppercase mb-1">License Expiry Date</label>
								<div className="relative">
									<Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
									<input
										type="date"
										value={editExpiryDate}
										onChange={(e) => {
											setEditExpiryDate(e.target.value)
											if (isLicenseExpired(e.target.value)) {
												setEditStatus('Suspended')
											}
										}}
										required
										className="block w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
									/>
								</div>
								{isLicenseExpired(editExpiryDate) && (
									<p className="mt-1 text-[11px] text-rose-500 font-semibold flex items-center gap-1">
										<Shield className="h-3 w-3" />
										License is expired! Status is locked to Suspended.
									</p>
								)}
							</div>

							<div>
								<label className="block text-xs font-bold text-text-secondary uppercase mb-1">Status</label>
								<select
									value={isLicenseExpired(editExpiryDate) ? 'Suspended' : editStatus}
									onChange={(e) => setEditStatus(e.target.value as Driver['status'])}
									disabled={isLicenseExpired(editExpiryDate)}
									className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer disabled:bg-bg-main disabled:text-text-secondary disabled:cursor-not-allowed"
								>
									<option value="Available">Available</option>
									<option value="On Trip">On Trip</option>
									<option value="Off Duty">Off Duty</option>
									<option value="Suspended">Suspended</option>
								</select>
							</div>

							<div className="flex gap-3.5 pt-4">
								<button
									type="button"
									onClick={() => setIsEditModalOpen(false)}
									className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-border-custom hover:bg-bg-main transition-colors text-center text-text-primary cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-brand-orange text-white hover:bg-brand-orange-hover transition-colors text-center cursor-pointer shadow-lg shadow-orange-500/10"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ADD DRIVER MODAL */}
			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="relative w-full max-w-md bg-bg-card rounded-[26px] border border-border-custom p-6 shadow-2xl animate-scale-up text-left">
						<div className="flex justify-between items-center mb-5">
							<div>
								<h3 className="text-lg font-bold text-text-primary">Add New Driver</h3>
								<p className="text-xs text-text-secondary">Register a new driver profile to the fleet pool</p>
							</div>
							<button
								onClick={() => setIsAddModalOpen(false)}
								className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-main transition-all cursor-pointer"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{validationError && (
							<div className="p-3 mb-4 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30">
								{validationError}
							</div>
						)}

						<form onSubmit={handleAddSubmit} className="space-y-4">
							<div>
								<label className="block text-xs font-bold text-text-secondary uppercase mb-1">Driver Name</label>
								<div className="relative">
									<User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
									<input
										type="text"
										placeholder="e.g. Marcus"
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										required
										className="block w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
									/>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-text-secondary uppercase mb-1">Contact Number</label>
								<div className="relative">
									<Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
									<input
										type="text"
										placeholder="e.g. 9876543210"
										value={newContact}
										onChange={(e) => setNewContact(e.target.value)}
										required
										className="block w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-bold text-text-secondary uppercase mb-1">License No.</label>
									<div className="relative">
										<CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
										<input
											type="text"
											placeholder="e.g. DL-88213"
											value={newLicenseNo}
											onChange={(e) => setNewLicenseNo(e.target.value)}
											required
											className="block w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
										/>
									</div>
								</div>

								<div>
									<label className="block text-xs font-bold text-text-secondary uppercase mb-1">Category</label>
									<select
										value={newCategory}
										onChange={(e) => setNewCategory(e.target.value as 'LMV' | 'HMV')}
										className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer"
									>
										<option value="LMV">LMV (Light)</option>
										<option value="HMV">HMV (Heavy)</option>
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-bold text-text-secondary uppercase mb-1">License Expiry Date</label>
									<div className="relative">
										<Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
										<input
											type="date"
											value={newExpiryDate}
											onChange={(e) => {
												setNewExpiryDate(e.target.value)
												if (isLicenseExpired(e.target.value)) {
													setNewStatus('Suspended')
												}
											}}
											required
											className="block w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
										/>
									</div>
								</div>

								<div>
									<label className="block text-xs font-bold text-text-secondary uppercase mb-1">Safety Score (0-100)</label>
									<div className="relative">
										<Star className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
										<input
											type="number"
											min="0"
											max="100"
											value={newSafetyScore}
											onChange={(e) => setNewSafetyScore(e.target.value)}
											required
											className="block w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
										/>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-text-secondary uppercase mb-1">Status</label>
								<select
									value={isLicenseExpired(newExpiryDate) ? 'Suspended' : newStatus}
									onChange={(e) => setNewStatus(e.target.value as Driver['status'])}
									disabled={isLicenseExpired(newExpiryDate)}
									className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer disabled:bg-bg-main disabled:text-text-secondary disabled:cursor-not-allowed"
								>
									<option value="Available">Available</option>
									<option value="On Trip">On Trip</option>
									<option value="Off Duty">Off Duty</option>
									<option value="Suspended">Suspended</option>
								</select>
								{isLicenseExpired(newExpiryDate) && (
									<p className="mt-1 text-[11px] text-rose-500 font-semibold flex items-center gap-1">
										<Shield className="h-3 w-3" />
										License is expired! Status is locked to Suspended.
									</p>
								)}
							</div>

							<div className="flex gap-3.5 pt-4">
								<button
									type="button"
									onClick={() => setIsAddModalOpen(false)}
									className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-border-custom hover:bg-bg-main transition-colors text-center text-text-primary cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-brand-orange text-white hover:bg-brand-orange-hover transition-colors text-center cursor-pointer shadow-lg shadow-orange-500/10"
								>
									Create Profile
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default Drivers
