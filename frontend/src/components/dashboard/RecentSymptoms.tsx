import React from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Symptom } from '../../types';

export const RecentSymptoms: React.FC<{ symptoms?: Symptom[] }> = ({ symptoms }) => {
  const mockSymptoms: Symptom[] = [
    { id: '1', name: 'Nausea', severity: 'elevated', date: 'Oct 12, 2023' },
    { id: '2', name: 'Joint Pain', severity: 'elevated', date: 'Oct 10, 2023' },
  ];

  const displaySymptoms = symptoms && symptoms.length > 0 ? symptoms : mockSymptoms;

  return (
    <Card>
      <h2 className="font-heading text-lg font-semibold text-ink mb-4">Recently Flagged Symptoms</h2>
      {displaySymptoms.length === 0 ? (
        <p className="font-body text-ink/60 text-sm">No symptoms flagged recently.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {displaySymptoms.map((symptom) => (
            <div key={symptom.id} className="flex justify-between items-center py-2 border-b border-line last:border-0">
              <div>
                <p className="font-body font-medium text-ink">{symptom.name}</p>
                <p className="font-body text-xs text-ink/60">{symptom.date}</p>
              </div>
              <StatusBadge status={symptom.severity} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
