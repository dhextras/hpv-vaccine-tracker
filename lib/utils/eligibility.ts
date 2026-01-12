import {
  EligibilityStatus,
  ProgramConfig,
  ScreeningResult,
  Profile,
  Sex,
} from "../types";

export function calculateEligibility(
  profile: Profile,
  screening: Omit<ScreeningResult, "id" | "profile_id" | "created_at" | "eligibility_status">,
  config: ProgramConfig
): EligibilityStatus {
  if (screening.anaphylaxis || screening.yeast_allergy) {
    return "clinician_review";
  }

  if (screening.very_sick_fever) {
    return "defer";
  }

  if (screening.pregnant) {
    return "defer_pregnancy";
  }

  const age = profile.age_years || calculateAgeFromDOB(profile.date_of_birth);

  if (!age) {
    return "clinician_review";
  }

  if (age < config.min_age_years) {
    return "not_eligible_yet";
  }

  if (
    age > config.routine_age_max_years &&
    age > config.allow_catchup_age_max_years
  ) {
    return "out_of_program";
  }

  if (config.sex_eligibility === "female_only" && profile.sex === "male") {
    return "girls_only_male";
  }

  return "eligible_now";
}

export function calculateAgeFromDOB(dob?: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export function getEligibilityMessage(status: EligibilityStatus): string {
  switch (status) {
    case "eligible_now":
      return "You're eligible to get the HPV vaccine. Next: find a location.";
    case "not_eligible_yet":
      return "Not eligible yet. Check again when you are older.";
    case "out_of_program":
      return "You may not be in this program's age range. Contact a clinic to ask about options.";
    case "girls_only_male":
      return "This program currently targets girls. Contact a clinic to ask about options.";
    case "defer":
      return "Please wait until you feel better before getting vaccinated.";
    case "defer_pregnancy":
      return "Delay vaccination until after pregnancy.";
    case "clinician_review":
      return "Please consult with a healthcare provider before getting vaccinated.";
  }
}
