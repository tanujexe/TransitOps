import { type Vehicle } from '../pages/fleet'
import { type Driver } from '../pages/Drivers'
import { type Trip } from '../pages/Dashboard'

const API_BASE_URL = 'http://localhost:5000/api'

// Automatic authentication token helper
const getToken = () => localStorage.getItem('token')
const setToken = (token: string) => localStorage.setItem('token', token)
export const clearToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('activeRole')
  localStorage.removeItem('user')
}
const getActiveRole = () => localStorage.getItem('activeRole') || 'FLEET_MANAGER'

// Login with real email + password (used by AuthPage)
export async function loginWithCredentials(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Login failed')
  if (!data?.data?.token) throw new Error('No token returned from server')
  setToken(data.data.token)
  localStorage.setItem('activeRole', data.data.user.role)
  localStorage.setItem('user', JSON.stringify(data.data.user))
  return { token: data.data.token, user: data.data.user }
}

// Emails for the auto-login profiles
const ROLE_EMAILS: Record<string, string> = {
  FLEET_MANAGER: 'manager@transitops.com',
  DISPATCHER: 'dispatcher@transitops.com',
  SAFETY_OFFICER: 'safety@transitops.com',
  FINANCIAL_ANALYST: 'analyst@transitops.com'
}

// Perform login to retrieve a valid JWT token
export async function login(role: string): Promise<string> {
  const email = ROLE_EMAILS[role] || ROLE_EMAILS.FLEET_MANAGER
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password123' })
  })

  if (!res.ok) {
    throw new Error(`Failed to login as ${role}`)
  }

  const data = await res.json()
  if (data.data && data.data.token) {
    setToken(data.data.token)
    localStorage.setItem('activeRole', role)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    return data.data.token
  }
  throw new Error('No token returned from server')
}

// Request wrapper with auto-reauth
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  let token = getToken()
  if (!token) {
    token = await login(getActiveRole())
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  // If unauthorized, attempt re-login once
  if (res.status === 401) {
    token = await login(getActiveRole())
    const retryHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
    const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: retryHeaders
    })
    if (!retryRes.ok) {
      const err = await retryRes.json().catch(() => ({}))
      throw new Error(err.message || 'Request failed')
    }
    return retryRes.json()
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Request failed')
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return null
  }

  return res.json()
}

// Mapping Utilities
export const mappers = {
  // Vehicle Mapping
  vehicleFromBackend: (bv: any): Vehicle => ({
    id: bv.id,
    regNo: bv.registrationNumber,
    nameModel: bv.model,
    type: bv.type as any,
    capacity: `${bv.capacityKg} kg`,
    odometer: bv.odometer,
    acqCost: Number(bv.acquisitionCost),
    status: bv.status === 'AVAILABLE' ? 'Available' : 
            bv.status === 'ON_TRIP' ? 'On Trip' :
            bv.status === 'IN_SHOP' ? 'In Shop' : 'Retired'
  }),
  vehicleToBackend: (fv: Vehicle) => ({
    registrationNumber: fv.regNo,
    model: fv.nameModel,
    type: fv.type,
    capacityKg: parseInt(fv.capacity.replace(/[^\d]/g, ''), 10) || 1000,
    odometer: Number(fv.odometer) || 0,
    acquisitionCost: Number(fv.acqCost) || 0,
    region: 'West India', // Default required field
    status: fv.status === 'Available' ? 'AVAILABLE' :
            fv.status === 'On Trip' ? 'ON_TRIP' :
            fv.status === 'In Shop' ? 'IN_SHOP' : 'RETIRED'
  }),

  // Driver Mapping
  driverFromBackend: (bd: any): Driver => ({
    id: String(bd.id),
    name: bd.name,
    licenseNo: bd.licenseNumber,
    category: bd.licenseCategory as any,
    expiryDate: new Date(bd.licenseExpiry).toISOString().split('T')[0],
    contact: bd.phone,
    safetyScore: Math.round(Number(bd.safetyScore) * 20), // Convert out of 5.0 to out of 100
    status: bd.status === 'AVAILABLE' ? 'Available' :
            bd.status === 'ON_TRIP' ? 'On Trip' :
            bd.status === 'OFF_DUTY' ? 'Off Duty' : 'Suspended'
  }),
  driverToBackend: (fd: Driver) => ({
    name: fd.name,
    licenseNumber: fd.licenseNo,
    licenseCategory: fd.category,
    licenseExpiry: new Date(fd.expiryDate).toISOString(),
    phone: fd.contact,
    safetyScore: Number(fd.safetyScore / 20) || 5.0, // Convert out of 100 to out of 5.0
    status: fd.status === 'Available' ? 'AVAILABLE' :
            fd.status === 'On Trip' ? 'ON_TRIP' :
            fd.status === 'Off Duty' ? 'OFF_DUTY' : 'SUSPENDED'
  }),

  // Trip Mapping
  tripFromBackend: (bt: any): Trip => ({
    dbId: bt.id,
    id: bt.trackingNumber,
    vehicle: bt.vehicle ? bt.vehicle.model : '—',
    driver: bt.driver ? bt.driver.name : '—',
    status: bt.status === 'DRAFT' ? 'Draft' :
            bt.status === 'DISPATCHED' ? 'Dispatched' :
            bt.status === 'COMPLETED' ? 'Completed' : 'Cancelled',
    eta: bt.status === 'COMPLETED' ? '—' : '45 min', // Mock or calculated
    vehicleType: bt.vehicle ? (bt.vehicle.type as any) : '—',
    region: bt.vehicle ? bt.vehicle.region : 'North'
  })
}

// API Methods
export const api = {
  // Vehicles
  getVehicles: () => request('/vehicles').then(res => res.data.map(mappers.vehicleFromBackend)),
  createVehicle: (v: Vehicle) => request('/vehicles', {
    method: 'POST',
    body: JSON.stringify(mappers.vehicleToBackend(v))
  }).then(res => mappers.vehicleFromBackend(res.data)),
  updateVehicle: (id: string, v: Partial<Vehicle>) => request(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(v)
  }).then(res => mappers.vehicleFromBackend(res.data)),
  deleteVehicle: (id: string) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  // Drivers
  getDrivers: () => request('/drivers').then(res => res.data.map(mappers.driverFromBackend)),
  createDriver: (d: Driver) => request('/drivers', {
    method: 'POST',
    body: JSON.stringify(mappers.driverToBackend(d))
  }).then(res => mappers.driverFromBackend(res.data)),
  updateDriver: (id: number, d: Partial<Driver>) => request(`/drivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(d)
  }).then(res => mappers.driverFromBackend(res.data)),
  deleteDriver: (id: number) => request(`/drivers/${id}`, { method: 'DELETE' }),

  // Trips
  getTrips: () => request('/trips').then(res => res.data.map(mappers.tripFromBackend)),
  createTrip: (tripData: any) => request('/trips', {
    method: 'POST',
    body: JSON.stringify(tripData)
  }).then(res => mappers.tripFromBackend(res.data)),
  updateTripStatus: (id: number, status: string, actualDistance?: number) => request(`/trips/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, actualDistance })
  }).then(res => mappers.tripFromBackend(res.data)),
  cancelTrip: (id: number) => request(`/trips/${id}/cancel`, { method: 'POST' }),
  completeTrip: (id: number, data: any) => request(`/trips/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Dashboard Summary
  getDashboardStats: () => request('/dashboard/summary').then(res => res.data),

  // Maintenance
  getMaintenanceLogs: () => request('/maintenance'),
  createMaintenanceLog: (vehicleId: number, description: string, cost: number) => request('/maintenance', {
    method: 'POST',
    body: JSON.stringify({ vehicleId, description, cost })
  }),
  completeMaintenanceLog: (id: number) => request(`/maintenance/${id}/complete`, {
    method: 'PUT'
  }),

  // Fuel & Expenses
  getFuelLogs: () => request('/expenses/fuel'),
  getGeneralExpenses: () => request('/expenses'),
  createFuelLog: (vehicleId: number, liters: number, cost: number, odometer: number) => request('/expenses/fuel', {
    method: 'POST',
    body: JSON.stringify({ vehicleId, amountLiters: liters, cost, odometer })
  }),
  createGeneralExpense: (vehicleId: number, category: string, amount: number, description: string) => request('/expenses', {
    method: 'POST',
    body: JSON.stringify({ vehicleId, category, amount, description })
  })
}
