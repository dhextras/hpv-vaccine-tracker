import { TriageLevel } from "../types";

export interface SymptomAnswers {
  genital_anal_bumps: boolean;
  unusual_bleeding?: boolean;
  pain_during_sex?: boolean;
  pelvic_pain?: boolean;
  discharge_changes?: boolean;
}

export function calculateTriage(symptoms: SymptomAnswers): TriageLevel {
  if (
    symptoms.unusual_bleeding ||
    symptoms.pelvic_pain ||
    symptoms.pain_during_sex ||
    symptoms.discharge_changes
  ) {
    return "urgent_same_week";
  }

  if (symptoms.genital_anal_bumps) {
    return "soon";
  }

  return "routine";
}

export function getTriageMessage(level: TriageLevel): string {
  switch (level) {
    case "urgent_same_week":
      return "Please contact a clinic this week for evaluation.";
    case "soon":
      return "Consider scheduling a clinic visit soon.";
    case "routine":
      return "No urgent symptoms detected. Continue with routine care.";
  }
}

export function getTriageColor(level: TriageLevel): string {
  switch (level) {
    case "urgent_same_week":
      return "text-red-600 bg-red-50";
    case "soon":
      return "text-yellow-600 bg-yellow-50";
    case "routine":
      return "text-green-600 bg-green-50";
  }
}
