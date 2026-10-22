import React from 'react';
import { Card } from '../ui/Card';
import { AdherenceStats as AdherenceStatsType } from '../../types';

export const AdherenceStats: React.FC<{ stats: AdherenceStatsType }> = ({ stats }) => {
  return (
    <Card>
      <h2 className="font-heading text-lg font-semibold text-ink mb-6">Adherence Statistics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <span className="font-body text-sm text-ink/60 mb-1">Total Doses</span>
          <span className="font-heading text-2xl text-ink font-semibold">{stats.totalDoses}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-body text-sm text-ink/60 mb-1">Taken</span>
          <span className="font-heading text-2xl text-secondary font-semibold">{stats.takenCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-body text-sm text-ink/60 mb-1">Missed</span>
          <span className="font-heading text-2xl text-alert font-semibold">{stats.missedCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-body text-sm text-ink/60 mb-1">Current Streak</span>
          <span className="font-heading text-2xl text-primary font-semibold">{stats.currentStreak} days</span>
        </div>
        <div className="flex flex-col">
          <span className="font-body text-sm text-ink/60 mb-1">Longest Streak</span>
          <span className="font-heading text-2xl text-ink font-semibold">{stats.longestStreak} days</span>
        </div>
      </div>
    </Card>
  );
};
