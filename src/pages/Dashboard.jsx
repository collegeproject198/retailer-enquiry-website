"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  Users,
  Store,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4500 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 5500 },
];

const statusData = [
  { name: "Completed", value: 45, color: "#10b981" },
  { name: "In Progress", value: 30, color: "#3b82f6" },
  { name: "Pending", value: 15, color: "#f59e0b" },
  { name: "Cancelled", value: 10, color: "#ef4444" },
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Dashboard
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Welcome to your business overview
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-white/20">
            <div className="flex items-center gap-3 text-slate-700">
              <span className="font-semibold text-blue-600">Today:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">
                    Total Sales
                  </h3>
                  <div className="text-3xl font-bold text-white mb-2">
                    ₹1,25,890
                  </div>
                  <div className="flex items-center text-blue-100">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">
                      +12.5% from last month
                    </span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-purple-100 uppercase tracking-wider mb-2">
                    Active Dealers
                  </h3>
                  <div className="text-3xl font-bold text-white mb-2">245</div>
                  <div className="flex items-center text-purple-100">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">
                      +5.2% from last month
                    </span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <Store className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-pink-500 via-rose-600 to-red-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-pink-100 uppercase tracking-wider mb-2">
                    Total Orders
                  </h3>
                  <div className="text-3xl font-bold text-white mb-2">
                    1,890
                  </div>
                  <div className="flex items-center text-pink-100">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">
                      +18.2% from last month
                    </span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-amber-100 uppercase tracking-wider mb-2">
                    Pending Enquiries
                  </h3>
                  <div className="text-3xl font-bold text-white mb-2">42</div>
                  <div className="flex items-center text-amber-100">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">
                      -8.4% from last month
                    </span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Monthly Sales Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-8 py-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Monthly Sales
              </h3>
              <p className="text-blue-50 text-lg">
                Track your sales performance over time
              </p>
            </div>
            <div className="p-8">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={12}
                      fontWeight={500}
                    />
                    <YAxis stroke="#64748b" fontSize={12} fontWeight={500} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        fontWeight: 500,
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="url(#salesGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="salesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Order Status Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 px-8 py-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Order Status
              </h3>
              <p className="text-purple-50 text-lg">
                Current distribution of order statuses
              </p>
            </div>
            <div className="p-8">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        fontWeight: 500,
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: "20px",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 px-8 py-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Quick Actions
            </h3>
            <p className="text-slate-200 text-lg">
              Frequently used actions and shortcuts
            </p>
          </div>
          <div className="p-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <button className="bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 border border-blue-200 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md">
                Add New Dealer
              </button>
              <button className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border border-purple-200 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md">
                Generate Report
              </button>
              <button className="bg-gradient-to-r from-green-100 to-teal-100 hover:from-green-200 hover:to-teal-200 text-green-700 border border-green-200 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md">
                Track Orders
              </button>
              <button className="bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-700 border border-amber-200 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
