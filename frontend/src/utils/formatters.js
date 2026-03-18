const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

export const formatVnd = (value) => {
  const price = Number(value) || 0;
  return vndFormatter.format(price);
};

export const formatDurationLabel = (value) => {
  const duration = Number(value) || 0;
  return `${duration} phút`;
};
