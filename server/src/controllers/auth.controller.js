import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { config } from '../config/index.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: config.cookie.maxAge,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'CUSTOMER', // Hardened against role privilege escalation
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeName: true,
        companyName: true,
        sellerGstin: true,
        sellerPhone: true,
        sellerCity: true,
        sellerAddress: true,
        sellerBio: true,
        isSellerApproved: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user.id);
    setAuthCookie(res, token);

    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeName: user.storeName,
      companyName: user.companyName,
      sellerGstin: user.sellerGstin,
      sellerPhone: user.sellerPhone,
      sellerCity: user.sellerCity,
      isSellerApproved: user.isSellerApproved,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: { user: userSafe, token },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeName: true,
        companyName: true,
        sellerGstin: true,
        sellerPhone: true,
        sellerCity: true,
        sellerAddress: true,
        sellerBio: true,
        isSellerApproved: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email address.',
    });
  }

  // Safe developer-mode response
  return res.status(200).json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been dispatched.',
    devNotice: 'In development mode, password reset links are simulated for security.',
  });
};
