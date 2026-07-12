const logger = require('../utils/logger');
const env = require('../config/env');
const { AppError } = require('../utils/errors');
const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log the complete error trace
  logger.error(err.message || 'An unexpected error occurred', {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Handle Zod Schema validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        details,
      },
    });
  }

  // Handle Prisma Known Request Errors (P2002 Unique Constraint, etc.)
  if (err.code && err.code.startsWith('P')) {
    // Unique constraint violation (e.g., duplicate email, registrationNumber)
    if (err.code === 'P2002') {
      const fields = err.meta?.target || [];
      return res.status(409).json({
        success: false,
        error: {
          message: `Duplicate field value: ${fields.join(', ')}. Please use another value.`,
        },
      });
    }

    // Foreign key constraint violation
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid reference ID. A referenced record could not be found.',
        },
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: err.meta?.cause || 'Record not found',
        },
      });
    }
  }

  // Handle our Custom AppError errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  // Handle standard server unexpected errors (e.g., programming bugs)
  const isProduction = env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    error: {
      message: isProduction ? 'Internal Server Error' : err.message,
      ...(!isProduction ? { stack: err.stack } : {}),
    },
  });
};

module.exports = errorHandler;
