# TB ADR Companion — Build Brief for Lovable

## Design Direction (apply across every page)

**Feel:** Clinical, calm, trustworthy — closer to a hospital patient-portal or a diagnostics lab report than a startup landing page. Nothing playful, nothing "SaaS." No bright gradients, no uniform rounded cards with matching drop shadows, no all-caps section labels, no emoji.

**Color tokens**
- `--bg`: `#F5F6F4` — cool paper white (base background)
- `--surface`: `#FFFFFF` — cards/panels, separated by hairline borders not shadows
- `--ink`: `#1C2422` — primary text (soft black, not pure #000)
- `--primary`: `#173C3E` — deep teal-charcoal (headers, primary buttons, nav)
- `--secondary`: `#5C7A6B` — muted sage (positive/safe status, secondary actions)
- `--alert`: `#B4622A` — muted ochre-rust (ADR warning, needs distinct hue from primary, not neon red)
- `--critical`: `#8C2F2F` — deep brick red, used ONLY for high-confidence ADR / emergency states
- `--line`: `#D8DBD6` — hairline dividers/borders

**Type**
- Headings: a serif with clinical authority — e.g. "Source Serif 4" or "Lora," medium weight, restrained sizing (no oversized hero type)
- Body/UI/data: a clean grotesk — e.g. "IBM Plex Sans" or "Public Sans" — used for all form fields, chat text, numbers, labels
- No tracked-out uppercase labels. Sentence case everywhere, including buttons and headers.

**Layout**
- Left-aligned content, not centered marketing blocks. Think patient-chart layout: clear left nav, content in a readable single column (<80 char line length), data in tables/lists not cards-with-icons.
- Borders and dividers carry structure (hairline `--line` rules between sections) instead of shadows and border-radius-everything.
- Motion: minimal. Only animate state changes that mean something (a new ADR alert appearing, a chat message arriving) — no scroll-triggered fade-ins on every section.
- Status colors are the one place to be deliberate: sage = normal, ochre = possible ADR/needs attention, brick red = confirmed/high-confidence ADR. Keep this consistent everywhere (dashboard, chat, reports).

---

## Pages

### 1. Welcome / Landing
Single clear entry point, not a marketing pitch. Explain in plain language what the app does: help TB patients notice medicine side effects early, between doctor visits. One primary action: "Get started" (sign up) and a secondary "I already have an account." No stock health imagery — use a simple, real illustration or none at all.

### 2. Sign Up / Login
Standard auth: name, phone/email, password, plus a language preference selector (relevant for regional TB patients). Keep the form short and calm — this is often filled in by someone unwell or a caregiver on their behalf. Include an option to add a caregiver's contact as a secondary account holder.

### 3. Onboarding — TB Profile & Report Upload
Patient enters or uploads their TB diagnosis details: regimen (drugs + dosage), start date, treatment center/doctor name, and uploads their latest checkup report (PDF/image). This data seeds the Knowledge Graph matching later, so keep fields structured (dropdowns for standard drug names) rather than free text where possible.

### 4. Home Dashboard
The daily landing page after login. Shows: today's medicine schedule with adherence check-off, current ADR risk status (sage/ochre/red indicator), a prompt to do today's check-in if not done yet, and a short list of recent flagged symptoms if any. This is a status page, not a feed — keep it scannable in one glance.

### 5. Daily Check-in (Chatbot)
Conversational interface where the chatbot asks about symptoms since last dose, adherence to schedule, and any new discomfort. Chat bubbles should look clinical (not a generic messenger skin) — muted colors, no avatars/emoji, clear timestamps. End of each check-in shows a short "what I noted today" summary before submitting.

### 6. ADR Assessment Result
Shows the outcome of a check-in: confidence score (e.g., "62% possible ADR"), which symptoms triggered it, and the likely drug/root cause from the knowledge graph. Use the status color system here prominently. Always include a clear next step — "monitor," "contact your doctor soon," or "seek care now" — never just a raw number with no guidance.

### 7. Guidance & Education
The RAG-powered explanation layer. For a given ADR or symptom, shows plain-language cause, what to do, what to avoid, and when it becomes urgent — sourced from WHO/TB program guidance. Written like a patient information leaflet, not a chatbot transcript: short headed sections, not paragraphs of prose.

### 8. Medicine Schedule & Adherence Tracker
Calendar/list view of the full TB regimen — drug, dose, time, days remaining in course. Lets the patient mark doses taken/missed, which feeds the ADR temporal-correlation logic. Highlight streaks and missed-dose patterns simply, without gamified badges or confetti — this is a health record, not a habit app.

### 9. Emergency / Doctor Contact
Reachable from anywhere (persistent header element for high-risk moments). Shows the treatment center/doctor's contact, a summary card the patient can show a clinician (recent symptoms, confidence score, regimen), and — if location-relevant — nearest TB care center. Kept deliberately plain and fast to act on, no decoration.

### 10. Profile & Settings
Basic account management: personal details, regimen edits, language, notification preferences (dose reminders, check-in reminders), and data/privacy controls (who can see their health data — relevant given this is sensitive medical info).

---

## Notes for the build agent
- Treat status color (sage/ochre/red) as the one consistent design language across dashboard, chat, and reports — everything else should stay quiet so that signal stands out.
- Avoid generic AI-app tells: no cream-and-terracotta palette, no identical rounded shadow-cards, no tracked-out uppercase eyebrows, no "→" on buttons.
- This is used by unwell patients, often older or non-technical — prioritize legibility, large touch targets, and short sentences over visual flourish.
