import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PhoneCall, AlertTriangle } from 'lucide-react';
import { getEmergencyInfo } from '../lib/api';

export const Emergency: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getEmergencyInfo();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch emergency info:', err);
      }
    };
    fetchData();
  }, []);

  const doctorContact = data?.doctor_contact || {};
  const clinicianSummary = data?.clinician_summary || {};

  const phoneHref = doctorContact.cleanPhone 
    ? doctorContact.cleanPhone 
    : doctorContact.phone?.replace(/[^0-9+]/g, '') || '';

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl text-critical flex items-center gap-2">
          <AlertTriangle className="w-7 h-7" />
          Emergency contact
        </h1>
        <p className="font-body text-sm text-ink/70">If you are experiencing severe symptoms, seek immediate help.</p>
      </div>

      <Card className="flex flex-col gap-4 border border-line rounded-lg bg-surface p-5">
        <h2 className="font-heading text-lg text-ink">Doctor contact</h2>
        <div className="flex flex-col gap-1">
          <p className="font-body text-lg font-medium text-ink">{doctorContact.name || 'Not provided'}</p>
          <p className="font-body text-sm text-ink/80">{doctorContact.address || 'Not provided'}</p>
          <p className="font-body text-base text-ink/80 mt-1 mb-2">{doctorContact.phone}</p>
        </div>
        <a href={`tel:${phoneHref}`} className="w-full block">
          <Button className="w-full flex items-center justify-center gap-2 bg-critical text-surface h-14 text-lg hover:opacity-90 transition-opacity">
            <PhoneCall className="w-6 h-6" />
            Call Doctor Now
          </Button>
        </a>
      </Card>

      <Card className="flex flex-col gap-4 border border-line rounded-lg bg-surface p-5">
        <h2 className="font-heading text-lg text-ink border-b border-line pb-3">Show this to your doctor</h2>
        <div className="grid grid-cols-2 gap-y-5 gap-x-3 text-sm font-body mt-1">
          <div className="text-ink/60">Patient Name</div>
          <div className="text-ink font-medium">{clinicianSummary.patient_name}</div>

          <div className="text-ink/60">Treatment Day</div>
          <div className="text-ink">{clinicianSummary.treatment_day}</div>

          <div className="text-ink/60">Current Regimen</div>
          <div className="text-ink flex flex-col gap-1">
            {(clinicianSummary.current_regimen || []).map((med: string, i: number) => (
              <span key={i}>{med}</span>
            ))}
          </div>

          <div className="text-ink/60">Recent Symptoms</div>
          <div className="text-ink flex flex-col gap-1">
            {(clinicianSummary.recent_symptoms || []).map((symp: string, i: number) => (
              <span key={i}>{symp}</span>
            ))}
          </div>

          <div className="text-ink/60">Latest ADR Alert</div>
          <div className="text-alert font-medium">{clinicianSummary.latest_adr_alert}</div>

          <div className="text-ink/60">Last Check-in</div>
          <div className="text-ink">{clinicianSummary.last_checkin}</div>
        </div>
      </Card>

      <div className="flex flex-col gap-2 p-5 bg-bg border border-line rounded-lg mt-2">
        <h2 className="font-heading text-base text-ink">Nearest TB care center</h2>
        <p className="font-body text-sm text-ink/80 leading-relaxed">
          City General Hospital<br/>
          123 Health Avenue, Medical District<br/>
          +91 11 2345 6789
        </p>
      </div>
    </div>
  );
};
