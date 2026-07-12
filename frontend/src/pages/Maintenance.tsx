import React, { useState } from 'react'
import { Wrench, Calendar, DollarSign, Activity, CheckCircle, Search, Settings, Info, ArrowRight } from 'lucide-react'
import { type Vehicle } from './fleet'

interface MaintenanceProps {
  vehicles: Vehicle[]
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>
}

interface ServiceLog {
  id: string
  vehicleReg: string
  vehicleName: string
  serviceType: string
  cost: number
  date: string
  status: 'In Shop' | 'Completed'
}

const INITIAL_LOGS: ServiceLog[] = [
  { id: 'MNT001', vehicleReg: 'GJ01AB452', vehicleName: 'VAN-05', serviceType: 'Oil Change', cost: 2500, date: '2026-07-07', status: 'In Shop' },
  { id: 'MNT002', vehicleReg: 'GJ01AB998', vehicleName: 'TRUCK-11', serviceType: 'Engine Repair', cost: 18000, date: '2026-07-05', status: 'Completed' },
  { id: 'MNT003', vehicleReg: 'GJ01AB1120', vehicleName: 'MINI-03', serviceType: 'Tyre Replace', cost: 6200, date: '2026-07-06', status: 'In Shop' }
]

export default function Maintenance({ vehicles, setVehicles }: MaintenanceProps) {
  const [logs, setLogs] = useState<ServiceLog[]>(INITIAL_LOGS)

  // Search & Filter
  const [logSearch, setLogSearch] = useState('')
  const [logStatusFilter, setLogStatusFilter] = useState('All')

  // Form states
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('')
  const [serviceType, setServiceType] = useState('Oil Change')
  const [cost, setCost] = useState(2500)
  const [date, setDate] = useState('2026-07-07')
  const [status, setStatus] = useState<'In Shop' | 'Completed'>('In Shop')

  // Toast message notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Save Service Record
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicleReg || !serviceType) {
      alert('Please fill out all required fields.')
      return
    }

    const targetVehicle = vehicles.find(v => v.regNo === selectedVehicleReg)!
    const nextLogId = `MNT${(logs.length + 1).toString().padStart(3, '0')}`

    const newLog: ServiceLog = {
      id: nextLogId,
      vehicleReg: selectedVehicleReg,
      vehicleName: targetVehicle.nameModel,
      serviceType,
      cost,
      date,
      status
    }

    // Append log
    setLogs([newLog, ...logs])

    // Update vehicle status
    const nextVehicleStatus = status === 'In Shop' ? 'In Shop' : 'Available'
    setVehicles(prev =>
      prev.map(v => (v.regNo === selectedVehicleReg ? { ...v, status: nextVehicleStatus } : v))
    )

    triggerToast(`Maintenance record ${newLog.id} saved successfully!`)

    // Reset Form
    setSelectedVehicleReg('')
    setServiceType('Oil Change')
    setCost(2500)
    setDate(new Date().toISOString().split('T')[0])
  }

  // Toggle log to completed
  const handleCompleteLog = (logId: string, vehicleReg: string) => {
    setLogs(prev =>
      prev.map(log => (log.id === logId ? { ...log, status: 'Completed' } : log))
    )

    // Return vehicle to Available
    setVehicles(prev =>
      prev.map(v => (v.regNo === vehicleReg && v.status === 'In Shop' ? { ...v, status: 'Available' } : v))
    )

    triggerToast(`Vehicle returned to active fleet!`)
  }

  const getStatusBadge = (status: ServiceLog['status']) => {
    const styles = {
      'In Shop': 'bg-amber-500/10 text-amber-500',
      Completed: 'bg-emerald-500/10 text-emerald-500'
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'In Shop' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        {status}
      </span>
    )
  }

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.vehicleName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.serviceType.toLowerCase().includes(logSearch.toLowerCase())

    const matchesStatus = logStatusFilter === 'All' || log.status === logStatusFilter

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

      {/* Log Service Record Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm space-y-5 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-base font-bold text-text-primary">Log Service Record</h3>

          <form onSubmit={handleSave} className="space-y-3.5">
            {/* Vehicle Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1">
                <Activity size={10} className="text-brand-orange" /> Vehicle
              </label>
              <select
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer"
                value={selectedVehicleReg}
                onChange={(e) => setSelectedVehicleReg(e.target.value)}
              >
                <option value="">Select vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v.regNo} value={v.regNo}>
                    {v.nameModel} ({v.regNo})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1">
                <Settings size={10} className="text-cyan-500" /> Service Type
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Oil Change, Tyre Repair"
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              />
            </div>

            {/* Cost */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1">
                <DollarSign size={10} className="text-emerald-500" /> Cost (₹)
              </label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1">
                <Calendar size={10} /> Date
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Status Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Status</label>
              <select
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="In Shop">Active (In Shop)</option>
                <option value="Completed">Completed (Available)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/15 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              Save Record
            </button>
          </form>

          {/* Business rules guideline block */}
          <div className="pt-4 border-t border-bg-main/50 space-y-2">
            <div className="p-3 bg-brand-orange/5 text-text-secondary rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-brand-orange">
                <Info size={14} />
                <span>System Rules</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Logging a service shifts vehicle to <strong>In Shop</strong> (blocking dispatch). Completing it restores status to <strong>Available</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Logs Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="p-6 rounded-2xl bg-bg-card shadow-sm space-y-6 min-h-[500px] hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Wrench size={18} className="text-brand-orange" />
              Service Logs
            </h3>
            
            <div className="flex gap-3">
              <div className="relative w-44">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-bg-main text-text-primary focus:outline-none"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </div>
              
              <select
                className="px-2.5 py-1.5 text-xs rounded-xl bg-bg-main text-text-primary focus:outline-none cursor-pointer"
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="In Shop">In Shop</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-main/30 text-text-secondary border-b border-bg-main/50">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Vehicle</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Cost</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary divide-y divide-bg-main/20">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-bg-main/15 transition-colors duration-150">
                        <td className="px-4 py-3.5 text-sm font-semibold">{log.vehicleName}</td>
                        <td className="px-4 py-3.5 text-sm text-text-secondary">{log.serviceType}</td>
                        <td className="px-4 py-3.5 text-sm text-text-secondary">₹{log.cost.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-sm">{getStatusBadge(log.status)}</td>
                        <td className="px-4 py-3.5 text-sm text-right">
                          {log.status === 'In Shop' && (
                            <button
                              onClick={() => handleCompleteLog(log.id, log.vehicleReg)}
                              className="px-2.5 py-1 text-xs bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white rounded-lg transition-colors font-bold cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                        No service logs matched search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
