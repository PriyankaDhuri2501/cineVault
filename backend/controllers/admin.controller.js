import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { asyncHandler } from '../utils/helpers.js';
import User from '../models/User.js';

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

/**
 * @route   POST /api/admin/users
 * @desc    Create a new admin user (Admin only)
 * @access  Private/Admin
 */
export const createAdmin = asyncHandler(async (req, res, next) => {
  const { username, email, password, role } = req.body;

  // Validation
  if (!username || !email || !password) {
    return next(new ValidationError('Please provide username, email, and password'));
  }

  if (role && !['user', 'admin'].includes(role)) {
    return next(new ValidationError('Role must be either "user" or "admin"'));
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return next(new ValidationError('User with this email or username already exists'));
  }

  
  const user = await User.create({
    username,
    email,
    password,
    role: role || 'admin',
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    data: {
      user: userResponse,
    },
  });
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update a user (Admin only)
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res, next) => {
  const { username, email, role } = req.body;
  const userId = req.params.id;

  // Prevent admin from updating themselves (security)
  if (userId === req.user._id.toString()) {
    return next(new ForbiddenError('You cannot update your own account from this interface'));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new NotFoundError('User not found'));
  }


  if (username) user.username = username;
  if (email) user.email = email;
  if (role && ['user', 'admin'].includes(role)) user.role = role;

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: {
      user: userResponse,
    },
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (Admin only)
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  // Prevent admin from deleting themselves
  if (userId === req.user._id.toString()) {
    return next(new ForbiddenError('You cannot delete your own account'));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new NotFoundError('User not found'));
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
    data: null,
  });
});
