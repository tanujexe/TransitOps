import React from 'react'
import { Fuel, BarChart3, ShieldAlert, DollarSign, Activity, Percent, ArrowUpRight } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

// Monthly revenue mock data
const REVENUE_DATA = [
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 52000 },
  { month: 'Mar', amount: 49000 },
  { month: 'Apr', amount: 63000 },
  { month: 'May', amount: 58000 },
  { month: 'Jun', amount: 72000 },
  { month: 'Jul', amount: 68000 },
  { month: 'Aug', amount: 69000 }
]

// Costliest vehicles mock data
const COSTLIEST_VEHICLES = [
  { name: 'TRUCK-11', type: 'Heavy Duty', cost: 18000, percentage: 85, color: '#f43f5e' }, // rose-500
  { name: 'MINI-03', type: 'Mini Truck', cost: 6200, percentage: 45, color: '#f59e0b' },  // amber-500
  { name: 'VAN-05', type: 'Cargo Van', cost: 2500, percentage: 20, color: '#3b82f6' }    // blue-500
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-3.5 py-2.5 rounded-xl shadow-xl text-xs font-bold border-none">
        <p className="font-mono">₹{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  return (
    <div className="space-y-6">
      
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Fuel Efficiency */}
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Fuel Efficiency</p>
            <h3 className="text-3xl font-bold mt-1.5 text-text-primary">8.4 km/l</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-semibold">
              <ArrowUpRight size={12} />
              <span>+4.2% vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-200">
            <Fuel size={22} />
          </div>
        </div>

        {/* Card 2: Fleet Utilization */}
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Fleet Utilization</p>
            <h3 className="text-3xl font-bold mt-1.5 text-text-primary">81%</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-semibold">
              <ArrowUpRight size={12} />
              <span>Optimal load distribution</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-200">
            <Activity size={22} />
          </div>
        </div>

        {/* Card 3: Operational Cost */}
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Operational Cost</p>
            <h3 className="text-3xl font-bold mt-1.5 text-text-primary">₹34,070</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-semibold">
              <ArrowUpRight size={12} />
              <span>Reflects fuel + maintenance</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-200">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Card 4: Vehicle ROI */}
        <div className="p-5 rounded-2xl bg-bg-card shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Vehicle ROI</p>
            <h3 className="text-3xl font-bold mt-1.5 text-text-primary">14.2%</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-semibold">
              <ArrowUpRight size={12} />
              <span>Target: &gt;12% benchmark</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors duration-200">
            <Percent size={22} />
          </div>
        </div>
      </div>

      {/* Formula hint */}
      <p className="text-[11px] font-medium text-text-secondary tracking-wide">
        * ROI Formula = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </p>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Monthly Revenue Bar Chart Card */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-bg-card shadow-sm space-y-6 hover:shadow-md transition-all duration-300">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-orange" />
            Monthly Revenue
          </h3>

          {/* Bar Chart Container */}
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 115, 22, 0.05)', radius: 8 }} />
                <Bar 
                  dataKey="amount" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                >
                  {REVENUE_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="var(--accent-orange)"
                      className="transition-opacity duration-300 hover:opacity-80" 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Costliest Vehicles Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-bg-card shadow-sm space-y-6 hover:shadow-md transition-all duration-300">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-500" />
            Top Costliest Vehicles
          </h3>

          {/* Recharts Horizontal Bar Chart */}
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={COSTLIEST_VEHICLES}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 700 }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                  content={({ active, payload }) => {
                    const value = payload?.[0]?.value

                    if (active && value != null) {
                      return (
                        <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-lg shadow text-xs font-bold">
                          ₹{Number(value).toLocaleString()}
                        </div>
                      )
                    }

                    return null
                  }}
                />
                <Bar dataKey="cost" radius={[4, 4, 4, 4]} barSize={12}>
                  {COSTLIEST_VEHICLES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  )
}
