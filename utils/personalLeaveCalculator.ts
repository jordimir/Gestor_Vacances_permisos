import { differenceInYears, startOfDay } from 'date-fns';

/**
 * Calculates the total number of personal leave days an employee is entitled to
 * based on their years of service (triennials).
 *
 * @param hireDate - The start date of employment (YYYY-MM-DD string).
 * @returns The total number of personal leave days.
 */
export const calculatePersonalLeaveDays = (hireDate: string): number => {
  const basePersonalLeaveDays = 6; // Based on the more favorable interpretation mentioned.
  const today = startOfDay(new Date());
  const startDate = startOfDay(new Date(hireDate));

  // Calculate years of service
  const yearsOfService = differenceInYears(today, startDate);
  
  // Calculate completed triennials
  const triennials = Math.floor(yearsOfService / 3);

  // Determine additional days based on triennials
  let additionalDays = 0;
  if (triennials >= 8) {
    // 2 days for the 6th and 7th triennial, plus 1 for each from the 8th onwards
    additionalDays = 2 + (triennials - 7);
  } else if (triennials >= 6) {
    // 2 additional days for the 6th and 7th triennial
    additionalDays = 2;
  }

  return basePersonalLeaveDays + additionalDays;
};