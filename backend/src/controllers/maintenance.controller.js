const maintenanceService = require('../services/maintenance.service');

class MaintenanceController {
  async getAll(req, res, next) {
    try {
      const logs = await maintenanceService.getAll(req.query);
      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const log = await maintenanceService.getById(parseInt(req.params.id, 10));
      res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }

  async logMaintenance(req, res, next) {
    try {
      const log = await maintenanceService.logMaintenance(req.body, req.user.id);
      res.status(201).json({
        success: true,
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }

  async closeMaintenance(req, res, next) {
    try {
      const log = await maintenanceService.closeMaintenance(parseInt(req.params.id, 10), req.body, req.user.id);
      res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaintenanceController();
