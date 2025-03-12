// User Schema with Default Role and Admin Authentication
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['seller', 'admin'],
      default: 'seller', // default role
    },
    // Add status field to track approval

    isApproved: { type: Boolean, default: false },

    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Middleware to hash password before saving


export const User = mongoose.model('user', UserSchema);
