import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { listCENROs, listPENROs } from "@/lib/data/offices";
import { CENROForm } from "@/components/offices/CENROForm";
import type { CENRODoc } from "@/types";

export default async function CENROsPage() {
  const user = await requireUser();
  if (!can(user.role, "cenro:manage")) {
    redirect("/dashboard");
  }

  const [cenros, penros] = await Promise.all([
    listCENROs(),
    listPENROs(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">CENRO Management</h1>
        <p className="text-slate-600">Manage Community Environment and Natural Resources Offices</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Add New CENRO</h2>
            <CENROForm penros={penros} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">CENROs ({cenros.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {cenros.map((cenro) => (
              <div
                key={cenro.id}
                className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{cenro.name}</p>
                  <p className="text-xs text-slate-600">{cenro.province}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CENROListTable cenros={cenros} penros={penros} />
    </div>
  );
}

function CENROListTable({ cenros, penros }: { cenros: CENRODoc[]; penros: any[] }) {
  const penroMap = Object.fromEntries(penros.map((p) => [p.id, p.name]));

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">PENRO</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Contact</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {cenros.map((cenro) => (
            <tr key={cenro.id} className="hover:bg-slate-50">
              <td className="px-6 py-3 text-sm text-slate-900">{cenro.name}</td>
              <td className="px-6 py-3 text-sm text-slate-600">{cenro.code}</td>
              <td className="px-6 py-3 text-sm text-slate-600">{penroMap[cenro.penroId]}</td>
              <td className="px-6 py-3 text-sm text-slate-600">{cenro.contactNumber}</td>
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
