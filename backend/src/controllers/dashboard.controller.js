const dashboardService = require('../services/dashboard.service');

class DashboardController {
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getStats(req.query);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFinancialReport(req, res, next) {
    try {
      const report = await dashboardService.getFinancialReport();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportFinancialCSV(req, res, next) {
    try {
      const csvContent = await dashboardService.generateFinancialCSV();
      
      // Set response headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transitops_financial_report.csv');
      
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
