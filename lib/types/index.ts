export type AccountMode = "parent" | "young_adult";

export type Sex = "female" | "male";

export type EligibilityStatus =
  | "eligible_now"
  | "not_eligible_yet"
  | "out_of_program"
  | "clinician_review"
  | "defer"
  | "defer_pregnancy"
  | "girls_only_male";

export type TriageLevel = "urgent_same_week" | "soon" | "routine";

export type ScheduleType = "two_dose" | "three_dose";

export type VaccineStatus =
  | "not_started"
  | "dose_1_complete"
  | "dose_2_complete"
  | "dose_3_complete"
  | "series_complete";

export interface Account {
  id: string;
  user_id: string;
  mode: AccountMode;
  language?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  account_id: string;
  display_name?: string;
  date_of_birth?: string;
  age_years?: number;
  sex?: Sex;
  is_self: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScreeningResult {
  id: string;
  profile_id: string;
  anaphylaxis: boolean;
  yeast_allergy: boolean;
  very_sick_fever: boolean;
  immunocompromised: boolean;
  pregnant?: boolean;
  eligibility_status: EligibilityStatus;
  created_at: string;
}

export interface SymptomCheck {
  id: string;
  profile_id: string;
  genital_anal_bumps: boolean;
  unusual_bleeding?: boolean;
  pain_during_sex?: boolean;
  pelvic_pain?: boolean;
  discharge_changes?: boolean;
  triage_level: TriageLevel;
  created_at: string;
}

export interface VaccineSeries {
  id: string;
  profile_id: string;
  schedule_type: ScheduleType;
  status: VaccineStatus;
  immunocompromised: boolean;
  created_at: string;
  updated_at: string;
}

export interface VaccineDose {
  id: string;
  series_id: string;
  dose_number: 1 | 2 | 3;
  date_administered: string;
  photo_url?: string;
  created_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  area_tags: string[];
  phone: string;
  whatsapp?: string;
  address?: string;
  hours?: string;
}

export interface ProgramConfig {
  min_age_years: number;
  routine_age_max_years: number;
  sex_eligibility: "all" | "female_only";
  schedule_policy: "cdc_style_2_or_3";
  dose2_months_after_dose1: number;
  allow_catchup_age_max_years: number;
  copy_variant: string;
}

export interface Reminder {
  id: string;
  profile_id: string;
  dose_number: 1 | 2 | 3;
  reminder_type: "30_days" | "7_days" | "1_day" | "overdue";
  scheduled_date: string;
  sent: boolean;
  created_at: string;
}
