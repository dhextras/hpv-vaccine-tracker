export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showNotification(title: string, body: string, tag?: string) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: tag || "hpv-vaccine-reminder",
      requireInteraction: true,
    });
  }
}

export interface DoseReminder {
  doseNumber: number;
  dueDate: string;
  profileName: string;
  profileId: string;
}

export function scheduleReminder(reminder: DoseReminder) {
  const dueDate = new Date(reminder.dueDate);
  const now = new Date();

  const reminderDates = [
    new Date(dueDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000),
    new Date(dueDate.getTime() - 1 * 24 * 60 * 60 * 1000),
    dueDate,
  ];

  reminderDates.forEach((reminderDate, index) => {
    if (reminderDate > now) {
      const timeUntilReminder = reminderDate.getTime() - now.getTime();

      if (timeUntilReminder < 2147483647) {
        setTimeout(() => {
          showNotification(
            `Dose ${reminder.doseNumber} Reminder`,
            `${reminder.profileName}'s dose ${reminder.doseNumber} is ${
              index === 3 ? "due today" :
              index === 2 ? "due tomorrow" :
              index === 1 ? "due in 7 days" :
              "due in 30 days"
            }. Please visit a clinic to get vaccinated.`,
            `dose-${reminder.profileId}-${reminder.doseNumber}`
          );
        }, timeUntilReminder);
      }
    }
  });
}

export function saveReminders(reminders: DoseReminder[]) {
  localStorage.setItem("dose_reminders", JSON.stringify(reminders));
}

export function loadReminders(): DoseReminder[] {
  const saved = localStorage.getItem("dose_reminders");
  return saved ? JSON.parse(saved) : [];
}

export function scheduleAllReminders() {
  const reminders = loadReminders();
  reminders.forEach(scheduleReminder);
}
