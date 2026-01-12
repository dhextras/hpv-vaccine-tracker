"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AccountMode, Sex } from "@/lib/types";

interface ProfileForm {
  display_name: string;
  date_of_birth: string;
  age_years: string;
  sex: Sex | "";
}

export default function ProfilePage() {
  const router = useRouter();
  const [mode, setMode] = useState<AccountMode | null>(null);
  const [profiles, setProfiles] = useState<ProfileForm[]>([
    { display_name: "", date_of_birth: "", age_years: "", sex: "" },
  ]);

  useEffect(() => {
    const savedMode = localStorage.getItem("account_mode") as AccountMode;
    if (!savedMode) {
      router.push("/onboarding/mode");
      return;
    }
    setMode(savedMode);
  }, [router]);

  const addProfile = () => {
    setProfiles([
      ...profiles,
      { display_name: "", date_of_birth: "", age_years: "", sex: "" },
    ]);
  };

  const removeProfile = (index: number) => {
    setProfiles(profiles.filter((_, i) => i !== index));
  };

  const updateProfile = (index: number, field: keyof ProfileForm, value: string) => {
    const updated = [...profiles];
    updated[index][field] = value as never;
    setProfiles(updated);
  };

  const handleContinue = () => {
    localStorage.setItem("profiles", JSON.stringify(profiles));
    router.push("/onboarding/screening");
  };

  const isValid = profiles.every(
    (p) => (p.date_of_birth || p.age_years) && p.sex
  );

  if (!mode) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === "parent" ? "Create Profiles" : "Create Your Profile"}
          </h1>
          <p className="text-gray-600 mb-8">
            {mode === "parent"
              ? "Add information for each child"
              : "Tell us a bit about yourself"}
          </p>

          <div className="space-y-6">
            {profiles.map((profile, index) => (
              <Card key={index} className="relative">
                {mode === "parent" && profiles.length > 1 && (
                  <button
                    onClick={() => removeProfile(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}

                <div className="space-y-4">
                  <Input
                    label="Display Name (Optional)"
                    value={profile.display_name}
                    onChange={(e) =>
                      updateProfile(index, "display_name", e.target.value)
                    }
                    placeholder={mode === "young_adult" ? "Your name" : "Child's name"}
                  />

                  <Input
                    label="Date of Birth"
                    type="date"
                    value={profile.date_of_birth}
                    onChange={(e) =>
                      updateProfile(index, "date_of_birth", e.target.value)
                    }
                  />

                  <Input
                    label="OR Age (if date of birth unknown)"
                    type="number"
                    value={profile.age_years}
                    onChange={(e) =>
                      updateProfile(index, "age_years", e.target.value)
                    }
                    placeholder="Age in years"
                    disabled={!!profile.date_of_birth}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sex
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateProfile(index, "sex", "female")}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          profile.sex === "female"
                            ? "border-primary-600 bg-primary-50"
                            : "border-gray-200 hover:border-primary-300"
                        }`}
                      >
                        Female
                      </button>
                      <button
                        onClick={() => updateProfile(index, "sex", "male")}
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
            ))}
          </div>

          {mode === "parent" && (
            <Button
              variant="outline"
              onClick={addProfile}
              className="mt-6"
              fullWidth
            >
              + Add Another Child
            </Button>
          )}

          <Button
            onClick={handleContinue}
            disabled={!isValid}
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
