const express = require('express');
const zod = require('zod');
const vehicleController = require('../controllers/vehicle.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const Roles = require('../constants/roles');
const { VehicleStatuses } = require('../constants/statuses');

const router = express.Router();

// 1. Zod validation schemas
const createVehicleSchema = zod.object({
  body: zod.object({
    registrationNumber: zod.string().trim().min(3, 'Registration number is too short'),
    model: zod.string().trim().min(1, 'Model is required'),
    type: zod.string().trim().min(1, 'Vehicle type is required'),
    capacityKg: zod.number().int().positive('Load capacity must be a positive integer'),
    odometer: zod.number().int().nonnegative('Odometer reading cannot be negative').optional(),
    acquisitionCost: zod.number().nonnegative('Acquisition cost must be non-negative'),
    region: zod.string().trim().min(1, 'Region is required'),
    status: zod.nativeEnum(VehicleStatuses).optional(),
  }),
});

const updateVehicleSchema = zod.object({
  params: zod.object({
    id: zod.preprocess((val) => parseInt(val, 10), zod.number().int().positive()),
  }),
  body: zod.object({
    registrationNumber: zod.string().trim().min(3).optional(),
    model: zod.string().trim().min(1).optional(),
    type: zod.string().trim().min(1).optional(),
    capacityKg: zod.number().int().positive().optional(),
    odometer: zod.number().int().nonnegative().optional(),
    acquisitionCost: zod.number().nonnegative().optional(),
    region: zod.string().trim().min(1).optional(),
    status: zod.nativeEnum(VehicleStatuses).optional(),
  }).refine((data) => Object.keys(data).length > 0, 'At least one field must be provided for update'),
});

const getVehiclesQuerySchema = zod.object({
  query: zod.object({
    status: zod.nativeEnum(VehicleStatuses).optional(),
    type: zod.string().optional(),
    region: zod.string().optional(),
    search: zod.string().optional(),
  }),
});

const getVehicleByIdSchema = zod.object({
  params: zod.object({
    id: zod.preprocess((val) => parseInt(val, 10), zod.number().int().positive()),
  }),
});

// 2. Mount routes with Authentication and Authorization
router.use(authMiddleware);

router.get(
  '/',
  validate(getVehiclesQuerySchema),
  vehicleController.getAll
);

router.get(
  '/:id',
  validate(getVehicleByIdSchema),
  vehicleController.getById
);

router.post(
  '/',
  authorize(Roles.FLEET_MANAGER),
  validate(createVehicleSchema),
  vehicleController.create
);

router.put(
  '/:id',
  authorize(Roles.FLEET_MANAGER),
  validate(updateVehicleSchema),
  vehicleController.update
);

router.delete(
  '/:id',
  authorize(Roles.FLEET_MANAGER),
  validate(getVehicleByIdSchema),
  vehicleController.delete
);

module.exports = router;
