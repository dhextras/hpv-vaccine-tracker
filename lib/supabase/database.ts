import { createClient } from "./client";
import { AccountMode, Sex, EligibilityStatus, TriageLevel } from "@/lib/types";

export async function getOrCreateAccount(userId: string, mode: AccountMode) {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert([{ user_id: userId, mode }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAccount(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data;
}

export async function createProfile(accountId: string, profile: {
  display_name?: string;
  date_of_birth?: string;
  age_years?: number;
  sex: Sex;
  is_self: boolean;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .insert([{ account_id: accountId, ...profile }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProfiles(accountId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateProfile(profileId: string, updates: {
  display_name?: string;
  age_years?: number;
  sex?: Sex;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfile(profileId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (error) throw error;
}

export async function createScreeningResult(profileId: string, screening: {
  anaphylaxis: boolean;
  yeast_allergy: boolean;
  very_sick_fever: boolean;
  immunocompromised: boolean;
  pregnant: boolean | null;
  eligibility_status: EligibilityStatus;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("screening_results")
    .insert([{ profile_id: profileId, ...screening }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getScreeningResults(profileId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("screening_results")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function createSymptomCheck(profileId: string, symptoms: {
  genital_anal_bumps: boolean;
  unusual_bleeding: boolean | null;
  pain_during_sex: boolean | null;
  pelvic_pain: boolean | null;
  discharge_changes: boolean | null;
  triage_level: TriageLevel;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("symptom_checks")
    .insert([{ profile_id: profileId, ...symptoms }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSymptomChecks(profileId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("symptom_checks")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function getOrCreateVaccineSeries(profileId: string, scheduleType: "two_dose" | "three_dose", immunocompromised: boolean) {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("vaccine_series")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("vaccine_series")
    .insert([{
      profile_id: profileId,
      schedule_type: scheduleType,
      immunocompromised
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVaccineDoses(seriesId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vaccine_doses")
    .select("*")
    .eq("series_id", seriesId)
    .order("dose_number", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createVaccineDose(seriesId: string, doseNumber: number, dateAdministered: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vaccine_doses")
    .insert([{
      series_id: seriesId,
      dose_number: doseNumber,
      date_administered: dateAdministered
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileWithAllData(profileId: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      screening_results(*),
      symptom_checks(*),
      vaccine_series(
        *,
        vaccine_doses(*)
      )
    `)
    .eq("id", profileId)
    .single();

  return profile;
}

export async function setActiveProfile(userId: string, profileId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .update({ active_profile_id: profileId })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
