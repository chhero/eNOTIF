import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { listUsers } from "@/lib/data/users";
import { USER_ROLES } from "@/lib/constants";
import { UserForm } from "@/components/users/UserForm";
import { UserStatusToggle } from "@/components/users/UserStatusToggle";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user.role, "users:manage")) redirect("/dashboard");

  const users = await listUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500">Manage DENR personnel accounts and roles</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Create User
        </h2>
        <UserForm />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          All Users
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Name</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Email</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Role</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Office</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    {USER_ROLES.find((r) => r.value === u.role)?.label ?? u.role}
                  </td>
                  <td className="px-4 py-2">{u.cenro ?? u.province ?? "Regional Office"}</td>
                  <td className="px-4 py-2 capitalize">{u.status}</td>
                  <td className="px-4 py-2">
                    <UserStatusToggle userId={u.id} status={u.status} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
