import React, { useState, useEffect } from 'react';
import { Globe, Pill, ShieldCheck, Activity, Eye, Heart, Salad, Sun, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getEducationContent } from '../lib/api';
import { EducationContent } from '../types';

export const Guidance: React.FC = () => {
  const [data, setData] = useState<EducationContent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState<string>('');

  useEffect(() => {
    const fetchGuidance = async () => {
      setLoading(true);
      try {
        const result = await getEducationContent(selectedDrug || undefined);
        if (result && result.length > 0) {
          setData(result);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error('Failed to fetch guidance data:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchGuidance();
  }, [selectedDrug]);

  const drugs = ['Isoniazid', 'Rifampicin', 'Pyrazinamide', 'Ethambutol'];

  // Helper to get an icon based on ADR name
  const getAdrIcon = (adrName: string) => {
    const name = adrName.toLowerCase();
    if (name.includes('hepato') || name.includes('liver')) return <Heart className="w-5 h-5 text-secondary" />;
    if (name.includes('nerve') || name.includes('neuro')) return <Activity className="w-5 h-5 text-secondary" />;
    if (name.includes('vision') || name.includes('ocular')) return <Eye className="w-5 h-5 text-secondary" />;
    if (name.includes('gi') || name.includes('gastro') || name.includes('nausea')) return <Salad className="w-5 h-5 text-secondary" />;
    if (name.includes('skin') || name.includes('rash')) return <Sun className="w-5 h-5 text-secondary" />;
    return <ShieldCheck className="w-5 h-5 text-secondary" />;
  };

  const getSeverity = (adrName: string) => {
    const name = adrName.toLowerCase();
    if (name.includes('hepato') || name.includes('ocular') || name.includes('severe')) return 'critical';
    if (name.includes('nerve') || name.includes('neuro') || name.includes('joint') || name.includes('flu')) return 'alert';
    return 'secondary';
  };

  const renderDynamicContent = () => {
    if (!data) return null;

    // Group by drug for the medicines section
    const drugMap = new Map<string, EducationContent[]>();
    data.forEach(item => {
      const existing = drugMap.get(item.drugName) || [];
      existing.push(item);
      drugMap.set(item.drugName, existing);
    });

    return (
      <>
        {/* Section 1: WHO supportive information */}
        <section className="space-y-6">
          <div className="space-y-1 border-b border-line pb-4">
            <div className="flex items-center gap-2 text-primary">
              <Globe className="w-6 h-6" />
              <h2 className="text-xl font-heading">WHO clinical guidance</h2>
            </div>
            <p className="text-ink/70">Evidence-based guidance from the World Health Organization for cases similar to yours</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(item => (
              <Card key={`who-${item.id}`} className="border-l-4 border-l-primary p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
                <div>
                  <h3 className="font-heading text-lg font-semibold">{item.adrName}</h3>
                  <p className="text-sm text-ink/60">Related to: {item.drugName}</p>
                </div>
                <p className="text-sm flex-grow">{item.cause}</p>
                <div className="flex justify-between items-center mt-2">
                  <StatusBadge status="secondary" label="WHO Guidance" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: ADR-causing medicines */}
        <section className="space-y-6">
          <div className="space-y-1 border-b border-line pb-4">
            <div className="flex items-center gap-2 text-alert">
              <Pill className="w-6 h-6" />
              <h2 className="text-xl font-heading">Medicines and associated adverse reactions</h2>
            </div>
            <p className="text-ink/70">Understanding which drugs in your regimen may cause side effects</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from(drugMap.entries()).map(([drugName, items]) => (
              <Card key={`drug-${drugName}`} className="border-[0.5px] border-t-4 border-t-alert p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-heading text-lg font-semibold">{drugName}</h3>
                    <span className="bg-secondary text-surface text-[10px] px-2 py-1 uppercase tracking-wider">In regimen</span>
                  </div>
                </div>
                
                <div className="space-y-2 flex-grow text-sm">
                  <p className="font-semibold border-b border-line pb-1">Known ADRs</p>
                  <ul className="space-y-2 pt-1">
                    {items.map(item => (
                      <li key={`adr-${item.id}`} className="flex justify-between items-center">
                        <span>{item.adrName}</span>
                        <StatusBadge status={getSeverity(item.adrName)} label={getSeverity(item.adrName) === 'critical' ? 'Severe' : (getSeverity(item.adrName) === 'alert' ? 'Moderate' : 'Mild')} />
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 3: Precaution methods */}
        <section className="space-y-6">
          <div className="space-y-1 border-b border-line pb-4">
            <div className="flex items-center gap-2 text-secondary">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-xl font-heading">Precautions and preventive measures</h2>
            </div>
            <p className="text-ink/70">Steps you can take to reduce your risk and stay safe</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(item => (
              <Card key={`prec-${item.id}`} className="p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
                <div className="flex items-center gap-3">
                  {getAdrIcon(item.adrName)}
                  <h3 className="font-heading text-lg font-semibold">{item.adrName} prevention</h3>
                </div>
                
                <div className="space-y-3 flex-grow text-sm">
                  <div>
                    <span className="font-semibold text-primary block mb-1">What to do</span>
                    <p className="text-ink/80">{item.whatToDo}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-alert block mb-1">What to avoid</span>
                    <p className="text-ink/80">{item.whatToAvoid}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-critical block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> When to seek help</span>
                    <p className="text-critical text-xs">{item.whenUrgent}</p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-ink/60 pt-3 border-t border-line">
                  Relevant to: {item.drugName}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </>
    );
  };

  const renderStaticContent = () => (
    <>
      {/* Section 1: WHO supportive information */}
      <section className="space-y-6">
        <div className="space-y-1 border-b border-line pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Globe className="w-6 h-6" />
            <h2 className="text-xl font-heading">WHO clinical guidance</h2>
          </div>
          <p className="text-ink/70">Evidence-based guidance from the World Health Organization for cases similar to yours</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div>
              <h3 className="font-heading text-lg font-semibold">Hepatotoxicity management</h3>
              <p className="text-sm text-ink/60">Similar cases reported: 1,240</p>
            </div>
            <p className="text-sm flex-grow">WHO recommends baseline LFT monitoring, temporary withdrawal if ALT &gt; 3x ULN with symptoms, and stepwise reintroduction once resolved.</p>
            <div className="flex justify-between items-center mt-2">
              <StatusBadge status="secondary" label="Strong recommendation" />
              <span className="text-xs text-ink/50 italic">WHO TB Guidelines 2024</span>
            </div>
          </Card>
          
          <Card className="border-l-4 border-l-primary p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div>
              <h3 className="font-heading text-lg font-semibold">Peripheral neuropathy prevention</h3>
              <p className="text-sm text-ink/60">Similar cases reported: 8,432</p>
            </div>
            <p className="text-sm flex-grow">WHO recommends pyridoxine (Vitamin B6) supplementation for all patients on Isoniazid to prevent peripheral neuropathy, especially in high-risk groups.</p>
            <div className="flex justify-between items-center mt-2">
              <StatusBadge status="secondary" label="Strong recommendation" />
              <span className="text-xs text-ink/50 italic">WHO TB Guidelines 2024</span>
            </div>
          </Card>

          <Card className="border-l-4 border-l-primary p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div>
              <h3 className="font-heading text-lg font-semibold">Ocular toxicity screening</h3>
              <p className="text-sm text-ink/60">Similar cases reported: 945</p>
            </div>
            <p className="text-sm flex-grow">WHO recommends baseline visual acuity testing before starting Ethambutol, monthly monitoring, and immediate cessation if changes occur.</p>
            <div className="flex justify-between items-center mt-2">
              <StatusBadge status="secondary" label="Conditional recommendation" />
              <span className="text-xs text-ink/50 italic">WHO TB Guidelines 2024</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Section 2: ADR-causing medicines */}
      <section className="space-y-6">
        <div className="space-y-1 border-b border-line pb-4">
          <div className="flex items-center gap-2 text-alert">
            <Pill className="w-6 h-6" />
            <h2 className="text-xl font-heading">Medicines and associated adverse reactions</h2>
          </div>
          <p className="text-ink/70">Understanding which drugs in your regimen may cause side effects</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="border-[0.5px] border-t-4 border-t-alert p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-heading text-lg font-semibold">Isoniazid</h3>
                <span className="bg-secondary text-surface text-[10px] px-2 py-1 uppercase tracking-wider">In regimen</span>
              </div>
              <p className="text-xs text-ink/60">Antimycobacterial — bactericidal</p>
            </div>
            
            <div className="space-y-2 flex-grow text-sm">
              <p className="font-semibold border-b border-line pb-1">Known ADRs</p>
              <ul className="space-y-2 pt-1">
                <li className="flex justify-between items-center">
                  <span>Hepatotoxicity</span>
                  <StatusBadge status="critical" label="Severe" />
                </li>
                <li className="flex justify-between items-center">
                  <span>Peripheral neuropathy</span>
                  <StatusBadge status="alert" label="Moderate" />
                </li>
                <li className="flex justify-between items-center">
                  <span>Skin rash</span>
                  <StatusBadge status="secondary" label="Mild" />
                </li>
              </ul>
            </div>
            <div className="mt-2 text-sm bg-surface p-2 border border-line">
              <span className="font-semibold">Typical onset:</span> 2-8 weeks
            </div>
          </Card>

          <Card className="border-[0.5px] border-t-4 border-t-alert p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-heading text-lg font-semibold">Rifampicin</h3>
                <span className="bg-secondary text-surface text-[10px] px-2 py-1 uppercase tracking-wider">In regimen</span>
              </div>
              <p className="text-xs text-ink/60">Antimycobacterial — bactericidal</p>
            </div>
            
            <div className="space-y-2 flex-grow text-sm">
              <p className="font-semibold border-b border-line pb-1">Known ADRs</p>
              <ul className="space-y-2 pt-1">
                <li className="flex justify-between items-center">
                  <span>GI upset</span>
                  <StatusBadge status="secondary" label="Mild" />
                </li>
                <li className="flex justify-between items-center">
                  <span>Hepatotoxicity</span>
                  <StatusBadge status="critical" label="Severe" />
                </li>
                <li className="flex justify-between items-center">
                  <span>Flu-like syndrome</span>
                  <StatusBadge status="alert" label="Moderate" />
                </li>
              </ul>
            </div>
            <div className="mt-2 text-sm bg-surface p-2 border border-line">
              <span className="font-semibold">Typical onset:</span> 1-2 weeks
            </div>
          </Card>

          <Card className="border-[0.5px] border-t-4 border-t-alert p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-heading text-lg font-semibold">Pyrazinamide</h3>
                <span className="bg-secondary text-surface text-[10px] px-2 py-1 uppercase tracking-wider">In regimen</span>
              </div>
              <p className="text-xs text-ink/60">Antimycobacterial — bactericidal</p>
            </div>
            
            <div className="space-y-2 flex-grow text-sm">
              <p className="font-semibold border-b border-line pb-1">Known ADRs</p>
              <ul className="space-y-2 pt-1">
                <li className="flex justify-between items-center">
                  <span>Hepatotoxicity</span>
                  <StatusBadge status="critical" label="Severe" />
                </li>
                <li className="flex justify-between items-center">
                  <span>Joint pain</span>
                  <StatusBadge status="alert" label="Moderate" />
                </li>
              </ul>
            </div>
            <div className="mt-2 text-sm bg-surface p-2 border border-line">
              <span className="font-semibold">Typical onset:</span> 2-6 weeks
            </div>
          </Card>

          <Card className="border-[0.5px] border-t-4 border-t-alert p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-heading text-lg font-semibold">Ethambutol</h3>
                <span className="bg-secondary text-surface text-[10px] px-2 py-1 uppercase tracking-wider">In regimen</span>
              </div>
              <p className="text-xs text-ink/60">Antimycobacterial — bacteriostatic</p>
            </div>
            
            <div className="space-y-2 flex-grow text-sm">
              <p className="font-semibold border-b border-line pb-1">Known ADRs</p>
              <ul className="space-y-2 pt-1">
                <li className="flex justify-between items-center">
                  <span>Ocular toxicity</span>
                  <StatusBadge status="critical" label="Severe" />
                </li>
                <li className="flex justify-between items-center">
                  <span>Skin rash</span>
                  <StatusBadge status="secondary" label="Mild" />
                </li>
              </ul>
            </div>
            <div className="mt-2 text-sm bg-surface p-2 border border-line">
              <span className="font-semibold">Typical onset:</span> 2+ months
            </div>
          </Card>
        </div>
      </section>

      {/* Section 3: Precaution methods */}
      <section className="space-y-6">
        <div className="space-y-1 border-b border-line pb-4">
          <div className="flex items-center gap-2 text-secondary">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-xl font-heading">Precautions and preventive measures</h2>
          </div>
          <p className="text-ink/70">Steps you can take to reduce your risk and stay safe</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-secondary" />
              <h3 className="font-heading text-lg font-semibold">Liver protection</h3>
            </div>
            
            <div className="space-y-3 flex-grow text-sm">
              <div>
                <span className="font-semibold text-primary block mb-1">What to do</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Take meds with food if nausea occurs</li>
                  <li>Watch for yellowing eyes/skin (jaundice)</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-alert block mb-1">What to avoid</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Avoid alcohol completely</li>
                  <li>Avoid other liver-taxing medications</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-critical block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> When to seek help</span>
                <p className="text-critical text-xs">Severe abdominal pain, dark urine, persistent vomiting.</p>
              </div>
            </div>

            <div className="mt-2 text-xs text-ink/60 pt-3 border-t border-line">
              Relevant to: Isoniazid, Rifampicin, Pyrazinamide
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-secondary" />
              <h3 className="font-heading text-lg font-semibold">Nerve health</h3>
            </div>
            
            <div className="space-y-3 flex-grow text-sm">
              <div>
                <span className="font-semibold text-primary block mb-1">What to do</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Take Vitamin B6 daily as prescribed</li>
                  <li>Do gentle stretching exercises</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-alert block mb-1">What to avoid</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tight footwear or clothing</li>
                  <li>Prolonged pressure on limbs</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-critical block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> When to seek help</span>
                <p className="text-critical text-xs">Report any tingling, numbness, or burning sensation immediately.</p>
              </div>
            </div>

            <div className="mt-2 text-xs text-ink/60 pt-3 border-t border-line">
              Relevant to: Isoniazid
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-secondary" />
              <h3 className="font-heading text-lg font-semibold">Vision monitoring</h3>
            </div>
            
            <div className="space-y-3 flex-grow text-sm">
              <div>
                <span className="font-semibold text-primary block mb-1">What to do</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check color vision daily (red/green)</li>
                  <li>Cover one eye at a time to test</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-alert block mb-1">What to avoid</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Avoid driving if vision feels altered</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-critical block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> When to seek help</span>
                <p className="text-critical text-xs">Report any blurriness or difficulty distinguishing colors.</p>
              </div>
            </div>

            <div className="mt-2 text-xs text-ink/60 pt-3 border-t border-line">
              Relevant to: Ethambutol
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div className="flex items-center gap-3">
              <Salad className="w-5 h-5 text-secondary" />
              <h3 className="font-heading text-lg font-semibold">GI comfort</h3>
            </div>
            
            <div className="space-y-3 flex-grow text-sm">
              <div>
                <span className="font-semibold text-primary block mb-1">What to do</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Take Rifampicin with light food if necessary</li>
                  <li>Stay well hydrated throughout the day</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-alert block mb-1">What to avoid</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Spicy, heavy, or very fatty foods</li>
                  <li>Taking on a completely empty stomach if nauseous</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-critical block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> When to seek help</span>
                <p className="text-critical text-xs">Inability to keep liquids down, severe cramping.</p>
              </div>
            </div>

            <div className="mt-2 text-xs text-ink/60 pt-3 border-t border-line">
              Relevant to: Rifampicin
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4 shadow-none border-line rounded-none">
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-secondary" />
              <h3 className="font-heading text-lg font-semibold">Skin care</h3>
            </div>
            
            <div className="space-y-3 flex-grow text-sm">
              <div>
                <span className="font-semibold text-primary block mb-1">What to do</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use mild, unscented moisturizer</li>
                  <li>Wear protective clothing outdoors</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-alert block mb-1">What to avoid</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Direct sun exposure (photosensitivity risk)</li>
                  <li>Harsh soaps or hot water</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold text-critical block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> When to seek help</span>
                <p className="text-critical text-xs">Report any spreading rash, blistering, or skin peeling.</p>
              </div>
            </div>

            <div className="mt-2 text-xs text-ink/60 pt-3 border-t border-line">
              Relevant to: All drugs
            </div>
          </Card>
        </div>
      </section>
    </>
  );

  return (
    <div className="p-10 w-full max-w-full space-y-14 font-body text-ink bg-bg">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-heading text-primary">Health guidance</h1>
          <p className="text-ink/80 text-base">Personalized guidance based on your treatment regimen, WHO recommendations, and clinical evidence.</p>
        </div>

        {/* Drug Filter */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedDrug === '' ? 'primary' : 'secondary'} 
            onClick={() => setSelectedDrug('')}
            size="sm"
          >
            All Medicines
          </Button>
          {drugs.map(drug => (
            <Button 
              key={drug}
              variant={selectedDrug === drug ? 'primary' : 'secondary'} 
              onClick={() => setSelectedDrug(drug)}
              size="sm"
            >
              {drug}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-secondary">Loading guidance...</p>
        </div>
      ) : data ? (
        renderDynamicContent()
      ) : (
        renderStaticContent()
      )}
    </div>
  );
};

export default Guidance;
