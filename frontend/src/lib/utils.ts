import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  if (currentPage === 1) {
    return [1, 2, '...', totalPages];
  }
  
  if (currentPage === 2) {
    return [1, 2, 3, '...', totalPages];
  }
  
  if (currentPage === totalPages) {
    return [1, '...', totalPages - 1, totalPages];
  }
  
  if (currentPage === totalPages - 1) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages];
  }
  
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export function numberToIndianWords(num: number): string {
  if (isNaN(num)) return '';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertWhole = (n: number): string => {
    if (n === 0) return 'Zero';
    if (n < 0) return 'Minus ' + convertWhole(Math.abs(n));
    let str = '';
    if (n >= 10000000) {
      str += convertWhole(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += convertWhole(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += convertWhole(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += convertWhole(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += a[n] + ' ';
      } else {
        str += b[Math.floor(n / 10)];
        if (n % 10 > 0) str += '-' + a[n % 10] + ' ';
        else str += ' ';
      }
    }
    return str.trim();
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = convertWhole(rupees) + ' Rupees';
  if (paise > 0) {
    result += ' and ' + convertWhole(paise) + ' Paise';
  }
  return result;
}

export function formatCurrencyTooltip(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '₹0.00';
  const formatted = `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const words = numberToIndianWords(num);
  return `${formatted} - ${words}`;
}
