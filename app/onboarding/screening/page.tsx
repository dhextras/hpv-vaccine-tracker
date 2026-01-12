"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AccountMode } from "@/lib/types";

interface ScreeningAnswers {
  anaphylaxis: boolean | null;
  yeast_allergy: boolean | null;
  very_sick_fever: boolean | null;
  immunocompromised: boolean | null;
  pregnant: boolean | null;
}

export default function ScreeningPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AccountMode | null>(null);
  const [answers, setAnswers] = useState<ScreeningAnswers>({
    anaphylaxis: null,
    yeast_allergy: null,
    very_sick_fever: null,
    immunocompromised: null,
    pregnant: null,
  });

  useEffect(() => {
    const savedMode = localStorage.getItem("account_mode") as AccountMode;
    if (!savedMode) {
      router.push("/onboarding/mode");
      return;
    }
    setMode(savedMode);
  }, [router]);

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
    ...(mode === "young_adult"
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

  const handleContinue = () => {
    localStorage.setItem("screening_answers", JSON.stringify(answers));
    router.push("/onboarding/eligibility");
  };

  const allAnswered = questions.every(
    (q) => answers[q.key as keyof ScreeningAnswers] !== null
  );

  if (!mode) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vaccine Safety Questions
          </h1>
          <p className="text-gray-600 mb-8">
            These help us determine whether you can get the HPV vaccine today
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
            disabled={!allAnswered}
            className="mt-8"
            fullWidth
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
