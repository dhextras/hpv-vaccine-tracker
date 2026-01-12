"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { format } from "date-fns";

interface Dose {
  number: 1 | 2 | 3;
  date: string | null;
  photo?: string;
}

export default function VaccinePlanPage() {
  const [doses, setDoses] = useState<Dose[]>([
    { number: 1, date: null },
    { number: 2, date: null },
  ]);
  const [selectedDose, setSelectedDose] = useState<number | null>(null);
  const [doseDate, setDoseDate] = useState("");

  const completedDoses = doses.filter((d) => d.date !== null).length;
  const progress = (completedDoses / doses.length) * 100;

  const handleMarkDose = () => {
    if (selectedDose !== null && doseDate) {
      setDoses((prev) =>
        prev.map((d) =>
          d.number === selectedDose ? { ...d, date: doseDate } : d
        )
      );
      setSelectedDose(null);
      setDoseDate("");
    }
  };

  const handleUploadPhoto = (doseNumber: number) => {
    alert("Photo upload coming soon with Supabase Storage integration");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vaccine Plan
        </h2>
        <p className="text-gray-600">
          Track your doses and completion
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar progress={progress} />
          <p className="text-sm text-gray-600 mt-3">
            {completedDoses} of {doses.length} doses completed
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {doses.map((dose) => (
          <Card key={dose.number}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Dose {dose.number}
                </h3>
                {dose.date ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                    <span className="text-green-600 font-medium">
                      Completed
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Not completed</span>
                )}
              </div>

              {dose.date ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Date: {format(new Date(dose.date), "MMM dd, yyyy")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadPhoto(dose.number)}
                    fullWidth
                  >
                    Upload Vaccine Card Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDose === dose.number ? (
                    <>
                      <Input
                        type="date"
                        label="Date Administered"
                        value={doseDate}
                        onChange={(e) => setDoseDate(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleMarkDose} size="sm">
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDose(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDose(dose.number)}
                      fullWidth
                    >
                      Mark as Complete
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>Schedule:</strong> For those under 15, two doses are recommended
            with the second dose 6 months after the first. For those 15 and older,
            three doses are recommended.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
