"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Users,
  Store,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import MonthlySales from "../components/dashboard/MonthlySales";
import OrderStatus from "../components/dashboard/OrderStatus";
function Dashboard() {
  const [totalCount, setTotalCount] = useState(0);
  const [activeDealersCount, setActiveDealersCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0); // New state for Column Z count
  const [pendingEnquiriesCount, setPendingEnquiriesCount] = useState(0); // New state for Column O not null, Column P null
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://docs.google.com/spreadsheets/d/1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0/gviz/tq?tqx=out:json&sheet=FMS"
        );
        const text = await response.text();
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        const jsonData = text.substring(jsonStart, jsonEnd);
        const data = JSON.parse(jsonData);

        if (data?.table?.rows) {
          // Count total rows (excluding header if present)
          setTotalCount(data.table.rows.length);

          // Count non-empty values in Column B (index 1)
          const dealers = new Set();
          data.table.rows.forEach((row) => {
            if (row.c?.[1]?.v) {
              // Column B data (index 1)
              dealers.add(row.c[1].v);
            }
          });
          setActiveDealersCount(dealers.size);

          // Count non-empty values in Column Z (index 25)
          let ordersCount = 0;
          data.table.rows.forEach((row) => {
            if (row.c?.[25]?.v) {
              // Column Z data (index 25, since Z is the 26th letter)
              const value = row.c[25].v;
              if (value && String(value).trim() !== "") {
                ordersCount++;
              }
            }
          });
          setTotalOrdersCount(ordersCount);

          // Count rows where Column O is not null and Column P is null
          let pendingCount = 0;
          data.table.rows.forEach((row) => {
            const colO = row.c?.[14]?.v; // Column O (index 14)
            const colP = row.c?.[15]?.v; // Column P (index 15)

            const isColONotEmpty = colO && String(colO).trim() !== "";
            const isColPEmpty = !colP || String(colP).trim() === "";

            // If Column O is not null AND Column P is null, count it
            if (isColONotEmpty && isColPEmpty) {
              pendingCount++;
            }
          });
          setPendingEnquiriesCount(pendingCount);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
          {/* Total Sales Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">
                    Total Records
                  </h3>
                  <div className="text-3xl font-bold text-white mb-2">
                    {isLoading ? (
                      <div className="h-8 w-20 bg-blue-400/50 rounded animate-pulse"></div>
                    ) : (
                      totalCount.toLocaleString()
                    )}
                  </div>
                  <div className="flex items-center text-blue-100">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">
                      Live data from FMS sheet
                    </span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Dealers Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-purple-100 uppercase tracking-wider mb-2">
                    Active Dealers
                  </h3>
                  <div className="text-3xl font-bold text-white mb-2">
                    {isLoading ? (
                      <div className="h-8 w-20 bg-purple-400/50 rounded animate-pulse"></div>
                    ) : (
                      activeDealersCount
                    )}
                  </div>
                  <div className="flex items-center text-purple-100">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">
                      Unique dealers in Column B
                    </span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <Store className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders Card - Updated to show Column Z count */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-pink-400 via-rose-500 to-red-400 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-pink-100 uppercase tracking-wider mb-2">
                    Total Orders
                  </h3>
                  <div className="text-3xl font-bold text-white mb-2">
                    {isLoading ? (
                      <div className="h-8 w-20 bg-pink-400/50 rounded animate-pulse"></div>
                    ) : (
                      totalOrdersCount.toLocaleString()
                    )}
                  </div>
                  <div className="flex items-center text-pink-100">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">
                      Live data from Column Z
                    </span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Pending Enquiries Card - Updated to show Column O not null, Column P null count */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-amber-100 uppercase tracking-wider mb-2">
                    Pending Enquiries
                  </h3>
                  <div className="text-3xl font-bold text-white mb-2">
                    {isLoading ? (
                      <div className="h-8 w-20 bg-amber-400/50 rounded animate-pulse"></div>
                    ) : (
                      pendingEnquiriesCount
                    )}
                  </div>
                  <div className="flex items-center text-amber-100">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">
                      Col O filled, Col P pending
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
          <MonthlySales />
          <OrderStatus />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
