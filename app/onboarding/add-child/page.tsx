"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Sex } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getAccount, getProfiles, createProfile } from "@/lib/supabase/database";

interface ProfileForm {
  display_name: string;
  date_of_birth: string;
  age_years: string;
  sex: Sex | "";
}

export default function AddChildPage() {
  const router = useRouter();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>({
    display_name: "",
    date_of_birth: "",
    age_years: "",
    sex: "",
  });

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

      setAccountId(account.id);
    });
  }, [router]);

  const updateProfile = (field: keyof ProfileForm, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleContinue = async () => {
    if (!accountId) return;

    setLoading(true);
    try {
      const profiles = await getProfiles(accountId);
      const newIndex = profiles.length;

      await createProfile(accountId, {
        display_name: profile.display_name || undefined,
        date_of_birth: profile.date_of_birth || undefined,
        age_years: profile.age_years ? parseInt(profile.age_years) : undefined,
        sex: profile.sex as Sex,
        is_self: false,
      });

      router.push(`/onboarding/screening?child=${newIndex}`);
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Failed to add child. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isValid = (profile.date_of_birth || profile.age_years) && profile.sex;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Another Child
          </h1>
          <p className="text-gray-600 mb-8">
            Enter the information for the new child
          </p>

          <Card>
            <div className="space-y-4">
              <Input
                label="Display Name (Optional)"
                value={profile.display_name}
                onChange={(e) => updateProfile("display_name", e.target.value)}
                placeholder="Child's name"
              />

              <Input
                label="Date of Birth"
                type="date"
                value={profile.date_of_birth}
                onChange={(e) => updateProfile("date_of_birth", e.target.value)}
              />

              <Input
                label="OR Age (if date of birth unknown)"
                type="number"
                value={profile.age_years}
                onChange={(e) => updateProfile("age_years", e.target.value)}
                placeholder="Age in years"
                disabled={!!profile.date_of_birth}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sex
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => updateProfile("sex", "female")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      profile.sex === "female"
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    Female
                  </button>
                  <button
                    onClick={() => updateProfile("sex", "male")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      profile.sex === "male"
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    Male
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/settings")}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!isValid || loading}
              fullWidth
            >
              {loading ? "Adding..." : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
