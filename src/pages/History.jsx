"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DownloadIcon, FilterIcon, SearchIcon, Eye, X } from "lucide-react";

const History = () => {
  const [indents, setIndents] = useState([]);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [col2Filter, setCol2Filter] = useState("");
  const [col4Filter, setCol4Filter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const SPREADSHEET_ID = "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const DISPLAY_COLUMNS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11];

  // Function to fetch data only from FMS sheet
  const fetchFMSData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching data from History sheet...");

      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=FMS`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch History data: ${response.status}`);
      }

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Invalid response format from History sheet");
      }

      const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));

      if (!data.table || !data.table.rows) {
        throw new Error("No table data found in History sheet");
      }

      console.log("✅ History data loaded successfully");

      // Process History headers
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

      // Process History data rows
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
      toast.success(` ${filteredItems.length} History successfully fetched `, {
        duration: 3000,
        position: "top-right",
      });
    } catch (err) {
      console.error("❌ Error fetching History data:", err);
      setError(err.message);
      toast.error(`Failed to load History data: ${err.message}`, {
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
  //   console.log("🔄 Refreshing History data...");
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
        `History_Data_${new Date().toISOString().split("T")[0]}.csv`
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
          <p className="text-slate-600 font-medium">Loading History data...</p>
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
            Error Loading History Data
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Interaction History
          </h1>
          <p className="text-muted-foreground">
            View history of all dealer interactions
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-pink-200">
          <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Dealer Interaction History
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete record of all dealer interactions and updates
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsFilterDropdownOpen(!isFilterDropdownOpen)
                    }
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full sm:w-auto"
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
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full sm:w-auto"
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-pink-200">
            <div className="p-8">
              <div>
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                  <div className="relative w-full sm:w-auto sm:flex-1">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search interactions..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <input
                    type="date"
                    // value={selectedDate}
                    // onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  />
                </div>
              </div>

              <div className="rounded-md border overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      {sheetHeaders.map((header) => (
                        <th
                          key={header.id}
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap"
                        >
                          {header.label}
                        </th>
                      ))}
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredIndents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={sheetHeaders.length + 1}
                          className="px-6 py-12 text-center text-slate-500 font-medium"
                        >
                          {searchTerm || col2Filter || col4Filter
                            ? "No results found for your current filters."
                            : "No data found in History sheet."}
                        </td>
                      </tr>
                    ) : (
                      filteredIndents.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          {sheetHeaders.map((header) => (
                            <td
                              key={header.id}
                              className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                            >
                              {item[header.id] || "—"}
                            </td>
                          ))}
                          <td className="px-6 py-4 text-right">
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                              onClick={() => {
                                console.log("👁️ Viewing item:", item);
                                setSelectedIndent(item);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* View Details Dialog */}
          {isDialogOpen && selectedIndent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0">
              <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Interaction Details
                  </h2>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    aria-label="Close"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
                  {Object.keys(selectedIndent)
                    .filter(
                      (key) =>
                        key.startsWith("col") &&
                        selectedIndent[key] !== null &&
                        selectedIndent[key] !== undefined &&
                        String(selectedIndent[key]).trim() !== "" &&
                        DISPLAY_COLUMNS.includes(
                          Number.parseInt(key.replace("col", ""))
                        )
                    )
                    .map((key) => {
                      const header = sheetHeaders.find((h) => h.id === key) || {
                        label: `Column ${key.replace("col", "")}`,
                      };
                      return (
                        <div key={key} className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">
                            {header.label}
                          </span>
                          <span className="text-base font-semibold text-gray-900">
                            {selectedIndent[key] || "—"}
                          </span>
                        </div>
                      );
                    })}
                </div>

                <div className="flex justify-end border-t pt-4">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 px-4 py-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default History;
