import React, { useState } from 'react'
import { Plus, Search, Trash2, Edit, X, Shield, Settings, Activity } from 'lucide-react'

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
  
  // Add vehicle modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [regNo, setRegNo] = useState('')
  const [nameModel, setNameModel] = useState('')
  const [type, setType] = useState('Van')
  const [capacity, setCapacity] = useState('')
  const [odometer, setOdometer] = useState(0)
  const [acqCost, setAcqCost] = useState(0)
  const [status, setStatus] = useState<'Available' | 'On Trip' | 'In Shop' | 'Retired'>('Available')

  // Handle Add Vehicle
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regNo || !nameModel || !capacity) {
      alert('Please fill out all required fields.')
      return
    }

    const newVehicle: Vehicle = {
      regNo,
      nameModel,
      type,
      capacity,
      odometer,
      acqCost,
      status,
    }

    setVehicles([newVehicle, ...vehicles])
    setIsModalOpen(false)
    
    // Reset fields
    setRegNo('')
    setNameModel('')
    setType('Van')
    setCapacity('')
    setOdometer(0)
    setAcqCost(0)
    setStatus('Available')
  }

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.regNo.toLowerCase().includes(search.toLowerCase()) ||
      v.nameModel.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'All' || v.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Count metrics
  const totalCount = vehicles.length
  const availableCount = vehicles.filter(v => v.status === 'Available').length
  const onTripCount = vehicles.filter(v => v.status === 'On Trip').length
  const inShopCount = vehicles.filter(v => v.status === 'In Shop').length

  const getStatusBadge = (status: Vehicle['status']) => {
    const styles = {
      Available: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'On Trip': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'In Shop': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      Retired: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border-light dark:border-border-dark flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary dark:text-text-muted">Total Fleet Size</p>
            <h3 className="text-3xl font-bold mt-1 text-text-primary dark:text-text-white">{totalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Activity size={24} />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border-light dark:border-border-dark flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary dark:text-text-muted">Available</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-500">{availableCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Shield size={24} />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border-light dark:border-border-dark flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary dark:text-text-muted">Active On Trip</p>
            <h3 className="text-3xl font-bold mt-1 text-blue-500">{onTripCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Settings size={24} />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border-light dark:border-border-dark flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary dark:text-text-muted">In Maintenance</p>
            <h3 className="text-3xl font-bold mt-1 text-amber-500">{inShopCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Settings size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border-light dark:border-border-dark">
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by Reg No, Model or Type..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary dark:text-text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary dark:text-text-white focus:outline-none"
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

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* Vehicle List Table */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-bg-dark border border-border-light dark:border-border-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-light dark:bg-bg-dark/50 border-b border-border-light dark:border-border-dark">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Reg No</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Name/Model</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Load Capacity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Odometer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Acq Cost</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle, idx) => (
                  <tr key={idx} className="hover:bg-bg-light/40 dark:hover:bg-bg-light/5 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-text-primary dark:text-text-white">{vehicle.regNo}</td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary dark:text-text-white">{vehicle.nameModel}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary dark:text-text-muted">{vehicle.type}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary dark:text-text-muted">{vehicle.capacity}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary dark:text-text-muted">{vehicle.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-sm text-text-secondary dark:text-text-muted">₹{vehicle.acqCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(vehicle.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                    No vehicles found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-bg-dark border border-border-light dark:border-border-dark shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
              <h3 className="text-lg font-bold text-text-primary dark:text-text-white">Add New Vehicle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary dark:hover:text-text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Registration No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GJ01AB1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary dark:text-text-white focus:outline-none"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Name/Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VAN-05"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary dark:text-text-white focus:outline-none"
                    value={nameModel}
                    onChange={(e) => setNameModel(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Vehicle Type</label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary dark:text-text-white focus:outline-none"
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
                  <label className="text-xs font-bold text-text-muted uppercase">Capacity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 kg or 5 Ton"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary dark:text-text-white focus:outline-none"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Odometer (km)</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary dark:text-text-white focus:outline-none"
                    value={odometer}
                    onChange={(e) => setOdometer(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Acquisition Cost (₹)</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary dark:text-text-white focus:outline-none"
                    value={acqCost}
                    onChange={(e) => setAcqCost(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Initial Status</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary dark:text-text-white focus:outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:bg-bg-light dark:hover:bg-bg-light/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 transition-colors"
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
