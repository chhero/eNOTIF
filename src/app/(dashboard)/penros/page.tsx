import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { listPENROs } from "@/lib/data/offices";
import { PENROForm } from "@/components/offices/PENROForm";
import type { PENRODoc } from "@/types";

export default async function PENROsPage() {
  const user = await requireUser();
  if (!can(user.role, "penro:manage")) {
    redirect("/dashboard");
  }

  const penros = await listPENROs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">PENRO Management</h1>
        <p className="text-slate-600">Manage Provincial Environment and Natural Resources Offices</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Add New PENRO</h2>
            <PENROForm />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">PENROs ({penros.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {penros.map((penro) => (
              <div
                key={penro.id}
                className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{penro.name}</p>
                  <p className="text-xs text-slate-600">{penro.province}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PENROListTable penros={penros} />
    </div>
  );
}

function PENROListTable({ penros }: { penros: PENRODoc[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Province</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Contact</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {penros.map((penro) => (
            <tr key={penro.id} className="hover:bg-slate-50">
              <td className="px-6 py-3 text-sm text-slate-900">{penro.name}</td>
              <td className="px-6 py-3 text-sm text-slate-600">{penro.code}</td>
              <td className="px-6 py-3 text-sm text-slate-600">{penro.province}</td>
              <td className="px-6 py-3 text-sm text-slate-600">{penro.contactNumber}</td>
              <td className="px-6 py-3 text-sm">
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                  <button className="text-red-600 hover:text-red-700 font-medium">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
