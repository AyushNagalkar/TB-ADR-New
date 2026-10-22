-- Seed ADR Knowledge Data
INSERT INTO adr_knowledge (drug_name, adr_name, symptoms, severity, typical_onset_hours, description) VALUES
('Isoniazid', 'Hepatotoxicity', '{"nausea", "vomiting", "jaundice", "dark urine"}', 'severe', 336, 'Liver toxicity often characterized by jaundice and elevated liver enzymes.'),
('Isoniazid', 'Peripheral Neuropathy', '{"numbness", "tingling in extremities", "weakness"}', 'moderate', 168, 'Nerve damage causing tingling and numbness.'),
('Rifampicin', 'GI Upset', '{"nausea", "vomiting", "diarrhea", "abdominal pain"}', 'mild', 2, 'Gastrointestinal disturbances.'),
('Rifampicin', 'Hepatotoxicity', '{"nausea", "vomiting", "jaundice", "dark urine"}', 'severe', 336, 'Liver toxicity often characterized by jaundice and elevated liver enzymes.'),
('Rifampicin', 'Flu-like Syndrome', '{"fever", "chills", "muscle aches", "headache"}', 'moderate', 12, 'Symptoms resembling the flu, often associated with intermittent dosing.'),
('Pyrazinamide', 'Hepatotoxicity', '{"nausea", "vomiting", "jaundice", "dark urine"}', 'severe', 336, 'Liver toxicity often characterized by jaundice and elevated liver enzymes.'),
('Pyrazinamide', 'Joint Pain (Hyperuricemia)', '{"joint pain", "swelling", "redness"}', 'moderate', 168, 'Uric acid buildup leading to gout-like symptoms.'),
('Ethambutol', 'Ocular Toxicity', '{"blurry vision", "color blindness", "visual field loss"}', 'severe', 720, 'Damage to the optic nerve affecting vision.'),
('All', 'Skin Reactions', '{"rash", "itching", "hives"}', 'moderate', 24, 'Allergic or adverse skin reactions to medication.');

-- Seed Education Content
INSERT INTO education_content (adr_name, drug_name, cause, what_to_do, what_to_avoid, when_urgent) VALUES
('Hepatotoxicity', 'Isoniazid, Rifampicin, Pyrazinamide', 'The medication is processed by the liver and can cause irritation or damage.', 'Rest and monitor your symptoms. Drink plenty of water.', 'Avoid alcohol and other medications that process through the liver (like paracetamol) unless advised by a doctor.', 'Contact your doctor immediately if you notice yellowing of your eyes or skin, or if your urine turns very dark.'),
('Peripheral Neuropathy', 'Isoniazid', 'The drug can affect the nerves, especially if you have low Vitamin B6.', 'Take the Vitamin B6 (Pyridoxine) supplement prescribed by your doctor.', 'Avoid activities that might cause injury to numb areas.', 'Inform your doctor if the tingling or numbness gets worse and affects your daily life.'),
('GI Upset', 'Rifampicin', 'The medication can irritate the stomach lining.', 'Take your medication with a light snack if allowed by your doctor.', 'Avoid very spicy or greasy foods.', 'Seek help if you cannot keep fluids down for more than 24 hours.'),
('Flu-like Syndrome', 'Rifampicin', 'An immune reaction to the medication.', 'Rest and stay hydrated.', 'Avoid missing doses, as this often happens with irregular taking of the drug.', 'Seek immediate help if you have difficulty breathing or a very high fever.'),
('Joint Pain (Hyperuricemia)', 'Pyrazinamide', 'The drug decreases the kidney''s ability to remove uric acid, causing it to build up in joints.', 'Apply a warm compress and rest the affected joints.', 'Avoid high-purine foods like red meat and alcohol.', 'Contact your doctor if the pain is severe and you cannot move the joint.'),
('Ocular Toxicity', 'Ethambutol', 'The drug can affect the optic nerve.', 'Monitor your vision daily, especially for changes in seeing colors (like red and green).', 'Avoid driving if your vision is blurry.', 'Contact your doctor immediately if you notice any changes in your vision.'),
('Skin Reactions', 'All', 'An allergic reaction to the medication.', 'Apply a mild moisturizer if itching.', 'Avoid scratching the rash or taking new medications without consulting your doctor.', 'Seek emergency care immediately if you have swelling of the face/throat or difficulty breathing.');
