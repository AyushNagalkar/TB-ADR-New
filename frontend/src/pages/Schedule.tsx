import React, { useEffect, useState } from 'react';
import { AdherenceStats } from '../components/schedule/AdherenceStats';
import { ScheduleList } from '../components/schedule/ScheduleList';
import { MedicineScheduleItem, AdherenceStats as Stats } from '../types';
import { getSchedule, getAdherenceStats, logDose } from '../lib/api';

export const Schedule: React.FC = () => {
  const [schedule, setSchedule] = useState<MedicineScheduleItem[]>([]);
  const [stats, setStats] = useState<Stats>({ totalDoses: 0, takenCount: 0, missedCount: 0, currentStreak: 0, longestStreak: 0 });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([getSchedule(), getAdherenceStats()]).then(([items, adherence]) => {
      setSchedule(items); setStats(adherence);
    }).catch(err => setError(err.message));
  }, []);
  const markDose = async (id: string, status: 'taken' | 'missed') => {
    try { await logDose(id, status); setStats(await getAdherenceStats()); }
    catch (err: any) { setError(err.message); }
  };
  return <div className="flex flex-col gap-6 max-w-3xl">
    <h1 className="font-heading text-2xl text-ink">Medicine schedule</h1>
    {error && <div className="p-3 border border-alert text-alert">{error}</div>}
    <AdherenceStats stats={stats} />
    <ScheduleList schedule={schedule} onMarkTaken={markDose} />
  </div>;
};
