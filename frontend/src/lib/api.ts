import { Patient, TbProfile, MedicineScheduleItem, DoseLog, Checkin, ChatMessage, Symptom, AdrAssessment, EducationContent, AdherenceStats } from '../types';

const BASE_URL = 'http://localhost:5000/api';
const USER_EMAIL_KEY = 'tb-user-email';

function headers(): Record<string, string> {
  const email = localStorage.getItem(USER_EMAIL_KEY);
  return { ...(email ? { 'X-User-Email': email } : {}), 'Content-Type': 'application/json' };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const requestHeaders = headers();
  if (options.body instanceof FormData) delete requestHeaders['Content-Type'];
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...requestHeaders, ...options.headers } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `HTTP ${response.status}`);
  return (payload.data ?? payload.patient ?? payload.profile ?? payload.schedule ??
    payload.adherence ?? payload.education_content ?? payload.assessment ??
    payload.checkin ?? payload.dose_log ?? payload.content ?? payload) as T;
}

type AuthResponse = { user: Patient };

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const result = await apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  localStorage.setItem(USER_EMAIL_KEY, result.user.email);
  return result;
};
export const signup = async (data: { email: string } & object): Promise<AuthResponse> => {
  const result = await apiFetch<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  localStorage.setItem(USER_EMAIL_KEY, result.user.email);
  return result;
};
export const logout = async (): Promise<void> => { localStorage.removeItem(USER_EMAIL_KEY); };
export const getProfile = (): Promise<Patient> => apiFetch('/profile/');
export const updateProfile = (data: Partial<Patient>): Promise<Patient> => apiFetch('/profile/', { method: 'PUT', body: JSON.stringify(data) });
export const getTbProfile = (): Promise<TbProfile> => apiFetch('/onboarding/profile');
export const createTbProfile = (data: object): Promise<TbProfile> => apiFetch('/onboarding/profile', { method: 'POST', body: JSON.stringify(data) });
export const uploadReport = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData(); formData.append('file', file);
  const result = await apiFetch<{ report_url: string }>('/onboarding/report', { method: 'POST', body: formData });
  return { url: result.report_url };
};
export const getSchedule = async (): Promise<MedicineScheduleItem[]> => {
  const rows = await apiFetch<any[]>('/schedule/');
  return rows.map(row => ({ id: row.id, drugName: row.drug_name, dosage: row.dosage, scheduledTime: row.scheduled_time, courseDurationDays: row.course_duration_days, daysRemaining: row.days_remaining }));
};
export const logDose = (scheduleItemId: string, status: 'taken' | 'missed' | 'pending'): Promise<DoseLog> =>
  apiFetch('/schedule/dose', { method: 'POST', body: JSON.stringify({ schedule_item_id: scheduleItemId, status }) });
export const getAdherenceStats = async (): Promise<AdherenceStats> => {
  const stats = await apiFetch<any>('/schedule/adherence');
  return { totalDoses: stats.total_doses, takenCount: stats.takenCount, missedCount: stats.missedCount, currentStreak: stats.current_streak, longestStreak: stats.longest_streak };
};
export const createCheckin = (): Promise<Checkin> => apiFetch('/checkin/', { method: 'POST' });
export const appendMessage = (id: string, content: string): Promise<ChatMessage> => apiFetch(`/checkin/${id}/message`, { method: 'POST', body: JSON.stringify({ content }) });
export const submitCheckin = (id: string, symptoms: Symptom[]): Promise<Checkin> => apiFetch(`/checkin/${id}/submit`, { method: 'POST', body: JSON.stringify({ symptoms }) });
export const getAssessment = (id: string): Promise<AdrAssessment> => apiFetch(`/assessment/${id}`);
export const getAssessments = (): Promise<AdrAssessment[]> => apiFetch('/assessment/');
export const scoreCheckin = (id: string): Promise<AdrAssessment> => apiFetch('/assessment/score', { method: 'POST', body: JSON.stringify({ checkin_id: id }) });
export const getEducationContent = async (drug?: string, adr?: string): Promise<EducationContent[]> => {
  const params = new URLSearchParams(); if (drug) params.set('drug', drug); if (adr) params.set('adr', adr);
  const rows = await apiFetch<any[]>(`/education/${params.toString() ? `?${params}` : ''}`);
  return rows.map(row => ({ id: row.id, adrName: row.adr_name, drugName: row.drug_name, cause: row.cause, whatToDo: row.what_to_do, whatToAvoid: row.what_to_avoid, whenUrgent: row.when_urgent }));
};
export const getDashboard = (): Promise<any> => apiFetch('/dashboard/');
export const getEmergencyInfo = (): Promise<any> => apiFetch('/emergency/');

// LLM Chat + ML Analysis
export interface LlmChatMessage { role: 'user' | 'assistant'; content: string; }
export interface LlmChatResponse { reply: string; is_complete: boolean; }
export interface MlAnalysisResult {
  sentences: { sentence: string; adr_flag: boolean; score: number }[];
  flagged_count: number;
  total_sentences: number;
  adr_risk_percent: number;
  adr_detected: boolean;
  model_used: string;
}

export const llmChat = (
  messages: LlmChatMessage[],
  patientName: string,
  treatmentDay: number
): Promise<LlmChatResponse> =>
  apiFetch('/llm/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, patient_name: patientName, treatment_day: treatmentDay })
  });

export const mlAnalyze = (conversationText: string): Promise<MlAnalysisResult> =>
  apiFetch('/llm/analyze', {
    method: 'POST',
    body: JSON.stringify({ conversation_text: conversationText })
  });

// RAG — WHO guideline cards + chat
export interface RagChunk { text: string; source: string; source_file: string; }
export interface RagCard { symptom: string; query: string; chunks: RagChunk[]; }

export const getRagCards = (symptoms: string[], mlRisk: number): Promise<{ cards: RagCard[] }> =>
  apiFetch('/rag/cards', { method: 'POST', body: JSON.stringify({ symptoms, ml_risk: mlRisk }) });

export const ragChat = (
  messages: LlmChatMessage[],
  symptoms: string[],
  userQuery: string
): Promise<{ reply: string }> =>
  apiFetch('/rag/chat', { method: 'POST', body: JSON.stringify({ messages, symptoms, user_query: userQuery }) });
