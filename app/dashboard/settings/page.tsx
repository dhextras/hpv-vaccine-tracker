"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { AccountMode, EligibilityStatus } from "@/lib/types";
import { calculateAgeFromDOB } from "@/lib/utils/eligibility";
import { createClient } from "@/lib/supabase/client";
import { getAccount, getProfiles, updateProfile, deleteProfile, getScreeningResults } from "@/lib/supabase/database";

export default function SettingsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [allScreenings, setAllScreenings] = useState<any[]>([]);
  const [mode, setMode] = useState<AccountMode | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    display_name: "",
    age_years: "",
    sex: "female" as "male" | "female",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      const screenings = await Promise.all(
        fetchedProfiles.map((p: any) => getScreeningResults(p.id))
      );
      setAllScreenings(screenings.filter((s: any) => s !== null));
    });
  }, [router]);

  const getEligibilityBadge = (status: EligibilityStatus) => {
    if (status === "eligible_now") return <Badge variant="success">Eligible</Badge>;
    if (status === "defer" || status === "defer_pregnancy")
      return <Badge variant="warning">Defer</Badge>;
    if (status === "clinician_review")
      return <Badge variant="error">Clinician Review</Badge>;
    return <Badge variant="neutral">Not Eligible</Badge>;
  };

  const handleEditClick = (profile: any) => {
    setEditingId(profile.id);
    setEditForm({
      display_name: profile.display_name || "",
      age_years: profile.age_years?.toString() || "",
      sex: profile.sex as "male" | "female",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await updateProfile(editingId, {
        display_name: editForm.display_name,
        age_years: parseInt(editForm.age_years),
        sex: editForm.sex as "male" | "female",
      });

      const updatedProfiles = profiles.map((p) =>
        p.id === editingId
          ? { ...p, display_name: editForm.display_name, age_years: parseInt(editForm.age_years), sex: editForm.sex }
          : p
      );
      setProfiles(updatedProfiles);
      setEditingId(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDeleteClick = (profileId: string) => {
    setDeleteConfirm(profileId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    if (profiles.length === 1) {
      alert("Cannot delete the last profile. You must have at least one profile.");
      setDeleteConfirm(null);
      return;
    }

    setLoading(true);
    try {
      await deleteProfile(deleteConfirm);
      const updatedProfiles = profiles.filter((p) => p.id !== deleteConfirm);
      setProfiles(updatedProfiles);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Failed to delete profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your profiles and account</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {mode === "parent" ? "Children" : "Profile"}
            </CardTitle>
            {mode === "parent" && (
              <Button size="sm" onClick={() => router.push("/onboarding/add-child")}>
                Add Child
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map((profile, index) => {
              const age = profile.date_of_birth
                ? calculateAgeFromDOB(profile.date_of_birth)
                : profile.age_years;
              const screening = allScreenings.find((s: any) => s?.profile_id === profile.id);

              if (editingId === profile.id) {
                return (
                  <div key={profile.id} className="p-4 border-2 border-primary-300 rounded-lg bg-primary-50">
                    <div className="space-y-3">
                      <Input
                        label="Name"
                        value={editForm.display_name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, display_name: e.target.value })
                        }
                      />
                      <Input
                        label="Age"
                        type="number"
                        value={editForm.age_years}
                        onChange={(e) =>
                          setEditForm({ ...editForm, age_years: e.target.value })
                        }
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sex
                        </label>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setEditForm({ ...editForm, sex: "female" })}
                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                              editForm.sex === "female"
                                ? "border-primary-600 bg-primary-50 font-semibold"
                                : "border-gray-200 hover:border-primary-300"
                            }`}
                          >
                            Female
                          </button>
                          <button
                            onClick={() => setEditForm({ ...editForm, sex: "male" })}
                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                              editForm.sex === "male"
                                ? "border-primary-600 bg-primary-50 font-semibold"
                                : "border-gray-200 hover:border-primary-300"
                            }`}
                          >
                            Male
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit} size="sm">
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (deleteConfirm === profile.id) {
                return (
                  <div key={profile.id} className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
                    <p className="text-gray-900 font-medium mb-3">
                      Are you sure you want to delete {profile.display_name || `Child ${index + 1}`}?
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      This will permanently remove all data for this profile including vaccine records, screening results, and symptom checks.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={handleConfirmDelete}>
                        Yes, Delete
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCancelDelete}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {profile.display_name || `Child ${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {age} years, {profile.sex === "male" ? "Male" : "Female"}
                    </p>
                    {screening && (
                      <div className="mt-2">{getEligibilityBadge(screening.eligibility_status)}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(profile)}
                    >
                      Edit
                    </Button>
                    {profiles.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(profile.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Account Type</span>
              <span className="font-medium text-gray-900">
                {mode === "parent" ? "Parent/Guardian" : "Young Adult"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
