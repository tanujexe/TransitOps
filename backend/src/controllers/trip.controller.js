const tripService = require('../services/trip.service');

class TripController {
  async getAll(req, res, next) {
    try {
      const trips = await tripService.getAll(req.query);
      res.status(200).json({
        success: true,
        data: trips,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const trip = await tripService.getById(parseInt(req.params.id, 10));
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const trip = await tripService.create(req.body);
      res.status(201).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  async dispatch(req, res, next) {
    try {
      const trip = await tripService.dispatch(parseInt(req.params.id, 10), req.user.id);
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  async complete(req, res, next) {
    try {
      const trip = await tripService.complete(parseInt(req.params.id, 10), req.body, req.user.id);
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const trip = await tripService.cancel(parseInt(req.params.id, 10), req.user.id);
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TripController();
