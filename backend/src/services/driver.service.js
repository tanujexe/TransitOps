const prisma = require('../config/database');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { DriverStatuses } = require('../constants/statuses');

class DriverService {
  /**
   * Get all drivers with filters
   */
  async getAll(filters = {}) {
    const { status, search } = filters;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.driver.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get driver by ID
   */
  async getById(id) {
    const driver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundError(`Driver with ID ${id} not found.`);
    }

    return driver;
  }

  /**
   * Create a new driver
   */
  async create(data) {
    // Check duplicate license number
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });

    if (existing) {
      throw new ConflictError(`Driver with license number ${data.licenseNumber} already exists.`);
    }

    // Convert date string if passed
    const licenseExpiry = typeof data.licenseExpiry === 'string' ? new Date(data.licenseExpiry) : data.licenseExpiry;

    return prisma.driver.create({
      data: {
        ...data,
        licenseExpiry,
      },
    });
  }

  /**
   * Update an existing driver
   */
  async update(id, data) {
    // Ensure driver exists
    await this.getById(id);

    // If changing license number, verify uniqueness
    if (data.licenseNumber) {
      const existing = await prisma.driver.findFirst({
        where: {
          licenseNumber: data.licenseNumber,
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictError(`Driver with license number ${data.licenseNumber} already exists.`);
      }
    }

    const updateData = { ...data };
    if (data.licenseExpiry) {
      updateData.licenseExpiry = typeof data.licenseExpiry === 'string' ? new Date(data.licenseExpiry) : data.licenseExpiry;
    }

    return prisma.driver.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete driver
   */
  async delete(id) {
    // Ensure driver exists
    await this.getById(id);

    // Verify driver has no active/dispatched trips
    const activeTrip = await prisma.trip.findFirst({
      where: {
        driverId: id,
        status: 'DISPATCHED',
      },
    });

    if (activeTrip) {
      throw new ConflictError('Cannot delete driver while they are assigned to an active trip.');
    }

    return prisma.driver.delete({
      where: { id },
    });
  }
}

module.exports = new DriverService();
