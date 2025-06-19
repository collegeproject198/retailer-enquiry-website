"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";
const formatDate = (value) => {
  if (!value) return "—";

  // Handle Date(2025,6,1) format
  if (typeof value === "string" && value.startsWith("Date(")) {
    try {
      // Extract the numbers from Date(2025,6,1)
      const dateParts = value.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (dateParts && dateParts.length === 4) {
        const year = parseInt(dateParts[1]);
        const month = parseInt(dateParts[2]); // Note: JavaScript months are 0-11
        const day = parseInt(dateParts[3]);

        // Create a date object (add 1 to month since JavaScript months are 0-indexed)
        const date = new Date(year, month, day);
        return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
      }
    } catch (e) {
      console.error("Error parsing Date() string:", e);
    }
  }

  // If it's already in dd/mm/yyyy format, return as is
  if (typeof value === "string" && value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return value;
  }

  // If it's a date string from Google Sheets
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB");
    }
    return value;
  }

  // If it's a date object or timestamp
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
};

const AttendanceHistory = () => {
  const [indents, setIndents] = useState([]);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [col2Filter, setCol2Filter] = useState("");
  const [col4Filter, setCol4Filter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const SPREADSHEET_ID = "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const DISPLAY_COLUMNS = [1, 2, 3, 4, 5, 6, 7];

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Attendance`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Invalid response format");
      }

      const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));

      if (!data.table || !data.table.rows) {
        throw new Error("No table data found");
      }

      // Process headers
      const headers = [];
      if (data.table.cols) {
        data.table.cols.forEach((col, index) => {
          if (DISPLAY_COLUMNS.includes(index)) {
            headers.push({
              id: `col${index}`,
              label: col.label || `Column ${index + 1}`,
            });
          }
        });
      }
      setSheetHeaders(headers);

      // Process rows
      const items = data.table.rows.map((row, rowIndex) => {
        const item = {
          _id: `${rowIndex}-${Math.random().toString(36).substr(2, 9)}`,
          _rowIndex: rowIndex + 1,
        };

        if (row.c) {
          row.c.forEach((cell, i) => {
            item[`col${i}`] = cell?.v ?? cell?.f ?? "";
          });
        }

        return item;
      });

      const filteredItems = items.filter((item) => {
        return DISPLAY_COLUMNS.some((colIndex) => {
          const value = item[`col${colIndex}`];
          return value && String(value).trim() !== "";
        });
      });

      setIndents(filteredItems);
      toast.success(`${filteredItems.length} records loaded successfully`, {
        duration: 3000,
        position: "top-right",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      toast.error(`Failed to load data: ${err.message}`, {
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

    const matchesSearchTerm = DISPLAY_COLUMNS.some((colIndex) => {
      const value = item[`col${colIndex}`];
      return value && String(value).toLowerCase().includes(term);
    });

    const matchesCol2 = col2Filter
      ? col2Val.includes(col2Filter.toLowerCase())
      : true;

    const matchesCol4 = col4Filter
      ? col4Val.includes(col4Filter.toLowerCase())
      : true;

    return matchesSearchTerm && matchesCol2 && matchesCol4;
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading attendance data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-0 sm:p-6">
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
            Error Loading Data
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

  return (
    <>
      <Toaster position="top-right" />

      <div className="mt-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 px-2 sm:px-8 py-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            Attendance History
          </h3>
          <p className="text-slate-200 text-lg">
            View your recent attendance records
          </p>
        </div>

        <div className="p-2 sm:p-8">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search records..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  {sheetHeaders.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
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
                      colSpan={sheetHeaders.length}
                      className="px-6 py-12 text-center text-slate-500 font-medium"
                    >
                      No matching records found
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
                          key={`${item._id}-${header.id}`}
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900"
                        >
                          {header.id === "col1" || header.id === "col2"
                            ? formatDate(item[header.id])
                            : item[header.id] || "—"}
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
    </>
  );
};

export default AttendanceHistory;
