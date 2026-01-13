"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AccountMode } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getAccount, getProfiles, createScreeningResult } from "@/lib/supabase/database";
import { calculateEligibility } from "@/lib/utils/eligibility";

interface ScreeningAnswers {
  anaphylaxis: boolean | null;
  yeast_allergy: boolean | null;
  very_sick_fever: boolean | null;
  immunocompromised: boolean | null;
  pregnant: boolean | null;
}

interface ProfileScreening {
  profileIndex: number;
  profileName: string;
  answers: ScreeningAnswers;
}

export default function ScreeningPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AccountMode | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isSingleChild, setIsSingleChild] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<ScreeningAnswers>({
    anaphylaxis: null,
    yeast_allergy: null,
    very_sick_fever: null,
    immunocompromised: null,
    pregnant: null,
  });

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const childParam = params.get("child");

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const account = await getAccount(user.id);
      if (!account) {
        router.push("/onboarding/mode");
        return;
      }

      setMode(account.mode);
      const fetchedProfiles = await getProfiles(account.id);

      if (!fetchedProfiles || fetchedProfiles.length === 0) {
        router.push("/onboarding/profile");
        return;
      }

      if (childParam === null) {
        const { data: screeningResults } = await supabase
          .from("screening_results")
          .select("profile_id")
          .in("profile_id", fetchedProfiles.map((p: any) => p.id));

        if (screeningResults && screeningResults.length === fetchedProfiles.length) {
          router.push("/dashboard/home");
          return;
        }
      }

      setProfiles(fetchedProfiles);

      if (childParam !== null) {
        const childIndex = parseInt(childParam);
        setIsSingleChild(true);
        setCurrentProfileIndex(childIndex);
      }
    });
  }, [router]);

  const currentProfile = profiles[currentProfileIndex];
  const isYoungAdult = mode === "young_adult";

  const questions = [
    {
      key: "anaphylaxis",
      text: "Have you ever had a severe allergic reaction (anaphylaxis) to a vaccine component or a previous HPV vaccine dose?",
    },
    {
      key: "yeast_allergy",
      text: "Have you ever had a severe allergy to yeast?",
    },
    {
      key: "very_sick_fever",
      text: "Are you currently very sick with a moderate or high fever?",
    },
    {
      key: "immunocompromised",
      text: "Do you have a condition that weakens the immune system (or take medicines that suppress immunity)?",
    },
    ...(isYoungAdult || currentProfile?.sex === "female"
      ? [
          {
            key: "pregnant",
            text: "Are you pregnant or think you might be pregnant?",
          },
        ]
      : []),
  ];

  const handleAnswer = (key: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const programConfig = {
        min_age_years: 9,
        routine_age_max_years: 14,
        sex_eligibility: "all" as const,
        schedule_policy: "cdc_style_2_or_3" as const,
        dose2_months_after_dose1: 6,
        allow_catchup_age_max_years: 45,
        copy_variant: "india_partner",
      };

      const eligibilityStatus = calculateEligibility(
        currentProfile,
        {
          anaphylaxis: answers.anaphylaxis || false,
          yeast_allergy: answers.yeast_allergy || false,
          very_sick_fever: answers.very_sick_fever || false,
          immunocompromised: answers.immunocompromised || false,
          pregnant: answers.pregnant || false,
        },
        programConfig
      );

      await createScreeningResult(currentProfile.id, {
        anaphylaxis: answers.anaphylaxis || false,
        yeast_allergy: answers.yeast_allergy || false,
        very_sick_fever: answers.very_sick_fever || false,
        immunocompromised: answers.immunocompromised || false,
        pregnant: answers.pregnant,
        eligibility_status: eligibilityStatus,
      });

      if (isSingleChild) {
        router.push(`/onboarding/symptoms?child=${currentProfileIndex}`);
      } else if (currentProfileIndex < profiles.length - 1) {
        setCurrentProfileIndex(currentProfileIndex + 1);
        setAnswers({
          anaphylaxis: null,
          yeast_allergy: null,
          very_sick_fever: null,
          immunocompromised: null,
          pregnant: null,
        });
      } else {
        router.push("/onboarding/symptoms");
      }
    } catch (error) {
      console.error("Error saving screening:", error);
      alert("Failed to save screening. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const allAnswered = questions.every(
    (q) => answers[q.key as keyof ScreeningAnswers] !== null
  );

  if (!mode || !currentProfile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {profiles.length > 1 && (
            <div className="mb-6 text-center">
              <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {currentProfile.display_name || `Child ${currentProfileIndex + 1}`} - Profile {currentProfileIndex + 1} of {profiles.length}
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vaccine Safety Questions
          </h1>
          <p className="text-gray-600 mb-8">
            These help us determine whether {mode === "parent" ? "this child" : "you"} can get the HPV vaccine today
          </p>

          <div className="space-y-6">
            {questions.map((question) => (
              <Card key={question.key}>
                <p className="text-gray-900 font-medium mb-4">
                  {question.text}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAnswer(question.key, true)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      answers[question.key as keyof ScreeningAnswers] === true
                        ? "border-primary-600 bg-primary-50 font-semibold"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleAnswer(question.key, false)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      answers[question.key as keyof ScreeningAnswers] === false
                        ? "border-primary-600 bg-primary-50 font-semibold"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    No
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!allAnswered || loading}
            className="mt-8"
            fullWidth
          >
            {loading ? "Saving..." : currentProfileIndex < profiles.length - 1 ? "Next Child" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
