import React, { useState } from 'react'
import { Plus, Search, X, Shield, Settings, Activity, ArrowUpDown, Info, Truck, CheckCircle } from 'lucide-react'

export interface Vehicle {
  regNo: string
  nameModel: string
  type: string
  capacity: string
  odometer: number
  acqCost: number
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired'
}

interface FleetProps {
  vehicles: Vehicle[]
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>
}

export default function Fleet({ vehicles, setVehicles }: FleetProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState<'regNo' | 'nameModel' | 'odometer' | 'acqCost'>('nameModel')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Selected vehicle details modal
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // Add vehicle modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [regNo, setRegNo] = useState('')
  const [nameModel, setNameModel] = useState('')
  const [type, setType] = useState('Van')
  const [capacity, setCapacity] = useState('')
  const [odometer, setOdometer] = useState(0)
  const [acqCost, setAcqCost] = useState(0)
  const [status, setStatus] = useState<'Available' | 'On Trip' | 'In Shop' | 'Retired'>('Available')

  // Toast message notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Handle Add Vehicle
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regNo.trim() || !nameModel.trim() || !capacity.trim()) {
      alert('Please fill out all required fields.')
      return
    }

    // Check duplicate plate
    if (vehicles.some(v => v.regNo.toLowerCase() === regNo.trim().toLowerCase())) {
      alert('A vehicle with this registration plate already exists!')
      return
    }

    const newVehicle: Vehicle = {
      regNo: regNo.trim().toUpperCase(),
      nameModel: nameModel.trim(),
      type,
      capacity: capacity.trim(),
      odometer: Number(odometer) || 0,
      acqCost: Number(acqCost) || 0,
      status,
    }

    setVehicles([newVehicle, ...vehicles])
    setIsModalOpen(false)
    triggerToast(`Vehicle ${newVehicle.nameModel} registered successfully!`)
    
    // Reset fields
    setRegNo('')
    setNameModel('')
    setType('Van')
    setCapacity('')
    setOdometer(0)
    setAcqCost(0)
    setStatus('Available')
  }

  // Handle Sort
  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Filter and Sort vehicles
  const filteredVehicles = vehicles
    .filter((v) => {
      const matchesSearch =
        v.regNo.toLowerCase().includes(search.toLowerCase()) ||
        v.nameModel.toLowerCase().includes(search.toLowerCase()) ||
        v.type.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'All' || v.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      if (typeof a[sortBy] === 'string') {
        comparison = (a[sortBy] as string).localeCompare(b[sortBy] as string)
      } else {
        comparison = (a[sortBy] as number) - (b[sortBy] as number)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Count metrics
  const totalCount = vehicles.length
  const availableCount = vehicles.filter(v => v.status === 'Available').length
  const onTripCount = vehicles.filter(v => v.status === 'On Trip').length
  const inShopCount = vehicles.filter(v => v.status === 'In Shop').length

  const getStatusBadge = (status: Vehicle['status']) => {
    const styles = {
      Available: 'bg-emerald-500/10 text-emerald-500',
      'On Trip': 'bg-blue-500/10 text-blue-500',
      'In Shop': 'bg-amber-500/10 text-amber-500',
      Retired: 'bg-rose-500/10 text-rose-500',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'Available' ? 'bg-emerald-500' :
          status === 'On Trip' ? 'bg-blue-500' :
          status === 'In Shop' ? 'bg-amber-500' : 'bg-rose-500'
        }`} />
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="text-emerald-500" size={18} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Total Fleet Size</p>
            <h3 className="text-3xl font-bold mt-1.5 text-text-primary group-hover:scale-105 transition-transform duration-200">{totalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange transition-colors group-hover:bg-brand-orange group-hover:text-white duration-200">
            <Activity size={22} />
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Available</p>
            <h3 className="text-3xl font-bold mt-1.5 text-emerald-500 group-hover:scale-105 transition-transform duration-200">{availableCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white duration-200">
            <Shield size={22} />
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Active On Trip</p>
            <h3 className="text-3xl font-bold mt-1.5 text-blue-500 group-hover:scale-105 transition-transform duration-200">{onTripCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white duration-200">
            <Settings size={22} />
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">In Maintenance</p>
            <h3 className="text-3xl font-bold mt-1.5 text-amber-500 group-hover:scale-105 transition-transform duration-200">{inShopCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white duration-200">
            <Settings size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-card shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary animate-pulse" size={18} />
            <input
              type="text"
              placeholder="Search by registration, model, type..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all duration-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-secondary uppercase">Status:</span>
            <select
              className="px-4 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/10 transition-all duration-200 cursor-pointer"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* Vehicle List Table */}
      <div className="overflow-hidden rounded-2xl bg-bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-main/30 text-text-secondary border-b border-bg-main/50">
                <th 
                  onClick={() => toggleSort('regNo')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-text-primary select-none"
                >
                  <div className="flex items-center gap-1">
                    Reg No <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('nameModel')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-text-primary select-none"
                >
                  <div className="flex items-center gap-1">
                    Name/Model <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Capacity</th>
                <th 
                  onClick={() => toggleSort('odometer')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-text-primary select-none"
                >
                  <div className="flex items-center gap-1">
                    Odometer <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('acqCost')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-text-primary select-none"
                >
                  <div className="flex items-center gap-1">
                    Acq Cost <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-text-primary divide-y divide-bg-main/20">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-bg-main/15 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 font-mono text-sm font-semibold">{vehicle.regNo}</td>
                    <td className="px-6 py-4 text-sm font-medium">{vehicle.nameModel}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{vehicle.type}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{vehicle.capacity}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{vehicle.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">₹{vehicle.acqCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(vehicle.status)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button 
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="text-xs font-bold text-brand-orange hover:underline flex items-center justify-end gap-1 ml-auto cursor-pointer"
                      >
                        <Info size={12} /> Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-text-secondary space-y-3">
                    <div className="flex flex-col items-center justify-center">
                      <Truck className="h-12 w-12 text-text-muted mb-2 animate-bounce" />
                      <p className="font-semibold">No Vehicles Found</p>
                      <p className="text-xs text-text-muted">Try adjusting your filters or add a new vehicle to the registry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Info Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-bg-card shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-bg-main/50 pb-3">
              <h3 className="text-lg font-bold text-text-primary">Vehicle Details</h3>
              <button onClick={() => setSelectedVehicle(null)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary font-medium">Model / Name:</span>
                <span className="font-bold text-text-primary">{selectedVehicle.nameModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-medium">Plate Number:</span>
                <span className="font-mono font-bold text-text-primary">{selectedVehicle.regNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-medium">Vehicle Type:</span>
                <span className="text-text-primary">{selectedVehicle.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-medium">Load Capacity:</span>
                <span className="text-text-primary">{selectedVehicle.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-medium">Odometer:</span>
                <span className="text-text-primary">{selectedVehicle.odometer.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-medium">Acquisition Cost:</span>
                <span className="text-text-primary">₹{selectedVehicle.acqCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">Status:</span>
                {getStatusBadge(selectedVehicle.status)}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="px-4.5 py-2 bg-bg-main hover:bg-bg-main/80 text-text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-main/55">
              <h3 className="text-lg font-bold text-text-primary">Add New Vehicle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Registration No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GJ01AB1234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Name/Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VAN-05"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all"
                    value={nameModel}
                    onChange={(e) => setNameModel(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Vehicle Type</label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini Truck</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Capacity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 kg or 5 Ton"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Odometer (km)</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all"
                    value={odometer}
                    onChange={(e) => setOdometer(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Acquisition Cost (₹)</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all"
                    value={acqCost}
                    onChange={(e) => setAcqCost(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Initial Status</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer animate-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-bg-main/55">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:bg-bg-main transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/10 transition-colors cursor-pointer"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
