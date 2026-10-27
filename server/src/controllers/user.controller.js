import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

export const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const dataToUpdate = {};

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      dataToUpdate.name = name.trim();
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long.',
        });
      }

      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password.',
        });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.',
        });
      }

      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
};

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { addresses },
    });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const { fullName, street, city, state, postalCode, country, phone, isDefault } = req.body;
    const userId = req.user.id;

    // Check if user has any existing addresses
    const count = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        fullName: fullName.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country?.trim() || 'United States',
        phone: phone ? phone.trim() : null,
        isDefault: shouldBeDefault,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      data: { address: newAddress },
    });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, street, city, state, postalCode, country, phone, isDefault } = req.body;
    const userId = req.user.id;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or does not belong to your account.',
      });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        fullName: fullName?.trim() || existing.fullName,
        street: street?.trim() || existing.street,
        city: city?.trim() || existing.city,
        state: state?.trim() || existing.state,
        postalCode: postalCode?.trim() || existing.postalCode,
        country: country?.trim() || existing.country,
        phone: phone !== undefined ? phone.trim() : existing.phone,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      data: { address: updated },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    await prisma.address.delete({ where: { id } });

    // If the deleted address was default, promote the newest address
    if (existing.isDefault) {
      const nextDefault = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (nextDefault) {
        await prisma.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};
