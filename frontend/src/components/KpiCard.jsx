import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Area,
} from "recharts";

export default function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  trend,
  chartData,
  change, // 📊 % change vs last month
}) {
  const trendColor =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
      ? "text-red-500"
      : "text-slate-500";

  const badgeStyle =
    trend === "up"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  // Unique gradient ID so each KPI card is isolated
  const gradientId = `sparklineGradient-${label.replace(/\s+/g, "")}`;

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 15 }}
      className="p-5 rounded-2xl shadow-lg bg-white/80 dark:bg-zinc-900/80 
                 backdrop-blur border border-slate-200/50 dark:border-zinc-800/50 
                 hover:shadow-2xl transition flex flex-col justify-between group"
    >
      {/* Top: Label + Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium opacity-70">{label}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 
                          group-hover:scale-110 transition">
            <Icon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          </div>
        )}
      </div>

      {/* Value + Change Badge */}
      <div className="mb-3">
        <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {value}
          {suffix || ""}
        </div>
        {change !== undefined && (
          <span
            className={`inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium rounded-full ${badgeStyle}`}
          >
            {trend === "up" ? "+" : "-"}
            {Math.abs(change)}% vs last month
          </span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <motion.div
          className={`flex items-center text-sm mb-3 font-medium ${trendColor}`}
          animate={
            trend === "up"
              ? { scale: [1, 1.15, 1] }
              : { x: [0, -2, 2, -2, 0] }
          }
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          {trend === "up" ? "Improving" : "Declining"}
        </motion.div>
      )}

      {/* Sparkline Chart with Area + Gradient */}
      {chartData && (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  {trend === "up" ? (
                    <>
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                    </>
                  ) : (
                    <>
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </>
                  )}
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="px-3 py-2 text-xs rounded-lg shadow-lg bg-slate-900 text-white">
                        <span className="font-semibold">
                          {payload[0].value.toLocaleString()}
                          {suffix || ""}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Area under line */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill={`url(#${gradientId})`}
              />
              {/* Sparkline line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={`url(#${gradientId})`}
                strokeWidth={trend === "down" ? 3.5 : 2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

