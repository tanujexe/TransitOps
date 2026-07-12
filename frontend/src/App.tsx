import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Plus,
  ArrowDownRight,
  TrendingUp,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play
} from 'lucide-react'

// Define types for our data
interface Trip {
  id: string
  vehicle: string
  driver: string
  status: 'On Trip' | 'Completed' | 'Dispatched' | 'Draft' | 'In Maintenance'
  eta: string
  vehicleType: 'Van' | 'Truck' | 'Mini' | 'Sedan' | '—'
  region: 'North' | 'South' | 'East' | 'West' | '—'
}

const INITIAL_TRIPS: Trip[] = [
  { id: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', eta: '45 min', vehicleType: 'Van', region: 'North' },
  { id: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', eta: '—', vehicleType: 'Truck', region: 'South' },
  { id: 'TR003', vehicle: 'MINI-01', driver: 'Priya', status: 'Dispatched', eta: '1h 10m', vehicleType: 'Mini', region: 'East' },
  { id: 'TR004', vehicle: '—', driver: '—', status: 'Draft', eta: 'Awaiting vehicle', vehicleType: '—', region: 'West' },
  { id: 'TR005', vehicle: 'TRK-08', driver: 'Marcus', status: 'On Trip', eta: '1h 30m', vehicleType: 'Truck', region: 'North' },
  { id: 'TR006', vehicle: 'VAN-02', driver: 'Sarah', status: 'Completed', eta: '—', vehicleType: 'Van', region: 'West' },
  { id: 'TR007', vehicle: 'MINI-03', driver: 'David', status: 'In Maintenance', eta: '—', vehicleType: 'Mini', region: 'East' }
]

function App() {
  // Theme state (Light / Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as 'light' | 'dark') || 'light'
  })

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('Dashboard')

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterVehicleType, setFilterVehicleType] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterRegion, setFilterRegion] = useState<string>('All')

  // Trip List State (to allow dispatching new trips)
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS)

  // Dispatch Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTripId, setNewTripId] = useState('TR008')
  const [newVehicle, setNewVehicle] = useState('')
  const [newDriver, setNewDriver] = useState('')
  const [newStatus, setNewStatus] = useState<'On Trip' | 'Completed' | 'Dispatched' | 'Draft'>('Dispatched')
  const [newEta, setNewEta] = useState('')
  const [newVehicleType, setNewVehicleType] = useState<'Van' | 'Truck' | 'Mini' | 'Sedan'>('Van')
  const [newRegion, setNewRegion] = useState<'North' | 'South' | 'East' | 'West'>('North')

  // Apply theme class to <html>
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Handle Dispatch Form Submit
  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVehicle || !newDriver) {
      alert('Please fill out vehicle and driver names.')
      return
    }
    const newTrip: Trip = {
      id: newTripId,
      vehicle: newVehicle.toUpperCase(),
      driver: newDriver,
      status: newStatus,
      eta: newEta || '—',
      vehicleType: newVehicleType,
      region: newRegion
    }

    setTrips([newTrip, ...trips])
    // Increment trip code for next dispatch
    const numPart = parseInt(newTripId.replace('TR', ''))
    const nextNum = numPart + 1
    setNewTripId(`TR${nextNum.toString().padStart(3, '0')}`)

    // Reset fields
    setNewVehicle('')
    setNewDriver('')
    setNewEta('')
    setIsModalOpen(false)
  }

  // Filtered trips
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driver.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesVehicleType =
      filterVehicleType === 'All' || trip.vehicleType === filterVehicleType

    const matchesStatus =
      filterStatus === 'All' || trip.status === filterStatus

    const matchesRegion =
      filterRegion === 'All' || trip.region === filterRegion

    return matchesSearch && matchesVehicleType && matchesStatus && matchesRegion
  })

  // KPI Calculations
  const activeVehiclesCount = trips.filter(t => t.status === 'On Trip').length + 50 // baseline + dynamic
  const availableVehiclesCount = trips.filter(t => t.status === 'Dispatched' || t.status === 'Completed').length + 38
  const maintenanceCount = trips.filter(t => t.status === 'In Maintenance').length + 4
  const activeTripsCount = trips.filter(t => t.status === 'On Trip').length
  const pendingTripsCount = trips.filter(t => t.status === 'Dispatched' || t.status === 'Draft').length
  const driversOnDuty = activeVehiclesCount - 27 // mock offset
  const fleetUtilization = Math.round((activeVehiclesCount / (activeVehiclesCount + availableVehiclesCount)) * 100)

  // Sidebar Menu Items
  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Fleet', icon: Truck },
    { name: 'Drivers', icon: Users },
    { name: 'Trips', icon: Route },
    { name: 'Maintenance', icon: Wrench },
    { name: 'Fuel & Expenses', icon: Fuel },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Settings', icon: Settings }
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-main text-text-primary">
      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col bg-bg-sidebar text-slate-300 border-r border-slate-800 transition-all duration-300 shrink-0">
        {/* LOGO AREA */}
        <div className="flex h-16 items-center px-6 gap-3 border-b border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white font-bold text-lg shadow-lg shadow-orange-500/20">
            T
          </div>
          <span className="text-xl font-bold tracking-wide text-white font-sans">
            TransitOps
          </span>
        </div>

        {/* SIDEBAR NAVIGATION LINKS */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex w-full items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-orange text-white shadow-lg shadow-orange-500/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* LIGHT/DARK THEME TOGGLE (Reference 2 style bottom of sidebar) */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-brand-orange text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-brand-orange text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="flex h-16 items-center justify-between px-8 bg-bg-card border-b border-border-custom transition-all duration-300">
          {/* LEFT: TITLE */}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              Dashboard Overview
            </h1>
            <span className="text-xs text-text-secondary">
              Real-time transit operations monitoring
            </span>
          </div>

          {/* CENTER: SEARCH BAR */}
          <div className="relative w-80 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search by trip, driver, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 text-sm rounded-2xl bg-bg-main border border-border-custom text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-200"
            />
          </div>

          {/* RIGHT: ACTIONS & USER PROFILE */}
          <div className="flex items-center gap-4">
            {/* DISPATCH CTA */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover active:scale-95 rounded-2xl shadow-lg shadow-orange-500/20 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Dispatch Trip</span>
            </button>

            {/* NOTIFICATIONS */}
            <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-xl transition-all duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-orange" />
            </button>

            {/* SEPARATOR */}
            <div className="h-6 w-px bg-border-custom" />

            {/* USER PROFILE */}
            <div className="flex items-center gap-3 pl-1 group cursor-pointer">
              <div className="relative h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-brand-orange overflow-hidden transition-transform duration-200 group-hover:scale-105">
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  RK
                </span>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-text-primary group-hover:text-brand-orange transition-colors">
                  Raven K.
                </span>
                <span className="text-[10px] font-medium text-text-secondary">
                  Dispatcher
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-text-secondary group-hover:text-text-primary transition-colors" />
            </div>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {activeTab !== 'Dashboard' ? (
            <div className="flex flex-col items-center justify-center h-96 bg-bg-card rounded-[24px] border border-border-custom p-8 shadow-custom text-center">
              <div className="h-16 w-16 bg-orange-100 dark:bg-orange-950/40 text-brand-orange flex items-center justify-center rounded-2xl mb-4">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Section Under Construction</h2>
              <p className="text-text-secondary max-w-md">
                The {activeTab} view is currently being customized. Select the **Dashboard** link in the sidebar to review the operational KPIs and trips grid.
              </p>
            </div>
          ) : (
            <>
              {/* FILTERS PANEL */}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-bg-card rounded-[22px] border border-border-custom shadow-custom transition-all duration-300">
                <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider pl-2">
                  Filters
                </div>
                
                {/* Vehicle Type Select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Vehicle:</span>
                  <select
                    value={filterVehicleType}
                    onChange={(e) => setFilterVehicleType(e.target.value)}
                    className="text-sm bg-bg-main border border-border-custom rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange cursor-pointer"
                  >
                    <option value="All">All Vehicles</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>

                {/* Status Select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
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

                {/* Region Select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Region:</span>
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="text-sm bg-bg-main border border-border-custom rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange cursor-pointer"
                  >
                    <option value="All">All Regions</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </div>

                {/* Clear Filters CTA */}
                {(filterVehicleType !== 'All' || filterStatus !== 'All' || filterRegion !== 'All' || searchQuery !== '') && (
                  <button
                    onClick={() => {
                      setFilterVehicleType('All')
                      setFilterStatus('All')
                      setFilterRegion('All')
                      setSearchQuery('')
                    }}
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orange-hover hover:underline ml-auto pr-2"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* KPI WIDGETS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {/* 1. Active Vehicles */}
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

                {/* 2. Available Vehicles */}
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

                {/* 3. Vehicles in Maintenance */}
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

                {/* 4. Active Trips */}
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

                {/* 5. Pending Trips */}
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

                {/* 6. Drivers on Duty */}
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

                {/* 7. Fleet Utilization */}
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

              {/* BOTTOM GRID (RECENT TRIPS + VEHICLE STATUS) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* RECENT TRIPS TABLE (Col-span 2) */}
                <div className="lg:col-span-2 bg-bg-card rounded-[24px] border border-border-custom shadow-custom p-6 transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">Recent Trips</h2>
                      <span className="text-xs text-text-secondary">Showing {filteredTrips.length} entries</span>
                    </div>
                    {/* Tiny stats label */}
                    <span className="text-xs text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full font-semibold">
                      Live Feed
                    </span>
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
                          filteredTrips.map((trip) => {
                            // Map statuses to pill design colors
                            const statusStyles = {
                              'On Trip': 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30',
                              'Completed': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30',
                              'Dispatched': 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/30',
                              'Draft': 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50',
                              'In Maintenance': 'bg-orange-50 dark:bg-orange-950/40 text-brand-orange dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30'
                            }

                            return (
                              <tr
                                key={trip.id}
                                className="group hover:bg-bg-main/40 transition-colors duration-150"
                              >
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
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* VEHICLE STATUS (Distribution metrics) */}
                <div className="bg-bg-card rounded-[24px] border border-border-custom shadow-custom p-6 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary mb-1">Vehicle Status</h2>
                    <p className="text-xs text-text-secondary mb-6">Active distribution of the operational fleet</p>

                    {/* Progress Bars */}
                    <div className="space-y-5">
                      {/* Available */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                          <span className="text-text-primary">Available</span>
                          <span className="text-emerald-500">42 Vehicles (63%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '63%' }} />
                        </div>
                      </div>

                      {/* On Trip */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                          <span className="text-text-primary">On Trip</span>
                          <span className="text-blue-500">18 Vehicles (27%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '27%' }} />
                        </div>
                      </div>

                      {/* In Shop */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                          <span className="text-text-primary">In Shop</span>
                          <span className="text-brand-orange">5 Vehicles (7%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-brand-orange h-full rounded-full transition-all duration-500" style={{ width: '7%' }} />
                        </div>
                      </div>

                      {/* Retired */}
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

                  {/* Summary/CTA inside the card */}
                  <div className="mt-8 pt-4 border-t border-border-custom/60 flex items-center justify-between text-xs">
                    <span className="text-text-secondary font-medium">Total Fleet Capacity</span>
                    <span className="font-bold text-text-primary">67 Registered</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* DISPATCH TRIP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-bg-card rounded-[26px] border border-border-custom p-6 shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Dispatch New Trip</h3>
                <p className="text-xs text-text-secondary">Register a route and assign a vehicle to service</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-main transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleDispatch} className="space-y-4 text-left">
              {/* Trip ID (Readonly) */}
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
                {/* Vehicle Name */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Vehicle Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. VAN-09"
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                    required
                    className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Type</label>
                  <select
                    value={newVehicleType}
                    onChange={(e) => setNewVehicleType(e.target.value as any)}
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
                {/* Driver Name */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Clara"
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    required
                    className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value as any)}
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
                {/* ETA */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">ETA</label>
                  <input
                    type="text"
                    placeholder="e.g. 50 min"
                    value={newEta}
                    onChange={(e) => setNewEta(e.target.value)}
                    className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary placeholder-text-secondary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none"
                  />
                </div>

                {/* Initial Status */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="block w-full px-3.5 py-2 text-sm rounded-xl bg-bg-card border border-border-custom text-text-primary focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none cursor-pointer"
                  >
                    <option value="Dispatched">Dispatched</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
    </div>
  )
}

export default App
