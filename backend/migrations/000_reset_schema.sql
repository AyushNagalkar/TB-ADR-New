-- Complete reset schema for the TB ADR Companion.
-- Run this file first in a new Supabase project, then run 005_mock_seed.sql.
-- The application uses local_credentials and X-User-Email authentication, so
-- patients.id intentionally does not reference auth.users.

create extension if not exists "uuid-ossp";

drop table if exists local_credentials, dose_logs, symptoms, adr_assessments,
  checkins, medicine_schedule, regimen_drugs, tb_profiles, education_content,
  adr_knowledge, patients cascade;

create table patients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text not null unique,
  language text not null default 'en',
  caregiver_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table local_credentials (
  patient_id uuid primary key references patients(id) on delete cascade,
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz not null default now()
);

create table tb_profiles (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null unique references patients(id) on delete cascade,
  treatment_start_date date not null,
  treatment_center text not null,
  doctor_name text not null,
  doctor_phone text,
  report_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table regimen_drugs (
  id uuid primary key default uuid_generate_v4(),
  tb_profile_id uuid not null references tb_profiles(id) on delete cascade,
  drug_name text not null,
  dosage text not null,
  frequency text not null default 'once',
  route text not null default 'oral'
);

create table medicine_schedule (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  drug_name text not null,
  dosage text not null,
  scheduled_time time not null,
  course_duration_days integer not null check (course_duration_days > 0),
  days_remaining integer not null check (days_remaining >= 0),
  created_at timestamptz not null default now()
);

create table dose_logs (
  id uuid primary key default uuid_generate_v4(),
  schedule_item_id uuid not null references medicine_schedule(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  log_date date not null default current_date,
  log_time timestamptz not null default now(),
  status text not null check (status in ('taken', 'missed', 'pending')),
  created_at timestamptz not null default now()
);

create table checkins (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  conversation_log jsonb not null default '[]'::jsonb,
  summary text,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table symptoms (
  id uuid primary key default uuid_generate_v4(),
  checkin_id uuid not null references checkins(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  name text not null,
  severity text not null check (severity in ('mild', 'moderate', 'severe')),
  onset_hours_after_dose numeric,
  created_at timestamptz not null default now()
);

create table adr_knowledge (
  id uuid primary key default uuid_generate_v4(),
  drug_name text not null,
  adr_name text not null,
  symptoms text[] not null default '{}',
  severity text not null check (severity in ('mild', 'moderate', 'severe')),
  typical_onset_hours numeric,
  description text
);

create table adr_assessments (
  id uuid primary key default uuid_generate_v4(),
  checkin_id uuid not null references checkins(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  confidence_score numeric not null check (confidence_score between 0 and 100),
  matched_adrs text[] not null default '{}',
  root_cause_drug text,
  recommended_action text not null
    check (recommended_action in ('monitor', 'contact_doctor', 'seek_care_now')),
  explanation text,
  created_at timestamptz not null default now()
);

create table education_content (
  id uuid primary key default uuid_generate_v4(),
  adr_name text not null,
  drug_name text not null,
  cause text,
  what_to_do text,
  what_to_avoid text,
  when_urgent text,
  created_at timestamptz not null default now()
);

create index medicine_schedule_patient_idx on medicine_schedule(patient_id);
create index dose_logs_patient_idx on dose_logs(patient_id, log_time desc);
create index checkins_patient_idx on checkins(patient_id, created_at desc);
create index assessments_patient_idx on adr_assessments(patient_id, created_at desc);
create index symptoms_checkin_idx on symptoms(checkin_id);

alter table patients enable row level security;
alter table local_credentials enable row level security;
alter table tb_profiles enable row level security;
alter table regimen_drugs enable row level security;
alter table medicine_schedule enable row level security;
alter table dose_logs enable row level security;
alter table checkins enable row level security;
alter table symptoms enable row level security;
alter table adr_knowledge enable row level security;
alter table adr_assessments enable row level security;
alter table education_content enable row level security;

create policy "patients_own" on patients for all using (id = auth.uid());
create policy "credentials_own" on local_credentials for all using (patient_id = auth.uid());
create policy "tb_profiles_own" on tb_profiles for all using (patient_id = auth.uid());
create policy "regimen_drugs_own" on regimen_drugs for all using (
  tb_profile_id in (select id from tb_profiles where patient_id = auth.uid())
);
create policy "schedule_own" on medicine_schedule for all using (patient_id = auth.uid());
create policy "dose_logs_own" on dose_logs for all using (patient_id = auth.uid());
create policy "checkins_own" on checkins for all using (patient_id = auth.uid());
create policy "symptoms_own" on symptoms for all using (patient_id = auth.uid());
create policy "assessments_own" on adr_assessments for all using (patient_id = auth.uid());
create policy "adr_knowledge_read" on adr_knowledge for select
  using (auth.role() = 'authenticated');
create policy "education_read" on education_content for select
  using (auth.role() = 'authenticated');
