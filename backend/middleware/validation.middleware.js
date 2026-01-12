import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Validation Middleware
 * Checks express-validator results and sends errors if validation fails
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new ValidationError(errorMessages.join(', ')));
  }

  next();
};

