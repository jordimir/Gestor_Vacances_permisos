import { LeaveTypeInfo } from './types';

export const DEFAULT_LEAVE_TYPES: Record<string, LeaveTypeInfo> = {
  'VACANCES': {
    label: 'Vacances',
    color: 'bg-blue-500',
    textColor: 'text-white',
    total: 22,
  },
  'ASSUMPTES_PROPIS': {
    label: 'Assumptes Personals',
    color: 'bg-green-500',
    textColor: 'text-white',
    total: 6,
  },
  'PONT': {
    label: 'Pont',
    color: 'bg-yellow-500',
    textColor: 'text-gray-800',
    total: 2,
  },
  'BAIXA_MEDICA': {
    label: 'Baixa Mèdica',
    color: 'bg-red-500',
    textColor: 'text-white',
    total: 0, // No solen tenir un límit predefinit
  },
  'ALTRES': {
    label: 'Altres',
    color: 'bg-purple-500',
    textColor: 'text-white',
    total: 0,
  },
};

// Base data for holiday calculation. Month is 1-indexed for clarity.
export const FIXED_HOLIDAYS: { month: number, day: number, name: string, type: 'national' | 'catalan' | 'local' | 'patron' }[] = [
    // Month is 1-indexed (1=Jan, 12=Dec)
    { month: 1, day: 1, name: 'Cap d\'Any', type: 'national' },
    { month: 1, day: 6, name: 'Reis', type: 'national' },
    { month: 1, day: 22, name: 'Sant Vicenç', type: 'local' },
    { month: 5, day: 1, name: 'Dia del Treball', type: 'national' },
    { month: 5, day: 22, name: 'Santa Rita', type: 'patron' },
    { month: 6, day: 24, name: 'Sant Joan', type: 'catalan' },
    { month: 6, day: 29, name: 'Sant Pere', type: 'local' },
    { month: 8, day: 15, name: 'L\'Assumpció', type: 'national' },
    { month: 9, day: 11, name: 'Diada Nacional de Catalunya', type: 'catalan' },
    { month: 10, day: 12, name: 'Festa Nacional d\'Espanya', type: 'national' },
    { month: 11, day: 1, name: 'Tots Sants', type: 'national' },
    { month: 12, day: 6, name: 'Dia de la Constitució', type: 'national' },
    { month: 12, day: 8, name: 'La Immaculada', type: 'national' },
    { month: 12, day: 25, name: 'Nadal', type: 'national' },
    { month: 12, day: 26, name: 'Sant Esteve', type: 'catalan' },
];