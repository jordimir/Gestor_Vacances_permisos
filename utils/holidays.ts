import { addDays } from 'date-fns';
// FIX: Corrected import paths to navigate up one level from the 'utils' directory.
import { Holiday } from '../types';
import { FIXED_HOLIDAYS } from '../constants';

// Function to calculate Easter Sunday for a given year (Gregorian calendar)
// Using the "Meeus/Jones/Butcher" algorithm
const getEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  // Note: month is 1-based, Date constructor expects 0-based
  return new Date(year, month - 1, day);
};

export const getHolidaysForYear = (year: number): Record<string, Holiday> => {
    const holidays: Record<string, Holiday> = {};
    const easterSunday = getEaster(year);
    
    // Fixed holidays
    FIXED_HOLIDAYS.forEach(h => {
        // Note: h.month is 1-based
        const dateString = `${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`;
        holidays[dateString] = { name: h.name, type: h.type };
    });

    // Mobile holidays (based on Easter)
    const goodFriday = addDays(easterSunday, -2);
    const easterMonday = addDays(easterSunday, 1);
    
    const mobileHolidays = [
        { date: goodFriday, name: 'Divendres Sant', type: 'national' as Holiday['type'] },
        { date: easterMonday, name: 'Dilluns de Pasqua', type: 'catalan' as Holiday['type'] },
    ];

    mobileHolidays.forEach(h => {
        const m = h.date.getMonth() + 1;
        const d = h.date.getDate();
        const dateString = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        holidays[dateString] = { name: h.name, type: h.type };
    });

    return holidays;
};