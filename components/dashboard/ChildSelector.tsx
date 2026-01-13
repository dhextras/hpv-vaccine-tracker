"use client";

import { useState, useEffect } from "react";
import { calculateAgeFromDOB } from "@/lib/utils/eligibility";
import { createClient } from "@/lib/supabase/client";
import { getAccount, getProfiles } from "@/lib/supabase/database";

interface Profile {
  id: string;
  display_name?: string;
  age_years?: number;
  date_of_birth?: string;
  sex: string;
}

export function ChildSelector() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const account = await getAccount(user.id);
      if (!account) return;

      setAccountId(account.id);
      const fetchedProfiles = await getProfiles(account.id);
      setProfiles(fetchedProfiles);
      setActiveProfileId(account.active_profile_id || fetchedProfiles[0]?.id || null);
    });
  }, []);

  const handleSelect = async (profileId: string) => {
    if (!accountId) return;

    const supabase = createClient();
    await supabase
      .from("accounts")
      .update({ active_profile_id: profileId })
      .eq("id", accountId);

    setActiveProfileId(profileId);
    setIsOpen(false);
    window.location.reload();
  };

  if (profiles.length <= 1) {
    return null;
  }

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const age = activeProfile?.date_of_birth
    ? calculateAgeFromDOB(activeProfile.date_of_birth)
    : activeProfile?.age_years;

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-between hover:border-primary-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">
              {activeProfile?.display_name || "Child"}
            </p>
            <p className="text-sm text-gray-600">
              {age} years, {activeProfile?.sex === "male" ? "Male" : "Female"}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {profiles.map((profile) => {
            const profileAge = profile.date_of_birth
              ? calculateAgeFromDOB(profile.date_of_birth)
              : profile.age_years;

            return (
              <button
                key={profile.id}
                onClick={() => handleSelect(profile.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  profile.id === activeProfileId ? "bg-primary-50" : ""
                }`}
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    {profile.display_name || "Child"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {profileAge} years, {profile.sex === "male" ? "Male" : "Female"}
                  </p>
                </div>
                {profile.id === activeProfileId && (
                  <svg
                    className="w-5 h-5 text-primary-600 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
