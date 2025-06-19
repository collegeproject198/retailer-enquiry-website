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
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [pendingEnquiriesCount, setPendingEnquiriesCount] = useState(0);
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
          setTotalCount(data.table.rows.length);

          const dealers = new Set();
          data.table.rows.forEach((row) => {
            if (row.c?.[1]?.v) {
              dealers.add(row.c[1].v);
            }
          });
          setActiveDealersCount(dealers.size);

          let ordersCount = 0;
          data.table.rows.forEach((row) => {
            if (row.c?.[25]?.v) {
              const value = row.c[25].v;
              if (value && String(value).trim() !== "") {
                ordersCount++;
              }
            }
          });
          setTotalOrdersCount(ordersCount);

          let pendingCount = 0;
          data.table.rows.forEach((row) => {
            const colO = row.c?.[14]?.v;
            const colP = row.c?.[15]?.v;
            const isColONotEmpty = colO && String(colO).trim() !== "";
            const isColPEmpty = !colP || String(colP).trim() === "";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Better mobile spacing */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium">
              Welcome to your business overview
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-md sm:shadow-lg border border-white/20 w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-700">
              <span className="font-semibold text-blue-600 text-xs sm:text-sm md:text-base">
                Today:
              </span>
              <span className="font-medium text-xs sm:text-sm md:text-base">
                {new Date().toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Cards - Better mobile card sizing */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Records Card */}
          <div className=" bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-white/20 overflow-hidden group active:scale-[0.99] sm:hover:scale-[1.02] transition-all duration-300">
            <div className="h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[0.65rem] xs:text-xs sm:text-sm font-semibold text-blue-100 uppercase tracking-wider mb-1">
                    Total Records
                  </h3>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                    {isLoading ? (
                      <div className="h-6 sm:h-7 md:h-8 w-16 sm:w-20 bg-blue-400/50 rounded animate-pulse"></div>
                    ) : (
                      totalCount.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="bg-white/20 p-1.5 sm:p-3 rounded-md sm:rounded-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Dealers Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-white/20 overflow-hidden group active:scale-[0.99] sm:hover:scale-[1.02] transition-all duration-300">
            <div className="h-full bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[0.65rem] xs:text-xs sm:text-sm font-semibold text-purple-100 uppercase tracking-wider mb-1">
                    Active Dealers
                  </h3>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                    {isLoading ? (
                      <div className="h-6 sm:h-7 md:h-8 w-16 sm:w-20 bg-purple-400/50 rounded animate-pulse"></div>
                    ) : (
                      activeDealersCount
                    )}
                  </div>
                </div>
                <div className="bg-white/20 p-1.5 sm:p-3 rounded-md sm:rounded-lg">
                  <Store className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-white/20 overflow-hidden group active:scale-[0.99] sm:hover:scale-[1.02] transition-all duration-300">
            <div className="h-full bg-gradient-to-br from-pink-400 via-rose-500 to-red-400 p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[0.65rem] xs:text-xs sm:text-sm font-semibold text-pink-100 uppercase tracking-wider mb-1">
                    Total Orders
                  </h3>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                    {isLoading ? (
                      <div className="h-6 sm:h-7 md:h-8 w-16 sm:w-20 bg-pink-400/50 rounded animate-pulse"></div>
                    ) : (
                      totalOrdersCount.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="bg-white/20 p-1.5 sm:p-3 rounded-md sm:rounded-lg">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Pending Enquiries Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-white/20 overflow-hidden group active:scale-[0.99] sm:hover:scale-[1.02] transition-all duration-300">
            <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[0.65rem] xs:text-xs sm:text-sm font-semibold text-amber-100 uppercase tracking-wider mb-1">
                    Pending Enquiries
                  </h3>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                    {isLoading ? (
                      <div className="h-6 sm:h-7 md:h-8 w-16 sm:w-20 bg-amber-400/50 rounded animate-pulse"></div>
                    ) : (
                      pendingEnquiriesCount
                    )}
                  </div>
                </div>
                <div className="bg-white/20 p-1.5 sm:p-3 rounded-md sm:rounded-lg">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - Better mobile spacing */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <MonthlySales />
          <OrderStatus />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
