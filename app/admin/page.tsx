"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  isAdminEmail,
  validateClinicData,
  validateProgramConfig,
  getAdminEmails,
  addAdminEmail,
} from "@/lib/utils/admin";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clinicsFile, setClinicsFile] = useState<File | null>(null);
  const [configFile, setConfigFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      const admin = await isAdminEmail(user.email || "");
      console.log(user.email);
      console.log(admin);
      setIsAdmin(admin);
      setLoading(false);

      if (!admin) {
        router.push("/dashboard/home");
      }

      const emails = await getAdminEmails();
      setAdminEmails(emails);
    });
  }, [router]);

  const handleClinicsUpload = async () => {
    if (!clinicsFile) return;

    try {
      const text = await clinicsFile.text();
      const data = JSON.parse(text);

      if (!validateClinicData(data)) {
        setUploadStatus("Invalid clinic data format");
        return;
      }

      const response = await fetch("/api/admin/update-clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinics: data }),
      });

      if (response.ok) {
        setUploadStatus("Clinics updated successfully");
        setClinicsFile(null);
      } else {
        setUploadStatus("Failed to update clinics");
      }
    } catch (error) {
      setUploadStatus("Error parsing clinic data: " + (error as Error).message);
    }
  };

  const handleConfigUpload = async () => {
    if (!configFile) return;

    try {
      const text = await configFile.text();
      const data = JSON.parse(text);

      if (!validateProgramConfig(data)) {
        setUploadStatus("Invalid program config format");
        return;
      }

      const response = await fetch("/api/admin/update-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: data }),
      });

      if (response.ok) {
        setUploadStatus("Config updated successfully");
        setConfigFile(null);
      } else {
        setUploadStatus("Failed to update config");
      }
    } catch (error) {
      setUploadStatus("Error parsing config data: " + (error as Error).message);
    }
  };

  const handleAddAdmin = async () => {
    if (newAdminEmail && newAdminEmail.includes("@")) {
      const success = await addAdminEmail(newAdminEmail, user?.email);
      if (success) {
        const emails = await getAdminEmails();
        setAdminEmails(emails);
        setNewAdminEmail("");
        setUploadStatus(`Added ${newAdminEmail} as admin`);
      } else {
        setUploadStatus(`Failed to add ${newAdminEmail} as admin`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-900 font-medium mb-2">Access Denied</p>
            <p className="text-gray-600">You do not have admin permissions</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Logged in as: {user?.email}</p>
        </div>

        {uploadStatus && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-blue-900">{uploadStatus}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Update Clinic Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a JSON file containing clinic information. The file must be
              an array of clinic objects with required fields: id, name,
              area_tags, phone.
            </p>
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setClinicsFile(e.target.files?.[0] || null)}
            />
            <Button
              onClick={handleClinicsUpload}
              disabled={!clinicsFile}
              fullWidth
            >
              Update Clinics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Program Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a JSON file containing program configuration. Must include
              age ranges, eligibility rules, and dose schedules.
            </p>
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setConfigFile(e.target.files?.[0] || null)}
            />
            <Button
              onClick={handleConfigUpload}
              disabled={!configFile}
              fullWidth
            >
              Update Configuration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Admins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Current Admin Emails:
              </p>
              <div className="space-y-2">
                {adminEmails.map((email) => (
                  <div
                    key={email}
                    className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900"
                  >
                    {email}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="Add New Admin Email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@example.com"
              />
              <Button
                onClick={handleAddAdmin}
                disabled={!newAdminEmail}
                fullWidth
              >
                Add Admin
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/home")}
              fullWidth
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/help")}
              fullWidth
            >
              View Clinics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
