/**
 * Utility functions for handling dates consistently across the application
 * Fixes timezone issues that were causing dates to show one day behind
 */

/**
 * Creates a date object from a date string ensuring it's interpreted in local timezone
 * This prevents the "one day behind" issue caused by UTC interpretation
 */
export function createLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  // If the date string doesn't include time, add local midnight time
  if (!dateString.includes('T') && !dateString.includes(' ')) {
    return new Date(dateString + 'T00:00:00');
  }
  
  return new Date(dateString);
}

/**
 * Formats a date to YYYY-MM-DD string in local timezone
 * Ensures consistent date formatting across the application
 */
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compares two dates considering only the date part (ignoring time)
 * Returns true if they represent the same calendar day in local timezone
 */
export function isSameLocalDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? createLocalDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? createLocalDate(date2) : date2;
  
  return formatDateToLocal(d1) === formatDateToLocal(d2);
}

/**
 * Gets today's date as a YYYY-MM-DD string in local timezone
 */
export function getTodayLocal(): string {
  return formatDateToLocal(new Date());
}

/**
 * Checks if a date string represents today in local timezone
 */
export function isToday(dateString: string): boolean {
  return isSameLocalDate(dateString, new Date());
}

/**
 * Gets the start of the week for a given date (Monday = start of week)
 * Returns the date in local timezone
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday = start of week
  return new Date(d.setDate(diff));
}

/**
 * Formats a date to Brazilian locale string (DD/MM/YYYY)
 */
export function formatDateBR(date: Date | string): string {
  const d = typeof date === 'string' ? createLocalDate(date) : date;
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formats a date to a readable string in Portuguese
 */
export function formatDateReadable(date: Date | string): string {
  const d = typeof date === 'string' ? createLocalDate(date) : date;
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}