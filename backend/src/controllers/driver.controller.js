const driverService = require('../services/driver.service');

class DriverController {
  async getAll(req, res, next) {
    try {
      const drivers = await driverService.getAll(req.query);
      res.status(200).json({
        success: true,
        data: drivers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const driver = await driverService.getById(parseInt(req.params.id, 10));
      res.status(200).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const driver = await driverService.create(req.body);
      res.status(201).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const driver = await driverService.update(parseInt(req.params.id, 10), req.body);
      res.status(200).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await driverService.delete(parseInt(req.params.id, 10));
      res.status(200).json({
        success: true,
        message: 'Driver deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DriverController();
