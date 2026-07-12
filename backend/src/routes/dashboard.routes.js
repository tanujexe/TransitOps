const express = require('express');
const zod = require('zod');
const dashboardController = require('../controllers/dashboard.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const Roles = require('../constants/roles');
const { VehicleStatuses } = require('../constants/statuses');

const router = express.Router();

// 1. Zod validation schemas
const statsQuerySchema = zod.object({
  query: zod.object({
    type: zod.string().optional(),
    status: zod.nativeEnum(VehicleStatuses).optional(),
    region: zod.string().optional(),
  }),
});

// 2. Mount routes with Authentication and Authorization
router.use(authMiddleware);

// Get dashboard KPIs
router.get(
  '/stats',
  validate(statsQuerySchema),
  dashboardController.getStats
);

// Get financial ROI reports
router.get(
  '/reports',
  authorize(Roles.FLEET_MANAGER, Roles.FINANCIAL_ANALYST),
  dashboardController.getFinancialReport
);

// Export reports to CSV file
router.get(
  '/reports/export',
  authorize(Roles.FLEET_MANAGER, Roles.FINANCIAL_ANALYST),
  dashboardController.exportFinancialCSV
);

module.exports = router;
