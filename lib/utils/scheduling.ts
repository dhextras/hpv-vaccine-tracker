import { addMonths, addDays } from "date-fns";
import { ScheduleType, VaccineDose } from "../types";

export function determineScheduleType(
  ageAtFirstDose: number,
  immunocompromised: boolean
): ScheduleType {
  if (ageAtFirstDose < 15 && !immunocompromised) {
    return "two_dose";
  }
  return "three_dose";
}

export function calculateDueDate(
  doses: VaccineDose[],
  scheduleType: ScheduleType,
  monthsAfterDose1: number = 6
): Date | null {
  const sortedDoses = [...doses].sort((a, b) => a.dose_number - b.dose_number);

  if (sortedDoses.length === 0) {
    return null;
  }

  const lastDose = sortedDoses[sortedDoses.length - 1];
  const firstDoseDate = new Date(sortedDoses[0].date_administered);

  if (scheduleType === "two_dose") {
    if (lastDose.dose_number === 1) {
      return addMonths(firstDoseDate, monthsAfterDose1);
    }
    return null;
  }

  if (scheduleType === "three_dose") {
    if (lastDose.dose_number === 1) {
      return addMonths(firstDoseDate, 2);
    }
    if (lastDose.dose_number === 2) {
      return addMonths(firstDoseDate, 6);
    }
    return null;
  }

  return null;
}

export function calculateProgress(
  doses: VaccineDose[],
  scheduleType: ScheduleType,
  eligibilityComplete: boolean,
  clinicFound: boolean
): number {
  if (!eligibilityComplete) return 0;
  if (!clinicFound) return 25;

  const completedDoses = doses.length;

  if (scheduleType === "two_dose") {
    if (completedDoses === 0) return 25;
    if (completedDoses === 1) return 75;
    return 100;
  }

  if (scheduleType === "three_dose") {
    if (completedDoses === 0) return 25;
    if (completedDoses === 1) return 50;
    if (completedDoses === 2) return 75;
    return 100;
  }

  return 0;
}

export function getNextDoseNumber(
  doses: VaccineDose[],
  scheduleType: ScheduleType
): 1 | 2 | 3 | null {
  const completedDoses = doses.length;

  if (scheduleType === "two_dose") {
    if (completedDoses === 0) return 1;
    if (completedDoses === 1) return 2;
    return null;
  }

  if (scheduleType === "three_dose") {
    if (completedDoses === 0) return 1;
    if (completedDoses === 1) return 2;
    if (completedDoses === 2) return 3;
    return null;
  }

  return null;
}
