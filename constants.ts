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

export const CATALAN_HOLIDAYS_2025: Record<string, string> = {
  '2025-01-01': 'Cap d\'Any',
  '2025-01-06': 'Reis',
  '2025-04-18': 'Divendres Sant',
  '2025-04-21': 'Dilluns de Pasqua',
  '2025-05-01': 'Dia del Treball',
  '2025-06-24': 'Sant Joan',
  '2025-08-15': 'L\'Assumpció',
  '2025-09-11': 'Diada Nacional de Catalunya',
  '2025-10-12': 'Festa Nacional d\'Espanya',
  '2025-11-01': 'Tots Sants',
  '2025-12-06': 'Dia de la Constitució',
  '2025-12-08': 'La Immaculada',
  '2025-12-25': 'Nadal',
  '2025-12-26': 'Sant Esteve',
};

export const USER_INFO = {
    name: 'JORDI MIR GORDILS',
    dni: '43671673D',
    department: 'SERVEIS TÈCNICS'
};
