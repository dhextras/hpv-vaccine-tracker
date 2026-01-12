CREATE TYPE account_mode AS ENUM ('parent', 'young_adult');
CREATE TYPE sex_type AS ENUM ('female', 'male');
CREATE TYPE eligibility_status AS ENUM (
  'eligible_now',
  'not_eligible_yet',
  'out_of_program',
  'clinician_review',
  'defer',
  'defer_pregnancy',
  'girls_only_male'
);
CREATE TYPE triage_level AS ENUM ('urgent_same_week', 'soon', 'routine');
CREATE TYPE schedule_type AS ENUM ('two_dose', 'three_dose');
CREATE TYPE vaccine_status AS ENUM (
  'not_started',
  'dose_1_complete',
  'dose_2_complete',
  'dose_3_complete',
  'series_complete'
);
CREATE TYPE reminder_type AS ENUM ('30_days', '7_days', '1_day', 'overdue');

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode account_mode NOT NULL,
  language VARCHAR(10),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  date_of_birth DATE,
  age_years INTEGER,
  sex sex_type,
  is_self BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (date_of_birth IS NOT NULL OR age_years IS NOT NULL)
);

CREATE TABLE screening_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anaphylaxis BOOLEAN NOT NULL DEFAULT false,
  yeast_allergy BOOLEAN NOT NULL DEFAULT false,
  very_sick_fever BOOLEAN NOT NULL DEFAULT false,
  immunocompromised BOOLEAN NOT NULL DEFAULT false,
  pregnant BOOLEAN,
  eligibility_status eligibility_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE symptom_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  genital_anal_bumps BOOLEAN NOT NULL DEFAULT false,
  unusual_bleeding BOOLEAN,
  pain_during_sex BOOLEAN,
  pelvic_pain BOOLEAN,
  discharge_changes BOOLEAN,
  triage_level triage_level NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vaccine_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_type schedule_type NOT NULL,
  status vaccine_status NOT NULL DEFAULT 'not_started',
  immunocompromised BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

CREATE TABLE vaccine_doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES vaccine_series(id) ON DELETE CASCADE,
  dose_number INTEGER NOT NULL CHECK (dose_number >= 1 AND dose_number <= 3),
  date_administered DATE NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, dose_number)
);

CREATE TABLE clinic_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  area_tags TEXT[] NOT NULL DEFAULT '{}',
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  address TEXT,
  hours VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dose_number INTEGER NOT NULL CHECK (dose_number >= 1 AND dose_number <= 3),
  reminder_type reminder_type NOT NULL,
  scheduled_date DATE NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_profiles_account_id ON profiles(account_id);
CREATE INDEX idx_screening_results_profile_id ON screening_results(profile_id);
CREATE INDEX idx_symptom_checks_profile_id ON symptom_checks(profile_id);
CREATE INDEX idx_vaccine_series_profile_id ON vaccine_series(profile_id);
CREATE INDEX idx_vaccine_doses_series_id ON vaccine_doses(series_id);
CREATE INDEX idx_reminders_profile_id ON reminders(profile_id);
CREATE INDEX idx_reminders_scheduled_date ON reminders(scheduled_date);
CREATE INDEX idx_clinic_directory_area_tags ON clinic_directory USING GIN(area_tags);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own account"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own account"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own account"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own profiles"
  ON profiles FOR INSERT
  WITH CHECK (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own profiles"
  ON profiles FOR UPDATE
  USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own profiles"
  ON profiles FOR DELETE
  USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can view screening results for their profiles"
  ON screening_results FOR SELECT
  USING (profile_id IN (
    SELECT p.id FROM profiles p
    JOIN accounts a ON p.account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert screening results for their profiles"
  ON screening_results FOR INSERT
  WITH CHECK (profile_id IN (
    SELECT p.id FROM profiles p
    JOIN accounts a ON p.account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Users can view symptom checks for their profiles"
  ON symptom_checks FOR SELECT
  USING (profile_id IN (
    SELECT p.id FROM profiles p
    JOIN accounts a ON p.account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert symptom checks for their profiles"
  ON symptom_checks FOR INSERT
  WITH CHECK (profile_id IN (
    SELECT p.id FROM profiles p
    JOIN accounts a ON p.account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Users can view vaccine series for their profiles"
  ON vaccine_series FOR ALL
  USING (profile_id IN (
    SELECT p.id FROM profiles p
    JOIN accounts a ON p.account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Users can view vaccine doses for their series"
  ON vaccine_doses FOR ALL
  USING (series_id IN (
    SELECT vs.id FROM vaccine_series vs
    JOIN profiles p ON vs.profile_id = p.id
    JOIN accounts a ON p.account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Users can view reminders for their profiles"
  ON reminders FOR ALL
  USING (profile_id IN (
    SELECT p.id FROM profiles p
    JOIN accounts a ON p.account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view clinic directory"
  ON clinic_directory FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccine_series_updated_at
  BEFORE UPDATE ON vaccine_series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_directory_updated_at
  BEFORE UPDATE ON clinic_directory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
