import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Alert = ({ type, message }) => {
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`${bgColor} border ${textColor} px-4 py-3 rounded-lg flex items-start gap-3`}>
      <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1 text-sm">{message}</div>
    </div>
  );
};