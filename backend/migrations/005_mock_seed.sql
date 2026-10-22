-- Mock data for the reset schema.
-- Demo login: demo@example.com / Demo@123456
-- Run after 000_reset_schema.sql.

insert into patients (id, name, phone, email, language, caregiver_contact)
values (
  '00000000-0000-0000-0000-000000000001',
  'Aarav Sharma', '+91 98765 43210', 'demo@example.com', 'en', '+91 98765 43211'
);

insert into local_credentials (patient_id, password_hash, password_salt)
values (
  '00000000-0000-0000-0000-000000000001',
  '876de450d38b2ec0435e3dff858bfa6d7c210a72ce89966d9a450b268532ba91',
  'tb-demo-salt-2026'
);

insert into tb_profiles (
  id, patient_id, treatment_start_date, treatment_center, doctor_name, doctor_phone
) values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  current_date - 14,
  'City TB Hospital',
  'Dr. Rajesh Kumar',
  '+91 98765 40000'
);

insert into regimen_drugs (id, tb_profile_id, drug_name, dosage, frequency)
values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010', 'Isoniazid', '300mg', 'once'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000010', 'Rifampicin', '600mg', 'once'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000010', 'Pyrazinamide', '1500mg', 'once'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000010', 'Ethambutol', '1200mg', 'once');

insert into medicine_schedule (
  id, patient_id, drug_name, dosage, scheduled_time, course_duration_days, days_remaining
) values
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Isoniazid', '300mg', '08:00', 180, 166),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Rifampicin', '600mg', '08:00', 180, 166),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Pyrazinamide', '1500mg', '08:00', 180, 166),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Ethambutol', '1200mg', '08:00', 180, 166);

insert into dose_logs (id, schedule_item_id, patient_id, log_date, status)
values
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', current_date - 1, 'taken'),
  ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', current_date - 1, 'taken'),
  ('00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', current_date - 1, 'missed');

insert into adr_knowledge (drug_name, adr_name, symptoms, severity, typical_onset_hours, description)
values
  ('Isoniazid', 'Hepatotoxicity', array['nausea','vomiting','jaundice','dark urine'], 'severe', 336, 'Possible liver toxicity.'),
  ('Isoniazid', 'Peripheral Neuropathy', array['numbness','tingling in extremities','weakness'], 'moderate', 168, 'Nerve irritation or damage.'),
  ('Rifampicin', 'GI Upset', array['nausea','vomiting','diarrhea','abdominal pain'], 'mild', 2, 'Gastrointestinal disturbance.'),
  ('Rifampicin', 'Flu-like Syndrome', array['fever','chills','muscle aches','headache'], 'moderate', 12, 'Flu-like reaction.'),
  ('Pyrazinamide', 'Joint Pain (Hyperuricemia)', array['joint pain','swelling','redness'], 'moderate', 168, 'Uric acid buildup in joints.'),
  ('Ethambutol', 'Ocular Toxicity', array['blurry vision','color blindness','visual field loss'], 'severe', 720, 'Possible optic nerve toxicity.'),
  ('All', 'Skin Reactions', array['rash','itching','hives'], 'moderate', 24, 'Allergic or adverse skin reaction.');

insert into education_content (adr_name, drug_name, cause, what_to_do, what_to_avoid, when_urgent)
values
  ('Hepatotoxicity', 'Isoniazid, Rifampicin, Pyrazinamide', 'The medicines are processed by the liver.', 'Rest, hydrate, and contact your doctor.', 'Avoid alcohol and unapproved medicines.', 'Get urgent care for yellow skin or eyes, or very dark urine.'),
  ('Peripheral Neuropathy', 'Isoniazid', 'Isoniazid can affect nerves, especially with low vitamin B6.', 'Take prescribed vitamin B6 and tell your doctor.', 'Avoid injury to numb areas.', 'Contact your doctor if numbness worsens.'),
  ('GI Upset', 'Rifampicin', 'Rifampicin can irritate the stomach.', 'Hydrate and follow your doctor''s food instructions.', 'Avoid foods that worsen symptoms.', 'Seek help if you cannot keep fluids down.'),
  ('Flu-like Syndrome', 'Rifampicin', 'An immune reaction can cause flu-like symptoms.', 'Rest and stay hydrated.', 'Do not stop treatment without medical advice.', 'Seek urgent help for breathing difficulty or high fever.'),
  ('Joint Pain (Hyperuricemia)', 'Pyrazinamide', 'Pyrazinamide can increase uric acid.', 'Rest the joint and contact your doctor.', 'Avoid alcohol and high-purine foods.', 'Get care for severe pain or swelling.'),
  ('Ocular Toxicity', 'Ethambutol', 'Ethambutol can affect the optic nerve.', 'Stop driving and contact your doctor about vision changes.', 'Do not ignore color or vision changes.', 'Contact your doctor immediately for any vision change.'),
  ('Skin Reactions', 'All', 'An allergic reaction can cause rash or hives.', 'Contact your doctor for advice.', 'Do not start new medicines without advice.', 'Call emergency services for face/throat swelling or breathing difficulty.');
