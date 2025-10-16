import React from 'react';
import { useDrag } from 'react-dnd';
import { LeaveTypeInfo } from '../types';

interface LeaveTypeItemProps {
  type: string;
  info: LeaveTypeInfo;
}

const LeaveTypeItem: React.FC<LeaveTypeItemProps> = ({ type, info }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'LEAVE_TYPE',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-3 rounded-lg cursor-grab flex items-center justify-center font-semibold transition-all duration-200
        ${info.color} ${info.textColor}
        ${isDragging ? 'opacity-50 shadow-lg' : 'opacity-100 shadow-md'}
      `}
      style={{
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {info.label}
    </div>
  );
};

export default LeaveTypeItem;
