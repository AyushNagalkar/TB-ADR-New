import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, GitBranch, BookOpen, ChevronRight, Activity, Pill, Moon, Utensils, Droplets, Thermometer, Heart, Wind, Eye, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Mock conversation insights extracted from last check-in
const CONVERSATION_INSIGHTS = [
  { icon: Pill, label: 'Medicine Adherence', value: '3 of 4 taken', status: 'warning', note: 'Missed Pyrazinamide' },
  { icon: Utensils, label: 'Appetite', value: 'Reduced', status: 'warning', note: 'Only ate half meals today' },
  { icon: Activity, label: 'Nausea Level', value: 'Moderate', status: 'alert', note: 'Reported after morning dose' },
  { icon: Moon, label: 'Sleep Quality', value: '5 hrs', status: 'warning', note: 'Disrupted, woke 3 times' },
  { icon: Thermometer, label: 'Body Temperature', value: '37.8°C', status: 'warning', note: 'Slight elevation noted' },
  { icon: Droplets, label: 'Hydration', value: '4 glasses', status: 'alert', note: 'Below recommended intake' },
  { icon: Heart, label: 'Energy Level', value: 'Low', status: 'alert', note: 'Reported fatigue all day' },
  { icon: Wind, label: 'Breathing', value: 'Normal', status: 'ok', note: 'No shortness of breath' },
  { icon: Eye, label: 'Vision', value: 'Normal', status: 'ok', note: 'No changes reported' },
  { icon: AlertTriangle, label: 'Joint Pain', value: 'Mild', status: 'warning', note: 'In knees, started 2 days ago' },
];

const STATUS_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  ok:      { border: '#5C7A6B', bg: '#5C7A6B15', text: '#5C7A6B' },
  warning: { border: '#B4622A', bg: '#B4622A15', text: '#B4622A' },
  alert:   { border: '#8C2F2F', bg: '#8C2F2F15', text: '#8C2F2F' },
};

function getRiskLabel(score: number) {
  if (score < 20) return { label: 'Low Risk', color: '#5C7A6B' };
  if (score < 50) return { label: 'Moderate Risk', color: '#B4622A' };
  if (score < 75) return { label: 'Elevated Risk', color: '#8C2F2F' };
  return { label: 'High Risk', color: '#8C2F2F' };
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('Patient');
  const [mlScore, setMlScore] = useState<number | null>(null);
  const [kgScore] = useState(72); // Knowledge graph score (mock for now)
  const [mlFlagged, setMlFlagged] = useState<{ count: number; total: number } | null>(null);

  useEffect(() => {
    // Load patient name
    const storedName = localStorage.getItem('patient_name');
    if (storedName) setName(storedName);

    // Load ML result from last check-in
    const raw = localStorage.getItem('adr_ml_result');
    if (raw) {
      try {
        const result = JSON.parse(raw);
        setMlScore(result.adr_risk_percent);
        setMlFlagged({ count: result.flagged_count, total: result.total_sentences });
      } catch { /* ignore */ }
    }
  }, []);

  const ml = mlScore ?? 62; // fallback mock value
  const combined = Math.round((ml * 0.6) + (kgScore * 0.4));
  const riskInfo = getRiskLabel(combined);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {name.split(' ')[0]}
          </h1>
          <p className="text-secondary font-body text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/checkin">
          <Button className="flex items-center gap-2">
            <Activity size={16} /> Start today's check-in
          </Button>
        </Link>
      </div>

      {/* Conversation insights scroller */}
      <div>
        <p className="text-xs text-ink/50 uppercase tracking-wider font-body mb-3">Extracted from last conversation</p>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {CONVERSATION_INSIGHTS.map(({ icon: Icon, label, value, status, note }) => {
            const colors = STATUS_COLORS[status];
            return (
              <div
                key={label}
                style={{
                  minWidth: 160, flexShrink: 0, border: `1px solid ${colors.border}`,
                  background: colors.bg, padding: '14px 16px', borderRadius: 2
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: colors.text }} />
                  <span className="text-xs font-body font-semibold" style={{ color: colors.text }}>{label}</span>
                </div>
                <p className="font-heading text-lg font-bold text-ink">{value}</p>
                <p className="text-xs text-ink/50 font-body mt-0.5">{note}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Check ADR Possibility Button — centered */}
      <div className="flex justify-center py-2">
        <Button
          onClick={() => navigate('/assessment/latest')}
          className="flex items-center gap-3 px-8 py-3 text-base"
        >
          <BrainCircuit size={20} />
          Check ADR Possibility
          <ChevronRight size={18} />
        </Button>
      </div>

      {/* ML + KG Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ML Score */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit size={18} className="text-primary" />
            <p className="text-sm font-semibold text-ink font-body">ML Model Score</p>
          </div>
          <p className="font-heading text-3xl font-bold" style={{ color: getRiskLabel(ml).color }}>{ml}%</p>
          <p className="text-xs text-ink/50 font-body mt-1">{getRiskLabel(ml).label}</p>
          {mlFlagged && (
            <p className="text-xs text-ink/40 font-body mt-0.5">{mlFlagged.count}/{mlFlagged.total} sentences flagged</p>
          )}
          <div className="w-full h-1.5 bg-line mt-3" style={{ borderRadius: 4 }}>
            <div className="h-1.5 transition-all" style={{ width: `${ml}%`, background: getRiskLabel(ml).color, borderRadius: 4 }} />
          </div>
        </Card>

        {/* KG Score */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={18} className="text-alert" />
            <p className="text-sm font-semibold text-ink font-body">Knowledge Graph Score</p>
          </div>
          <p className="font-heading text-3xl font-bold" style={{ color: getRiskLabel(kgScore).color }}>{kgScore}%</p>
          <p className="text-xs text-ink/50 font-body mt-1">{getRiskLabel(kgScore).label}</p>
          <p className="text-xs text-ink/40 font-body mt-0.5">Pyrazinamide → Hepatotoxicity path</p>
          <div className="w-full h-1.5 bg-line mt-3" style={{ borderRadius: 4 }}>
            <div className="h-1.5 transition-all" style={{ width: `${kgScore}%`, background: getRiskLabel(kgScore).color, borderRadius: 4 }} />
          </div>
        </Card>

        {/* Combined Score */}
        <Card className="p-5" style={{ borderLeft: `4px solid ${riskInfo.color}` }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} style={{ color: riskInfo.color }} />
            <p className="text-sm font-semibold text-ink font-body">Combined Score</p>
          </div>
          <p className="font-heading text-3xl font-bold" style={{ color: riskInfo.color }}>{combined}%</p>
          <p className="text-xs font-body mt-1 font-semibold" style={{ color: riskInfo.color }}>{riskInfo.label}</p>
          <p className="text-xs text-ink/40 font-body mt-0.5">ML (60%) + KG (40%)</p>
          <div className="w-full h-1.5 bg-line mt-3" style={{ borderRadius: 4 }}>
            <div className="h-1.5 transition-all" style={{ width: `${combined}%`, background: riskInfo.color, borderRadius: 4 }} />
          </div>
        </Card>
      </div>

      {/* See Research Button */}
      <div className="flex justify-center pb-4">
        <Link to="/guidance">
          <Button variant="secondary" className="flex items-center gap-2">
            <BookOpen size={16} />
            See Research &amp; WHO Guidance
            <ChevronRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
};
