import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, CheckCircle2, Circle, ChevronRight, BrainCircuit, AlertTriangle, Wifi } from 'lucide-react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ChatMessage } from '../types';
import {
  createCheckin, appendMessage as appendMsgApi,
  llmChat, LlmChatMessage, mlAnalyze, MlAnalysisResult
} from '../lib/api';

const SYMPTOM_KEYWORDS: Record<string, string> = {
  nausea: 'Nausea', vomiting: 'Vomiting', tingling: 'Tingling/Numbness',
  numbness: 'Tingling/Numbness', fatigue: 'Fatigue', tired: 'Fatigue',
  jaundice: 'Jaundice', yellow: 'Jaundice', rash: 'Skin Rash',
  vision: 'Vision Change', blur: 'Vision Change', joint: 'Joint Pain',
  appetite: 'Loss of Appetite', dark: 'Dark Urine', headache: 'Headache',
  dizziness: 'Dizziness', sleep: 'Sleep Disruption', fever: 'Fever',
  chills: 'Chills', itching: 'Itching', pain: 'Pain',
};

function detectSymptoms(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const [kw, symptom] of Object.entries(SYMPTOM_KEYWORDS)) {
    if (lower.includes(kw)) found.add(symptom);
  }
  return Array.from(found);
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-bg border border-line w-fit">
    <span className="text-xs text-secondary font-body mr-2">MedBot is thinking</span>
    {[0, 1, 2].map(i => (
      <span key={i} className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

const OPENING_MESSAGE = "Hello! I'm MedBot, your daily health assistant. I'm here to check in on how you're feeling with your TB treatment today. Let's start — did you manage to take all your medicines this morning? (Isoniazid, Rifampicin, Pyrazinamide, and Ethambutol)";

export const Checkin: React.FC = () => {
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [llmHistory, setLlmHistory] = useState<LlmChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [checkinId, setCheckinId] = useState<string | null>(null);
  const [detectedSymptoms, setDetectedSymptoms] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [mlResult, setMlResult] = useState<MlAnalysisResult | null>(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [meds, setMeds] = useState([
    { name: 'Isoniazid', taken: false },
    { name: 'Rifampicin', taken: false },
    { name: 'Pyrazinamide', taken: false },
    { name: 'Ethambutol', taken: false },
  ]);

  // Init: create checkin session and show opening message
  useEffect(() => {
    const init = async () => {
      try {
        const c = await createCheckin();
        setCheckinId(c.id);
      } catch { /* offline – continue without backend session */ }
    };
    init();
    setMessages([{
      id: 'a0',
      role: 'assistant',
      content: OPENING_MESSAGE,
      timestamp: new Date().toISOString()
    }]);
    // The opening message is also added to llm history so the LLM has context
    setLlmHistory([{ role: 'assistant', content: OPENING_MESSAGE }]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Collect all patient messages for ML analysis
  const getPatientText = useCallback((currentHistory: LlmChatMessage[]): string => {
    return currentHistory
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('. ');
  }, []);

  const runMlAnalysis = useCallback(async (history: LlmChatMessage[]) => {
    const patientText = getPatientText(history);
    if (!patientText.trim()) return;
    try {
      const result = await mlAnalyze(patientText);
      setMlResult(result);
      // Store in localStorage for Dashboard
      localStorage.setItem('adr_ml_result', JSON.stringify(result));
    } catch (e) {
      console.warn('ML analysis failed:', e);
    }
  }, [getPatientText]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isTyping || done) return;
    setInputValue('');
    setLlmError(null);

    // Add user message to UI
    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: 'patient',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    // Detect symptoms from user input
    const found = detectSymptoms(text);
    if (found.length) setDetectedSymptoms(prev => [...new Set([...prev, ...found])]);

    // Update medicine adherence on first message
    if (exchangeCount === 0 && text.toLowerCase().includes('yes')) {
      setMeds(prev => prev.map(m => ({ ...m, taken: true })));
    }

    // Save to backend
    if (checkinId) {
      try { await appendMsgApi(checkinId, text); } catch { /* offline */ }
    }

    // Build updated LLM history
    const updatedHistory: LlmChatMessage[] = [...llmHistory, { role: 'user', content: text }];
    setLlmHistory(updatedHistory);
    setExchangeCount(prev => prev + 1);

    // Show typing indicator
    setIsTyping(true);

    // Run ML in background every 2 exchanges
    if ((exchangeCount + 1) % 2 === 0) {
      runMlAnalysis(updatedHistory);
    }

    try {
      // Get patient name from localStorage if available
      const patientName = localStorage.getItem('patient_name') || 'Patient';
      const treatmentDay = parseInt(localStorage.getItem('treatment_day') || '1', 10);

      const response = await llmChat(updatedHistory, patientName, treatmentDay);
      setIsTyping(false);

      const botMsg: ChatMessage = {
        id: `a${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);

      const newHistory: LlmChatMessage[] = [...updatedHistory, { role: 'assistant', content: response.reply }];
      setLlmHistory(newHistory);

      if (response.is_complete) {
        // Run final ML analysis on completion
        await runMlAnalysis(newHistory);
        setTimeout(() => setDone(true), 800);
      }
    } catch (err: any) {
      setIsTyping(false);
      const errMsg = err.message || 'Failed to connect to MedBot. Please check Ollama is running.';
      setLlmError(errMsg);
      // Add fallback bot message
      setMessages(prev => [...prev, {
        id: `err${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please make sure Ollama is running and try again.",
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Final ML analysis if not done yet
    if (!mlResult) {
      await runMlAnalysis(llmHistory);
    }
    // Store result for Assessment page
    localStorage.setItem('checkin_symptoms', JSON.stringify(detectedSymptoms));
    navigate('/assessment/latest');
  };

  const riskPercent = mlResult?.adr_risk_percent ?? 0;
  const riskLabel = riskPercent < 20 ? 'Low' : riskPercent < 50 ? 'Moderate' : riskPercent < 75 ? 'Elevated' : 'High';
  const riskColor = riskPercent < 20 ? '#5C7A6B' : riskPercent < 50 ? '#B4622A' : '#8C2F2F';

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 128px)', minHeight: 500 }}>
      {/* LEFT: Chat Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0', background: '#fff', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e0e0e0', background: '#F5F6F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="font-heading text-xl text-primary font-semibold">Daily Health Check-in</h1>
            <p className="font-body text-xs text-secondary mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {mlResult && (
              <span className="flex items-center gap-1.5 text-xs font-body px-2 py-1 border" style={{ borderColor: riskColor, color: riskColor }}>
                <BrainCircuit size={12} />
                ML: {riskPercent}% {riskLabel}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-secondary font-body">
              <span className="w-2 h-2 rounded-full bg-green-500" style={{ animation: 'pulse 2s infinite' }} />
              <Wifi size={12} /> Ollama connected
            </span>
          </div>
        </div>

        {/* Medicine quick-check */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
          <p className="text-xs text-ink/50 font-body uppercase tracking-wider mb-2">Today's medicines — tap to mark taken</p>
          <div className="flex gap-2 flex-wrap">
            {meds.map(m => (
              <button
                key={m.name}
                onClick={() => setMeds(prev => prev.map(x => x.name === m.name ? { ...x, taken: !x.taken } : x))}
                className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-body transition-colors ${m.taken ? 'border-secondary bg-secondary/10 text-secondary' : 'border-line bg-white text-ink/60 hover:border-secondary/50'}`}
              >
                {m.taken ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* LLM Error Banner */}
        {llmError && (
          <div className="flex items-center gap-2 px-4 py-2 bg-alert/10 border-b border-alert/30 text-xs text-alert font-body">
            <AlertTriangle size={13} />
            {llmError}
          </div>
        )}

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map(msg => (
            <ChatBubble key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
          ))}
          {isTyping && <TypingIndicator />}
          {done && (
            <div className="border-l-4 border-secondary bg-secondary/5 p-4 mt-2">
              <p className="font-heading text-base text-primary font-semibold">Check-in complete</p>
              {mlResult && (
                <div className="mt-2 mb-3 p-3 bg-white border border-line">
                  <p className="text-xs text-ink/50 uppercase tracking-wider font-body mb-1">ML Analysis Result</p>
                  <p className="text-sm font-body">
                    <span className="font-semibold" style={{ color: riskColor }}>{riskPercent}% ADR Risk</span>
                    {' — '}{mlResult.flagged_count} of {mlResult.total_sentences} sentences flagged
                  </p>
                  <p className="text-xs text-ink/40 mt-0.5">Model: {mlResult.model_used}</p>
                </div>
              )}
              <p className="font-body text-sm text-ink/70">
                {detectedSymptoms.length > 0
                  ? `${detectedSymptoms.length} symptom(s) noted — ${detectedSymptoms.join(', ')}.`
                  : 'No specific symptoms flagged.'
                } Proceeding to full ADR assessment.
              </p>
              <Button onClick={handleSubmit} disabled={submitting} className="mt-3 flex items-center gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                {submitting ? 'Analysing…' : 'View ADR assessment'}
              </Button>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        {!done && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e0e0e0', background: '#F5F6F4' }}>
            <p className="text-xs text-ink/40 font-body mb-2 italic">Describe how you feel honestly — MedBot will ask follow-up questions</p>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Type your response…"
                disabled={isTyping}
                className="flex-1 border border-line bg-white px-3 py-2.5 font-body text-sm text-ink focus:outline-none focus:border-primary placeholder:text-ink/30 disabled:opacity-50"
              />
              <Button type="submit" disabled={isTyping || !inputValue.trim()} className="flex items-center gap-1.5">
                {isTyping ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {isTyping ? 'Wait…' : 'Send'}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* RIGHT: Live Summary Panel */}
      <div style={{ width: 270, flexShrink: 0, borderLeft: '1px solid #e0e0e0', background: '#F5F6F4', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
          <p className="font-heading text-sm text-primary font-semibold">Examination summary</p>
        </div>

        {/* Exchange count */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
          <p className="text-xs text-ink/50 uppercase tracking-wider font-body mb-2">Conversation progress</p>
          <div className="w-full bg-line h-1.5" style={{ borderRadius: 4 }}>
            <div className="h-1.5 bg-primary transition-all duration-500" style={{ width: `${Math.min((exchangeCount / 8) * 100, 100)}%`, borderRadius: 4 }} />
          </div>
          <p className="text-xs text-secondary font-body mt-1">{exchangeCount} of ~8 exchanges</p>
        </div>

        {/* Medicines */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
          <p className="text-xs text-ink/50 uppercase tracking-wider font-body mb-2">Medicine adherence</p>
          {meds.map(m => (
            <div key={m.name} className="flex items-center justify-between text-sm font-body mb-1.5">
              <span className="text-ink/80">{m.name}</span>
              {m.taken
                ? <span className="text-secondary text-xs flex items-center gap-1"><CheckCircle2 size={12} /> Taken</span>
                : <span className="text-ink/30 text-xs">—</span>
              }
            </div>
          ))}
        </div>

        {/* Detected symptoms */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
          <p className="text-xs text-ink/50 uppercase tracking-wider font-body mb-2">Detected symptoms</p>
          {detectedSymptoms.length === 0 ? (
            <p className="text-xs text-ink/30 font-body italic">None flagged yet</p>
          ) : (
            detectedSymptoms.map(s => (
              <div key={s} className="flex items-center gap-2 text-xs font-body mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-alert flex-shrink-0" />
                <span className="text-ink/80">{s}</span>
              </div>
            ))
          )}
        </div>

        {/* ML Risk */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
          <p className="text-xs text-ink/50 uppercase tracking-wider font-body mb-2">Live ML risk</p>
          <div className="w-full h-2 bg-line" style={{ borderRadius: 4, overflow: 'hidden' }}>
            <div
              className="h-2 transition-all duration-700"
              style={{ width: `${riskPercent}%`, background: riskColor, borderRadius: 4 }}
            />
          </div>
          <p className="text-xs font-body mt-1" style={{ color: riskColor }}>{riskPercent}% — {riskLabel}</p>
          {mlResult && (
            <p className="text-xs text-ink/30 font-body mt-0.5">{mlResult.flagged_count}/{mlResult.total_sentences} sentences flagged</p>
          )}
        </div>

        {/* ML sentence breakdown */}
        {mlResult && mlResult.sentences.length > 0 && (
          <div style={{ padding: '16px' }}>
            <p className="text-xs text-ink/50 uppercase tracking-wider font-body mb-2">Sentence analysis</p>
            <div className="flex flex-col gap-1.5">
              {mlResult.sentences.map((s, i) => (
                <div key={i} className="text-xs font-body p-2 border" style={{ borderColor: s.adr_flag ? '#8C2F2F' : '#e0e0e0', background: s.adr_flag ? '#8C2F2F10' : 'transparent' }}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.adr_flag ? '#8C2F2F' : '#5C7A6B' }} />
                    <span className="font-semibold" style={{ color: s.adr_flag ? '#8C2F2F' : '#5C7A6B' }}>
                      {s.adr_flag ? 'ADR Signal' : 'Normal'} ({Math.round(s.score * 100)}%)
                    </span>
                  </div>
                  <p className="text-ink/60 leading-tight" style={{ fontSize: 10 }}>{s.sentence.slice(0, 60)}{s.sentence.length > 60 ? '…' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
