import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, Users, Landmark, Wallet, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Activity, CreditCard
} from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [branchData, setBranchData] = useState<any[]>([]);
  const [tierData, setTierData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, branchRes, tierRes, trendRes] = await Promise.all([
          fetch("http://localhost:5002/api/analytics/summary"),
          fetch("http://localhost:5002/api/analytics/branch-performance"),
          fetch("http://localhost:5002/api/analytics/customer-tiers"),
          fetch("http://localhost:5002/api/analytics/transaction-trends")
        ]);

        const [sum, branch, tier, trend] = await Promise.all([
          sumRes.json(), branchRes.json(), tierRes.json(), trendRes.json()
        ]);

        if (sum.success) setSummary(sum.data);
        if (branch.success) setBranchData(branch.data);
        if (tier.success) setTierData(tier.data);
        if (trend.success) setTrendData(trend.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          System Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Real-time analytics and performance metrics for the Banking Management System.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Deposits", value: `$${summary?.totalBalance.toLocaleString()}`, icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Loans", value: `$${summary?.totalLoans.toLocaleString()}`, icon: Landmark, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Customers", value: summary?.activeCustomers, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Recent Activity", value: summary?.recentTransactions, icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card flex flex-col justify-between p-6 transition-transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl ${kpi.bg} p-3 ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+2.4%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transaction Volume Trend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Volume</h3>
            <div className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800">Last 6 Months</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Branch Performance */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Branch Deposits</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="branch_name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ borderRadius: "12px", border: "none" }} />
                <Bar dataKey="total_deposits" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Tiers */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 lg:col-span-1"
        >
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Customer Tiers</h3>
          <div className="flex h-[250px] items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="customer_tier"
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {tierData.map((t, i) => (
              <div key={t.customer_tier} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t.customer_tier}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security / System Health */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security Logs</h3>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="space-y-4">
            {[
              { action: "Database Backup", time: "2 hours ago", status: "Successful", icon: ShieldCheck, color: "text-emerald-500" },
              { action: "Admin Login", time: "4 hours ago", status: "Secure", icon: ShieldCheck, color: "text-blue-500" },
              { action: "Large Transaction Audit", time: "1 day ago", status: "Verified", icon: ShieldCheck, color: "text-amber-500" },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg bg-slate-50 p-2 dark:bg-slate-800 ${log.color}`}>
                    <log.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{log.time}</p>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{log.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
