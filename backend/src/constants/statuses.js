const VehicleStatuses = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  IN_SHOP: 'IN_SHOP',
  RETIRED: 'RETIRED',
};

const DriverStatuses = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  OFF_DUTY: 'OFF_DUTY',
  SUSPENDED: 'SUSPENDED',
};

const TripStatuses = {
  DRAFT: 'DRAFT',
  DISPATCHED: 'DISPATCHED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const MaintenanceStatuses = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};

module.exports = {
  VehicleStatuses,
  DriverStatuses,
  TripStatuses,
  MaintenanceStatuses,
};
