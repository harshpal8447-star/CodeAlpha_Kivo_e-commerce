// Indian Rupee (INR / ₹) Currency Formatter

export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
};

export const formatINRWithDecimals = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export const formatRupee = formatINR;

export default formatINR;
