import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  createAdmin,
  updateUser,
  deleteUser,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

const adminUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .matches(/^[a-zA-Z0-9._-]+@gmail\.com$/)
    .withMessage('Email must be a Gmail address (@gmail.com)'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
];

const updateUserValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .matches(/^[a-zA-Z0-9._-]+@gmail\.com$/)
    .withMessage('Email must be a Gmail address (@gmail.com)'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
];


//All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

router.get('/users', getAllUsers);

router.post('/users', adminUserValidation, validate, createAdmin);

router.put('/users/:id', updateUserValidation, validate, updateUser);

router.delete('/users/:id', deleteUser);

export default router;
