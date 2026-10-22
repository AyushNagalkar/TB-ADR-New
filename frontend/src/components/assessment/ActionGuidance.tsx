import React from 'react';
import { Card } from '../ui/Card';
import { AlertCircle, Clock, PhoneCall } from 'lucide-react';

export interface ActionGuidanceProps {
  action: 'monitor' | 'contact_doctor' | 'seek_care_now';
  explanation: string;
  matchedAdrs: string[];
  rootCauseDrug: string;
}

export const ActionGuidance: React.FC<ActionGuidanceProps> = ({
  action,
  explanation,
  matchedAdrs,
  rootCauseDrug
}) => {
  const config = {
    monitor: {
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20',
      icon: Clock,
      title: 'Continue monitoring, check in again tomorrow'
    },
    contact_doctor: {
      color: 'text-alert',
      bgColor: 'bg-alert/10',
      borderColor: 'border-alert/20',
      icon: AlertCircle,
      title: 'Contact your doctor within the next 24 hours'
    },
    seek_care_now: {
      color: 'text-critical',
      bgColor: 'bg-critical/10',
      borderColor: 'border-critical/20',
      icon: PhoneCall,
      title: 'Seek medical care immediately'
    }
  };

  const { color, bgColor, borderColor, icon: Icon, title } = config[action];

  return (
    <Card className={`border-2 ${borderColor}`}>
      <div className={`flex items-start gap-4 p-4 rounded mb-6 ${bgColor}`}>
        <Icon className={`shrink-0 mt-1 ${color}`} size={24} />
        <div>
          <h2 className={`font-heading text-lg font-bold mb-1 ${color}`}>
            {title}
          </h2>
          <p className="font-body text-ink/80 text-sm">
            {explanation}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-body font-semibold text-ink text-sm mb-2 uppercase tracking-wide">
          Possible Reactions
        </h3>
        <ul className="list-disc pl-5 font-body text-ink/80 space-y-1">
          {matchedAdrs.map((adr, idx) => (
            <li key={idx}>{adr}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-body font-semibold text-ink text-sm mb-1 uppercase tracking-wide">
          Suspected Medication
        </h3>
        <p className="font-body text-ink/80">
          {rootCauseDrug}
        </p>
      </div>
    </Card>
  );
};
