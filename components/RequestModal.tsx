import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { LeaveDay, LeaveTypeInfo, UserProfile } from '../types';

interface RequestModalProps {
  user: UserProfile;
  leaveDays: Record<string, LeaveDay>;
  leaveTypes: Record<string, LeaveTypeInfo>;
  onClose: () => void;
}

const groupConsecutiveDays = (dates: Date[]) => {
  if (dates.length === 0) return [];
  
  dates.sort((a, b) => a.getTime() - b.getTime());

  const groups: string[] = [];
  let groupStart = dates[0];
  
  for (let i = 1; i < dates.length; i++) {
    const prevDay = dates[i-1];
    const currentDay = dates[i];
    const diff = (currentDay.getTime() - prevDay.getTime()) / (1000 * 3600 * 24);

    if (diff > 1.5) { // allow for weekends
      const groupEnd = prevDay;
      if (isSameDay(groupStart, groupEnd)) {
        groups.push(`${format(groupStart, 'd')}`);
      } else {
        groups.push(`del ${format(groupStart, 'd')} al ${format(groupEnd, 'd')}`);
      }
      groupStart = currentDay;
    }
  }

  const lastGroupEnd = dates[dates.length - 1];
  if (isSameDay(groupStart, lastGroupEnd)) {
    groups.push(`${format(groupStart, 'd')}`);
  } else {
    groups.push(`del ${format(groupStart, 'd')} al ${format(lastGroupEnd, 'd')}`);
  }

  return groups.join(', ');
};

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

const RequestForm: React.FC<{ title: string, dates: Date[], user: UserProfile }> = ({ title, dates, user }) => {
    if (dates.length === 0) return null;

    const datesByMonth = dates.reduce((acc: Record<string, Date[]>, date: Date) => {
        const month = format(date, 'MMMM yyyy', { locale: ca });
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(date);
        return acc;
    }, {} as Record<string, Date[]>);

    return (
        <div className="border-2 border-black p-4 mb-8 text-sm printable-area">
            <div className="text-center mb-4">
                <img src="https://www.tossademar.cat/Content/Images/logo-ajuntament-tossa.png" alt="Logo Ajuntament de Tossa de Mar" className="mx-auto mb-2 h-20"/>
                <h1 className="font-bold text-lg">AJUNTAMENT DE TOSSA DE MAR</h1>
                <p className="text-xs">GIRONA</p>
            </div>

            <div className="border-2 border-black text-center font-bold bg-gray-200 py-1 mb-4">
                SOL·LICITUD {title} ({new Date().getFullYear()})
            </div>

            <table className="w-full border-collapse border border-black mb-4">
                <tbody>
                    <tr>
                        <td className="border border-black p-1 font-bold w-1/4">EN/NA:</td>
                        <td className="border border-black p-1">{user.name}</td>
                    </tr>
                    <tr>
                        <td className="border border-black p-1 font-bold">AMB NÚM. DNI:</td>
                        <td className="border border-black p-1">{user.dni}</td>
                        <td className="border border-black p-1 font-bold w-1/6">DEPT.</td>
                        <td className="border border-black p-1 w-1/3">{user.department}</td>
                    </tr>
                </tbody>
            </table>

            <div className="border border-black p-2 mb-4">
                <p>
                    Per la present sol·licito al DEPARTAMENT DE RECURSOS HUMANS l'aprovació dels següents períodes de {title.toLowerCase()}, que sumen un total de <span className="font-bold">{dates.length} dies</span>:
                </p>
                <div className="mt-2 font-semibold">Distribució mensual:</div>
                <ul className="list-disc list-inside ml-4">
                    {Object.keys(datesByMonth).map((month) => {
                        const monthDates = datesByMonth[month];
                        return (
                            <li key={month}>
                                <span className="capitalize">{month.split(' ')[0]}</span>: {monthDates.length} dies ({
                                    monthDates.length > 5 ? groupConsecutiveDays(monthDates) : monthDates.map(d => format(d, 'd')).join(', ')
                                })
                            </li>
                        );
                    })}
                </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4 h-24">
                <div className="border border-black p-2">
                    <p className="font-bold">SIGNATURA INTERESSAT</p>
                </div>
                 <div className="border border-black p-2">
                    <p className="font-bold">SIGNATURA RESPONSABLE</p>
                    <p className="mt-auto text-xs">Data d'acceptació:</p>
                </div>
            </div>
        </div>
    );
};

const RequestModal: React.FC<RequestModalProps> = ({ user, leaveDays, leaveTypes, onClose }) => {
  const requestedDays = useMemo(() => {
    // Filter for only 'requested' days
    return Object.entries(leaveDays)
      .filter(([, leaveDay]: [string, LeaveDay]) => leaveDay.status === 'requested')
      .reduce((acc: Record<string, Date[]>, [dateStr, leaveDay]: [string, LeaveDay]) => {
        if (!acc[leaveDay.type]) {
          acc[leaveDay.type] = [];
        }
        acc[leaveDay.type].push(parseISO(dateStr));
        return acc;
      }, {} as Record<string, Date[]>);
  }, [leaveDays]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center no-print">
          <h2 className="text-xl font-bold">Generador de Sol·licituds (Dies Demanats)</h2>
          <div>
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">&times;</button>
          </div>
        </header>
        <main className="p-8 overflow-auto">
            {Object.keys(requestedDays).length === 0 ? (
                <p className="text-center text-gray-500">No hi ha dies pendents de sol·licitar. Arrossega nous dies al calendari per generar una sol·licitud.</p>
            ) : (
                Object.entries(requestedDays).map(([type, dates]) => (
                    <RequestForm key={type} title={leaveTypes[type]?.label.toUpperCase() ?? type} dates={dates} user={user} />
                ))
            )}
        </main>
      </div>
    </div>
  );
};

export default RequestModal;