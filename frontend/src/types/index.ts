export type RiskStatus = 'normal' | 'elevated' | 'critical';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  language: string;
  caregiverContact?: string;
}

export interface RegimenDrug {
  drugName: string;
  dosage: string;
  frequency: string;
  route?: string;
}

export interface TbProfile {
  id: string;
  patientId: string;
  treatmentStartDate: string;
  treatmentCenter: string;
  doctorName: string;
  reportUrl?: string;
  regimen: RegimenDrug[];
}

export interface MedicineScheduleItem {
  id: string;
  drugName: string;
  dosage: string;
  scheduledTime: string;
  courseDurationDays: number;
  daysRemaining: number;
}

export interface DoseLog {
  id: string;
  scheduleItemId: string;
  date: string;
  time: string;
  status: 'taken' | 'missed' | 'pending';
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'patient';
  content: string;
  timestamp: string;
}

export interface Symptom {
  id?: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  onsetHoursAfterDose?: number;
  date?: string;
}

export interface Checkin {
  id: string;
  patientId: string;
  timestamp: string;
  conversationLog: ChatMessage[];
  symptoms: Symptom[];
  summary?: string;
}

export interface AdrAssessment {
  id: string;
  checkinId: string;
  confidenceScore: number;
  matchedAdrs: string[];
  rootCauseDrug: string;
  recommendedAction: 'monitor' | 'contact_doctor' | 'seek_care_now';
  explanation: string;
}

export interface EducationContent {
  id: string;
  adrName: string;
  drugName: string;
  cause: string;
  whatToDo: string;
  whatToAvoid: string;
  whenUrgent: string;
}

export interface AdherenceStats {
  totalDoses: number;
  takenCount: number;
  missedCount: number;
  currentStreak: number;
  longestStreak: number;
}
