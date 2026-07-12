import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Slidebar from './components/Slidebar'
import Dashboard, { type Trip } from './pages/Dashboard'
import Fleet, { type Vehicle } from './pages/fleet'

const INITIAL_TRIPS: Trip[] = [
  { id: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', eta: '45 min', vehicleType: 'Van', region: 'North' },
  { id: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', eta: '—', vehicleType: 'Truck', region: 'South' },
  { id: 'TR003', vehicle: 'MINI-01', driver: 'Priya', status: 'Dispatched', eta: '1h 10m', vehicleType: 'Mini', region: 'East' },
  { id: 'TR004', vehicle: '—', driver: '—', status: 'Draft', eta: 'Awaiting vehicle', vehicleType: '—', region: 'West' },
  { id: 'TR005', vehicle: 'TRK-08', driver: 'Marcus', status: 'On Trip', eta: '1h 30m', vehicleType: 'Truck', region: 'North' },
  { id: 'TR006', vehicle: 'VAN-02', driver: 'Sarah', status: 'Completed', eta: '—', vehicleType: 'Van', region: 'West' },
  { id: 'TR007', vehicle: 'MINI-03', driver: 'David', status: 'In Maintenance', eta: '—', vehicleType: 'Mini', region: 'East' }
]

const INITIAL_VEHICLES: Vehicle[] = [
  { regNo: 'GJ01AB452', nameModel: 'VAN-05', type: 'Van', capacity: '500 kg', odometer: 74000, acqCost: 620000, status: 'Available' },
  { regNo: 'GJ01AB998', nameModel: 'TRUCK-11', type: 'Truck', capacity: '5 Ton', odometer: 182000, acqCost: 2450000, status: 'On Trip' },
  { regNo: 'GJ01AB1120', nameModel: 'MINI-03', type: 'Mini', capacity: '1 Ton', odometer: 66000, acqCost: 410000, status: 'In Shop' },
  { regNo: 'GJ01AB008', nameModel: 'VAN-09', type: 'Van', capacity: '750 kg', odometer: 241900, acqCost: 590000, status: 'Retired' },
  { regNo: 'GJ01AB990', nameModel: 'TRK-12', type: 'Truck', capacity: '8 Ton', odometer: 115000, acqCost: 2800000, status: 'Available' },
  { regNo: 'GJ01AB101', nameModel: 'MINI-01', type: 'Mini', capacity: '1 Ton', odometer: 45000, acqCost: 380000, status: 'Available' },
  { regNo: 'GJ01AB995', nameModel: 'TRK-08', type: 'Truck', capacity: '6 Ton', odometer: 92000, acqCost: 2200000, status: 'On Trip' },
  { regNo: 'GJ01AB440', nameModel: 'VAN-02', type: 'Van', capacity: '500 kg', odometer: 120000, acqCost: 600000, status: 'Available' }
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

  // Vehicle Registry State
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES)

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

  // Handle new vehicle selection and auto-sync its type
  const handleNewVehicleChange = (val: string) => {
    setNewVehicle(val)
    const selectedVeh = vehicles.find((v) => v.nameModel === val)
    if (selectedVeh) {
      setNewVehicleType(selectedVeh.type)
    }
  }

  // Handle Dispatch Form Submit
  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVehicle || !newDriver) {
      alert('Please fill out vehicle and driver names.')
      return
    }
    const newTrip: Trip = {
      id: newTripId,
      vehicle: newVehicle,
      driver: newDriver,
      status: newStatus,
      eta: newEta || '—',
      vehicleType: newVehicleType,
      region: newRegion
    }

    setTrips([newTrip, ...trips])

    // Update vehicle status in the registry to 'On Trip'
    setVehicles((prev) =>
      prev.map((v) => (v.nameModel === newVehicle ? { ...v, status: 'On Trip' } : v))
    )

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-main text-text-primary">
      <Slidebar activeTab={activeTab} onTabChange={setActiveTab} theme={theme} onThemeChange={setTheme} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onDispatchClick={() => setIsModalOpen(true)}
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
              newTripId={newTripId}
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

export default App
