import React, { useState } from 'react'
import { Plus, Search, CheckCircle, X, DollarSign, Calendar, Fuel, Receipt, AlertCircle } from 'lucide-react'
import { type Vehicle } from './fleet'

interface FuelExpensesProps {
  vehicles: Vehicle[]
}

interface FuelLog {
  id: string
  vehicle: string
  date: string
  liters: string
  cost: number
}

interface ExpenseLog {
  id: string
  tripId: string
  vehicle: string
  toll: number
  other: number
  maint: number
}

const INITIAL_FUEL_LOGS: FuelLog[] = [
  { id: 'FL001', vehicle: 'VAN-05', date: '05 Jul 2026', liters: '42 L', cost: 3150 },
  { id: 'FL002', vehicle: 'TRUCK-11', date: '06 Jul 2026', liters: '110 L', cost: 8400 },
  { id: 'FL003', vehicle: 'MINI-03', date: '06 Jul 2026', liters: '28 L', cost: 2050 }
]

const INITIAL_EXPENSES: ExpenseLog[] = [
  { id: 'EXP001', tripId: 'TR001', vehicle: 'VAN-05', toll: 120, other: 0, maint: 0 },
  { id: 'EXP002', tripId: 'TR002', vehicle: 'TRK-12', toll: 340, other: 150, maint: 18000 },
  { id: 'EXP003', tripId: '—', vehicle: 'MINI-03', toll: 0, other: 1860, maint: 0 }
]

export default function FuelExpenses({ vehicles }: FuelExpensesProps) {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(INITIAL_FUEL_LOGS)
  const [expenses, setExpenses] = useState<ExpenseLog[]>(INITIAL_EXPENSES)

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('')

  // Modal control states
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

  // Log Fuel Form fields
  const [fuelVehicle, setFuelVehicle] = useState('')
  const [fuelLiters, setFuelLiters] = useState(42)
  const [fuelCost, setFuelCost] = useState(3150)
  const [fuelDate, setFuelDate] = useState('2026-07-07')

  // Add Expense Form fields
  const [expTripId, setExpTripId] = useState('')
  const [expVehicle, setExpVehicle] = useState('')
  const [expToll, setExpToll] = useState(0)
  const [expOther, setExpOther] = useState(0)
  const [expMaint, setExpMaint] = useState(0)

  // Toast message notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Handle Log Fuel
  const handleLogFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fuelVehicle) {
      alert('Please select a vehicle.')
      return
    }

    const newLog: FuelLog = {
      id: `FL${(fuelLogs.length + 1).toString().padStart(3, '0')}`,
      vehicle: fuelVehicle,
      date: new Date(fuelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      liters: `${fuelLiters} L`,
      cost: fuelCost
    }

    setFuelLogs([newLog, ...fuelLogs])
    setIsFuelModalOpen(false)
    triggerToast(`Fuel log recorded for ${fuelVehicle}!`)
    
    // Reset
    setFuelVehicle('')
    setFuelLiters(40)
    setFuelCost(3000)
  }

  // Handle Add Expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!expVehicle) {
      alert('Please select a vehicle.')
      return
    }

    const newExpense: ExpenseLog = {
      id: `EXP${(expenses.length + 1).toString().padStart(3, '0')}`,
      tripId: expTripId || '—',
      vehicle: expVehicle,
      toll: expToll,
      other: expOther,
      maint: expMaint
    }

    setExpenses([newExpense, ...expenses])
    setIsExpenseModalOpen(false)
    triggerToast('Expense record logged successfully!')

    // Reset
    setExpTripId('')
    setExpVehicle('')
    setExpToll(0)
    setExpOther(0)
    setExpMaint(0)
  }

  // Filter logs based on search term
  const filteredFuelLogs = fuelLogs.filter(log =>
    log.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredExpenses = expenses.filter(exp =>
    exp.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.tripId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculations
  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0)
  const totalOtherExpenses = expenses.reduce((sum, exp) => sum + exp.toll + exp.other + exp.maint, 0)
  const totalOperationalCost = totalFuelCost + totalOtherExpenses

  return (
    <div className="space-y-6 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="text-emerald-500" size={18} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Search & Action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-card shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search by vehicle or trip..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-hover active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/10 transition-all cursor-pointer text-sm"
          >
            <Plus size={16} /> Log Fuel
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 bg-bg-main hover:bg-bg-main/80 active:scale-95 text-text-primary px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-sm"
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Fuel Logs Grid */}
      <div className="p-6 rounded-2xl bg-bg-card shadow-sm space-y-4">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Fuel size={18} className="text-brand-orange" />
          Fuel Logs
        </h3>
        
        <div className="overflow-hidden rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-main/30 text-text-secondary border-b border-bg-main/50">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Liters</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Fuel Cost</th>
              </tr>
            </thead>
            <tbody className="text-text-primary divide-y divide-bg-main/20">
              {filteredFuelLogs.map((log) => (
                <tr key={log.id} className="hover:bg-bg-main/15 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-semibold">{log.vehicle}</td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{log.date}</td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{log.liters}</td>
                  <td className="px-4 py-3.5 text-sm text-right font-mono font-medium">₹{log.cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Other Expenses Grid */}
      <div className="p-6 rounded-2xl bg-bg-card shadow-sm space-y-4">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Receipt size={18} className="text-cyan-500" />
          Other Expenses (Toll / Misc)
        </h3>

        <div className="overflow-hidden rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-main/30 text-text-secondary border-b border-bg-main/50">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Trip</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Toll</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Other</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Maint. (Linked)</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-text-primary divide-y divide-bg-main/20">
              {filteredExpenses.map((exp) => {
                const rowTotal = exp.toll + exp.other + exp.maint
                return (
                  <tr key={exp.id} className="hover:bg-bg-main/15 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-mono font-bold text-brand-orange">{exp.tripId}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold">{exp.vehicle}</td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">₹{exp.toll.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">₹{exp.other.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">₹{exp.maint.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-sm text-right font-mono font-bold text-text-primary">
                      ₹{rowTotal.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto Operational Cost Banner */}
      <div className="p-6 rounded-2xl bg-bg-card shadow-sm flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <AlertCircle size={15} className="text-brand-orange animate-pulse" />
          Total Operational Cost (Auto) = Fuel + Maint + Tolls + Misc
        </div>
        <div className="text-2xl font-extrabold text-brand-orange font-mono">
          ₹{totalOperationalCost.toLocaleString()}
        </div>
      </div>

      {/* Log Fuel Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-main/55">
              <h3 className="text-lg font-bold text-text-primary">Log Fuel Receipt</h3>
              <button onClick={() => setIsFuelModalOpen(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleLogFuelSubmit} className="p-6 space-y-4">
              {/* Vehicle Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Vehicle</label>
                <select
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none"
                  value={fuelVehicle}
                  onChange={(e) => setFuelVehicle(e.target.value)}
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.regNo} value={v.nameModel}>
                      {v.nameModel} ({v.regNo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Liters */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Liters Consumed</label>
                <input
                  type="number"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none"
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              {/* Fuel Cost */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Fuel Cost (₹)</label>
                <input
                  type="number"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Log Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:bg-bg-main transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-sm font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  Log Fuel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-main/55">
              <h3 className="text-lg font-bold text-text-primary">Add Expense Record</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddExpenseSubmit} className="p-6 space-y-4">
              {/* Trip ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Trip ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TR001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary placeholder-text-secondary focus:outline-none"
                  value={expTripId}
                  onChange={(e) => setExpTripId(e.target.value)}
                />
              </div>

              {/* Vehicle Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Vehicle</label>
                <select
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none"
                  value={expVehicle}
                  onChange={(e) => setExpVehicle(e.target.value)}
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.regNo} value={v.nameModel}>
                      {v.nameModel} ({v.regNo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Toll Cost */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Toll Cost (₹)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none"
                  value={expToll}
                  onChange={(e) => setExpToll(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              {/* Other Cost */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Other Cost (₹)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none"
                  value={expOther}
                  onChange={(e) => setExpOther(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              {/* Maintenance linked Cost */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Maintenance linked Cost (₹)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-main text-text-primary focus:outline-none"
                  value={expMaint}
                  onChange={(e) => setExpMaint(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:bg-bg-main transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-sm font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
