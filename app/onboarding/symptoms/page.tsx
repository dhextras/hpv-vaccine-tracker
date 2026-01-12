"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { calculateTriage, getTriageMessage, getTriageColor } from "@/lib/utils/triage";
import { TriageLevel } from "@/lib/types";

interface SymptomAnswers {
  genital_anal_bumps: boolean | null;
  unusual_bleeding: boolean | null;
  pain_during_sex: boolean | null;
  pelvic_pain: boolean | null;
  discharge_changes: boolean | null;
}

export default function SymptomsPage() {
  const router = useRouter();
  const [sex, setSex] = useState<string>("");
  const [answers, setAnswers] = useState<SymptomAnswers>({
    genital_anal_bumps: null,
    unusual_bleeding: null,
    pain_during_sex: null,
    pelvic_pain: null,
    discharge_changes: null,
  });
  const [triageResult, setTriageResult] = useState<TriageLevel | null>(null);

  useEffect(() => {
    const profilesData = localStorage.getItem("profiles");
    if (!profilesData) {
      router.push("/onboarding/mode");
      return;
    }
    const profiles = JSON.parse(profilesData);
    setSex(profiles[0].sex || "");
  }, [router]);

  const questions = [
    {
      key: "genital_anal_bumps",
      text: "Do you have small bumps or rough lumps around the genitals or anus?",
      showFor: "all",
    },
    {
      key: "unusual_bleeding",
      text: "Do you have vaginal bleeding that is unusual for you (after sex, between periods, or after menopause)?",
      showFor: "female",
    },
    {
      key: "pain_during_sex",
      text: "Do you have pain during sex?",
      showFor: "female",
    },
    {
      key: "pelvic_pain",
      text: "Do you have pelvic/lower abdominal pain?",
      showFor: "female",
    },
    {
      key: "discharge_changes",
      text: "Have you noticed changes in vaginal discharge that are unusual for you?",
      showFor: "female",
    },
  ];

  const visibleQuestions = questions.filter(
    (q) => q.showFor === "all" || sex === "female" || !sex
  );

  const handleAnswer = (key: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckSymptoms = () => {
    const triage = calculateTriage({
      genital_anal_bumps: answers.genital_anal_bumps || false,
      unusual_bleeding: answers.unusual_bleeding || false,
      pain_during_sex: answers.pain_during_sex || false,
      pelvic_pain: answers.pelvic_pain || false,
      discharge_changes: answers.discharge_changes || false,
    });
    setTriageResult(triage);
    localStorage.setItem("symptom_triage", triage);
  };

  const handleNext = () => {
    router.push("/dashboard/home");
  };

  const allAnswered = visibleQuestions.every(
    (q) => answers[q.key as keyof SymptomAnswers] !== null
  );

  if (!sex) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Do you have any of these symptoms?
          </h1>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> HPV often has no symptoms. This webapp
              does not diagnose HPV. It only helps you decide when to seek care.
            </p>
          </div>

          {!triageResult ? (
            <>
              <div className="space-y-6">
                {visibleQuestions.map((question) => (
                  <Card key={question.key}>
                    <p className="text-gray-900 font-medium mb-4">
                      {question.text}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleAnswer(question.key, true)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          answers[question.key as keyof SymptomAnswers] === true
                            ? "border-primary-600 bg-primary-50 font-semibold"
                            : "border-gray-200 hover:border-primary-300"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleAnswer(question.key, false)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          answers[question.key as keyof SymptomAnswers] === false
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
                onClick={handleCheckSymptoms}
                disabled={!allAnswered}
                className="mt-8"
                fullWidth
              >
                Check Symptoms
              </Button>
            </>
          ) : (
            <>
              <div className={`rounded-lg p-6 mb-6 ${getTriageColor(triageResult)}`}>
                <Badge
                  variant={
                    triageResult === "urgent_same_week"
                      ? "error"
                      : triageResult === "soon"
                      ? "warning"
                      : "success"
                  }
                  className="mb-2"
                >
                  {triageResult.replace(/_/g, " ").toUpperCase()}
                </Badge>
                <p className="text-lg font-medium mt-2">
                  {getTriageMessage(triageResult)}
                </p>
              </div>

              <div className="space-y-3">
                {(triageResult === "urgent_same_week" ||
                  triageResult === "soon") && (
                  <>
                    <Button fullWidth>Call a Clinic</Button>
                    <Button variant="outline" fullWidth>
                      WhatsApp a Clinic
                    </Button>
                  </>
                )}
                <Button
                  variant={
                    triageResult === "routine" ? "primary" : "ghost"
                  }
                  onClick={handleNext}
                  fullWidth
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
