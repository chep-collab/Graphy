import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Users, Moon, Sun } from "lucide-react";
import KpiCard from "./components/KpiCard";

// ✅ Set API base URL
const API_BASE = "http://localhost:8000"; // Replace with your Render backend URL for production

function App() {
  const [theme, setTheme] = useState("light");
  const [kpis, setKpis] = useState(null);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [revenueByRegion, setRevenueByRegion] = useState([]);
  const [sparklineData, setSparklineData] = useState({
    totalRevenue: [],
    monthlyGrowth: [],
    churnRate: [],
    customers: [],
  });

  // ✅ Theme init & toggle
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // ✅ Fetch live data from backend
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/kpis`).then(res => res.json()),
      fetch(`${API_BASE}/api/revenue/monthly`).then(res => res.json()),
      fetch(`${API_BASE}/api/revenue/region`).then(res => res.json())
    ])
    .then(([kpiJson, monthJson, regionJson]) => {
      setKpis(kpiJson);
      setRevenueByMonth(monthJson);
      setRevenueByRegion(regionJson);

      // Prepare sparkline data
      setSparklineData({
        totalRevenue: monthJson.map(d => ({ value: d.revenue })),
        monthlyGrowth: monthJson.map((d,i)=> i===0?0:((d.revenue-monthJson[i-1].revenue)/monthJson[i-1].revenue)*100),
        churnRate: [{value: 5.1},{value:4.8},{value:4.3},{value:4.0},{value:3.81}], // Optional: replace with real data
        customers: [{value:2800},{value:3200},{value:3600},{value:3800},{value:4012}] // Optional
      });
    })
    .catch(err => console.error("API fetch error:", err));
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-zinc-900/80 p-6 rounded-r-2xl shadow hidden md:flex flex-col">
        <h2 className="text-xl font-bold mb-6">📊 Dashboard</h2>
        <nav className="space-y-2 flex-1">
          {["Overview", "Customers", "Revenue"].map((item) => (
            <a
              key={item}
              href="#"
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            >
              {item}
            </a>
          ))}
        </nav>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © 2025 Mos Solutions
        </p>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">🚀 Mos Insights Dashboard</h1>
            <p className="opacity-70">
              Cloud-ready, data-driven demo aligned with Mos Solutions.
            </p>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="px-3 py-2 flex items-center gap-2 rounded-lg border text-sm hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            {theme === "light" ? (
              <>
                <Moon className="h-4 w-4" /> Dark
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" /> Light
              </>
            )}
          </button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {kpis && (
            <>
              <KpiCard
                label="Total Revenue"
                value={`$${kpis.total_revenue.toLocaleString()}`}
                icon={DollarSign}
                trend="up"
                change={12.5}
                chartData={sparklineData.totalRevenue}
              />
              <KpiCard
                label="Monthly Growth"
                value={kpis.monthly_growth_pct}
                suffix="%"
                trend="up"
                change={8.3}
                chartData={sparklineData.monthlyGrowth}
              />
              <KpiCard
                label="Churn Rate"
                value={kpis.churn_rate_pct}
                suffix="%"
                trend="down"
                change={4.1}
                chartData={sparklineData.churnRate}
              />
              <KpiCard
                label="Total Customers"
                value={kpis.customers.toLocaleString()}
                icon={Users}
                trend="up"
                change={6.7}
                chartData={sparklineData.customers}
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart */}
          <div className="p-6 rounded-2xl shadow-lg bg-white/80 dark:bg-zinc-900/80 transition">
            <h3 className="text-lg font-semibold mb-4">📈 Revenue by Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#lineColor)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6366f1" }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#6366f1" }}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="p-6 rounded-2xl shadow-lg bg-white/80 dark:bg-zinc-900/80 transition">
            <h3 className="text-lg font-semibold mb-4">🌍 Revenue by Region</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByRegion} layout="vertical" barSize={20}>
                <defs>
                  <linearGradient id="barColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <YAxis dataKey="region" type="category" stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#barColor)"
                  radius={[0, 8, 8, 0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
