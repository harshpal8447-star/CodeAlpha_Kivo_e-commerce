export const validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Full name is required (minimum 2 characters).';
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'A valid email address is required.';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'A valid email address is required.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

export const validateAddress = (req, res, next) => {
  const { fullName, street, city, state, postalCode, country } = req.body;
  const errors = {};

  if (!fullName || fullName.trim().length < 2) errors.fullName = 'Full name is required.';
  if (!street || street.trim().length < 3) errors.street = 'Street address is required.';
  if (!city || city.trim().length < 2) errors.city = 'City is required.';
  if (!state || state.trim().length < 2) errors.state = 'State / Province is required.';
  if (!postalCode || postalCode.trim().length < 3) errors.postalCode = 'Postal / ZIP code is required.';
  if (!country || country.trim().length < 2) errors.country = 'Country is required.';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Address validation failed.',
      errors,
    });
  }

  next();
};
