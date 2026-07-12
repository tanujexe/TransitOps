const express = require('express');
const zod = require('zod');
const expenseController = require('../controllers/expense.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const Roles = require('../constants/roles');

const router = express.Router();

// 1. Zod validation schemas
const logFuelSchema = zod.object({
  body: zod.object({
    vehicleId: zod.number().int().positive('Vehicle ID must be a positive integer'),
    tripId: zod.number().int().positive('Trip ID must be a positive integer').optional(),
    amountLiters: zod.number().positive('Fuel amount in liters must be positive'),
    cost: zod.number().positive('Fuel cost must be positive'),
    odometer: zod.number().int().positive('Odometer reading must be a positive integer'),
    date: zod.string().datetime({ message: 'Date must be a valid ISO Date-Time' }).optional(),
  }),
});

const logExpenseSchema = zod.object({
  body: zod.object({
    vehicleId: zod.number().int().positive('Vehicle ID must be a positive integer').optional(),
    tripId: zod.number().int().positive('Trip ID must be a positive integer').optional(),
    category: zod.enum(['FUEL', 'MAINTENANCE', 'TOLL', 'OTHER'], {
      errorMap: () => ({ message: 'Invalid expense category' }),
    }),
    amount: zod.number().positive('Expense amount must be positive'),
    description: zod.string().trim().min(3, 'Description must be at least 3 characters long'),
    date: zod.string().datetime({ message: 'Date must be a valid ISO Date-Time' }).optional(),
  }),
});

const getFuelLogsQuerySchema = zod.object({
  query: zod.object({
    vehicleId: zod.string().optional(),
  }),
});

const getExpensesQuerySchema = zod.object({
  query: zod.object({
    vehicleId: zod.string().optional(),
    category: zod.enum(['FUEL', 'MAINTENANCE', 'TOLL', 'OTHER']).optional(),
  }),
});

// 2. Mount routes with Authentication and Authorization
router.use(authMiddleware);

// Viewing fuel logs and expenses
router.get(
  '/fuel',
  validate(getFuelLogsQuerySchema),
  expenseController.getFuelLogs
);

router.get(
  '/',
  validate(getExpensesQuerySchema),
  expenseController.getExpenses
);

// Logging manual entries
router.post(
  '/fuel',
  authorize(Roles.FLEET_MANAGER, Roles.DISPATCHER, Roles.FINANCIAL_ANALYST),
  validate(logFuelSchema),
  expenseController.logFuel
);

router.post(
  '/',
  authorize(Roles.FLEET_MANAGER, Roles.DISPATCHER, Roles.FINANCIAL_ANALYST),
  validate(logExpenseSchema),
  expenseController.logExpense
);

module.exports = router;
