import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      image: true,
      headline: true,
      bio: true,
      country: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 dark:text-white sm:text-3xl">
          Profile &amp; Settings
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Manage how you appear across eLearners Academy — on leaderboards, reviews and community
          discussions.
        </p>
      </div>

      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          image: user.image,
          headline: user.headline ?? "",
          bio: user.bio ?? "",
          country: user.country ?? "",
        }}
      />
    </div>
  );
}
