"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ChildSelector } from "@/components/dashboard/ChildSelector";
import { format, addMonths } from "date-fns";
import { AccountMode } from "@/lib/types";
import { calculateAgeFromDOB } from "@/lib/utils/eligibility";
import { scheduleReminder, saveReminders, loadReminders, type DoseReminder } from "@/lib/utils/notifications";
import { createClient } from "@/lib/supabase/client";
import { getAccount, getProfiles, getScreeningResults, getOrCreateVaccineSeries, getVaccineDoses, createVaccineDose } from "@/lib/supabase/database";

interface Dose {
  number: 1 | 2 | 3;
  date: string | null;
  id?: string;
}

export default function VaccinePlanPage() {
  const [doses, setDoses] = useState<Dose[]>([]);
  const [selectedDose, setSelectedDose] = useState<number | null>(null);
  const [doseDate, setDoseDate] = useState("");
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [mode, setMode] = useState<AccountMode | null>(null);
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const account = await getAccount(user.id);
      if (!account) {
        window.location.href = "/onboarding/mode";
        return;
      }

      setMode(account.mode);
      const fetchedProfiles = await getProfiles(account.id);
      setProfiles(fetchedProfiles);

      const active = account.active_profile_id
        ? fetchedProfiles.find((p: any) => p.id === account.active_profile_id)
        : fetchedProfiles[0];

      setActiveProfile(active);

      if (active) {
        const screening = await getScreeningResults(active.id);

        let numDoses = 2;
        const age = active.date_of_birth
          ? calculateAgeFromDOB(active.date_of_birth)
          : active.age_years;

        if (age >= 15 || screening?.immunocompromised) {
          numDoses = 3;
        }

        const scheduleType = numDoses === 2 ? "two_dose" : "three_dose";
        const series = await getOrCreateVaccineSeries(
          active.id,
          scheduleType,
          screening?.immunocompromised || false
        );

        setSeriesId(series.id);

        const existingDoses = await getVaccineDoses(series.id);

        if (existingDoses.length > 0) {
          const mappedDoses = Array.from({ length: numDoses }, (_, i) => {
            const existing = existingDoses.find((d: any) => d.dose_number === i + 1);
            return {
              number: (i + 1) as 1 | 2 | 3,
              date: existing?.date_administered || null,
              id: existing?.id,
            };
          });
          setDoses(mappedDoses);
        } else {
          const initialDoses = Array.from({ length: numDoses }, (_, i) => ({
            number: (i + 1) as 1 | 2 | 3,
            date: null,
          }));
          setDoses(initialDoses);
        }
      }
    });
  }, []);

  const completedDoses = doses.filter((d) => d.date !== null).length;
  const progress = doses.length > 0 ? (completedDoses / doses.length) * 100 : 0;

  const handleMarkDose = async () => {
    if (selectedDose !== null && doseDate && seriesId) {
      setLoading(true);
      try {
        await createVaccineDose(seriesId, selectedDose, doseDate);

        const newDoses = doses.map((d) =>
          d.number === selectedDose ? { ...d, date: doseDate } : d
        );
        setDoses(newDoses);

        const nextDose = newDoses.find((d) => d.date === null);
        if (nextDose && activeProfile) {
          let monthsUntilNext = 6;
          if (newDoses.length === 3 && nextDose.number === 2) {
            monthsUntilNext = 2;
          }

          const nextDueDate = addMonths(new Date(doseDate), monthsUntilNext);
          const profileName = activeProfile.display_name || "Child";

          const reminder: DoseReminder = {
            doseNumber: nextDose.number,
            dueDate: nextDueDate.toISOString(),
            profileName,
            profileId: activeProfile.id,
          };

          const existingReminders = loadReminders();
          const filteredReminders = existingReminders.filter(
            (r) => !(r.profileName === profileName && r.doseNumber === nextDose.number)
          );
          const updatedReminders = [...filteredReminders, reminder];

          saveReminders(updatedReminders);
          scheduleReminder(reminder);
        }

        setSelectedDose(null);
        setDoseDate("");
      } catch (error) {
        console.error("Error saving dose:", error);
        alert("Failed to save dose. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUploadPhoto = (doseNumber: number) => {
    alert("Photo upload coming soon with Supabase Storage integration");
  };

  const age = activeProfile?.date_of_birth
    ? calculateAgeFromDOB(activeProfile.date_of_birth)
    : activeProfile?.age_years;

  if (doses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading vaccine plan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vaccine Plan
        </h2>
        <p className="text-gray-600">
          {mode === "parent" && activeProfile
            ? `Tracking doses for: ${activeProfile.display_name || "Child"} (${age} years)`
            : "Track your doses and completion"}
        </p>
      </div>

      {mode === "parent" && <ChildSelector />}

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
