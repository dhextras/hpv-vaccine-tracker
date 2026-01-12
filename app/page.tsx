"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("eligibility_status");
    if (hasOnboarded) {
      router.push("/dashboard/home");
    } else {
      router.push("/onboarding/mode");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
