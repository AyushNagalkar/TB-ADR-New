import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, MessageCircle, Send, Loader2, AlertTriangle, ChevronDown, ChevronUp, FileText, Bot, User, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getRagCards, ragChat, RagCard, LlmChatMessage } from '../lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────── //

const SOURCE_COLORS: Record<string, string> = {
  'WHO 2025 TB Treatment Guidelines':      '#1a5c3a',
  'WHO 2025 TB Operational Handbook':      '#1a3a5c',
  'WHO TB Pharmacovigilance Handbook':     '#4a1a5c',
  'NTEP ADR Ready Reckoner':               '#5c3a1a',
};

const SYMPTOM_COLORS: Record<string, string> = {
  Nausea: '#B4622A', Vomiting: '#8C2F2F', Jaundice: '#8C6B2F',
  Fatigue: '#5C7A6B', 'Tingling/Numbness': '#2F5C8C', 'Vision Change': '#6B2F8C',
  'Skin Rash': '#8C2F6B', 'Joint Pain': '#2F8C6B', 'Dark Urine': '#5C4A2F',
  Headache: '#6B5C2F', Dizziness: '#4A6B8C', 'Sleep Disruption': '#5C2F8C',
  'Loss of Appetite': '#8C5C2F', Fever: '#8C2F2F', Chills: '#2F5C8C',
  Itching: '#6B8C2F', Pain: '#8C2F3F',
};

function symptomColor(s: string) { return SYMPTOM_COLORS[s] || '#5C7A6B'; }

// ─── Sub-components ───────────────────────────────────────────────────────── //

const SourceBadge: React.FC<{ source: string }> = ({ source }) => (
  <span
    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 font-body"
    style={{ background: (SOURCE_COLORS[source] || '#2a2a2a') + '18', color: SOURCE_COLORS[source] || '#333', border: `1px solid ${(SOURCE_COLORS[source] || '#2a2a2a')}40` }}
  >
    <FileText size={10} /> {source}
  </span>
);

const SymptomCard: React.FC<{ card: RagCard }> = ({ card }) => {
  const [open, setOpen] = useState(true);
  const color = symptomColor(card.symptom);

  return (
    <div className="border" style={{ borderColor: color + '50', background: '#fff' }}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{ background: color + '10' }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="font-heading font-semibold text-base" style={{ color }}>
            {card.symptom}
          </span>
          <span className="text-xs font-body text-ink/40 hidden sm:inline">
            — {card.chunks.length} WHO reference{card.chunks.length !== 1 ? 's' : ''}
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-ink/40" /> : <ChevronDown size={16} className="text-ink/40" />}
      </button>

      {open && (
        <div className="divide-y divide-line">
          {card.chunks.length === 0 ? (
            <p className="px-5 py-4 text-sm text-ink/40 italic font-body">No relevant WHO passages found for this symptom.</p>
          ) : card.chunks.map((chunk, i) => (
            <div key={i} className="px-5 py-4">
              <div className="mb-2">
                <SourceBadge source={chunk.source} />
              </div>
              <p className="text-sm font-body text-ink/80 leading-relaxed">
                {chunk.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-bg border border-line w-fit">
    <Bot size={14} className="text-secondary mr-1" />
    {[0, 1, 2].map(i => (
      <span key={i} className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

// ─── Suggested questions ──────────────────────────────────────────────────── //

function buildSuggestions(symptoms: string[]): string[] {
  const base = [
    "What does WHO say about my current symptoms?",
    "Is my condition serious according to WHO guidelines?",
    "What precautions should I take right now?",
    "Should I stop my TB medication?",
  ];
  const symptomQ = symptoms.slice(0, 2).map(s => `What does WHO recommend for ${s.toLowerCase()} from TB drugs?`);
  return [...symptomQ, ...base].slice(0, 5);
}

// ─── Main Page ────────────────────────────────────────────────────────────── //

export const RAGGuide: React.FC = () => {
  const endRef = useRef<HTMLDivElement>(null);

  // Patient data from localStorage
  const [symptoms] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('checkin_symptoms') || '[]'); } catch { return []; }
  });
  const [mlRisk] = useState<number>(() => {
    try {
      const r = JSON.parse(localStorage.getItem('adr_ml_result') || '{}');
      return r.adr_risk_percent || 0;
    } catch { return 0; }
  });

  // Cards state
  const [cards, setCards] = useState<RagCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<LlmChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatStarted, setChatStarted] = useState(false);

  const suggestions = buildSuggestions(symptoms);

  // Load cards on mount
  useEffect(() => {
    const load = async () => {
      setCardsLoading(true);
      setCardsError(null);
      try {
        const result = await getRagCards(
          symptoms.length > 0 ? symptoms : ['Nausea', 'Fatigue', 'Jaundice'],
          mlRisk
        );
        setCards(result.cards);
      } catch (e: any) {
        setCardsError(e.message || 'Failed to load WHO guidelines');
      } finally {
        setCardsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setInput('');
    setChatError(null);
    setChatStarted(true);

    const userMsg: LlmChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await ragChat(newMessages, symptoms, text);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (e: any) {
      setIsTyping(false);
      setChatError(e.message || 'Failed to connect. Check Ollama is running.');
    }
  };

  const riskColor = mlRisk < 20 ? '#5C7A6B' : mlRisk < 50 ? '#B4622A' : '#8C2F2F';

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-primary flex items-center gap-3">
            <BookOpen size={28} /> WHO Health Guidance
          </h1>
          <p className="font-body text-sm text-secondary mt-1">
            Personalised guidance based on your check-in symptoms, powered by WHO guidelines
          </p>
        </div>
        {mlRisk > 0 && (
          <div className="text-right">
            <p className="text-xs text-ink/40 font-body uppercase tracking-wider">ML Risk Score</p>
            <p className="font-heading text-2xl font-bold" style={{ color: riskColor }}>{mlRisk}%</p>
          </div>
        )}
      </div>

      {/* Detected symptoms strip */}
      {symptoms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-ink/40 font-body uppercase tracking-wider self-center mr-1">Your symptoms:</span>
          {symptoms.map(s => (
            <span key={s} className="text-xs font-body px-2.5 py-1 border font-medium" style={{ borderColor: symptomColor(s), color: symptomColor(s), background: symptomColor(s) + '12' }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {/* WHO Reference Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-lg font-semibold text-ink">
            WHO Guideline References
          </h2>
          <Button
            variant="secondary"
            onClick={() => {
              setCardsLoading(true);
              getRagCards(symptoms.length > 0 ? symptoms : ['Nausea', 'Fatigue'], mlRisk)
                .then(r => { setCards(r.cards); setCardsError(null); })
                .catch(e => setCardsError(e.message))
                .finally(() => setCardsLoading(false));
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5"
          >
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>

        {cardsLoading && (
          <div className="flex items-center gap-3 p-6 border border-line text-secondary font-body text-sm">
            <Loader2 size={18} className="animate-spin" />
            Searching WHO guidelines across 4 medical references… (first load takes ~30s)
          </div>
        )}

        {cardsError && (
          <div className="flex items-center gap-2 p-4 border border-alert/30 bg-alert/5 text-alert text-sm font-body">
            <AlertTriangle size={16} /> {cardsError}
          </div>
        )}

        {!cardsLoading && cards.length === 0 && !cardsError && (
          <div className="p-6 border border-line text-ink/40 font-body text-sm text-center">
            No cards loaded yet. Complete a check-in first to load symptom-specific WHO guidance.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {cards.map(card => (
            <SymptomCard key={card.symptom} card={card} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-line" />
        <span className="flex items-center gap-2 text-sm text-secondary font-body px-2">
          <MessageCircle size={16} /> Ask WHO Advisor
        </span>
        <div className="flex-1 h-px bg-line" />
      </div>

      {/* RAG Chatbot */}
      <div className="border border-line" style={{ background: '#fff' }}>
        {/* Chat header */}
        <div className="px-5 py-3 border-b border-line bg-bg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-secondary" />
            <span className="font-body font-semibold text-sm text-ink">WHO Guideline Advisor</span>
            <span className="text-xs text-ink/30 font-body">— answers sourced from WHO PDFs</span>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-secondary font-body">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            RAG active
          </span>
        </div>

        {/* Messages */}
        <div style={{ minHeight: 260, maxHeight: 420, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Welcome */}
          {!chatStarted && (
            <div className="border-l-4 border-secondary bg-secondary/5 p-4">
              <p className="font-heading text-sm font-semibold text-ink mb-1">Ask me anything about your symptoms</p>
              <p className="text-xs font-body text-ink/60">
                I will answer using WHO TB Treatment Guidelines, WHO Pharmacovigilance Handbook, and the NTEP ADR Ready Reckoner.
              </p>
              {/* Suggested questions */}
              <div className="flex flex-col gap-1.5 mt-3">
                {suggestions.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs font-body px-3 py-2 border border-secondary/30 bg-white hover:bg-secondary/5 text-secondary transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message history */}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-secondary" />
                </div>
              )}
              <div
                className="max-w-[85%] px-4 py-3 text-sm font-body leading-relaxed"
                style={{
                  background: m.role === 'user' ? '#2D3B2D' : '#F5F6F4',
                  color: m.role === 'user' ? '#fff' : '#1a1a1a',
                  borderRadius: 2,
                }}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-primary" />
                </div>
              )}
            </div>
          ))}

          {isTyping && <TypingDots />}

          {chatError && (
            <div className="flex items-center gap-2 text-xs text-alert font-body px-1">
              <AlertTriangle size={13} /> {chatError}
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-line bg-bg">
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your symptoms, WHO recommendations, or next steps…"
              disabled={isTyping}
              className="flex-1 border border-line bg-white px-3 py-2.5 font-body text-sm text-ink focus:outline-none focus:border-primary placeholder:text-ink/30 disabled:opacity-50"
            />
            <Button type="submit" disabled={isTyping || !input.trim()} className="flex items-center gap-1.5">
              {isTyping ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {isTyping ? 'Wait…' : 'Ask'}
            </Button>
          </form>
          <p className="text-xs text-ink/30 font-body mt-1.5">
            Sources: WHO 2025 TB Guidelines · WHO Pharmacovigilance Handbook · NTEP ADR Ready Reckoner
          </p>
        </div>
      </div>
    </div>
  );
};
