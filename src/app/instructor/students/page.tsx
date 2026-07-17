import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { relativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";

export const dynamic = "force-dynamic";

export default async function InstructorStudentsPage() {
  const user = (await getCurrentUser())!;

  const enrollments = await prisma.enrollment.findMany({
    where: { course: { instructorId: user.id } },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  type Student = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    courses: number;
    progressSum: number;
    lastJoined: Date;
    courseTitles: string[];
  };

  const map = new Map<string, Student>();
  for (const e of enrollments) {
    const existing = map.get(e.user.id);
    if (existing) {
      existing.courses += 1;
      existing.progressSum += e.progressPct;
      existing.courseTitles.push(e.course.title);
      if (e.createdAt > existing.lastJoined) existing.lastJoined = e.createdAt;
    } else {
      map.set(e.user.id, {
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
        image: e.user.image,
        courses: 1,
        progressSum: e.progressPct,
        lastJoined: e.createdAt,
        courseTitles: [e.course.title],
      });
    }
  }

  const students = [...map.values()].sort((a, b) => b.lastJoined.getTime() - a.lastJoined.getTime());
  const totalEnrollments = enrollments.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy-900 dark:text-white">Students</h2>
        <p className="text-sm text-navy-500 dark:text-slate-400">
          {students.length} unique student{students.length === 1 ? "" : "s"} across{" "}
          {totalEnrollments} enrollment{totalEnrollments === 1 ? "" : "s"}
        </p>
      </div>

      {students.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="inline-flex rounded-2xl bg-navy-100 p-4 dark:bg-navy-800">
            <Users size={28} className="text-sky" />
          </span>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
            No students yet
          </h3>
          <p className="max-w-sm text-sm text-navy-500 dark:text-slate-400">
            Once traders enroll in your courses they will appear here with their learning progress.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-800">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Courses</th>
                  <th className="px-5 py-3 font-medium">Avg. progress</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const avgProgress = s.courses ? s.progressSum / s.courses : 0;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-navy-50 last:border-0 dark:border-navy-800/60"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} src={s.image} size={38} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-navy-900 dark:text-white">
                              {s.name}
                            </p>
                            <p className="truncate text-xs text-navy-500 dark:text-slate-400">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700 dark:bg-navy-800 dark:text-slate-200">
                          {s.courses}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="w-40 max-w-full">
                          <ProgressBar value={avgProgress} showLabel />
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-navy-500 dark:text-slate-400">
                        {relativeTime(s.lastJoined)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
