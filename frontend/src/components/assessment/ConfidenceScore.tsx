import React from 'react';
import { Card } from '../ui/Card';
import { RiskStatus } from '../../types';

export interface ConfidenceScoreProps {
  score: number;
  status: RiskStatus;
}

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({ score, status }) => {
  const colors = {
    normal: 'text-secondary bg-secondary/10',
    elevated: 'text-alert bg-alert/10',
    critical: 'text-critical bg-critical/10'
  };

  const progressColors = {
    normal: 'bg-secondary',
    elevated: 'bg-alert',
    critical: 'bg-critical'
  };

  return (
    <Card className="flex flex-col items-center text-center">
      <h2 className="font-heading text-lg font-semibold text-ink mb-6">ADR Detection Confidence</h2>
      
      <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${colors[status]}`}>
        <span className="font-heading text-4xl font-bold">{score}%</span>
      </div>

      <div className="w-full bg-line rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full ${progressColors[status]}`} 
          style={{ width: `${score}%` }}
        />
      </div>
      
      <p className="font-body text-sm text-ink/60 mt-2">
        Based on reported symptoms and medication history
      </p>
    </Card>
  );
};
