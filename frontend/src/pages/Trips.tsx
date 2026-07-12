import React, { useState } from 'react'
import { AlertCircle, Clock, Play, MapPin, Truck, User, Scale, Navigation, CheckCircle, Trash2, Search } from 'lucide-react'
import { type Vehicle } from './fleet'
import { type Trip } from './Dashboard'

import { type Driver } from './Drivers'
import { api } from '../utils/api'

interface TripsProps {
  trips: Trip[]
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>
  vehicles: Vehicle[]
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>
  drivers: Driver[]
  readOnly?: boolean
}

// Seed mock drivers
const INITIAL_DRIVERS = [
  { name: 'Alex', status: 'Available', licenseCategory: 'LMV' },
  { name: 'Suresh', status: 'Available', licenseCategory: 'HMV' },
  { name: 'Priya', status: 'Available', licenseCategory: 'LMV' },
  { name: 'John', status: 'On Trip', licenseCategory: 'HMV' },
  { name: 'Marcus', status: 'On Trip', licenseCategory: 'HMV' },
  { name: 'Sarah', status: 'Available', licenseCategory: 'LMV' }
]

export default function Trips({ trips, setTrips, vehicles, setVehicles, drivers, readOnly = false }: TripsProps) {
  // Form fields
  const [source, setSource] = useState('Gandhinagar Depot')
  const [destination, setDestination] = useState('Ahmedabad Hub')
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('')
  const [selectedDriverName, setSelectedDriverName] = useState('')
  const [cargoWeight, setCargoWeight] = useState(700)
  const [plannedDistance, setPlannedDistance] = useState(38)

  // Filter/Search live board
  const [boardSearch, setBoardSearch] = useState('')
  const [boardStatusFilter, setBoardStatusFilter] = useState('All')

  // Toast message notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Current active step in lifecycle representation
  const [lifecycleStep, setLifecycleStep] = useState<'Draft' | 'Dispatched' | 'Completed' | 'Cancelled'>('Draft')

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Find selected vehicle
  const selectedVehicle = vehicles.find(v => v.regNo === selectedVehicleReg)
  
  // Parse capacity helper
  const parseCapacity = (capacityStr: string): number => {
    const clean = capacityStr.toLowerCase().replace(/\s+/g, '')
    if (clean.includes('ton')) {
      const val = parseFloat(clean.replace('ton', '')) || 0
      return val * 1000
    }
    if (clean.includes('kg')) {
      return parseFloat(clean.replace('kg', '')) || 0
    }
    return parseFloat(clean) || 0
  }

  // Check capacity constraint
  const vehicleCapacityKg = selectedVehicle ? parseCapacity(selectedVehicle.capacity) : 0
  const isOverweight = selectedVehicle && cargoWeight > vehicleCapacityKg
  const weightExceededBy = isOverweight ? cargoWeight - vehicleCapacityKg : 0

  // Filter available drivers & vehicles
  const availableVehicles = vehicles.filter(v => v.status === 'Available')
  const availableDrivers = drivers.filter(d => d.status === 'Available')

  // Handle Dispatch submit
  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!source || !destination || !selectedVehicleReg || !selectedDriverName) {
      alert('Please fill out all required fields.')
      return
    }

    if (isOverweight) {
      alert('Cannot dispatch: cargo weight exceeds vehicle capacity!')
      return
    }

    const vehicleObj = vehicles.find(v => v.regNo === selectedVehicleReg)!
    const driverObj = drivers.find(d => d.name === selectedDriverName)!

    if (!vehicleObj || !driverObj) {
      alert('Selected vehicle or driver not found.')
      return
    }

    const tripData = {
      vehicleId: vehicleObj.id,
      driverId: Number(driverObj.id),
      cargoWeightKg: cargoWeight,
      plannedDistance: plannedDistance,
      revenue: Math.round(plannedDistance * 45), // Sensible estimate
      startLocation: source,
      endLocation: destination
    }

    api.createTrip(tripData)
      .then((createdTrip) => {
        // Dispatch trip on the backend to change its status from DRAFT to DISPATCHED
        api.updateTripStatus(createdTrip.dbId!, 'DISPATCHED')
          .then((dispatchedTrip) => {
            // Update local state lists
            setTrips([dispatchedTrip, ...trips])
            setVehicles(prev =>
              prev.map(v => (v.regNo === selectedVehicleReg ? { ...v, status: 'On Trip' } : v))
            )
            triggerToast(`Trip ${dispatchedTrip.id} dispatched successfully!`)
            
            // Reset Form
            setSelectedVehicleReg('')
            setSelectedDriverName('')
            setCargoWeight(700)
            setPlannedDistance(38)
            setLifecycleStep('Dispatched')
          })
      })
      .catch(err => {
        alert(`API Error: ${err.message}`)
      })
  }

  // Cancel/Delete trip action
  const handleCancelTrip = (tripId: string, vehicleModel: string) => {
    // Find the trip object in state to get its dbId
    const targetTrip = trips.find(t => t.id === tripId)
    if (!targetTrip || !targetTrip.dbId) {
      alert('Trip database ID not found.')
      return
    }

    api.cancelTrip(targetTrip.dbId)
      .then(() => {
        setTrips(prev =>
          prev.map(t => (t.id === tripId ? { ...t, status: 'Cancelled', eta: '—' } : t))
        )
        // Make vehicle available again
        setVehicles(prev =>
          prev.map(v => (v.nameModel === vehicleModel && v.status === 'On Trip' ? { ...v, status: 'Available' } : v))
        )
        triggerToast(`Trip ${tripId} has been cancelled.`)
      })
      .catch(err => {
        alert(`API Error cancelling trip: ${err.message}`)
      })
  }

  const getStatusStyle = (status: Trip['status']) => {
    const styles = {
      'On Trip': 'bg-blue-500/10 text-blue-500',
      Completed: 'bg-emerald-500/10 text-emerald-500',
      Dispatched: 'bg-cyan-500/10 text-cyan-500',
      Draft: 'bg-slate-500/10 text-slate-500',
      'In Maintenance': 'bg-orange-500/10 text-brand-orange',
      Cancelled: 'bg-rose-500/10 text-rose-500'
    }
    return `${styles[status as keyof typeof styles] || styles.Draft} inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold`
  }

  // Filter board trips
  const filteredBoardTrips = trips.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(boardSearch.toLowerCase()) ||
      t.vehicle.toLowerCase().includes(boardSearch.toLowerCase()) ||
      t.driver.toLowerCase().includes(boardSearch.toLowerCase())

    const matchesStatus = boardStatusFilter === 'All' || t.status === boardStatusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="text-emerald-500" size={18} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Create Trip Form Column — hidden in view-only mode */}
      {readOnly ? (
        <div className="lg:col-span-4">
          <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col items-center justify-center gap-3 py-10">
            <AlertCircle className="text-blue-500" size={28} />
            <p className="text-sm font-bold text-blue-500">View Only Access</p>
            <p className="text-xs text-text-secondary text-center">Your role allows you to monitor trips but not create or modify them.</p>
          </div>
        </div>
      ) : (
      <div className="lg:col-span-4 space-y-6">
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm space-y-5 hover:shadow-md transition-shadow duration-300">
          
          {/* Trip Lifecycle Step Indicator */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Trip Lifecycle</h4>
            <div className="flex items-center justify-between relative pl-2 pr-2">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-bg-main -translate-y-1/2 z-0" />
              
              {/* Draft */}
              <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => setLifecycleStep('Draft')}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${lifecycleStep === 'Draft' ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20 scale-110' : 'bg-bg-main text-text-secondary hover:bg-bg-main/80'}`}>
                  1
                </div>
                <span className="text-[10px] font-bold mt-1 text-text-secondary">Draft</span>
              </div>

              {/* Dispatched */}
              <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => setLifecycleStep('Dispatched')}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${lifecycleStep === 'Dispatched' ? 'bg-cyan-500 text-white ring-4 ring-cyan-500/20 scale-110' : 'bg-bg-main text-text-secondary hover:bg-bg-main/80'}`}>
                  2
                </div>
                <span className="text-[10px] font-bold mt-1 text-text-secondary">Dispatched</span>
              </div>

              {/* Completed */}
              <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => setLifecycleStep('Completed')}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${lifecycleStep === 'Completed' ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 scale-110' : 'bg-bg-main text-text-secondary hover:bg-bg-main/80'}`}>
                  3
                </div>
                <span className="text-[10px] font-bold mt-1 text-text-secondary">Completed</span>
              </div>

              {/* Cancelled */}
              <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => setLifecycleStep('Cancelled')}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${lifecycleStep === 'Cancelled' ? 'bg-rose-500 text-white ring-4 ring-rose-500/20 scale-110' : 'bg-bg-main text-text-secondary hover:bg-bg-main/80'}`}>
                  4
                </div>
                <span className="text-[10px] font-bold mt-1 text-text-secondary">Cancelled</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleDispatch} className="space-y-3.5">
            <h3 className="text-base font-bold text-text-primary">Create Trip</h3>
            
            {/* Source */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1.5">
                <MapPin size={10} className="text-brand-orange" /> Source
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all duration-200"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1.5">
                <MapPin size={10} className="text-cyan-500" /> Destination
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all duration-200"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            {/* Vehicle Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1.5">
                <Truck size={10} /> Vehicle (Available Only)
              </label>
              <select
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer transition-all duration-200"
                value={selectedVehicleReg}
                onChange={(e) => setSelectedVehicleReg(e.target.value)}
              >
                <option value="">Select a vehicle...</option>
                {availableVehicles.map((v) => (
                  <option key={v.regNo} value={v.regNo}>
                    {v.nameModel} ({v.capacity} capacity)
                  </option>
                ))}
              </select>
            </div>

            {/* Driver Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1.5">
                <User size={10} /> Driver (Available Only)
              </label>
              <select
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer transition-all duration-200"
                value={selectedDriverName}
                onChange={(e) => setSelectedDriverName(e.target.value)}
              >
                <option value="">Select a driver...</option>
                {availableDrivers.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} (License: {d.licenseCategory})
                  </option>
                ))}
              </select>
            </div>

            {/* Cargo Weight */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1.5">
                <Scale size={10} /> Cargo Weight (kg)
              </label>
              <input
                type="number"
                required
                min={1}
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all duration-200"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            {/* Planned Distance */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1.5">
                <Navigation size={10} /> Planned Distance (km)
              </label>
              <input
                type="number"
                required
                min={1}
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all duration-200"
                value={plannedDistance}
                onChange={(e) => setPlannedDistance(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            {/* Overweight Capacity Alert */}
            {isOverweight && selectedVehicle && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-300">
                <div className="font-bold text-[12px] flex items-center gap-1.5 mb-0.5">
                  <AlertCircle size={14} />
                  <span>Capacity Blocked</span>
                </div>
                <div>Vehicle Capacity: <span className="font-bold">{selectedVehicle.capacity}</span></div>
                <div>Cargo Weight: <span className="font-bold">{cargoWeight} kg</span></div>
                <div className="font-bold mt-1 text-rose-600 dark:text-rose-400 text-[11px]">
                  ❌ Exceeded by {weightExceededBy} kg - dispatch blocked.
                </div>
              </div>
            )}

            {/* Form Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={!!isOverweight || !selectedVehicleReg || !selectedDriverName}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all duration-200 active:scale-95 cursor-pointer text-sm ${
                  isOverweight || !selectedVehicleReg || !selectedDriverName
                    ? 'bg-bg-main text-text-secondary cursor-not-allowed active:scale-100'
                    : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-orange-500/10'
                }`}
              >
                <Play size={14} />
                Dispatch
              </button>
              <button
                type="button"
                onClick={() => {
                  setLifecycleStep('Cancelled')
                  setSelectedVehicleReg('')
                  setSelectedDriverName('')
                }}
                className="px-4 py-2 bg-bg-main hover:bg-bg-main/80 text-text-secondary rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>

        </div>
      </div>
      )}

      {/* Live Board Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="p-6 rounded-2xl bg-bg-card shadow-sm space-y-6 flex flex-col justify-between min-h-[500px] hover:shadow-md transition-shadow duration-300">
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Board
              </h3>
              
              <div className="flex gap-3">
                <div className="relative w-44">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search trips..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-bg-main text-text-primary focus:outline-none"
                    value={boardSearch}
                    onChange={(e) => setBoardSearch(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-bg-main text-text-primary focus:outline-none cursor-pointer"
                  value={boardStatusFilter}
                  onChange={(e) => setBoardStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* List Stack */}
            <div className="space-y-3.5">
              {filteredBoardTrips.length > 0 ? (
                filteredBoardTrips.map((trip) => (
                  <div 
                    key={trip.id} 
                    className="p-4 rounded-xl bg-bg-main/30 hover:bg-bg-main/60 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-brand-orange bg-brand-orange/5 px-2 py-0.5 rounded-md">
                          {trip.id}
                        </span>
                        <span className="text-sm font-semibold text-text-primary">
                          {trip.vehicle !== '—' ? trip.vehicle : 'Unassigned'}
                        </span>
                        <span className="text-text-secondary text-xs">/</span>
                        <span className="text-xs font-semibold text-text-secondary">
                          {trip.driver !== '—' ? trip.driver : 'No Driver'}
                        </span>
                      </div>

                      <div className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                        <MapPin size={12} className="text-text-secondary" />
                        <span>{trip.id === 'TR001' ? 'Gandhinagar Depot' : trip.id === 'TR003' ? 'Vatva Industrial Area' : 'Origin'}</span>
                        <span className="text-text-secondary font-bold">➔</span>
                        <span>{trip.id === 'TR001' ? 'Ahmedabad Hub' : trip.id === 'TR003' ? 'Sanand Warehouse' : 'Destination'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1.5 text-right">
                        <span className={getStatusStyle(trip.status)}>
                          {trip.status}
                        </span>
                        <span className="text-xs text-text-secondary font-medium flex items-center gap-1">
                          <Clock size={12} />
                          {trip.eta}
                        </span>
                      </div>
                      
                      {trip.status === 'Dispatched' && (
                        <button
                          onClick={() => handleCancelTrip(trip.id, trip.vehicle)}
                          title="Cancel Trip"
                          className="p-2 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  No trips matched search filters.
                </div>
              )}
            </div>
          </div>

          {/* Bottom helper guidelines */}
          <div className="pt-4 flex items-center gap-2 text-xs font-medium text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            <span>On Completion: odometer ➔ fuel log ➔ expenses ➔ Vehicle & Driver available</span>
          </div>
        </div>
      </div>
    </div>
  )
}
