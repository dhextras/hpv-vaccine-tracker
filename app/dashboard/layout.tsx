import { TabNavigation } from "@/components/dashboard/TabNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            HPV Vaccine Tracker
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <TabNavigation />
    </div>
  );
}
