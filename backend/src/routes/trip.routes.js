const express = require('express');
const zod = require('zod');
const tripController = require('../controllers/trip.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const Roles = require('../constants/roles');
const { TripStatuses } = require('../constants/statuses');

const router = express.Router();

// 1. Zod validation schemas
const createTripSchema = zod.object({
  body: zod.object({
    vehicleId: zod.number().int().positive('Vehicle ID must be a positive integer'),
    driverId: zod.number().int().positive('Driver ID must be a positive integer'),
    cargoWeightKg: zod.number().int().positive('Cargo weight must be a positive integer'),
    plannedDistance: zod.number().positive('Planned distance must be a positive number'),
    revenue: zod.number().nonnegative('Revenue cannot be negative'),
    startLocation: zod.string().trim().min(1, 'Source location is required'),
    endLocation: zod.string().trim().min(1, 'Destination location is required'),
  }),
});

const completeTripSchema = zod.object({
  params: zod.object({
    id: zod.preprocess((val) => parseInt(val, 10), zod.number().int().positive()),
  }),
  body: zod.object({
    actualDistance: zod.number().positive('Actual distance must be a positive number'),
    fuelLiters: zod.number().nonnegative('Fuel liters must be non-negative').optional().default(0),
    fuelCost: zod.number().nonnegative('Fuel cost must be non-negative').optional().default(0),
    additionalExpenses: zod.array(
      zod.object({
        category: zod.enum(['FUEL', 'MAINTENANCE', 'TOLL', 'OTHER'], {
          errorMap: () => ({ message: 'Invalid expense category' }),
        }),
        amount: zod.number().positive('Expense amount must be a positive number'),
        description: zod.string().trim().optional(),
      })
    ).optional().default([]),
  }),
});

const getTripsQuerySchema = zod.object({
  query: zod.object({
    status: zod.nativeEnum(TripStatuses).optional(),
    vehicleId: zod.string().optional(),
    driverId: zod.string().optional(),
  }),
});

const getTripByIdSchema = zod.object({
  params: zod.object({
    id: zod.preprocess((val) => parseInt(val, 10), zod.number().int().positive()),
  }),
});

// 2. Mount routes with Authentication and Authorization
router.use(authMiddleware);

router.get(
  '/',
  validate(getTripsQuerySchema),
  tripController.getAll
);

router.get(
  '/:id',
  validate(getTripByIdSchema),
  tripController.getById
);

router.post(
  '/',
  authorize(Roles.DISPATCHER, Roles.FLEET_MANAGER),
  validate(createTripSchema),
  tripController.create
);

router.post(
  '/:id/dispatch',
  authorize(Roles.DISPATCHER, Roles.FLEET_MANAGER),
  validate(getTripByIdSchema),
  tripController.dispatch
);

router.post(
  '/:id/complete',
  authorize(Roles.DISPATCHER, Roles.FLEET_MANAGER),
  validate(completeTripSchema),
  tripController.complete
);

router.post(
  '/:id/cancel',
  authorize(Roles.DISPATCHER, Roles.FLEET_MANAGER),
  validate(getTripByIdSchema),
  tripController.cancel
);

module.exports = router;
