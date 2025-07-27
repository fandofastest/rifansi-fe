export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatDate = (date: string | number): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('id-ID', options);
};

export const getMonthName = (month: number): string => {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleString('id-ID', { month: 'long' });
};
