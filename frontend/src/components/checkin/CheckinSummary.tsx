import React from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { Symptom } from '../../types';

export interface CheckinSummaryProps {
  symptoms: Symptom[];
  notes?: string;
  onSubmit?: () => void;
}

export const CheckinSummary: React.FC<CheckinSummaryProps> = ({ symptoms, notes, onSubmit }) => {
  return (
    <Card>
      <h2 className="font-heading text-xl font-semibold text-ink mb-4">What I noted today</h2>
      
      <div className="mb-6">
        <h3 className="font-body font-medium text-ink mb-2">Symptoms reported:</h3>
        {symptoms.length === 0 ? (
          <p className="font-body text-ink/60 text-sm">None</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {symptoms.map(s => (
              <li key={s.id} className="flex justify-between items-center p-2 bg-bg rounded border border-line">
                <span className="font-body text-ink">{s.name}</span>
                <StatusBadge status={s.severity} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {notes && (
        <div className="mb-6">
          <h3 className="font-body font-medium text-ink mb-1">Additional notes:</h3>
          <p className="font-body text-ink/80 text-sm bg-bg p-3 rounded border border-line">{notes}</p>
        </div>
      )}

      <Button fullWidth onClick={onSubmit} variant="primary">
        Submit check-in
      </Button>
    </Card>
  );
};
