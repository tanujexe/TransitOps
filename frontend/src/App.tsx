//App.tsx
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Slidebar from './components/Slidebar'
import Dashboard, { type Trip } from './pages/Dashboard'
import Fleet, { type Vehicle } from './pages/fleet'
import Drivers, { type Driver, isLicenseExpired } from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import FuelExpenses from './pages/FuelExpenses'
import Analytics from './pages/Analytics'
import SettingsPage from './pages/Settings'
import AuthPage, { type AuthUser } from './pages/AuthPage'
import { api, login, clearToken } from './utils/api'

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as 'light' | 'dark') || 'light'
  })

  // Auth state – check if user already has a valid token stored
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!(localStorage.getItem('token') && localStorage.getItem('user'))
  })
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('Dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterVehicleType, setFilterVehicleType] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterRegion, setFilterRegion] = useState<string>('All')

  // Real Database States
  const [trips, setTrips] = useState<Trip[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  // Active User Role state
  const [activeRole, setActiveRole] = useState<string>(() => localStorage.getItem('activeRole') || 'FLEET_MANAGER')

  // Dispatch Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  // Load all data from API (called after auth is established)
  const loadData = async () => {
    try {
      const fetchedVehicles = await api.getVehicles()
      setVehicles(fetchedVehicles)

      const fetchedDrivers = await api.getDrivers()
      setDrivers(fetchedDrivers)

      const fetchedTrips = await api.getTrips()
      setTrips(fetchedTrips)
    } catch (err) {
      console.error('Error loading data from API:', err)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, activeRole])

  // Handle login success from AuthPage
  const handleLogin = (token: string, user: AuthUser) => {
    setCurrentUser(user)
    setActiveRole(user.role)
    setIsAuthenticated(true)
  }

  // Handle logout
  const handleLogout = () => {
    clearToken()
    setIsAuthenticated(false)
    setCurrentUser(null)
    setVehicles([])
    setDrivers([])
    setTrips([])
  }

  // Handle active role switch
  const handleRoleChange = async (role: string) => {
    try {
      setActiveRole(role)
      localStorage.setItem('activeRole', role)
      await login(role)
      loadData()
    } catch (err) {
      alert(`Role switch error: ${(err as Error).message}`)
    }
  }

  // Handle new vehicle selection and auto-sync its type
  const handleNewVehicleChange = (val: string) => {
    setNewVehicle(val)
    const selectedVeh = vehicles.find((v) => v.nameModel === val)
    if (selectedVeh) {
      setNewVehicleType(selectedVeh.type as 'Van' | 'Truck' | 'Mini' | 'Sedan')
    }
  }

  // Handle Dispatch Form Submit
  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVehicle || !newDriver) {
      alert('Please fill out vehicle and driver names.')
      return
    }

    const matchingDriver = drivers.find(d => d.name.trim().toLowerCase() === newDriver.trim().toLowerCase())
    if (matchingDriver) {
      const expired = isLicenseExpired(matchingDriver.expiryDate)
      const suspended = matchingDriver.status === 'Suspended'
      if (expired || suspended) {
        alert(`Cannot assign trip to ${matchingDriver.name}. This driver's license is expired or their status is Suspended.`)
        return
      }
    }

    const targetVehicleObj = vehicles.find(v => v.nameModel === newVehicle)
    const targetDriverObj = drivers.find(d => d.name === newDriver)

    if (!targetVehicleObj || !targetDriverObj) {
      alert('Could not find selected vehicle or driver in database.')
      return
    }

    try {
      // Create trip in database
      await api.createTrip({
        vehicleId: Number(targetVehicleObj.regNo.charCodeAt(0) + targetVehicleObj.odometer) % 5 + 1, // mock lookup
        driverId: Number(targetDriverObj.id) || 1,
        cargoWeightKg: 1000,
        plannedDistance: 50,
        revenue: 1500,
        startLocation: 'Gandhinagar Depot',
        endLocation: 'Ahmedabad Hub'
      })

      // Dispatch trip on the backend if status is Dispatched
      // Reload UI data
      await loadData()
      setIsModalOpen(false)
      setNewVehicle('')
      setNewDriver('')
    } catch (err) {
      alert(`API dispatch error: ${(err as Error).message}`)
    }
  }

  // Stats calculation
  const activeVehiclesCount = vehicles.filter(v => v.status === 'On Trip').length
  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length
  const maintenanceCount = vehicles.filter(v => v.status === 'In Shop').length
  const activeTripsCount = trips.filter(t => t.status === 'On Trip').length
  const pendingTripsCount = trips.filter(t => t.status === 'Dispatched' || t.status === 'Draft').length
  const driversOnDuty = activeVehiclesCount + pendingTripsCount
  const totalF = activeVehiclesCount + availableVehiclesCount
  const fleetUtilization = totalF > 0 ? Math.round((activeVehiclesCount / totalF) * 100) : 0

  // Filter logic
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driver.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterVehicleType === 'All' || trip.vehicleType === filterVehicleType
    const matchesStatus = filterStatus === 'All' || trip.status === filterStatus
    const matchesRegion = filterRegion === 'All' || trip.region === filterRegion

    return matchesSearch && matchesType && matchesStatus && matchesRegion
  })

  // Auth gate – show login page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-main text-text-primary">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/55 backdrop-blur-xs z-40 lg:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Slidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        theme={theme} 
        onThemeChange={setTheme} 
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuClick={() => setIsSidebarOpen(true)}
          activeRole={activeRole}
          currentUser={currentUser}
          onLogout={handleLogout}
          title={activeTab === 'Fleet' ? 'Vehicle Registry' : activeTab === 'Dashboard' ? 'Dashboard Overview' : `${activeTab} Overview`}
          subtitle={
            activeTab === 'Fleet'
              ? 'Real-time vehicle registry and fleet status'
              : activeTab === 'Dashboard'
              ? 'Real-time transit operations monitoring'
              : `${activeTab} management`
          }
        />

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {activeTab === 'Fleet' ? (
            <Fleet vehicles={vehicles} setVehicles={setVehicles} />
          ) : activeTab === 'Drivers' ? (
            <Drivers drivers={drivers} setDrivers={setDrivers} />
          ) : activeTab === 'Trips' ? (
            <Trips trips={trips} setTrips={setTrips} vehicles={vehicles} setVehicles={setVehicles} drivers={drivers} />
          ) : activeTab === 'Maintenance' ? (
            <Maintenance vehicles={vehicles} setVehicles={setVehicles} />
          ) : activeTab === 'Fuel & Expenses' ? (
            <FuelExpenses vehicles={vehicles} />
          ) : activeTab === 'Analytics' ? (
            <Analytics />
          ) : activeTab === 'Settings' ? (
            <SettingsPage />
          ) : (
            <Dashboard
              activeTab={activeTab}
              trips={trips}
              filteredTrips={filteredTrips}
              searchQuery={searchQuery}
              filterVehicleType={filterVehicleType}
              filterStatus={filterStatus}
              filterRegion={filterRegion}
              onFilterVehicleTypeChange={setFilterVehicleType}
              onFilterStatusChange={setFilterStatus}
              onFilterRegionChange={setFilterRegion}
              onClearFilters={() => {
                setFilterVehicleType('All')
                setFilterStatus('All')
                setFilterRegion('All')
                setSearchQuery('')
              }}
              activeVehiclesCount={activeVehiclesCount}
              availableVehiclesCount={availableVehiclesCount}
              maintenanceCount={maintenanceCount}
              activeTripsCount={activeTripsCount}
              pendingTripsCount={pendingTripsCount}
              driversOnDuty={driversOnDuty}
              fleetUtilization={fleetUtilization}
              isModalOpen={isModalOpen}
              onCloseModal={() => setIsModalOpen(false)}
              onDispatchSubmit={handleDispatch}
              newTripId="AUTO"
              newVehicle={newVehicle}
              onNewVehicleChange={handleNewVehicleChange}
              newDriver={newDriver}
              onNewDriverChange={setNewDriver}
              newStatus={newStatus}
              onNewStatusChange={setNewStatus}
              newEta={newEta}
              onNewEtaChange={setNewEta}
              newVehicleType={newVehicleType}
              onNewVehicleTypeChange={setNewVehicleType}
              newRegion={newRegion}
              onNewRegionChange={setNewRegion}
              vehicles={vehicles}
            />
          )}
        </main>
      </div>
    </div>
  )
}
