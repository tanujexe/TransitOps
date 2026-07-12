const prisma = require('../config/database');
const { VehicleStatuses, DriverStatuses, TripStatuses } = require('../constants/statuses');

class DashboardService {
  /**
   * Aggregate operational metrics and KPIs
   */
  async getStats(filters = {}) {
    const { type, status, region } = filters;

    // Build vehicle query conditions
    const vehicleWhere = {};
    if (type) vehicleWhere.type = type;
    if (status) vehicleWhere.status = status;
    if (region) vehicleWhere.region = region;

    // 1. Fetch vehicles matching filters
    const vehicles = await prisma.vehicle.findMany({
      where: vehicleWhere,
      select: {
        id: true,
        status: true,
      },
    });

    const totalVehiclesCount = vehicles.length;
    const activeVehiclesCount = vehicles.filter(v => v.status === VehicleStatuses.ON_TRIP).length;
    const availableVehiclesCount = vehicles.filter(v => v.status === VehicleStatuses.AVAILABLE).length;
    const maintenanceVehiclesCount = vehicles.filter(v => v.status === VehicleStatuses.IN_SHOP).length;
    const retiredVehiclesCount = vehicles.filter(v => v.status === VehicleStatuses.RETIRED).length;

    // 2. Fleet Utilization (%) calculation
    // Formula: (Active / (Total - Retired)) * 100
    const denominator = totalVehiclesCount - retiredVehiclesCount;
    const fleetUtilization = denominator > 0 ? (activeVehiclesCount / denominator) * 100 : 0;

    // 3. Count trips matching the filtered vehicles
    const vehicleIds = vehicles.map(v => v.id);
    
    // If we have filters, we limit trip counts to those vehicles
    const tripWhere = {};
    if (vehicleIds.length > 0) {
      tripWhere.vehicleId = { in: vehicleIds };
    }

    const activeTripsCount = await prisma.trip.count({
      where: {
        ...tripWhere,
        status: TripStatuses.DISPATCHED,
      },
    });

    const pendingTripsCount = await prisma.trip.count({
      where: {
        ...tripWhere,
        status: TripStatuses.DRAFT,
      },
    });

    // 4. Drivers counts (on duty is AVAILABLE or ON_TRIP)
    const driversOnDutyCount = await prisma.driver.count({
      where: {
        status: { in: [DriverStatuses.AVAILABLE, DriverStatuses.ON_TRIP] },
      },
    });

    return {
      kpis: {
        activeVehicles: activeVehiclesCount,
        availableVehicles: availableVehiclesCount,
        vehiclesInMaintenance: maintenanceVehiclesCount,
        retiredVehicles: retiredVehiclesCount,
        activeTrips: activeTripsCount,
        pendingTrips: pendingTripsCount,
        driversOnDuty: driversOnDutyCount,
        fleetUtilization: parseFloat(fleetUtilization.toFixed(2)),
      },
    };
  }

  /**
   * Get financial analytics and ROI per vehicle
   */
  async getFinancialReport() {
    // Fetch all vehicles with their related records
    const vehicles = await prisma.vehicle.findMany({
      include: {
        trips: {
          where: { status: TripStatuses.COMPLETED },
          select: { revenue: true },
        },
        maintenances: {
          select: { cost: true },
        },
        fuelLogs: {
          select: { cost: true },
        },
      },
    });

    // Map each vehicle to its financial metrics
    return vehicles.map((vehicle) => {
      const acquisitionCost = Number(vehicle.acquisitionCost);

      // Sum revenue from completed trips
      const totalRevenue = vehicle.trips.reduce(
        (sum, trip) => sum + Number(trip.revenue),
        0
      );

      // Sum maintenance costs
      const totalMaintenance = vehicle.maintenances.reduce(
        (sum, maint) => sum + Number(maint.cost),
        0
      );

      // Sum fuel costs
      const totalFuel = vehicle.fuelLogs.reduce(
        (sum, log) => sum + Number(log.cost),
        0
      );

      // ROI = [ (Revenue - (Maintenance + Fuel)) / Acquisition Cost ] * 100
      const netEarnings = totalRevenue - (totalMaintenance + totalFuel);
      const roi = acquisitionCost > 0 ? (netEarnings / acquisitionCost) * 100 : 0;

      return {
        id: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        model: vehicle.model,
        type: vehicle.type,
        region: vehicle.region,
        status: vehicle.status,
        acquisitionCost,
        totalRevenue,
        totalFuelCost: totalFuel,
        totalMaintenanceCost: totalMaintenance,
        netEarnings,
        roi: parseFloat(roi.toFixed(2)),
      };
    });
  }

  /**
   * Compile the financial report into a CSV string
   */
  async generateFinancialCSV() {
    const reportData = await this.getFinancialReport();

    const headers = [
      'Vehicle ID',
      'Registration Number',
      'Model',
      'Type',
      'Region',
      'Status',
      'Acquisition Cost ($)',
      'Total Revenue ($)',
      'Total Fuel Cost ($)',
      'Total Maintenance Cost ($)',
      'Net Earnings ($)',
      'ROI (%)',
    ].join(',');

    const rows = reportData.map((item) =>
      [
        item.id,
        `"${item.registrationNumber}"`,
        `"${item.model}"`,
        `"${item.type}"`,
        `"${item.region}"`,
        `"${item.status}"`,
        item.acquisitionCost.toFixed(2),
        item.totalRevenue.toFixed(2),
        item.totalFuelCost.toFixed(2),
        item.totalMaintenanceCost.toFixed(2),
        item.netEarnings.toFixed(2),
        item.roi.toFixed(2),
      ].join(',')
    );

    return [headers, ...rows].join('\n');
  }
}

module.exports = new DashboardService();
