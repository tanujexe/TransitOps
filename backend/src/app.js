const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { NotFoundError } = require('./utils/errors');

const app = express();

// 1. Core security headers & settings
app.use(helmet());
app.use(cors());

// 2. Rate limiter for API safety
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// 3. Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. API routes
app.use('/api', routes);

// 5. Catch-all for unhandled routes
app.all(/.*/, (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// 6. Global error handler middleware
app.use(errorHandler);

module.exports = app;
