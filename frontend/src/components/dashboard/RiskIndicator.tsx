import React from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { RiskStatus } from '../../types';

export interface RiskIndicatorProps {
  status: RiskStatus;
  lastCheckin?: string;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ status, lastCheckin }) => {
  const explanations = {
    normal: 'No ADR indicators detected',
    elevated: 'Some symptoms need monitoring',
    critical: 'Possible ADR detected — contact your doctor',
  };

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h2 className="font-heading text-lg font-semibold text-ink">Current Status</h2>
          <StatusBadge status={status} />
        </div>
        <p className="font-body text-base text-ink">{explanations[status]}</p>
        {lastCheckin && (
          <p className="font-body text-sm text-ink/60 mt-2">Last check-in: {lastCheckin}</p>
        )}
      </div>
    </Card>
  );
};
