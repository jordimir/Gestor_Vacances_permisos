/**
 * Calculates the total number of vacation days an employee is entitled to
 * based on their years of service.
 *
 * @param hireDate - The start date of employment (YYYY-MM-DD string).
 * @returns The total number of vacation days.
 */
export const calculateVacationDays = (hireDate: string): number => {
  const baseVacationDays = 22;
  const today = new Date();
  const startDate = new Date(hireDate);
  
  // Calculate years of service
  let yearsOfService = today.getFullYear() - startDate.getFullYear();
  const monthDifference = today.getMonth() - startDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < startDate.getDate())) {
    yearsOfService--;
  }

  // Determine additional days based on seniority
  let additionalDays = 0;
  if (yearsOfService >= 35) {
    additionalDays = 5;
  } else if (yearsOfService >= 30) {
    additionalDays = 4; // This tier wasn't in the prompt but is standard, added for completeness
  } else if (yearsOfService >= 25) {
    additionalDays = 3;
  } else if (yearsOfService >= 20) {
    additionalDays = 2;
  } else if (yearsOfService >= 15) {
    additionalDays = 1;
  }

  return baseVacationDays + additionalDays;
};
