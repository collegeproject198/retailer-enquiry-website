"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";

const DummyReports = () => {
  const [indents, setIndents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [col2Filter, setCol2Filter] = useState("");
  const [col4Filter, setCol4Filter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const SPREADSHEET_ID = "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const DISPLAY_COLUMNS = [26, 27, 28, 29, 30, 31, 32];
  const trackerData = [
    { id: "col26", label: "Last Order Before" },
    { id: "col27", label: "Last Call Before" },
    { id: "col28", label: "MTD" },
    { id: "col29", label: "YTD" },
    { id: "col30", label: "Pending Amount" },
    { id: "col31", label: "No Of Bills" },
    { id: "col32", label: "Status" },
  ];

  // Filter indents based on search and filter criteria
  const filteredIndents = indents.filter((item) => {
    const term = searchTerm.toLowerCase();
    const col2Val = String(item.col2 || "").toLowerCase();
    const col4Val = String(item.col4 || "").toLowerCase();

    // If search term is empty, check filters only
    const matchesSearchTerm =
      !searchTerm ||
      DISPLAY_COLUMNS.some((colIndex) => {
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

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Starting data fetch...");

      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=FMS`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const text = await response.text();
      console.log("Raw response length:", text.length);
      console.log("First 500 chars:", text.substring(0, 500));

      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("No JSON found in response");
        throw new Error("Invalid response format - no JSON found");
      }

      const jsonText = text.substring(jsonStart, jsonEnd + 1);
      console.log("Extracted JSON length:", jsonText.length);

      const data = JSON.parse(jsonText);
      console.log("Parsed data structure:", {
        hasTable: !!data.table,
        hasCols: !!data.table?.cols,
        hasRows: !!data.table?.rows,
        colsCount: data.table?.cols?.length || 0,
        rowsCount: data.table?.rows?.length || 0,
      });

      // Set debug info
      setDebugInfo({
        totalCols: data.table?.cols?.length || 0,
        totalRows: data.table?.rows?.length || 0,
        displayColumns: DISPLAY_COLUMNS,
        sampleData: data.table?.rows?.slice(0, 3) || [],
      });

      // Process headers
      const headers = [];
      if (data.table?.cols) {
        console.log("Processing columns...");
        data.table.cols.forEach((col, index) => {
          if (DISPLAY_COLUMNS.includes(index)) {
            const header = {
              id: `col${index}`,
              label: col.label || col.id || `Column ${index + 1}`,
            };
            headers.push(header);
            console.log(`Column ${index}:`, header);
          }
        });
      }

      setSheetHeaders(headers);
      console.log("Headers set:", headers);

      // Process data rows
      const items = [];
      if (data.table?.rows) {
        console.log("Processing rows...");
        const startRow = 0; // Let's start from row 0 to see all data

        data.table.rows.slice(startRow).forEach((row, rowIndex) => {
          const item = {
            _id: `${rowIndex}-${Math.random().toString(36).substr(2, 9)}`,
            _rowIndex: rowIndex + startRow + 1,
          };

          if (row.c) {
            row.c.forEach((cell, cellIndex) => {
              const value = cell?.v ?? cell?.f ?? "";
              item[`col${cellIndex}`] = value;

              // Log first few rows for debugging
              if (rowIndex < 3 && DISPLAY_COLUMNS.includes(cellIndex)) {
                console.log(`Row ${rowIndex}, Col ${cellIndex}:`, value);
              }
            });
          }

          // Check if this row has any data in display columns
          const hasDisplayData = DISPLAY_COLUMNS.some((colIndex) => {
            const value = item[`col${colIndex}`];
            return (
              value !== null &&
              value !== undefined &&
              String(value).trim() !== ""
            );
          });

          if (hasDisplayData) {
            items.push(item);
          }

          // Log first few items
          if (rowIndex < 3) {
            console.log(`Item ${rowIndex}:`, item);
          }
        });
      }

      console.log("Processed items:", items.length);
      console.log("Sample items:", items.slice(0, 3));

      setIndents(items);

      if (items.length > 0) {
        toast.success(`${items.length} records loaded`, {
          duration: 3000,
          position: "top-right",
        });
      } else {
        toast.warning("No data found in the specified columns", {
          duration: 4000,
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

  const exportData = () => {
    try {
      if (filteredIndents.length === 0) {
        toast.error("No data to export", {
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      const csvContent = [
        // Header row
        sheetHeaders.map((header) => header.label).join(","),
        // Data rows
        ...filteredIndents.map((item) =>
          sheetHeaders
            .map((header) => {
              const value = item[header.id] || "";
              // Escape commas and quotes in CSV
              return typeof value === "string" &&
                (value.includes(",") || value.includes('"'))
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Reports_Data_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully!", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  console.log("Current state:", {
    indentsCount: indents.length,
    filteredCount: filteredIndents.length,
    headersCount: sheetHeaders.length,
    isLoading,
    error,
  });

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-3">
              Performance Reports
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              View and analyze dealer performance data
            </p>
          </div>

          {/* Debug Info (remove in production) */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>
                Total Columns: {debugInfo.totalCols}, Total Rows:{" "}
                {debugInfo.totalRows}
              </p>
              <p>Display Columns: {debugInfo.displayColumns.join(", ")}</p>
              <p>
                Loaded Items: {indents.length}, Filtered:{" "}
                {filteredIndents.length}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <span className="ml-4 text-slate-600">Loading data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-medium">Error loading data:</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchAttendanceData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Content */}
          {!isLoading && !error && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-8 py-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Dealer Performance Report
                    </h3>
                    <p className="text-orange-50 text-lg">
                      Comprehensive view of all dealers and their performance
                      metrics ({filteredIndents.length} of {indents.length}{" "}
                      records)
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setIsFilterDropdownOpen(!isFilterDropdownOpen)
                        }
                        className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <FilterIcon className="h-4 w-4 mr-2" />
                        Filter
                      </button>
                      {isFilterDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 p-4">
                          <div className="py-1">
                            <div className="block px-4 py-2 text-sm text-gray-700 font-semibold">
                              Filter by Columns
                            </div>
                            <div className="border-t border-gray-200 my-2"></div>
                            <div className="grid gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Column 2 Filter
                                </label>
                                <input
                                  type="text"
                                  placeholder="Filter by Column 2"
                                  value={col2Filter}
                                  onChange={(e) =>
                                    setCol2Filter(e.target.value)
                                  }
                                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Column 4 Filter
                                </label>
                                <input
                                  type="text"
                                  placeholder="Filter by Column 4"
                                  value={col4Filter}
                                  onChange={(e) =>
                                    setCol4Filter(e.target.value)
                                  }
                                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={exportData}
                      disabled={filteredIndents.length === 0}
                      className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="relative w-full max-w-md">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="search"
                      placeholder="Search in data..."
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-700 font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        {trackerData.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap"
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
                            colSpan={trackerData.length}
                            className="px-6 py-12 text-center"
                          >
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                            </div>
                          </td>
                        </tr>
                      ) : filteredIndents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={trackerData.length}
                            className="px-6 py-12 text-center text-slate-500 font-medium"
                          >
                            {error
                              ? `Error: ${error}`
                              : indents.length === 0
                              ? "No data available"
                              : "No results match your filters"}
                          </td>
                        </tr>
                      ) : (
                        filteredIndents.map((item) => (
                          <tr
                            key={item._id}
                            className="hover:bg-slate-50 transition-colors duration-150"
                          >
                            {trackerData.map((header) => (
                              <td
                                key={header.id}
                                className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900"
                              >
                                {item[header.id] !== null &&
                                item[header.id] !== undefined
                                  ? String(item[header.id])
                                  : "—"}
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
          )}
        </div>
      </div>
    </>
  );
};

export default DummyReports;
