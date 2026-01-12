"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Clinic } from "@/lib/types";

const sampleClinics: Clinic[] = [
  {
    id: "clinic_001",
    name: "Primary Health Centre - District A",
    area_tags: ["Village A", "Block X", "District A"],
    phone: "+91XXXXXXXXXX",
    whatsapp: "+91XXXXXXXXXX",
    address: "Near bus stand, Village A",
    hours: "Mon-Sat 9:00-16:00",
  },
  {
    id: "clinic_002",
    name: "Community Health Center - Block Y",
    area_tags: ["Village B", "Block Y", "District A"],
    phone: "+91YYYYYYYYYY",
    whatsapp: "+91YYYYYYYYYY",
    address: "Main road, Village B",
    hours: "Mon-Fri 8:00-14:00",
  },
  {
    id: "clinic_003",
    name: "Government Hospital - District A",
    area_tags: ["District A", "City Center"],
    phone: "+91ZZZZZZZZZZ",
    address: "Hospital road, City Center",
    hours: "24/7",
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const filteredClinics = sampleClinics.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.area_tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");
  };

  if (selectedClinic) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedClinic(null)}
          className="mb-4"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to clinics
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{selectedClinic.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClinic.address && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Address
                </p>
                <p className="text-gray-900">{selectedClinic.address}</p>
              </div>
            )}

            {selectedClinic.hours && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Hours
                </p>
                <p className="text-gray-900">{selectedClinic.hours}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Service Areas
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedClinic.area_tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => handleCall(selectedClinic.phone)}
                fullWidth
              >
                Call {selectedClinic.phone}
              </Button>

              {selectedClinic.whatsapp && (
                <Button
                  variant="outline"
                  onClick={() => handleWhatsApp(selectedClinic.whatsapp!)}
                  fullWidth
                >
                  WhatsApp {selectedClinic.whatsapp}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Find a Clinic
        </h2>
        <p className="text-gray-600">
          Search for clinics by area or name
        </p>
      </div>

      <Input
        placeholder="Search by village, area, or clinic name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="space-y-3">
        {filteredClinics.length > 0 ? (
          filteredClinics.map((clinic) => (
            <Card
              key={clinic.id}
              onClick={() => setSelectedClinic(clinic)}
              className="cursor-pointer hover:shadow-lg"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {clinic.name}
                </h3>

                <div className="flex flex-wrap gap-2 mb-3">
                  {clinic.area_tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {clinic.address && (
                  <p className="text-sm text-gray-600 mb-2">
                    {clinic.address}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📞 {clinic.phone}</span>
                  {clinic.whatsapp && <span>💬 WhatsApp</span>}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">
                No clinics found matching your search
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This is sample clinic data. Actual clinic
            information will be loaded from your program configuration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
