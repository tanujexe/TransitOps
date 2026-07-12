const express = require('express');
const zod = require('zod');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const Roles = require('../constants/roles');

const router = express.Router();

// 1. Zod schemas for registration and login validation
const registerSchema = zod.object({
  body: zod.object({
    name: zod.string().min(2, 'Name must be at least 2 characters long'),
    email: zod.string().email('Please provide a valid email address'),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
    role: zod.nativeEnum(Roles, {
      errorMap: () => ({ message: 'Invalid user role selected' }),
    }),
  }),
});

const loginSchema = zod.object({
  body: zod.object({
    email: zod.string().email('Please provide a valid email address'),
    password: zod.string().min(1, 'Password is required'),
  }),
});

// 2. Mount routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
