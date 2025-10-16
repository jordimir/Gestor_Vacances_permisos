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
    total: 4,
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

export interface Holiday {
  name: string;
  type: 'national' | 'catalan' | 'local' | 'patron';
}

export const HOLIDAYS_2025: Record<string, Holiday> = {
  // Festius Nacionals (Espanya)
  '2025-01-01': { name: 'Cap d\'Any', type: 'national' },
  '2025-01-06': { name: 'Reis', type: 'national' },
  '2025-04-18': { name: 'Divendres Sant', type: 'national' },
  '2025-05-01': { name: 'Dia del Treball', type: 'national' },
  '2025-08-15': { name: 'L\'Assumpció', type: 'national' },
  '2025-10-12': { name: 'Festa Nacional d\'Espanya', type: 'national' },
  '2025-11-01': { name: 'Tots Sants', type: 'national' },
  '2025-12-06': { name: 'Dia de la Constitució', type: 'national' },
  '2025-12-08': { name: 'La Immaculada', type: 'national' },
  '2025-12-25': { name: 'Nadal', type: 'national' },
  
  // Festius de Catalunya
  '2025-04-21': { name: 'Dilluns de Pasqua', type: 'catalan' },
  '2025-06-24': { name: 'Sant Joan', type: 'catalan' },
  '2025-09-11': { name: 'Diada Nacional de Catalunya', type: 'catalan' },
  '2025-12-26': { name: 'Sant Esteve', type: 'catalan' },
  
  // Festiu Patrona
  '2025-05-22': { name: 'Santa Rita', type: 'patron' },

  // Festius Locals (Tossa de Mar)
  '2025-01-22': { name: 'Sant Vicenç', type: 'local' },
  '2025-06-29': { name: 'Sant Pere', type: 'local' },
};

export const USER_INFO = {
    name: 'JORDI MIR GORDILS',
    dni: '43671673D',
    department: 'SERVEIS TÈCNICS'
};