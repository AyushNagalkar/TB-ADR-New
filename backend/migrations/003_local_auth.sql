-- Local development authentication. Passwords are stored as salted PBKDF2 hashes.
alter table patients drop constraint if exists patients_id_fkey;

create table if not exists local_credentials (
  patient_id uuid primary key references patients(id) on delete cascade,
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz default now()
);
