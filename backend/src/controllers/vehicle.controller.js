const vehicleService = require('../services/vehicle.service');

class VehicleController {
  async getAll(req, res, next) {
    try {
      const vehicles = await vehicleService.getAll(req.query);
      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const vehicle = await vehicleService.getById(parseInt(req.params.id, 10));
      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const vehicle = await vehicleService.create(req.body);
      res.status(201).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const vehicle = await vehicleService.update(parseInt(req.params.id, 10), req.body);
      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await vehicleService.delete(parseInt(req.params.id, 10));
      res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleController();
