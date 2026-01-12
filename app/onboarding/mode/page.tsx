"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AccountMode } from "@/lib/types";

export default function ModeSelectionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AccountMode | null>(null);

  const handleModeSelect = (selectedMode: AccountMode) => {
    setMode(selectedMode);
    localStorage.setItem("account_mode", selectedMode);
    router.push("/onboarding/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Who are you using this app for?
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Select the option that best describes you
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleModeSelect("parent")}
            className={`w-full p-6 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
              mode === "parent"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 hover:border-primary-300"
            }`}
          >
            <div className="text-left">
              <div className="text-xl font-semibold text-gray-900 mb-2">
                I'm a Parent/Guardian
              </div>
              <div className="text-sm text-gray-600">
                Manage vaccine plans for one or more children
              </div>
            </div>
          </button>

          <button
            onClick={() => handleModeSelect("young_adult")}
            className={`w-full p-6 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
              mode === "young_adult"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 hover:border-primary-300"
            }`}
          >
            <div className="text-left">
              <div className="text-xl font-semibold text-gray-900 mb-2">
                I'm getting vaccinated myself
              </div>
              <div className="text-sm text-gray-600">
                Track your own HPV vaccine journey
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
