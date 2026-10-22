-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- patients table (linked to auth.users)
create table patients (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  language text default 'en',
  caregiver_contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- tb_profiles (one per patient)
create table tb_profiles (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  treatment_start_date date not null,
  treatment_center text,
  doctor_name text,
  report_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(patient_id)
);

-- regimen_drugs (structured, not a blob)
create table regimen_drugs (
  id uuid primary key default uuid_generate_v4(),
  tb_profile_id uuid not null references tb_profiles(id) on delete cascade,
  drug_name text not null,
  dosage text not null,
  frequency text not null default 'once_daily',
  route text default 'oral'
);

-- medicine_schedule (generated from regimen)
create table medicine_schedule (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  drug_name text not null,
  dosage text not null,
  scheduled_time time not null,
  course_duration_days int not null,
  days_remaining int,
  created_at timestamptz default now()
);

-- dose_logs
create table dose_logs (
  id uuid primary key default uuid_generate_v4(),
  schedule_item_id uuid not null references medicine_schedule(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  log_date date not null default current_date,
  log_time timestamptz default now(),
  status text not null check (status in ('taken', 'missed', 'pending')),
  created_at timestamptz default now()
);

-- checkins
create table checkins (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  conversation_log jsonb default '[]'::jsonb,
  summary text,
  status text default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- symptoms
create table symptoms (
  id uuid primary key default uuid_generate_v4(),
  checkin_id uuid not null references checkins(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  name text not null,
  severity text not null check (severity in ('mild', 'moderate', 'severe')),
  onset_hours_after_dose numeric,
  created_at timestamptz default now()
);

-- adr_knowledge (reference/seed data)
create table adr_knowledge (
  id uuid primary key default uuid_generate_v4(),
  drug_name text not null,
  adr_name text not null,
  symptoms text[] not null,
  severity text not null,
  typical_onset_hours numeric,
  description text
);

-- adr_assessments
create table adr_assessments (
  id uuid primary key default uuid_generate_v4(),
  checkin_id uuid not null references checkins(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  confidence_score numeric not null,
  matched_adrs text[] default '{}',
  root_cause_drug text,
  recommended_action text not null check (recommended_action in ('monitor', 'contact_doctor', 'seek_care_now')),
  explanation text,
  created_at timestamptz default now()
);

-- education_content
create table education_content (
  id uuid primary key default uuid_generate_v4(),
  adr_name text not null,
  drug_name text not null,
  cause text,
  what_to_do text,
  what_to_avoid text,
  when_urgent text,
  created_at timestamptz default now()
);

-- RLS policies (critical for medical data)
alter table patients enable row level security;
alter table tb_profiles enable row level security;
alter table regimen_drugs enable row level security;
alter table medicine_schedule enable row level security;
alter table dose_logs enable row level security;
alter table checkins enable row level security;
alter table symptoms enable row level security;
alter table adr_assessments enable row level security;
alter table education_content enable row level security;

-- Patients can only access their own data
create policy "patients_own" on patients for all using (id = auth.uid());
create policy "tb_profiles_own" on tb_profiles for all using (patient_id = auth.uid());
create policy "regimen_drugs_own" on regimen_drugs for all using (
  tb_profile_id in (select id from tb_profiles where patient_id = auth.uid())
);
create policy "schedule_own" on medicine_schedule for all using (patient_id = auth.uid());
create policy "dose_logs_own" on dose_logs for all using (patient_id = auth.uid());
create policy "checkins_own" on checkins for all using (patient_id = auth.uid());
create policy "symptoms_own" on symptoms for all using (patient_id = auth.uid());
create policy "assessments_own" on adr_assessments for all using (patient_id = auth.uid());
-- Education content is readable by all authenticated users
create policy "education_read" on education_content for select using (auth.role() = 'authenticated');
