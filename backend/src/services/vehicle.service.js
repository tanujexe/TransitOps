const prisma = require('../config/database');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { VehicleStatuses } = require('../constants/statuses');

class VehicleService {
  /**
   * Get all vehicles with optional filters
   */
  async getAll(filters = {}) {
    const { status, type, region, search } = filters;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (region) {
      where.region = region;
    }
    if (search) {
      where.OR = [
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get vehicle by ID
   */
  async getById(id) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found.`);
    }

    return vehicle;
  }

  /**
   * Create a new vehicle
   */
  async create(data) {
    // Check duplicate registration number
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });

    if (existing) {
      throw new ConflictError(`Vehicle with registration number ${data.registrationNumber} already exists.`);
    }

    return prisma.vehicle.create({
      data,
    });
  }

  /**
   * Update an existing vehicle
   */
  async update(id, data) {
    // Ensure vehicle exists
    await this.getById(id);

    // If changing registrationNumber, verify uniqueness
    if (data.registrationNumber) {
      const existing = await prisma.vehicle.findFirst({
        where: {
          registrationNumber: data.registrationNumber,
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictError(`Vehicle with registration number ${data.registrationNumber} already exists.`);
      }
    }

    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete vehicle
   */
  async delete(id) {
    // Ensure vehicle exists
    await this.getById(id);

    // Check if vehicle is linked to any active/dispatched trips
    const activeTrip = await prisma.trip.findFirst({
      where: {
        vehicleId: id,
        status: 'DISPATCHED',
      },
    });

    if (activeTrip) {
      throw new ConflictError('Cannot delete vehicle while it is assigned to an active trip.');
    }

    return prisma.vehicle.delete({
      where: { id },
    });
  }
}

module.exports = new VehicleService();
