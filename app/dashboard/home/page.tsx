"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MilestoneProgress } from "@/components/ui/ProgressBar";
import { EligibilityStatus, AccountMode } from "@/lib/types";
import { getEligibilityMessage } from "@/lib/utils/eligibility";
import { ChildSelector } from "@/components/dashboard/ChildSelector";
import { NotificationPermissionBanner } from "@/components/dashboard/NotificationPermissionBanner";
import { createClient } from "@/lib/supabase/client";
import { getAccount, getProfiles, getScreeningResults } from "@/lib/supabase/database";

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<AccountMode | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [allScreenings, setAllScreenings] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();
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
      setProfiles(fetchedProfiles);

      const active = account.active_profile_id
        ? fetchedProfiles.find((p: any) => p.id === account.active_profile_id)
        : fetchedProfiles[0];

      setActiveProfile(active);

      if (active) {
        const screening = await getScreeningResults(active.id);
        if (screening) {
          setEligibility(screening.eligibility_status);
        }
      }

      const screenings = await Promise.all(
        fetchedProfiles.map((p: any) => getScreeningResults(p.id))
      );
      setAllScreenings(screenings.filter((s: any) => s !== null));
    });
  }, [router]);

  const milestones = [
    { label: "Eligibility", percentage: 0 },
    { label: "Find Clinic", percentage: 25 },
    { label: "Dose 1", percentage: 50 },
    { label: "Follow-up", percentage: 75 },
    { label: "Complete", percentage: 100 },
  ];

  const getEligibilityBadge = (status: EligibilityStatus) => {
    if (status === "eligible_now") return <Badge variant="success">Eligible</Badge>;
    if (status === "defer" || status === "defer_pregnancy")
      return <Badge variant="warning">Defer</Badge>;
    if (status === "clinician_review")
      return <Badge variant="error">Clinician Review</Badge>;
    return <Badge variant="neutral">Not Eligible</Badge>;
  };

  if (!mode || !eligibility) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === "young_adult" ? "Your Vaccine Journey" : "Family Dashboard"}
        </h2>
        <p className="text-gray-600">
          Track your progress and stay on schedule
        </p>
      </div>

      {mode === "parent" && <ChildSelector />}

      <NotificationPermissionBanner />

      {getEligibilityBadge(eligibility)}

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          {eligibility === "eligible_now" ? (
            <>
              <p className="text-gray-700 mb-4">
                You're eligible for the HPV vaccine. Find a clinic to get started.
              </p>
              <Button fullWidth onClick={() => router.push("/dashboard/help")}>
                Find a Location
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                {getEligibilityMessage(eligibility)}
              </p>
              {(eligibility === "clinician_review" ||
                eligibility === "defer" ||
                eligibility === "defer_pregnancy") && (
                <Button variant="outline" fullWidth onClick={() => router.push("/dashboard/help")}>
                  Contact Clinic
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <MilestoneProgress
            milestones={milestones}
            currentProgress={eligibility === "eligible_now" ? 25 : 0}
          />
        </CardContent>
      </Card>

      {mode === "parent" && profiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profiles.map((profile, index) => {
                const childScreening = allScreenings[index];
                return (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {profile.display_name || `Child ${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Age: {profile.age_years || "N/A"}
                      </p>
                    </div>
                    {childScreening && getEligibilityBadge(childScreening.eligibility_status)}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
