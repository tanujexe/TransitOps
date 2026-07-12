const prisma = require('../config/database');
const { NotFoundError, BadRequestError } = require('../utils/errors');

class ExpenseService {
  /**
   * Log a manual fuel entry
   */
  async logFuel(data) {
    const { vehicleId, tripId, amountLiters, cost, odometer, date } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Verify vehicle exists
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        throw new NotFoundError(`Vehicle with ID ${vehicleId} not found.`);
      }

      // 2. Validate odometer
      if (odometer < vehicle.odometer) {
        throw new BadRequestError(`Logged odometer (${odometer}km) cannot be less than vehicle's current odometer (${vehicle.odometer}km).`);
      }

      // 3. Create fuel log
      const fuelLog = await tx.fuelLog.create({
        data: {
          vehicleId,
          tripId,
          amountLiters,
          cost,
          odometer,
          date: date ? new Date(date) : new Date(),
        },
      });

      // 4. Create corresponding expense record
      await tx.expense.create({
        data: {
          vehicleId,
          tripId,
          category: 'FUEL',
          amount: cost,
          description: `Fuel consumption: ${amountLiters} liters logged.`,
          date: date ? new Date(date) : new Date(),
        },
      });

      // 5. Update vehicle odometer
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { odometer },
      });

      return fuelLog;
    });
  }

  /**
   * Log a manual expense (tolls, maintenance, etc.)
   */
  async logExpense(data) {
    const { vehicleId, tripId, category, amount, description, date } = data;

    // Verify vehicle if provided
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        throw new NotFoundError(`Vehicle with ID ${vehicleId} not found.`);
      }
    }

    // Verify trip if provided
    if (tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) {
        throw new NotFoundError(`Trip with ID ${tripId} not found.`);
      }
    }

    return prisma.expense.create({
      data: {
        vehicleId,
        tripId,
        category,
        amount,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });
  }

  /**
   * List fuel logs
   */
  async getFuelLogs(filters = {}) {
    const { vehicleId } = filters;
    const where = {};

    if (vehicleId) {
      where.vehicleId = parseInt(vehicleId, 10);
    }

    return prisma.fuelLog.findMany({
      where,
      include: {
        vehicle: { select: { registrationNumber: true, model: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * List expenses
   */
  async getExpenses(filters = {}) {
    const { vehicleId, category } = filters;
    const where = {};

    if (vehicleId) {
      where.vehicleId = parseInt(vehicleId, 10);
    }
    if (category) {
      where.category = category;
    }

    return prisma.expense.findMany({
      where,
      include: {
        vehicle: { select: { registrationNumber: true, model: true } },
      },
      orderBy: { date: 'desc' },
    });
  }
}

module.exports = new ExpenseService();
