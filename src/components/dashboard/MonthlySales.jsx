"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function MonthlySales() {
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);

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
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          const monthlySalesMap = new Map();

          data.table.rows.forEach((row, index) => {
            const rawZ = row.c?.[25]?.v; // Column Z - Sales
            const rawP = row.c?.[15]?.v; // Column P - Date

            if (!rawZ || !rawP) return;

            const cleanedZ = parseFloat(String(rawZ).replace(/[^\d.]/g, ""));
            if (isNaN(cleanedZ) || cleanedZ <= 0) return;

            let monthKey = "";

            try {
              if (typeof rawP === "string" && rawP.startsWith("Date(")) {
                const match = rawP.match(/Date\((\d+),(\d+),(\d+)\)/);
                if (match) {
                  const year = parseInt(match[1], 10);
                  const month = parseInt(match[2], 10);
                  monthKey = `${monthNames[month]} ${year}`;
                }
              } else {
                const date = new Date(rawP);
                if (!isNaN(date.getTime())) {
                  monthKey = `${
                    monthNames[date.getMonth()]
                  } ${date.getFullYear()}`;
                }
              }
            } catch (err) {
              console.warn("Failed to parse date from P:", rawP);
            }

            if (!monthKey) return;

            monthlySalesMap.set(
              monthKey,
              (monthlySalesMap.get(monthKey) || 0) + cleanedZ
            );
          });

          const dynamicSalesData = Array.from(monthlySalesMap.entries())
            .map(([month, sales]) => {
              const dateObj = new Date("1 " + month);
              return {
                name: month,
                sales: Math.round(sales),
                dateSort: isNaN(dateObj.getTime()) ? new Date() : dateObj,
              };
            })
            .sort((a, b) => a.dateSort - b.dateSort)
            .slice(-12)
            .map(({ name, sales }) => ({ name, sales }));

          setSalesData(
            dynamicSalesData.length
              ? dynamicSalesData
              : [{ name: "No Valid Data", sales: 0 }]
          );
        }
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        setSalesData([{ name: "Fetch Error", sales: 0 }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center font-semibold text-blue-600">
        Loading sales data...
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 sm:px-8 py-6">
        <h3 className="md:text-2xl font-bold text-white mb-2">Monthly Sales</h3>
        <p className="text-blue-50 md:text-lg">
          Track your sales performance over time
        </p>
      </div>
      <div className="w-full px-2 sm:px-4 md:px-6 py-4">
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm sm:shadow-md p-3 sm:p-4 md:p-6">
          <div className="w-full h-48 xs:h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{
                  top: 10,
                  right: window.innerWidth < 640 ? 0 : 20,
                  left: window.innerWidth < 640 ? 0 : 10,
                  bottom: window.innerWidth < 640 ? 15 : 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={window.innerWidth < 640 ? 10 : 12}
                  fontWeight={500}
                  tickMargin={window.innerWidth < 640 ? 5 : 10}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={window.innerWidth < 640 ? 10 : 12}
                  fontWeight={500}
                  width={window.innerWidth < 640 ? 30 : 40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontWeight: 500,
                    fontSize: window.innerWidth < 640 ? "12px" : "14px",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="url(#salesGradient)"
                  radius={[4, 4, 0, 0]}
                  barSize={window.innerWidth < 640 ? 20 : 30}
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
    </div>
  );
}

export default MonthlySales;
