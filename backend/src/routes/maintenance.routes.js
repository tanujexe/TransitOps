const express = require('express');
const zod = require('zod');
const maintenanceController = require('../controllers/maintenance.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const Roles = require('../constants/roles');
const { MaintenanceStatuses } = require('../constants/statuses');

const router = express.Router();

// 1. Zod validation schemas
const logMaintenanceSchema = zod.object({
  body: zod.object({
    vehicleId: zod.number().int().positive('Vehicle ID must be a positive integer'),
    description: zod.string().trim().min(5, 'Description must be at least 5 characters long'),
    cost: zod.number().positive('Estimated cost must be positive'),
    startDate: zod.string().datetime({ message: 'Start date must be a valid ISO Date-Time' }).optional(),
  }),
});

const closeMaintenanceSchema = zod.object({
  params: zod.object({
    id: zod.preprocess((val) => parseInt(val, 10), zod.number().int().positive()),
  }),
  body: zod.object({
    endDate: zod.string().datetime({ message: 'End date must be a valid ISO Date-Time' }).optional(),
    finalCost: zod.number().positive('Final cost must be positive').optional(),
  }),
});

const getMaintenanceQuerySchema = zod.object({
  query: zod.object({
    vehicleId: zod.string().optional(),
    status: zod.nativeEnum(MaintenanceStatuses).optional(),
  }),
});

const getMaintenanceByIdSchema = zod.object({
  params: zod.object({
    id: zod.preprocess((val) => parseInt(val, 10), zod.number().int().positive()),
  }),
});

// 2. Mount routes with Authentication and Authorization
router.use(authMiddleware);

router.get(
  '/',
  validate(getMaintenanceQuerySchema),
  maintenanceController.getAll
);

router.get(
  '/:id',
  validate(getMaintenanceByIdSchema),
  maintenanceController.getById
);

router.post(
  '/',
  authorize(Roles.FLEET_MANAGER, Roles.SAFETY_OFFICER),
  validate(logMaintenanceSchema),
  maintenanceController.logMaintenance
);

router.post(
  '/:id/close',
  authorize(Roles.FLEET_MANAGER, Roles.SAFETY_OFFICER),
  validate(closeMaintenanceSchema),
  maintenanceController.closeMaintenance
);

module.exports = router;
