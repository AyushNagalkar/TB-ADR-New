import React from 'react';
import { MedicineScheduleItem } from '../../types';

export const ScheduleList: React.FC<{
  schedule: MedicineScheduleItem[];
  onMarkTaken: (id: string, status: 'taken' | 'missed') => void;
}> = ({ schedule, onMarkTaken }) => (
  <div className="bg-surface border border-line rounded overflow-hidden">
    <div className="px-6 py-4 border-b border-line bg-bg">
      <h2 className="font-heading text-lg font-semibold text-ink">Treatment Regimen</h2>
    </div>
    <div className="flex flex-col">
      {schedule.map(item => (
        <div key={item.id} className="p-6 border-b border-line last:border-0 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-body font-semibold text-ink text-lg">{item.drugName}</h3>
            <p className="font-body text-ink/70 mt-1">Dose: {item.dosage}</p>
            <p className="font-body text-ink/70">Time: {item.scheduledTime}</p>
          </div>
          <div className="flex flex-col sm:items-end justify-between">
            <span className="font-body text-sm font-medium text-ink bg-line/30 px-2 py-1 rounded">{item.daysRemaining} days remaining</span>
            <div className="mt-2 font-body text-sm">
              <button onClick={() => onMarkTaken(item.id, 'taken')} className="text-secondary underline">Mark taken</button>
              {' · '}
              <button onClick={() => onMarkTaken(item.id, 'missed')} className="text-alert underline">Mark missed</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
