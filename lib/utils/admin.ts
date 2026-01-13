import { createClient } from "@/lib/supabase/client";

export async function isAdminEmail(email: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("admins")
    .select("email")
    .eq("email", email.toLowerCase())
    .single();

  return !!data && !error;
}

export async function addAdminEmail(email: string, addedBy?: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("admins")
    .insert([{ email: email.toLowerCase(), added_by: addedBy }]);

  return !error;
}

export async function removeAdminEmail(email: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("admins")
    .delete()
    .eq("email", email.toLowerCase());

  return !error;
}

export async function getAdminEmails(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("admins")
    .select("email")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.email);
}

export interface ClinicData {
  id: string;
  name: string;
  area_tags: string[];
  phone: string;
  whatsapp?: string;
  address?: string;
  hours?: string;
}

export function validateClinicData(data: any): boolean {
  if (!Array.isArray(data)) {
    return false;
  }

  for (const clinic of data) {
    if (
      !clinic.id ||
      !clinic.name ||
      !Array.isArray(clinic.area_tags) ||
      !clinic.phone
    ) {
      return false;
    }
  }

  return true;
}

export interface ProgramConfig {
  min_age_years: number;
  routine_age_max_years: number;
  sex_eligibility: "all" | "female_only";
  schedule_policy: "cdc_style_2_or_3" | "fixed_3_dose";
  dose2_months_after_dose1: number;
  allow_catchup_age_max_years: number;
  copy_variant: string;
}

export function validateProgramConfig(data: any): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  const required = [
    "min_age_years",
    "routine_age_max_years",
    "sex_eligibility",
    "schedule_policy",
    "dose2_months_after_dose1",
    "allow_catchup_age_max_years",
    "copy_variant",
  ];

  for (const field of required) {
    if (!(field in data)) {
      return false;
    }
  }

  if (
    data.sex_eligibility !== "all" &&
    data.sex_eligibility !== "female_only"
  ) {
    return false;
  }

  if (
    data.schedule_policy !== "cdc_style_2_or_3" &&
    data.schedule_policy !== "fixed_3_dose"
  ) {
    return false;
  }

  return true;
}
