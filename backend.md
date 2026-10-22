# Build Prompt: TB ADR Companion — Flask Backend on Supabase

Paste everything below into the agent.

---
## Context

Build the backend for **TB ADR Companion**, a system that helps tuberculosis patients self-monitor for Adverse Drug Reactions (ADR) between doctor visits. The frontend (already being built separately) covers: onboarding, a daily chatbot check-in, an ADR assessment result view, an education/guidance library, a medicine adherence tracker, and an emergency/doctor-contact page.

Your job is to build the API and data layer that powers all of this — not the frontend.

## Tech stack (fixed — do not substitute)

- **Framework:** Flask (Python), using Blueprints for modular routes
- **Database + Auth + Storage:** Supabase Postgres for data. Prototype auth uses local credentials and the `X-User-Email` request header; no Supabase email auth or JWT is used.
- **ORM:** either raw `supabase-py` client calls or SQLAlchemy against the Supabase Postgres connection string — pick one and be consistent across the codebase.
- Config via environment variables (`.env`, loaded with `python-dotenv`), never hardcoded keys. Provide a `.env.example`.

## Core domain model (design the Supabase schema for this)

- **patients** — local prototype user id, name, phone, email, language preference, caregiver contact
- **tb_profiles** — one per patient: regimen (drug names + dosages, as structured rows not a blob), treatment start date, treatment center/doctor name, uploaded checkup report file reference (Supabase Storage path)
- **medicine_schedule** — generated from the regimen: drug, dose, scheduled time(s), course duration
- **dose_logs** — per-dose taken/missed record, timestamped, used later for ADR temporal correlation
- **checkins** — one per chatbot session: timestamp, raw conversation log or extracted symptom list, free-text notes
- **symptoms** — normalized symptom entries linked to a checkin (symptom name, severity, onset time relative to last dose)
- **adr_knowledge** — reference table(s) encoding drug → known ADR → symptom → severity → typical onset window (seed this with first-line TB drugs: Isoniazid, Rifampicin, Pyrazinamide, Ethambutol, and their well-documented ADRs — hepatotoxicity, peripheral neuropathy, ocular toxicity, GI upset, skin reactions)
- **adr_assessments** — output of the scoring pipeline per checkin: confidence score, matched ADR(s), root-cause drug, recommended action (monitor / contact doctor / seek care now)
- **education_content** — the content library backing the RAG-driven guidance page: per-ADR plain-language cause, what to do, what to avoid, urgency threshold

Design proper foreign keys between these (patient → tb_profile → schedule/checkins/assessments). Include Postgres row-level security (RLS) policies scoped to `auth.uid()` so a patient can only ever read/write their own data — this is medical data, RLS is not optional.

## API surface to implement

Group as Flask Blueprints, one per domain:

1. **Auth/session** — local signup/login against `patients` and `local_credentials`; middleware resolves the patient from `X-User-Email`.
2. **Onboarding** — create/update `tb_profiles`, upload checkup report to Supabase Storage, generate initial `medicine_schedule` from the entered regimen.
3. **Schedule & adherence** — CRUD for `medicine_schedule`, endpoint to log a dose as taken/missed, endpoint to fetch adherence summary (streaks, missed-dose count) for the dashboard.
4. **Check-in** — endpoint(s) to create a `checkin`, append conversation turns, and submit for scoring. This does NOT need to implement the chatbot's NLP itself yet — expose a clean endpoint the chatbot logic (built separately) can call to persist turns and trigger scoring.
5. **ADR assessment** — endpoint that takes a completed checkin, runs the scoring logic (symptom-match against `adr_knowledge`, temporal correlation from `dose_logs`, differential exclusion), and writes/returns an `adr_assessments` row with confidence score + recommended action. Stub the actual knowledge-graph/RAG reasoning behind a clearly separated service function (`services/adr_scoring.py`) so it can be swapped for the real KG+RAG pipeline later — don't hardcode this logic inline in the route.
6. **Education** — read endpoints for `education_content`, filterable by ADR/drug, for the guidance page.
7. **Dashboard** — a single aggregate endpoint that returns today's schedule, current risk status, and recent flagged symptoms, so the frontend doesn't need multiple round-trips.
8. **Emergency/doctor contact** — endpoint returning the patient's treatment center/doctor contact plus a generated summary (recent symptoms, latest confidence score, regimen) suitable for showing a clinician.
9. **Profile** — read/update patient profile and preferences.

## Non-functional requirements

- Consistent JSON error format across all routes (status, error code, message) — don't let raw exceptions leak to the client.
- Input validation on every write route (use `pydantic` or `marshmallow` — pick one).
- CORS configured for the frontend's dev and prod origins (leave as configurable env var).
- Structured logging, but never log full patient health payloads at info level — this is sensitive medical data.
- Include a `requirements.txt`, a `README.md` with setup + Supabase schema migration instructions, and a `/health` endpoint for uptime checks.
- Provide the Supabase schema as SQL migration files (not just an ORM model), so it can be run directly in the Supabase SQL editor.

## Deliverable

A working Flask app skeleton with all blueprints wired up, the Supabase schema + RLS policies as SQL, and the `adr_scoring` service stubbed with a clear interface (symptoms + dose history in, confidence score + recommended action out) ready for the real Knowledge Graph/RAG logic to be dropped in later.
