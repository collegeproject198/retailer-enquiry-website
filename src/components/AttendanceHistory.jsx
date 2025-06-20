"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";

  if (typeof value === "string" && value.startsWith("Date(")) {
    try {
      const dateParts = value.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (dateParts && dateParts.length === 4) {
        const year = parseInt(dateParts[1]);
        const month = parseInt(dateParts[2]);
        const day = parseInt(dateParts[3]);
        const date = new Date(year, month, day);
        return date.toLocaleDateString("en-GB");
      }
    } catch (e) {
      console.error("Error parsing Date() string:", e);
    }
  }

  if (typeof value === "string" && value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB");
    }
    return value;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
};

const AttendanceHistory = () => {
  const [indents, setIndents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [col2Filter, setCol2Filter] = useState("");
  const [col4Filter, setCol4Filter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sheetHeaders, setSheetHeaders] = useState(true);
  const [error, setError] = useState(null);

  const SPREADSHEET_ID = "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const DISPLAY_COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8];
  const attendenceData = [
    { id: "col1", label: "Date & Time	" },
    { id: "col2", label: "End Date" },
    { id: "col2", label: "Status" },
    { id: "col3", label: "Reason" },
    { id: "col4", label: "Latitude" },
    { id: "col5", label: "Longitude" },
    { id: "col6", label: "Map Link" },
    { id: "col7", label: "Formatted Address" },
  ];
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

      // Set headers from cols (not from rows)
      const headers = [];
      if (data.table?.cols) {
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

      // Process data rows (skip row 0 if it contains headers)
      const items = [];
      if (data.table?.rows) {
        // Start from row 1 if first row contains headers
        const startRow =
          headers.length > 0 && headers[0].label === data.table.rows[0]?.c[0]?.v
            ? 1
            : 0;

        data.table.rows.slice(startRow).forEach((row, rowIndex) => {
          const item = {
            _id: `${rowIndex}-${Math.random().toString(36).substr(2, 9)}`,
            _rowIndex: rowIndex + startRow + 1,
          };
          if (row.c) {
            row.c.forEach((cell, i) => {
              item[`col${i}`] = cell?.v ?? cell?.f ?? "";
            });
          }
          items.push(item);
        });
      }

      const filteredItems = items.filter((item) => {
        return DISPLAY_COLUMNS.some((colIndex) => {
          const value = item[`col${colIndex}`];
          return value && String(value).trim() !== "";
        });
      });

      setIndents(filteredItems);

      if (filteredItems.length > 0) {
        toast.success(`${filteredItems.length} records loaded`, {
          duration: 3000,
          position: "top-right",
        });
      }
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
  console.log(filteredIndents, "filteredIndents");
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
                  {attendenceData.map((header) => (
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
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={sheetHeaders.length}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredIndents.length <= 1 ? (
                  <tr>
                    <td
                      colSpan={sheetHeaders.length}
                      className="px-6 py-12 text-center text-slate-500 font-medium"
                    >
                      {error
                        ? `Error: ${error}`
                        : "No attendance records found"}
                    </td>
                  </tr>
                ) : (
                  filteredIndents.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      {sheetHeaders.map((header, idx) => (
                        <td
                          key={`${item._id}-${header.id}-${idx}`}
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900"
                        >
                          {header.id === "col1" || header.id === "col2" ? (
                            formatDate(item[header.id])
                          ) : header.id === "col7" &&
                            typeof item[header.id] === "string" &&
                            item[header.id].includes("maps") ? (
                            <a
                              href={item[header.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-3 py-1 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                            >
                              View Map
                            </a>
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
    </>
  );
};

export default AttendanceHistory;
