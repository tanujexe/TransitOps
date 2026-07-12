const expenseService = require('../services/expense.service');

class ExpenseController {
  async logFuel(req, res, next) {
    try {
      const fuelLog = await expenseService.logFuel(req.body);
      res.status(201).json({
        success: true,
        data: fuelLog,
      });
    } catch (error) {
      next(error);
    }
  }

  async logExpense(req, res, next) {
    try {
      const expense = await expenseService.logExpense(req.body);
      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFuelLogs(req, res, next) {
    try {
      const logs = await expenseService.getFuelLogs(req.query);
      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpenses(req, res, next) {
    try {
      const expenses = await expenseService.getExpenses(req.query);
      res.status(200).json({
        success: true,
        data: expenses,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpenseController();
