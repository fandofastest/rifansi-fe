const indonesianMonths = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export function formatDateIndonesia(dateString: string | number): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '-';
  }

  const day = date.getDate();
  const month = indonesianMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatDateTimeIndonesia(dateString: string | number): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '-';
  }

  const day = date.getDate();
  const month = indonesianMonths[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
} 