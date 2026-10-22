import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { createTbProfile, uploadReport } from '../lib/api';

type DrugRow = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
};

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [drugs, setDrugs] = useState<DrugRow[]>([
    { id: '1', name: '', dosage: '', frequency: '' }
  ]);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddDrug = () => {
    setDrugs([...drugs, { id: Date.now().toString(), name: '', dosage: '', frequency: '' }]);
  };

  const handleRemoveDrug = (id: string) => {
    if (drugs.length > 1) {
      setDrugs(drugs.filter(d => d.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      const treatment_center = formData.get('treatment_center') as string;
      const doctor_name = formData.get('doctor_name') as string;
      const treatment_start_date = formData.get('treatment_start_date') as string;
      
      const regimen = drugs.map(d => ({
        drug_name: d.name,
        dosage: d.dosage,
        frequency: d.frequency
      }));

      await createTbProfile({ treatment_center, doctor_name, treatment_start_date, regimen });
      
      if (reportFile) {
        await uploadReport(reportFile);
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReportFile(e.target.files[0]);
    }
  };

  const drugOptions = [
    { value: 'isoniazid', label: 'Isoniazid' },
    { value: 'rifampicin', label: 'Rifampicin' },
    { value: 'pyrazinamide', label: 'Pyrazinamide' },
    { value: 'ethambutol', label: 'Ethambutol' },
    { value: 'streptomycin', label: 'Streptomycin' }
  ];

  const frequencyOptions = [
    { value: 'once', label: 'Once daily' },
    { value: 'twice', label: 'Twice daily' },
    { value: 'three', label: 'Three times weekly' }
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center py-12 px-6 text-ink">
      <div className="max-w-xl w-full flex flex-col gap-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-primary mb-2">Complete your profile</h1>
          <p className="font-body text-ink/80">Step 1 of 1: Treatment details</p>
        </div>

        {error && (
          <div className="p-4 bg-bg border border-alert text-alert rounded font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <Card className="p-6 flex flex-col gap-4">
            <h2 className="font-heading text-xl text-primary font-medium mb-2 border-b border-line pb-2">Treatment info</h2>
            <Input name="treatment_center" label="Treatment center name" placeholder="e.g. City Hospital" required />
            <Input name="doctor_name" label="Doctor name" placeholder="e.g. Dr. Smith" required />
            <Input name="treatment_start_date" label="Treatment start date" type="date" required />
          </Card>

          <Card className="p-6 flex flex-col gap-4">
            <h2 className="font-heading text-xl text-primary font-medium mb-2 border-b border-line pb-2">Regimen</h2>
            <p className="font-body text-sm text-secondary">Add your prescribed TB medicines below.</p>
            
            {drugs.map((drug, index) => (
              <div key={drug.id} className="flex flex-col gap-4 p-4 border border-line bg-surface relative">
                <Select 
                  label="Drug name" 
                  options={drugOptions} 
                  required 
                  value={drug.name}
                  onChange={(e) => {
                    const newDrugs = [...drugs];
                    newDrugs[index].name = e.target.value;
                    setDrugs(newDrugs);
                  }}
                />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input 
                      label="Dosage" 
                      placeholder="e.g. 300mg" 
                      required 
                      value={drug.dosage}
                      onChange={(e) => {
                        const newDrugs = [...drugs];
                        newDrugs[index].dosage = e.target.value;
                        setDrugs(newDrugs);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Select 
                      label="Frequency" 
                      options={frequencyOptions} 
                      required 
                      value={drug.frequency}
                      onChange={(e) => {
                        const newDrugs = [...drugs];
                        newDrugs[index].frequency = e.target.value;
                        setDrugs(newDrugs);
                      }}
                    />
                  </div>
                </div>
                {drugs.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveDrug(drug.id)}
                    className="absolute top-4 right-4 text-alert text-sm font-body hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={handleAddDrug} className="self-start mt-2">
              + Add another drug
            </Button>
          </Card>

          <Card className="p-6 flex flex-col gap-4">
            <h2 className="font-heading text-xl text-primary font-medium mb-2 border-b border-line pb-2">Report upload (Optional)</h2>
            <p className="font-body text-sm text-secondary">Upload your latest checkup report or prescription.</p>
            
            <div className="border-2 border-dashed border-line p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-bg transition-colors relative">
              <input 
                type="file" 
                accept=".pdf,image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="font-body text-primary font-medium">Click to upload or drag file</span>
              <span className="font-body text-sm text-secondary mt-1">Supports PDF, JPG, PNG</span>
            </div>
            {reportFile && (
              <p className="font-body text-sm text-ink font-medium">Selected: {reportFile.name}</p>
            )}
          </Card>

          <Button type="submit" className="w-full py-4 text-lg" disabled={loading}>
            {loading ? 'Saving...' : 'Complete setup'}
          </Button>
        </form>
      </div>
    </div>
  );
};
