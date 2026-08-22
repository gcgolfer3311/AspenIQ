-- AspenIQ initial schema
-- Single-agent (Karl) for now; agency_id included so this can grow to multiple agencies later without a rewrite.

CREATE TABLE agencies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE facilities (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id),
  name TEXT NOT NULL,
  loc TEXT,
  address TEXT,
  zip TEXT,
  county TEXT,
  care JSONB DEFAULT '[]',
  rate TEXT,
  beds TEXT,
  rating TEXT,
  amenities JSONB DEFAULT '[]',
  phone TEXT,
  license_num TEXT,
  license_exp TEXT,
  source TEXT,
  contracted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE facility_contacts (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT,
  phone TEXT,
  email TEXT
);

CREATE TABLE facility_notes (
  facility_id INTEGER PRIMARY KEY REFERENCES facilities(id) ON DELETE CASCADE,
  notes TEXT
);

CREATE TABLE reminders (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id),
  name TEXT NOT NULL,
  task TEXT,
  type TEXT,
  date DATE,
  phone TEXT,
  done BOOLEAN DEFAULT FALSE,
  done_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE placements (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id),
  name TEXT NOT NULL,
  facility TEXT,
  care TEXT,
  rate NUMERIC,
  fee NUMERIC,
  date DATE,
  agent TEXT,
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id),
  invoice_code TEXT,
  client TEXT,
  facility TEXT,
  fee NUMERIC,
  rate NUMERIC,
  movein DATE,
  billto TEXT,
  status TEXT DEFAULT 'Unpaid',
  created_date DATE,
  paid_date DATE
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id),
  doc_code TEXT,
  type TEXT,
  recipient TEXT,
  email TEXT,
  status TEXT DEFAULT 'Pending',
  sent_date DATE,
  signed_date DATE,
  fee_low TEXT,
  fee_high TEXT,
  relationship TEXT,
  state TEXT,
  facility TEXT,
  care_level TEXT,
  reasoning TEXT,
  legal_text TEXT
);

CREATE TABLE referral_partners (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id),
  name TEXT NOT NULL,
  org TEXT,
  role TEXT,
  phone TEXT,
  email TEXT,
  strength TEXT,
  leads INTEGER DEFAULT 0,
  last_contact DATE
);

CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id),
  name TEXT NOT NULL,
  care TEXT,
  facility TEXT,
  phone TEXT,
  notes TEXT,
  date DATE
);

CREATE TABLE bedcheck_log (
  agency_id INTEGER PRIMARY KEY REFERENCES agencies(id),
  sent_date TIMESTAMP,
  contact_count INTEGER
);

CREATE TABLE newsletter_log (
  agency_id INTEGER PRIMARY KEY REFERENCES agencies(id),
  sent_date TIMESTAMP,
  partner_count INTEGER
);

CREATE TABLE leads_recovered (
  agency_id INTEGER PRIMARY KEY REFERENCES agencies(id),
  count INTEGER DEFAULT 0
);

-- Seed the one agency that exists today
INSERT INTO agencies (name) VALUES ('Aspen Senior Care');
