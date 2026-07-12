const prisma = require('../config/database');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { VehicleStatuses, DriverStatuses, TripStatuses } = require('../constants/statuses');

class TripService {
  /**
   * Get all trips with optional filters
   */
  async getAll(filters = {}) {
    const { status, vehicleId, driverId } = filters;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (vehicleId) {
      where.vehicleId = parseInt(vehicleId, 10);
    }
    if (driverId) {
      where.driverId = parseInt(driverId, 10);
    }

    return prisma.trip.findMany({
      where,
      include: {
        vehicle: {
          select: { registrationNumber: true, model: true, type: true },
        },
        driver: {
          select: { name: true, phone: true, licenseCategory: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get trip by ID
   */
  async getById(id) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: true,
        expenses: true,
      },
    });

    if (!trip) {
      throw new NotFoundError(`Trip with ID ${id} not found.`);
    }

    return trip;
  }

  /**
   * Create a draft trip
   */
  async create(data) {
    const trackingNumber = `TRIP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Verify vehicle and driver exist
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${data.vehicleId} not found.`);
    }

    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) {
      throw new NotFoundError(`Driver with ID ${data.driverId} not found.`);
    }

    return prisma.trip.create({
      data: {
        ...data,
        trackingNumber,
        status: TripStatuses.DRAFT,
      },
    });
  }

  /**
   * Dispatch a trip (Transactional check & update)
   */
  async dispatch(id, userId) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch trip, driver, vehicle with current transaction client
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });

      if (!trip) {
        throw new NotFoundError(`Trip with ID ${id} not found.`);
      }

      // 2. State validations
      if (trip.status !== TripStatuses.DRAFT) {
        throw new BadRequestError(`Cannot dispatch trip in ${trip.status} status. Only DRAFT trips can be dispatched.`);
      }

      if (trip.vehicle.status !== VehicleStatuses.AVAILABLE) {
        throw new BadRequestError(`Vehicle ${trip.vehicle.registrationNumber} is currently ${trip.vehicle.status} and cannot be dispatched.`);
      }

      if (trip.driver.status !== DriverStatuses.AVAILABLE) {
        throw new BadRequestError(`Driver ${trip.driver.name} is currently ${trip.driver.status} and cannot be assigned.`);
      }

      // 3. Expiry and health check
      const now = new Date();
      if (new Date(trip.driver.licenseExpiry) < now) {
        throw new BadRequestError(`Driver ${trip.driver.name} cannot be assigned because their driving license has expired.`);
      }

      // 4. Weight capacity validation
      if (trip.cargoWeightKg > trip.vehicle.capacityKg) {
        throw new BadRequestError(`Cargo weight (${trip.cargoWeightKg}kg) exceeds vehicle maximum capacity (${trip.vehicle.capacityKg}kg).`);
      }

      // 5. Execute transactional updates
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatuses.DISPATCHED,
          dispatchedAt: now,
        },
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatuses.ON_TRIP },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatuses.ON_TRIP },
      });

      // 6. Log activity
      await tx.activityLog.create({
        data: {
          userId,
          action: 'TRIP_DISPATCH',
          entityType: 'Trip',
          entityId: id,
          message: `Trip ${trip.trackingNumber} successfully dispatched with vehicle ${trip.vehicle.registrationNumber} and driver ${trip.driver.name}.`,
        },
      });

      return updatedTrip;
    });
  }

  /**
   * Complete a trip (Transactional check & update)
   */
  async complete(id, data, userId) {
    const { actualDistance, fuelLiters, fuelCost, additionalExpenses = [] } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Fetch trip, driver, vehicle
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });

      if (!trip) {
        throw new NotFoundError(`Trip with ID ${id} not found.`);
      }

      // 2. Validate status
      if (trip.status !== TripStatuses.DISPATCHED) {
        throw new BadRequestError(`Cannot complete trip in ${trip.status} status. Only DISPATCHED trips can be completed.`);
      }

      // Calculate odometer end
      const odometerEnd = trip.vehicle.odometer + parseInt(actualDistance, 10);
      const now = new Date();

      // 3. Update states
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatuses.COMPLETED,
          completedAt: now,
          actualDistance,
        },
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: VehicleStatuses.AVAILABLE,
          odometer: odometerEnd,
        },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatuses.AVAILABLE },
      });

      // 4. Create Fuel Log if details provided
      if (fuelLiters > 0 && fuelCost > 0) {
        await tx.fuelLog.create({
          data: {
            vehicleId: trip.vehicleId,
            tripId: trip.id,
            amountLiters: fuelLiters,
            cost: fuelCost,
            odometer: odometerEnd,
            date: now,
          },
        });

        // Register fuel log expense
        await tx.expense.create({
          data: {
            vehicleId: trip.vehicleId,
            tripId: trip.id,
            category: 'FUEL',
            amount: fuelCost,
            description: `Fuel consumption: ${fuelLiters} liters logged upon trip completion.`,
            date: now,
          },
        });
      }

      // 5. Create additional expenses
      for (const expense of additionalExpenses) {
        await tx.expense.create({
          data: {
            vehicleId: trip.vehicleId,
            tripId: trip.id,
            category: expense.category,
            amount: expense.amount,
            description: expense.description || `${expense.category} expense logged during trip completion.`,
            date: now,
          },
        });
      }

      // 6. Log Activity
      await tx.activityLog.create({
        data: {
          userId,
          action: 'TRIP_COMPLETE',
          entityType: 'Trip',
          entityId: id,
          message: `Trip ${trip.trackingNumber} completed. Vehicle odometer updated to ${odometerEnd}km.`,
        },
      });

      return updatedTrip;
    });
  }

  /**
   * Cancel a trip (Transactional check & update)
   */
  async cancel(id, userId) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch trip
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });

      if (!trip) {
        throw new NotFoundError(`Trip with ID ${id} not found.`);
      }

      // 2. Validate status
      if (trip.status !== TripStatuses.DRAFT && trip.status !== TripStatuses.DISPATCHED) {
        throw new BadRequestError(`Cannot cancel trip in ${trip.status} status. Only DRAFT or DISPATCHED trips can be cancelled.`);
      }

      const wasDispatched = trip.status === TripStatuses.DISPATCHED;
      const now = new Date();

      // 3. Update status
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatuses.CANCELLED,
          cancelledAt: now,
        },
      });

      // 4. If dispatched, release resources back to AVAILABLE
      if (wasDispatched) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatuses.AVAILABLE },
        });

        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatuses.AVAILABLE },
        });
      }

      // 5. Log Activity
      await tx.activityLog.create({
        data: {
          userId,
          action: 'TRIP_CANCEL',
          entityType: 'Trip',
          entityId: id,
          message: `Trip ${trip.trackingNumber} cancelled. Assigned vehicle and driver returned to available pool.`,
        },
      });

      return updatedTrip;
    });
  }
}

module.exports = new TripService();
