import React, { useState } from 'react'
import { Plus, Search, X, Truck, ArrowUpDown } from 'lucide-react'


export interface Vehicle {
    regNo: string
    nameModel: string
    type: 'Van' | 'Truck' | 'Mini' | 'Sedan'
    capacity: string
    odometer: number
    acqCost: number
    status: 'Available' | 'On Trip' | 'In Shop' | 'Retired'
}


type FleetProps = {
    vehicles: Vehicle[]
    setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>
}


// Indian numbering system formatter (e.g., 620000 -> 6,20,000)
const formatIndianNumber = (num: number): string => {
    const x = num.toString()
    let lastThree = x.substring(x.length - 3)
    const otherNumbers = x.substring(0, x.length - 3)
    if (otherNumbers !== '') {
        lastThree = ',' + lastThree
    }
    const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
    return res
}


function Fleet({ vehicles, setVehicles }: FleetProps) {
    // Filter State
    const [filterType, setFilterType] = useState<string>('All')
    const [filterStatus, setFilterStatus] = useState<string>('All')
    const [searchRegNo, setSearchRegNo] = useState<string>('')


    // Sorting State
    const [sortField, setSortField] = useState<keyof Vehicle | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')


    // Add Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newRegNo, setNewRegNo] = useState('')
    const [newNameModel, setNewNameModel] = useState('')
    const [newType, setNewType] = useState<'Van' | 'Truck' | 'Mini' | 'Sedan'>('Van')
    const [newCapacity, setNewCapacity] = useState('')
    const [newOdometer, setNewOdometer] = useState('')
    const [newAcqCost, setNewAcqCost] = useState('')
    const [newStatus, setNewStatus] = useState<'Available' | 'On Trip' | 'In Shop' | 'Retired'>('Available')
    const [validationError, setValidationError] = useState<string | null>(null)


    // Status colors mapping matching Dashboard.tsx styles
    const statusStyles = {
        Available: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30',
        'On Trip': 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30',
        'In Shop': 'bg-orange-50 dark:bg-orange-950/40 text-brand-orange dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30',
        Retired: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30'
    } as const


    // Handle sort click
    const handleSort = (field: keyof Vehicle) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }


    // Submit Add Vehicle Form
    const handleAddVehicle = (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError(null)


        const formattedRegNo = newRegNo.trim().toUpperCase()
        const formattedNameModel = newNameModel.trim()


        if (!formattedRegNo || !formattedNameModel || !newCapacity.trim() || !newOdometer || !newAcqCost) {
            setValidationError('Please fill out all fields.')
            return
        }


        // Check for uniqueness
        const exists = vehicles.some((v) => v.regNo === formattedRegNo)
        if (exists) {
            setValidationError(`Registration Number "${formattedRegNo}" already exists in the registry. It must be unique.`)
            return
        }


        const parsedOdometer = parseInt(newOdometer)
        const parsedAcqCost = parseInt(newAcqCost)


        if (isNaN(parsedOdometer) || parsedOdometer < 0) {
            setValidationError('Odometer must be a valid positive number.')
            return
        }


        if (isNaN(parsedAcqCost) || parsedAcqCost < 0) {
            setValidationError('Acquisition Cost must be a valid positive number.')
            return
        }


        const newVehicleItem: Vehicle = {
            regNo: formattedRegNo,
            nameModel: formattedNameModel,
            type: newType,
            capacity: newCapacity.trim(),
            odometer: parsedOdometer,
            acqCost: parsedAcqCost,
            status: newStatus
        }


        setVehicles([newVehicleItem, ...vehicles])


        // Reset form and close
        setNewRegNo('')
        setNewNameModel('')
        setNewType('Van')
        setNewCapacity('')
        setNewOdometer('')
        setNewAcqCost('')
        setNewStatus('Available')
        setIsAddModalOpen(false)
    }


    // Filter vehicles
    const filteredVehicles = vehicles.filter((v) => {
        const matchesType = filterType === 'All' || v.type === filterType
        const matchesStatus = filterStatus === 'All' || v.status === filterStatus
        const matchesSearch = v.regNo.toLowerCase().includes(searchRegNo.toLowerCase())
        return matchesType && matchesStatus && matchesSearch
    })


    // Sort vehicles
    const sortedVehicles = [...filteredVehicles].sort((a, b) => {
        if (!sortField) return 0
        const valA = a[sortField]
        const valB = b[sortField]


        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortDirection === 'asc' ? valA - valB : valB - valA
        }


        return sortDirection === 'asc'
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA))
    })


    return (
        <div className="space-y-6">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-bg-card rounded-[22px] border border-border-custom shadow-custom transition-all duration-300">
                <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider pl-2">
                    Filters & Search
                </div>


                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">Type:</span>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="text-sm bg-bg-main border border-border-custom rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange cursor-pointer text-text-primary"
                    >
                        <option value="All">All Types</option>
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
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm bg-bg-main border border-border-custom rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange cursor-pointer text-text-primary"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="In Shop">In Shop</option>
                        <option value="Retired">Retired</option>
                    </select>
                </div>


                <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search reg. no..."
                        value={searchRegNo}
                        onChange={(e) => setSearchRegNo(e.target.value)}
                        className="block w-full pl-10 pr-4 py-1.5 text-sm rounded-xl bg-bg-main border border-border-custom text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200"
                    />
                </div>


                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover active:scale-95 rounded-2xl shadow-lg shadow-orange-500/20 transition-all duration-200 cursor-pointer ml-auto"
                >
                    <Plus className="h-4.5 w-4.5" />
                    <span>+ Add Vehicle</span>
                </button>
            </div>


            {/* Data Table */}
            <div className="bg-bg-card rounded-[24px] border border-border-custom shadow-custom p-6 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">Fleet Registry</h2>
                        <span className="text-xs text-text-secondary">Showing {sortedVehicles.length} vehicles</span>
                    </div>
                    <span className="text-xs text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full font-semibold">Active Inventory</span>
                </div>


                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-custom text-xs text-text-secondary font-semibold uppercase tracking-wider select-none">
                                <th className="pb-3.5 pl-4 cursor-pointer hover:text-text-primary transition-colors" onClick={() => handleSort('regNo')}>
                                    <div className="flex items-center gap-1">
                                        REG. NO. (UNIQUE)
                                        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                                    </div>
                                </th>
                                <th className="pb-3.5 cursor-pointer hover:text-text-primary transition-colors" onClick={() => handleSort('nameModel')}>
                                    <div className="flex items-center gap-1">
                                        NAME/MODEL
                                        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                                    </div>
                                </th>
                                <th className="pb-3.5 cursor-pointer hover:text-text-primary transition-colors" onClick={() => handleSort('type')}>
                                    <div className="flex items-center gap-1">
                                        TYPE
                                        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                                    </div>
                                </th>
                                <th className="pb-3.5">CAPACITY</th>
                                <th className="pb-3.5 cursor-pointer hover:text-text-primary transition-colors text-right pr-4" onClick={() => handleSort('odometer')}>
                                    <div className="flex items-center gap-1 justify-end">
                                        ODOMETER
                                        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                                    </div>
                                </th>
                                <th className="pb-3.5 cursor-pointer hover:text-text-primary transition-colors text-right pr-4" onClick={() => handleSort('acqCost')}>
                                    <div className="flex items-center gap-1 justify-end">
                                        ACQ. COST
                                        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                                    </div>
                                </th>
                                <th className="pb-3.5 pr-4">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom/50 text-sm">
                            {sortedVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-text-secondary">
                                        No vehicles matched your search or filters.
                                    </td>
                                </tr>
                            ) : (
                                sortedVehicles.map((vehicle) => (
                                    <tr key={vehicle.regNo} className="group hover:bg-bg-main/40 transition-colors duration-150">
                                        <td className="py-3.5 pl-4 font-bold text-text-primary group-hover:text-brand-orange transition-colors">
                                            {vehicle.regNo}
                                        </td>
                                        <td className="py-3.5 font-medium text-text-primary">
                                            <div className="flex items-center gap-1.5">
                                                <Truck className="h-4 w-4 text-text-secondary" />
                                                <span>{vehicle.nameModel}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 text-text-secondary font-medium">{vehicle.type}</td>
                                        <td className="py-3.5 text-text-secondary font-medium">{vehicle.capacity}</td>
                                        <td className="py-3.5 text-right pr-4 text-text-primary font-bold">
                                            {formatIndianNumber(vehicle.odometer)} km
                                        </td>
                                        <td className="py-3.5 text-right pr-4 text-text-primary font-bold">
                                            ₹ {formatIndianNumber(vehicle.acqCost)}
                                        </td>
                                        <td className="py-3.5 pr-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg ${statusStyles[vehicle.status]}`}>
                                                {vehicle.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                {/* Rule Warning/Footnote */}
                <div className="mt-6 pt-4 border-t border-border-custom/60 text-xs text-brand-orange font-semibold tracking-wide">
                    Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatch
                </div>
            </div>


            {/* Add Vehicle Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-md bg-bg-card rounded-[26px] border border-border-custom p-6 shadow-2xl animate-scale-up">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-text-primary">Add New Vehicle</h3>
                                <p className="text-xs text-text-secondary">Register a new fleet asset into the vehicle database</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false)
                                    setValidationError(null)
                                }}
                                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-main transition-all cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>


                        <form onSubmit={handleAddVehicle} className="space-y-4 text-left">
                            {validationError && (
                                <div className="p-3.5 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 rounded-xl">
                                    {validationError}
                                </div>
                            )}


                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Registration No. (Unique)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. GJ01AB452"
                                    value={newRegNo}
                                    onChange={(e) => setNewRegNo(e.target.value)}
                                    required
                                    className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
                                />
                            </div>


                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Name/Model</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. VAN-05"
                                        value={newNameModel}
                                        onChange={(e) => setNewNameModel(e.target.value)}
                                        required
                                        className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
                                    />
                                </div>


                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Type</label>
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value as 'Van' | 'Truck' | 'Mini' | 'Sedan')}
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
                                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Capacity</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 500 kg or 5 Ton"
                                        value={newCapacity}
                                        onChange={(e) => setNewCapacity(e.target.value)}
                                        required
                                        className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
                                    />
                                </div>


                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Status</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value as 'Available' | 'On Trip' | 'In Shop' | 'Retired')}
                                        className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="On Trip">On Trip</option>
                                        <option value="In Shop">In Shop</option>
                                        <option value="Retired">Retired</option>
                                    </select>
                                </div>
                            </div>


                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Odometer (km)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 74000"
                                        value={newOdometer}
                                        onChange={(e) => setNewOdometer(e.target.value)}
                                        required
                                        min="0"
                                        className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
                                    />
                                </div>


                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Acq. Cost (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 620000"
                                        value={newAcqCost}
                                        onChange={(e) => setNewAcqCost(e.target.value)}
                                        required
                                        min="0"
                                        className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
                                    />
                                </div>
                            </div>


                            <div className="flex gap-3.5 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false)
                                        setValidationError(null)
                                    }}
                                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-border-custom hover:bg-bg-main transition-colors text-center text-text-primary cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-brand-orange text-white hover:bg-brand-orange-hover transition-colors text-center cursor-pointer shadow-lg shadow-orange-500/10"
                                >
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Fleet

