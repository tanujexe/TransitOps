import React, { useState } from 'react'
import { CheckCircle, Shield, Settings, Check, Minus, Info } from 'lucide-react'

export default function SettingsPage() {
  // Form fields state
  const [depotName, setDepotName] = useState('Gandhinagar Depot GJ14')
  const [currency, setCurrency] = useState('INR (Rs)')
  const [distanceUnit, setDistanceUnit] = useState('Kilometers')

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault()
    triggerToast('General settings saved successfully!')
  }

  // RBAC Table data matching mock screenshot
  const RBAC_DATA = [
    { role: 'Fleet Manager', fleet: '✓', driver: '✓', trip: '—', fuel: '—', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'View', driver: '—', trip: '✓', fuel: '—', analytics: '—' },
    { role: 'Safety Officer', fleet: '—', driver: '✓', trip: 'View', fuel: '—', analytics: '—' },
    { role: 'Financial Analyst', fleet: 'View', driver: '—', trip: '—', fuel: '✓', analytics: '✓' }
  ]

  const getCellBadge = (val: string) => {
    if (val === '✓') {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold">
          <Check size={14} />
        </span>
      )
    }
    if (val === 'View') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-[11px] font-semibold">
          View
        </span>
      )
    }
    return <Minus className="text-text-secondary opacity-40" size={14} />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="text-emerald-500" size={18} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Left Column: General Configuration Form */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm space-y-5 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-base font-bold text-text-primary">General</h3>

          <form onSubmit={handleSaveChanges} className="space-y-4">
            {/* Depot Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Depot Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all"
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
              />
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Currency</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>

            {/* Distance Unit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Distance Unit</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-main text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all"
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/10 transition-colors cursor-pointer"
            >
              Save changes
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: RBAC Matrix Dashboard */}
      <div className="lg:col-span-8 space-y-6">
        <div className="p-6 rounded-2xl bg-bg-card shadow-sm space-y-6 min-h-[400px] hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-brand-orange" />
            <h3 className="text-base font-bold text-text-primary">Role-Based Access (RBAC)</h3>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main/30 text-text-secondary border-b border-bg-main/50">
                  <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider">Fleet</th>
                  <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider">Driver</th>
                  <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider">Trip</th>
                  <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider">Fuel/Exp.</th>
                  <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider">Analytics</th>
                </tr>
              </thead>
              <tbody className="text-text-primary divide-y divide-bg-main/20">
                {RBAC_DATA.map((row) => (
                  <tr key={row.role} className="hover:bg-bg-main/15 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-bold">{row.role}</td>
                    <td className="px-4 py-3.5 text-sm">{getCellBadge(row.fleet)}</td>
                    <td className="px-4 py-3.5 text-sm">{getCellBadge(row.driver)}</td>
                    <td className="px-4 py-3.5 text-sm">{getCellBadge(row.trip)}</td>
                    <td className="px-4 py-3.5 text-sm">{getCellBadge(row.fuel)}</td>
                    <td className="px-4 py-3.5 text-sm">{getCellBadge(row.analytics)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-bg-main/20 text-text-secondary rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-text-primary">
              <Info size={14} /> Security Advisory
            </div>
            <p className="text-[11px] leading-relaxed">
              Role permissions are strictly enforced on both the backend routes and UI routing layers to prevent privilege escalations.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
