"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface EducationCard {
  id: string;
  title: string;
  image: string;
  bullets: string[];
}

const educationCards: EducationCard[] = [
  {
    id: "hpv-basics",
    title: "HPV Basics",
    image: "/images/hpv-basics.jpg",
    bullets: [
      "HPV is one of the most common sexually transmitted infections",
      "Many types of HPV cause no symptoms and go away on their own",
      "Some types can cause genital warts or cancers",
      "HPV vaccination is the best way to prevent infection",
      "The vaccine is most effective when given before exposure to the virus",
    ],
  },
  {
    id: "why-vaccinate",
    title: "Why Vaccinate Early",
    image: "/images/why-early.jpg",
    bullets: [
      "The vaccine works best before exposure to HPV",
      "Immune response is strongest in younger age groups",
      "Protection lasts for many years, possibly a lifetime",
      "Early vaccination means fewer doses may be needed",
      "Protects against multiple cancer-causing HPV types",
    ],
  },
  {
    id: "what-vaccine-does",
    title: "What the Vaccine Does/Doesn't Do",
    image: "/images/vaccine-info.jpg",
    bullets: [
      "DOES: Protects against HPV types that cause most cervical cancers",
      "DOES: Prevents genital warts from certain HPV types",
      "DOES: Reduces risk of other HPV-related cancers",
      "DOESN'T: Treat existing HPV infections",
      "DOESN'T: Replace the need for regular cancer screenings",
    ],
  },
  {
    id: "genital-warts",
    title: "Genital Warts: When to Get Checked",
    image: "/images/genital-warts.jpg",
    bullets: [
      "Small bumps or groups of bumps in the genital area",
      "Can be raised or flat, single or multiple",
      "Usually painless but may cause discomfort",
      "Treatable by a healthcare provider",
      "Prevention through vaccination is most effective",
    ],
  },
  {
    id: "when-seek-care",
    title: "When to Seek Care",
    image: "/images/seek-care.jpg",
    bullets: [
      "Unusual vaginal bleeding (after sex, between periods)",
      "Persistent pelvic or lower abdominal pain",
      "Pain during sexual intercourse",
      "Unusual vaginal discharge or changes",
      "Any new or concerning symptoms in genital area",
    ],
  },
  {
    id: "dose-completion",
    title: "Dose Completion Matters",
    image: "/images/completion.jpg",
    bullets: [
      "Full protection requires completing the vaccine series",
      "Two or three doses needed depending on age",
      "Missing doses reduces effectiveness significantly",
      "Set reminders to stay on schedule",
      "Contact your clinic if you've missed a dose",
    ],
  },
];

export default function LearnPage() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleShare = (card: EducationCard) => {
    if (navigator.share) {
      navigator.share({
        title: card.title,
        text: `Learn about ${card.title}`,
        url: window.location.href,
      });
    } else {
      alert("Sharing not supported on this device");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Learn About HPV
        </h2>
        <p className="text-gray-600">
          Educational resources to help you understand HPV and vaccination
        </p>
      </div>

      <div className="space-y-4">
        {educationCards.map((card) => {
          const isExpanded = expandedCard === card.id;

          return (
            <Card
              key={card.id}
              onClick={() =>
                setExpandedCard(isExpanded ? null : card.id)
              }
              className="cursor-pointer"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {card.title}
                  </h3>
                  {!isExpanded && (
                    <p className="text-sm text-gray-600 mt-1">
                      Tap to read more
                    </p>
                  )}
                </div>

                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? "rotate-180" : ""
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
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <ul className="space-y-2">
                    {card.bullets.map((bullet, index) => (
                      <li key={index} className="flex gap-2 text-gray-700">
                        <span className="text-primary-600 mt-1 flex-shrink-0">
                          •
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(card);
                    }}
                    fullWidth
                  >
                    Share
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
