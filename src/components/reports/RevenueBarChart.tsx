"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function RevenueBarChart({
  data,
}: {
  data: { name: string; revenue: number }[];
}) {
  return (
    <div className="h-72 w-full rounded-lg border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip
            formatter={(value) =>
              Number(value).toLocaleString("en-PH", { style: "currency", currency: "PHP" })
            }
          />
          <Bar dataKey="revenue" fill="#15803d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
