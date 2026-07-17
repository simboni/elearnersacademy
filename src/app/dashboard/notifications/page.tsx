import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  NotificationsList,
  type NotificationItem,
} from "@/components/dashboard/notifications-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const items: NotificationItem[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 dark:text-white sm:text-3xl">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Announcements, replies, live sessions and achievements — all in one place.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400 dark:bg-navy-800">
            <Bell className="h-7 w-7" />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-navy-900 dark:text-white">
            No notifications yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-navy-500 dark:text-slate-400">
            When something needs your attention, it will show up here.
          </p>
        </div>
      ) : (
        <NotificationsList initial={items} />
      )}
    </div>
  );
}
