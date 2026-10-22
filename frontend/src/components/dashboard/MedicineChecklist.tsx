import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Check } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

const mockMedicines: Medicine[] = [
  { id: '1', name: 'Isoniazid', dosage: '300mg', time: '08:00 AM', taken: false },
  { id: '2', name: 'Rifampicin', dosage: '450mg', time: '08:00 AM', taken: false },
  { id: '3', name: 'Pyrazinamide', dosage: '1500mg', time: '08:00 AM', taken: false },
  { id: '4', name: 'Ethambutol', dosage: '800mg', time: '08:00 AM', taken: false },
];

export const MedicineChecklist: React.FC<{ schedule?: Medicine[] }> = ({ schedule }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);

  React.useEffect(() => {
    if (schedule && schedule.length > 0) {
      setMedicines(schedule);
    }
  }, [schedule]);

  const toggleTaken = (id: string) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  return (
    <Card>
      <h2 className="font-heading text-lg font-semibold text-ink mb-4">Today's Medicines</h2>
      <div className="flex flex-col gap-3">
        {medicines.map((med) => (
          <label
            key={med.id}
            className="flex items-center gap-4 p-3 border border-line rounded cursor-pointer hover:bg-bg transition-colors min-h-[56px]"
          >
            <div className="relative flex items-center justify-center w-6 h-6 border-2 border-line rounded bg-surface shrink-0">
              <input
                type="checkbox"
                className="opacity-0 absolute w-full h-full cursor-pointer"
                checked={med.taken}
                onChange={() => toggleTaken(med.id)}
              />
              {med.taken && <Check size={16} className="text-secondary pointer-events-none" />}
            </div>
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className={`font-body font-medium ${med.taken ? 'line-through text-ink/50' : 'text-ink'}`}>
                  {med.name}
                </p>
                <p className="font-body text-sm text-ink/60">{med.dosage}</p>
              </div>
              <span className="font-body text-sm text-ink/60">{med.time}</span>
            </div>
          </label>
        ))}
      </div>
    </Card>
  );
};
