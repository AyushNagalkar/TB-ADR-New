# TB ADR Companion Backend

Flask backend API for the TB ADR Companion app.

## Setup Instructions

1. Clone the repository.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
5. In a fresh Supabase project, run the SQL files in this order:
   - `migrations/000_reset_schema.sql`
   - `migrations/005_mock_seed.sql` (optional demo data)

   The demo account is `demo@example.com` with password `Demo@123456`.
   The reset file drops and recreates only this application's tables. Do not run
   it against a shared database without confirming that those tables are safe to
   replace.
6. Run the Flask app:
   ```bash
   python app.py
   ```

For local prototype authentication, also run `migrations/003_local_auth.sql`.
The app resolves the current patient from the `X-User-Email` request header and
stores only salted password hashes in `local_credentials`.
