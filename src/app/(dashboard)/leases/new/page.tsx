import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { LeaseForm } from "@/components/leases/LeaseForm";

export default async function NewLeasePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user.role, "leases:create")) redirect("/leases");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Register New Lease</h1>
      <LeaseForm />
    </div>
  );
}
