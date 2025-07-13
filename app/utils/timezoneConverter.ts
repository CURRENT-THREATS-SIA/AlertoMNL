/**
 * Utility functions for converting database timestamps to Philippine time
 * Philippine Standard Time (PST) is UTC+8
 */

/**
 * Convert database timestamp to Philippine timezone dynamically
 * This function handles various database time formats and converts them to Philippine time
 */
function convertToPhilippineTime(dateString: string): Date {
  try {
    // Parse the date string from database
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }
    
    // Get the current Philippine time for comparison
    const now = new Date();
    const philippineOffset = 8 * 60; // UTC+8 in minutes
    const localOffset = now.getTimezoneOffset(); // Local timezone offset in minutes
    const totalOffset = philippineOffset + localOffset; // Total offset needed
    
    // Create Philippine time by adding the offset
    const philippineTime = new Date(date.getTime() + (totalOffset * 60000));
    
    return philippineTime;
  } catch (error) {
    console.error('Error converting to Philippine time:', error);
    // Fallback: return current Philippine time
    const now = new Date();
    const philippineOffset = 8 * 60;
    const localOffset = now.getTimezoneOffset();
    const totalOffset = philippineOffset + localOffset;
    return new Date(now.getTime() + (totalOffset * 60000));
  }
}

/**
 * Format time in 24-hour military format for Philippine timezone
 * @param dateString - The date string from the database
 * @returns Formatted time string (e.g., "13:45")
 */
export function getPhilippineFormattedTime24Hour(dateString: string): string {
  try {
    const philippineDate = convertToPhilippineTime(dateString);
    
    const hours = philippineDate.getHours().toString().padStart(2, '0');
    const minutes = philippineDate.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting Philippine time:', error);
    return 'Invalid time';
  }
}

/**
 * Format time in 12-hour format with AM/PM for Philippine timezone
 * @param dateString - The date string from the database
 * @returns Formatted time string (e.g., "1:45 PM")
 */
export function getPhilippineFormattedTime12Hour(dateString: string): string {
  try {
    const philippineDate = convertToPhilippineTime(dateString);
    
    let hours = philippineDate.getHours();
    const minutes = philippineDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    return `${hours}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting Philippine time:', error);
    return 'Invalid time';
  }
}

/**
 * Format date and time for Philippine timezone with military time
 * @param dateString - The date string from the database
 * @returns Object with formatted date and time in military format
 */
export function formatPhilippineDateTime(dateString: string): { date: string; time: string } {
  try {
    const philippineDate = convertToPhilippineTime(dateString);
    
    // Format date
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[philippineDate.getMonth()];
    const day = philippineDate.getDate();
    const year = philippineDate.getFullYear();
    const formattedDate = `${month} ${day}, ${year}`;
    
    // Format time in 24-hour military format
    const hours = philippineDate.getHours().toString().padStart(2, '0');
    const minutes = philippineDate.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    return { date: formattedDate, time: formattedTime };
  } catch (error) {
    console.error('Error formatting Philippine date/time:', error);
    return { date: 'Invalid date', time: 'Invalid time' };
  }
}

/**
 * Get a complete formatted string with date and military time
 * @param dateString - The date string from the database
 * @returns Formatted string like "Jul 13, 01:31"
 */
export function getPhilippineDateTimeString(dateString: string): string {
  try {
    const philippineDate = convertToPhilippineTime(dateString);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[philippineDate.getMonth()];
    const day = philippineDate.getDate();
    const hours = philippineDate.getHours().toString().padStart(2, '0');
    const minutes = philippineDate.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting Philippine date/time string:', error);
    return 'Invalid date/time';
  }
}

/**
 * Get current Philippine time for debugging and comparison
 * @returns Current time in Philippines in military format
 */
export function getCurrentPhilippineTime(): string {
  const now = new Date();
  const philippineOffset = 8 * 60; // UTC+8 in minutes
  const localOffset = now.getTimezoneOffset(); // Local timezone offset in minutes
  const totalOffset = philippineOffset + localOffset; // Total offset needed
  
  const philippineTime = new Date(now.getTime() + (totalOffset * 60000));
  
  const hours = philippineTime.getHours().toString().padStart(2, '0');
  const minutes = philippineTime.getMinutes().toString().padStart(2, '0');
  const seconds = philippineTime.getSeconds().toString().padStart(2, '0');
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[philippineTime.getMonth()];
  const day = philippineTime.getDate();
  
  return `${month} ${day}, ${hours}:${minutes}:${seconds}`;
}

/**
 * Calculate time difference between database time and current Philippine time
 * @param dateString - The date string from the database
 * @returns Time difference in minutes (positive if database time is in the future)
 */
export function getTimeDifference(dateString: string): number {
  try {
    const philippineDate = convertToPhilippineTime(dateString);
    const currentPhilippineTime = new Date();
    const philippineOffset = 8 * 60;
    const localOffset = currentPhilippineTime.getTimezoneOffset();
    const totalOffset = philippineOffset + localOffset;
    const currentPhilippine = new Date(currentPhilippineTime.getTime() + (totalOffset * 60000));
    
    const diffMs = philippineDate.getTime() - currentPhilippine.getTime();
    return Math.round(diffMs / (1000 * 60)); // Convert to minutes
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return 0;
  }
}