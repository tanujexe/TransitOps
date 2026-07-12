const express = require('express');
const zod = require('zod');
const driverController = require('../controllers/driver.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const Roles = require('../constants/roles');
const { DriverStatuses } = require('../constants/statuses');

const router = express.Router();

// 1. Zod validation schemas
const createDriverSchema = zod.object({
  body: zod.object({
    name: zod.string().trim().min(2, 'Driver name must be at least 2 characters'),
    licenseNumber: zod.string().trim().min(5, 'License number is too short'),
    licenseCategory: zod.string().trim().min(1, 'License category is required'),
    licenseExpiry: zod.string().datetime({ message: 'License expiry must be a valid ISO Date-Time' }),
    phone: zod.string().trim().min(10, 'Contact number is too short'),
    safetyScore: zod.number().min(0).max(5, 'Safety score must be between 0.0 and 5.0').optional(),
    status: zod.nativeEnum(DriverStatuses).optional(),
  }),
});

const updateDriverSchema = zod.object({
  params: zod.object({
    id: zod.preprocess((val) => parseInt(val, 10), zod.number().int().positive()),
  }),
  body: zod.object({
    name: zod.string().trim().min(2).optional(),
    licenseNumber: zod.string().trim().min(5).optional(),
    licenseCategory: zod.string().trim().min(1).optional(),
    licenseExpiry: zod.string().datetime().optional(),
    phone: zod.string().trim().min(10).optional(),
    safetyScore: zod.number().min(0).max(5).optional(),
    status: zod.nativeEnum(DriverStatuses).optional(),
  }).refine((data) => Object.keys(data).length > 0, 'At least one field must be provided for update'),
});

const getDriversQuerySchema = zod.object({
  query: zod.object({
    status: zod.nativeEnum(DriverStatuses).optional(),
    search: zod.string().optional(),
  }),
});

const getDriverByIdSchema = zod.object({
  params: zod.object({
    id: zod.preprocess((val) => parseInt(val, 10), zod.number().int().positive()),
  }),
});

// 2. Mount routes with Authentication and Authorization
router.use(authMiddleware);

router.get(
  '/',
  validate(getDriversQuerySchema),
  driverController.getAll
);

router.get(
  '/:id',
  validate(getDriverByIdSchema),
  driverController.getById
);

router.post(
  '/',
  authorize(Roles.FLEET_MANAGER, Roles.SAFETY_OFFICER),
  validate(createDriverSchema),
  driverController.create
);

router.put(
  '/:id',
  authorize(Roles.FLEET_MANAGER, Roles.SAFETY_OFFICER),
  validate(updateDriverSchema),
  driverController.update
);

router.delete(
  '/:id',
  authorize(Roles.FLEET_MANAGER, Roles.SAFETY_OFFICER),
  validate(getDriverByIdSchema),
  driverController.delete
);

module.exports = router;
