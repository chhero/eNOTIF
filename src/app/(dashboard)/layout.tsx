import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-1 bg-slate-50">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <TopBar user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
