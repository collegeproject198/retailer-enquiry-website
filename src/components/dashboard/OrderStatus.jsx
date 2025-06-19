"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function OrderStatus() {
  const [statusData, setStatusData] = useState([]);
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
          let completed = 0;
          let pending = 0;
          let cancelled = 0; // hardcoded for now

          data.table.rows.forEach((row) => {
            const colO = row.c?.[14]?.v; // Column O - Enquiry Done
            const colP = row.c?.[15]?.v; // Column P - Enquiry Response

            if (colO && colP) {
              completed++;
            } else if (colO && !colP) {
              pending++;
            }
          });

          const newStatusData = [
            { name: "Completed", value: completed, color: "#10b981" },
            { name: "Pending", value: pending, color: "#f59e0b" },
            { name: "Cancelled", value: cancelled, color: "#ef4444" },
          ];

          setStatusData(newStatusData);
        }
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        setStatusData([
          { name: "Fetch Error", value: 1, color: "#ef4444" },
          { name: "Completed", value: 0, color: "#10b981" },
          { name: "Pending", value: 0, color: "#f59e0b" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 px-8 py-6">
        <h3 className="md:text-2xl font-bold text-white mb-2">Order Status</h3>
        <p className="text-purple-50 md:text-lg">
          Current distribution of order statuses
        </p>
      </div>
      <div className="p-4 sm:p-8">
        <div className="h-64 sm:h-80 ">
          {isLoading ? (
            <div className="text-center text-slate-500 pt-20 text-lg">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="70%" // Responsive radius (relative instead of 100px)
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
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: "16px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;
