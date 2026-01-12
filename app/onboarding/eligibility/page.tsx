"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EligibilityStatus } from "@/lib/types";
import {
  calculateEligibility,
  getEligibilityMessage,
  calculateAgeFromDOB,
} from "@/lib/utils/eligibility";

const programConfig = {
  min_age_years: 9,
  routine_age_max_years: 14,
  sex_eligibility: "all" as const,
  schedule_policy: "cdc_style_2_or_3" as const,
  dose2_months_after_dose1: 6,
  allow_catchup_age_max_years: 45,
  copy_variant: "india_partner",
};

export default function EligibilityPage() {
  const router = useRouter();
  const [status, setStatus] = useState<EligibilityStatus | null>(null);

  useEffect(() => {
    const profilesData = localStorage.getItem("profiles");
    const screeningData = localStorage.getItem("screening_answers");

    if (!profilesData || !screeningData) {
      router.push("/onboarding/mode");
      return;
    }

    const profiles = JSON.parse(profilesData);
    const screening = JSON.parse(screeningData);

    const profile = profiles[0];
    const age = profile.date_of_birth
      ? calculateAgeFromDOB(profile.date_of_birth)
      : parseInt(profile.age_years);

    const eligibilityStatus = calculateEligibility(
      {
        ...profile,
        age_years: age,
        id: "temp",
        account_id: "temp",
        is_self: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        anaphylaxis: screening.anaphylaxis,
        yeast_allergy: screening.yeast_allergy,
        very_sick_fever: screening.very_sick_fever,
        immunocompromised: screening.immunocompromised,
        pregnant: screening.pregnant,
      },
      programConfig
    );

    setStatus(eligibilityStatus);
    localStorage.setItem("eligibility_status", eligibilityStatus);
  }, [router]);

  const getBadgeVariant = (status: EligibilityStatus) => {
    if (status === "eligible_now") return "success";
    if (status === "defer" || status === "defer_pregnancy") return "warning";
    if (status === "clinician_review") return "error";
    return "neutral";
  };

  const handleNext = () => {
    if (status === "eligible_now") {
      router.push("/onboarding/symptoms");
    } else {
      router.push("/dashboard/home");
    }
  };

  if (!status) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === "eligible_now" ? (
              <svg
                className="w-10 h-10 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>

          <Badge variant={getBadgeVariant(status)} className="mb-4">
            {status.replace(/_/g, " ").toUpperCase()}
          </Badge>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Eligibility Result
          </h1>

          <p className="text-gray-700 text-lg">{getEligibilityMessage(status)}</p>
        </div>

        <div className="space-y-3 mt-8">
          <Button onClick={handleNext} fullWidth>
            {status === "eligible_now" ? "Continue" : "Go to Dashboard"}
          </Button>

          {(status === "clinician_review" ||
            status === "defer" ||
            status === "defer_pregnancy") && (
            <Button variant="outline" fullWidth>
              Contact Clinic
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
