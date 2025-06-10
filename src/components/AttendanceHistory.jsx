"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";

const AttendanceHistory = () => {
  const [indents, setIndents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [col2Filter, setCol2Filter] = useState("");
  const [col4Filter, setCol4Filter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [error, setError] = useState(null);

  const SPREADSHEET_ID = "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const DISPLAY_COLUMNS = [1, 2, 3, 4, 5, 6, 7];

  // Function to fetch data only from FMS sheet
  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching data from Reports sheet...");

      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Attendance`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Reports data: ${response.status}`);
      }

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Invalid response format from Reports sheet");
      }

      const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));

      if (!data.table || !data.table.rows) {
        throw new Error("No table data found in Reports sheet");
      }

      console.log("✅ Reports data loaded successfully");

      // Process Reports headers
      const fmsHeaders = [];

      if (data.table.cols) {
        data.table.cols.forEach((col, index) => {
          const label = col.label || `Column ${index}`;
          if (DISPLAY_COLUMNS.includes(index)) {
            fmsHeaders.push({ id: `col${index}`, label });
          }
        });
      }

      setSheetHeaders(fmsHeaders);

      // Process Reports data rows
      const fmsItems = data.table.rows.map((row, rowIndex) => {
        const itemObj = {
          _id: `${rowIndex}-${Math.random().toString(36).substr(2, 9)}`,
          _rowIndex: rowIndex + 1,
        };

        if (row.c) {
          row.c.forEach((cell, i) => {
            itemObj[`col${i}`] = cell?.v ?? cell?.f ?? "";
          });
        }

        return itemObj;
      });

      // Filter out empty rows
      const filteredItems = fmsItems.filter((item) => {
        return DISPLAY_COLUMNS.some((colIndex) => {
          const value = item[`col${colIndex}`];
          return value && String(value).trim() !== "";
        });
      });

      setIndents(filteredItems);
      toast.success(` ${filteredItems.length} Reports successfully fetched `, {
        duration: 3000,
        position: "top-right",
      });
    } catch (err) {
      console.error("❌ Error fetching Reports data:", err);
      setError(err.message);
      toast.error(`Failed to load Reports data: ${err.message}`, {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const filteredIndents = indents.filter((item) => {
    const term = searchTerm.toLowerCase();
    const col2Val = String(item.col2 || "").toLowerCase();
    const col4Val = String(item.col4 || "").toLowerCase();

    // Search term filter
    const matchesSearchTerm = DISPLAY_COLUMNS.some((colIndex) => {
      const value = item[`col${colIndex}`];
      return value && String(value).toLowerCase().includes(term);
    });

    // col2 filter
    const matchesCol2 = col2Filter
      ? col2Val.includes(col2Filter.toLowerCase())
      : true;

    // col4 filter
    const matchesCol4 = col4Filter
      ? col4Val.includes(col4Filter.toLowerCase())
      : true;

    return matchesSearchTerm && matchesCol2 && matchesCol4;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading AttendanceHistory Data
          </h3>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={fetchAttendanceData}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  function getStatusColor(status) {
    switch (status) {
      case "IN":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "OUT":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200";
      case "Leave":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200";
    }
  }
  return (
    <>
      <Toaster position="top-right" />

      <div className="mt-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 px-8 py-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            Attendance History
          </h3>
          <p className="text-slate-200 text-lg">
            View your recent attendance records
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    {sheetHeaders.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider"
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredIndents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={15}
                        className="px-6 py-12 text-center text-slate-500 font-medium"
                      >
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    filteredIndents.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50 transition-colors duration-150"
                      >
                        {sheetHeaders.map((header) => (
                          <td
                            key={header.id}
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900"
                          >
                            {header.id === "col3" ? (
                              <span
                                className={getStatusColor(
                                  item[header.id] || ""
                                )}
                              >
                                {item[header.id] || "—"}
                              </span>
                            ) : (
                              item[header.id] || "—"
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceHistory;
