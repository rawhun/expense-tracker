"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

type DataPoint = { label: string; amount: number };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-2 shadow-lg text-sm">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-primary font-bold">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

export function SpendingChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No expense data yet — start logging to see your chart!
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.amount));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))", radius: 6 }} />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.amount === maxVal ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
