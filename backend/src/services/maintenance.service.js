const prisma = require('../config/database');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { VehicleStatuses, MaintenanceStatuses } = require('../constants/statuses');

class MaintenanceService {
  /**
   * Get all maintenance logs with optional filters
   */
  async getAll(filters = {}) {
    const { vehicleId, status } = filters;
    const where = {};

    if (vehicleId) {
      where.vehicleId = parseInt(vehicleId, 10);
    }
    if (status) {
      where.status = status;
    }

    return prisma.maintenance.findMany({
      where,
      include: {
        vehicle: {
          select: { registrationNumber: true, model: true },
        },
        loggedBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get maintenance log by ID
   */
  async getById(id) {
    const log = await prisma.maintenance.findUnique({
      where: { id },
      include: { vehicle: true, loggedBy: true },
    });

    if (!log) {
      throw new NotFoundError(`Maintenance log with ID ${id} not found.`);
    }

    return log;
  }

  /**
   * Log vehicle maintenance (Transactional check & status update)
   */
  async logMaintenance(data, userId) {
    const { vehicleId, description, cost, startDate } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Verify vehicle state
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        throw new NotFoundError(`Vehicle with ID ${vehicleId} not found.`);
      }

      if (vehicle.status === VehicleStatuses.RETIRED) {
        throw new BadRequestError(`Cannot send retired vehicle ${vehicle.registrationNumber} to maintenance.`);
      }
      if (vehicle.status === VehicleStatuses.IN_SHOP) {
        throw new BadRequestError(`Vehicle ${vehicle.registrationNumber} is already in maintenance.`);
      }
      if (vehicle.status === VehicleStatuses.ON_TRIP) {
        throw new BadRequestError(`Vehicle ${vehicle.registrationNumber} is currently on a trip. Complete or cancel the trip first.`);
      }

      // 2. Create maintenance record
      const maintenance = await tx.maintenance.create({
        data: {
          vehicleId,
          description,
          cost,
          startDate: startDate ? new Date(startDate) : new Date(),
          status: MaintenanceStatuses.OPEN,
          loggedById: userId,
        },
      });

      // 3. Update vehicle status to IN_SHOP
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: VehicleStatuses.IN_SHOP },
      });

      // 4. Create Activity Log
      await tx.activityLog.create({
        data: {
          userId,
          action: 'MAINTENANCE_LOG',
          entityType: 'Vehicle',
          entityId: vehicleId,
          message: `Vehicle ${vehicle.registrationNumber} sent to maintenance: ${description}. Status changed to IN_SHOP.`,
        },
      });

      return maintenance;
    });
  }

  /**
   * Close vehicle maintenance (Transactional check & status restore)
   */
  async closeMaintenance(id, data, userId) {
    const { endDate, finalCost } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Fetch maintenance record
      const maintenance = await tx.maintenance.findUnique({
        where: { id },
        include: { vehicle: true },
      });

      if (!maintenance) {
        throw new NotFoundError(`Maintenance record with ID ${id} not found.`);
      }

      // 2. Validate state
      if (maintenance.status !== MaintenanceStatuses.OPEN) {
        throw new BadRequestError(`Maintenance record is already ${maintenance.status}. Only OPEN maintenance can be closed.`);
      }

      const closedCost = finalCost !== undefined ? finalCost : maintenance.cost;
      const closedDate = endDate ? new Date(endDate) : new Date();

      // 3. Update Maintenance status
      const updatedMaintenance = await tx.maintenance.update({
        where: { id },
        data: {
          status: MaintenanceStatuses.CLOSED,
          endDate: closedDate,
          cost: closedCost,
        },
      });

      // 4. Restore vehicle availability unless it was retired in the meantime
      if (maintenance.vehicle.status === VehicleStatuses.IN_SHOP) {
        await tx.vehicle.update({
          where: { id: maintenance.vehicleId },
          data: { status: VehicleStatuses.AVAILABLE },
        });
      }

      // 5. Register Maintenance Expense record
      await tx.expense.create({
        data: {
          vehicleId: maintenance.vehicleId,
          category: 'MAINTENANCE',
          amount: closedCost,
          description: `Maintenance expense: ${maintenance.description} closed.`,
          date: closedDate,
        },
      });

      // 6. Create Activity Log
      await tx.activityLog.create({
        data: {
          userId,
          action: 'MAINTENANCE_CLOSE',
          entityType: 'Vehicle',
          entityId: maintenance.vehicleId,
          message: `Maintenance for ${maintenance.vehicle.registrationNumber} closed. Total cost: $${closedCost}. Vehicle restored to AVAILABLE.`,
        },
      });

      return updatedMaintenance;
    });
  }
}

module.exports = new MaintenanceService();
