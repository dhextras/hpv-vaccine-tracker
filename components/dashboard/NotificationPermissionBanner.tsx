"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { requestNotificationPermission } from "@/lib/utils/notifications";

export function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      const dismissed = localStorage.getItem("notification_banner_dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    setRequesting(true);
    const granted = await requestNotificationPermission();
    setRequesting(false);

    if (granted) {
      setShowBanner(false);
      localStorage.setItem("notification_permission_granted", "true");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("notification_banner_dismissed", "true");
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Enable Dose Reminders
            </p>
            <p className="text-sm text-blue-800 mb-3">
              Get notified when vaccine doses are due. We'll send reminders 30 days, 7 days, and 1 day before the due date.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRequestPermission}
                disabled={requesting}
              >
                {requesting ? "Requesting..." : "Enable Notifications"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
