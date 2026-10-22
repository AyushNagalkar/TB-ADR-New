import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BrainCircuit, GitBranch, Globe, Phone, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfidenceScore } from '../components/assessment/ConfidenceScore';
import { KnowledgeGraphView } from '../components/assessment/KnowledgeGraphView';

export const Assessment = () => {
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState<number>(1);

  // Load real ML score from check-in analysis
  const [mlScore, setMlScore] = useState(62);
  const [mlFlagged, setMlFlagged] = useState<{ count: number; total: number } | null>(null);
  const [mlModel, setMlModel] = useState('');
  const [mlDetected, setMlDetected] = useState(true);

  React.useEffect(() => {
    const raw = localStorage.getItem('adr_ml_result');
    if (raw) {
      try {
        const r = JSON.parse(raw);
        setMlScore(Math.round(r.adr_risk_percent));
        setMlFlagged({ count: r.flagged_count, total: r.total_sentences });
        setMlModel(r.model_used || '');
        setMlDetected(r.adr_detected);
      } catch { /* use defaults */ }
    }
  }, []);

  const kgScore = 74;
  const combinedScore = Math.round(mlScore * 0.6 + kgScore * 0.4);

  // Helper for step indicator styling
  const getStepCircleClass = (stepNum: number) => {
    if (activeStep > stepNum) {
      return "bg-secondary text-white border-secondary";
    }
    if (activeStep === stepNum) {
      return "bg-primary text-white border-primary";
    }
    return "bg-bg border-line text-ink";
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-20 font-body text-ink space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold text-ink">
          ADR assessment results
        </h1>
        <p className="text-secondary text-sm">
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center w-full my-8">
        <div className="flex flex-col items-center relative z-10 w-24">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium transition-colors ${getStepCircleClass(1)}`}>
            {activeStep > 1 ? <Check size={16} /> : "1"}
          </div>
          <span className="text-xs font-medium mt-2 text-center text-ink">ML analysis</span>
        </div>
        
        <div className={`flex-1 h-px -mt-6 transition-colors ${activeStep >= 2 ? 'bg-secondary' : 'bg-line'}`}></div>
        
        <div className="flex flex-col items-center relative z-10 w-24">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium transition-colors ${getStepCircleClass(2)}`}>
            {activeStep > 2 ? <Check size={16} /> : "2"}
          </div>
          <span className="text-xs font-medium mt-2 text-center text-ink">Knowledge graph</span>
        </div>

        <div className={`flex-1 h-px -mt-6 transition-colors ${activeStep >= 3 ? 'bg-secondary' : 'bg-line'}`}></div>
        
        <div className="flex flex-col items-center relative z-10 w-24">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium transition-colors ${getStepCircleClass(3)}`}>
            {activeStep > 3 ? <Check size={16} /> : "3"}
          </div>
          <span className="text-xs font-medium mt-2 text-center text-ink">Clinical guidance</span>
        </div>
      </div>

      {/* Step 1: ML Model */}
      <Card className="border-l-4 border-l-primary overflow-hidden">
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-line">
            <BrainCircuit className="text-primary" size={24} />
            <h2 className="font-heading text-xl font-bold text-ink">Machine learning analysis</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-secondary uppercase tracking-wider font-medium mb-1">Is this an adverse drug reaction?</p>
              <div className="text-3xl font-bold" style={{ color: mlDetected ? '#8C2F2F' : '#5C7A6B' }}>{mlDetected ? 'YES' : 'NO'}</div>
            </div>
            
            <div className="pt-2">
              <ConfidenceScore score={mlScore} status={mlScore >= 75 ? 'critical' : mlScore >= 40 ? 'elevated' : 'normal'} />
            </div>

            {mlFlagged && (
              <div className="p-3 bg-bg border border-line text-sm">
                <p className="font-medium mb-1">PubMedBERT sentence analysis:</p>
                <p className="text-ink/80">{mlFlagged.count} of {mlFlagged.total} clinical sentences flagged as ADR signals</p>
                {mlModel && <p className="text-xs text-secondary mt-1">Model: {mlModel}</p>}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Type of ADR detected:</p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="severe">Hepatotoxicity</StatusBadge>
                <StatusBadge status="moderate">GI Upset</StatusBadge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Contributing factors:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-ink/80">
                <li>Nausea reported 2 hours after dose</li>
                <li>Loss of appetite persisting 3 days</li>
                <li>Patient on Pyrazinamide (known hepatotoxic)</li>
              </ul>
            </div>
            
            {activeStep === 1 && (
              <div className="pt-4">
                <Button 
                  onClick={() => setActiveStep(2)}
                  className="w-full sm:w-auto"
                >
                  View knowledge graph analysis
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Step 2: Knowledge Graph */}
      {activeStep >= 2 && (
        <Card className="border-l-4 border-l-alert overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="p-5 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-line">
              <GitBranch className="text-alert" size={24} />
              <h2 className="font-heading text-xl font-bold text-ink">Knowledge graph verification</h2>
            </div>
            
            <div className="space-y-6">
              <KnowledgeGraphView 
                drug="Pyrazinamide"
                adrName="Hepatotoxicity"
                symptoms={["Nausea", "Loss of appetite", "Abdominal discomfort"]}
                confidence={kgScore}
              />

              <div className="bg-bg p-4 rounded-lg border border-line text-sm">
                <p className="font-medium mb-1">Graph path explanation:</p>
                <p className="text-ink/80">The knowledge graph confirms a documented pathway between Pyrazinamide and hepatotoxicity. Your reported symptoms (nausea, loss of appetite) are consistent with early-stage liver inflammation.</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Combined Confidence Score:</p>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs text-secondary">
                      <span>ML: {mlScore}%</span>
                      <span>KG: {kgScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-line rounded-full overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: `${mlScore}%` }}></div>
                      <div className="h-full bg-alert" style={{ width: `${100 - mlScore}%` }}></div>
                    </div>
                    <div className="text-center text-sm font-bold text-ink">Final weighted score: {combinedScore}%</div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Evidence strength:</p>
                <p className="text-sm text-ink/80">Strong — multiple symptom matches with documented ADR profile</p>
              </div>

              {activeStep === 2 && (
                <div className="pt-4">
                  <Button 
                    onClick={() => setActiveStep(3)}
                    className="w-full sm:w-auto"
                  >
                    View clinical recommendations
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: WHO Guidance */}
      {activeStep >= 3 && (
        <Card className="border-l-4 border-l-secondary overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="p-5 space-y-6">
            <div className="flex items-start gap-3 pb-4 border-b border-line">
              <Globe className="text-secondary mt-1 flex-shrink-0" size={24} />
              <div>
                <h2 className="font-heading text-xl font-bold text-ink">Personalized clinical guidance</h2>
                <p className="text-sm text-secondary">Based on ML analysis, knowledge graph verification, and WHO clinical guidelines</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* WHO Recommendation */}
              <div className="space-y-2">
                <h3 className="font-medium text-ink">1. WHO recommendation</h3>
                <div className="bg-bg p-4 border border-line rounded-lg space-y-2">
                  <p className="text-sm text-ink/90">"For patients showing early signs of hepatotoxicity on Pyrazinamide, WHO recommends: Immediate liver function test, temporary dose adjustment pending results, increased monitoring frequency."</p>
                  <p className="text-xs text-secondary font-medium">Source: WHO Guidelines for TB Treatment, 2024</p>
                </div>
              </div>

              {/* Root cause drug */}
              <div className="space-y-2">
                <h3 className="font-medium text-ink">2. Likely root cause</h3>
                <div className="border border-line p-4 rounded-lg flex items-start gap-4 bg-surface">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    PZA
                  </div>
                  <div>
                    <h4 className="font-bold text-ink">Pyrazinamide</h4>
                    <p className="text-sm text-alert font-medium mt-1">Primary suspect for identified ADR profile</p>
                    <p className="text-sm text-secondary mt-1">Known high risk of hepatotoxicity. Matches reported onset timeline.</p>
                  </div>
                </div>
              </div>

              {/* Personalized precautions */}
              <div className="space-y-2">
                <h3 className="font-medium text-ink">3. Your precautions</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-ink/90">
                  <li><strong>Avoid all alcohol</strong> consumption</li>
                  <li>Ensure adequate hydration and take medication with food</li>
                  <li>Monitor urine color (report if dark/tea-colored)</li>
                  <li>Next symptom check-in recommended in <strong>24 hours</strong></li>
                </ul>
              </div>
              
              {/* Recommended Action */}
              <div className="mt-8 bg-alert/10 border-l-4 border-alert p-5 rounded-r-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="bg-surface p-3 rounded-full shadow-sm flex-shrink-0">
                  <Phone className="text-alert" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-ink mb-1">Contact your doctor within 24 hours</h3>
                  <p className="text-sm text-ink/80">Your combined analysis score of 68% indicates a moderate likelihood of an adverse drug reaction. While not immediately dangerous, medical review is recommended.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-line">
                <Link to="/emergency" className="flex-1">
                  <Button variant="danger" className="w-full">
                    Call doctor now
                  </Button>
                </Link>
                <Link to="/" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Back to dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      <div className="text-center text-xs text-secondary mt-8 pb-8">
        Assessment generated at {new Date().toLocaleTimeString()}. This is a screening tool — always consult your healthcare provider for medical decisions.
      </div>
    </div>
  );
};
