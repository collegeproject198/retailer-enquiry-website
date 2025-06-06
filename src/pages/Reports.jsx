"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";

const Reports = () => {
  const [indents, setIndents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [col2Filter, setCol2Filter] = useState("");
  const [col4Filter, setCol4Filter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const SPREADSHEET_ID = "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const DISPLAY_COLUMNS = [26, 27, 28, 29, 30, 31, 32];

  // Function to fetch data only from FMS sheet
  const fetchFMSData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching data from Reports sheet...");

      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=FMS`
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
    fetchFMSData();
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

  // const refreshData = () => {
  //   console.log("🔄 Refreshing Reports data...");
  //   fetchFMSData();
  // };

  const exportData = () => {
    try {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 flex items-center justify-center">
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
            Error Loading Reports Data
          </h3>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={fetchFMSData}
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

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Dealer Performance Report
                  </h3>
                  <p className="text-orange-50 text-lg">
                    Comprehensive view of all dealers and their performance
                    metrics
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsFilterDropdownOpen(!isFilterDropdownOpen)
                      }
                      className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                      aria-expanded={isFilterDropdownOpen}
                      aria-haspopup="true"
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
                          <div className="border-t border-gray-200 my-2"></div>{" "}
                          {/* Separator */}
                          <div className="grid gap-4">
                            <div>
                              <label
                                htmlFor="col2-filter"
                                className="block text-sm font-medium text-gray-700"
                              >
                                {sheetHeaders.find((h) => h.id === "col2")
                                  ?.label || "Column 2"}
                              </label>
                              <input
                                id="col2-filter"
                                type="text"
                                placeholder={`Filter by ${
                                  sheetHeaders.find((h) => h.id === "col2")
                                    ?.label || "Column 2"
                                }`}
                                value={col2Filter}
                                onChange={(e) => setCol2Filter(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="col4-filter"
                                className="block text-sm font-medium text-gray-700"
                              >
                                {sheetHeaders.find((h) => h.id === "col4")
                                  ?.label || "Column 4"}
                              </label>
                              <input
                                id="col4-filter"
                                type="text"
                                placeholder={`Filter by ${
                                  sheetHeaders.find((h) => h.id === "col4")
                                    ?.label || "Column 4"
                                }`}
                                value={col4Filter}
                                onChange={(e) => setCol4Filter(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={exportData}
                    className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
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
                    placeholder="Search dealers..."
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
                      {sheetHeaders.map((header) => (
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
                              className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900"
                            >
                              {item[header.id] || "—"}
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
      </div>
    </>
  );
};

export default Reports;
