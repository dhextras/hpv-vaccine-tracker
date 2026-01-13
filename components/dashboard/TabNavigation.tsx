"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Home", path: "/dashboard/home" },
  { name: "Vaccine Plan", path: "/dashboard/vaccine-plan" },
  { name: "Learn", path: "/dashboard/learn" },
  { name: "Help", path: "/dashboard/help" },
  { name: "Settings", path: "/dashboard/settings" },
];

export function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex-1 py-3 px-2 text-center text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary-600 border-t-2 border-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
