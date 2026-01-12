/**
 * Script to create an admin user
 * Run with: node scripts/createAdmin.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config({ path: './.env' });

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    const adminData = {
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminData.email },
        { username: adminData.username },
      ],
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      if (existingAdmin.role !== 'admin') {
        // Update role to admin
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
      process.exit(0);
    }

    // Create admin user
    // Password will be hashed by pre-save hook
    const admin = await User.create(adminData);

    console.log('✅ Admin user created successfully!');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('\n⚠️  Remember to change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();

