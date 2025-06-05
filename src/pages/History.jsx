"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DownloadIcon, FilterIcon, SearchIcon, Eye } from "lucide-react";
import HistoryDummy from "../components/dialogbox/TrackerDialog";

const History = () => {
  const [indents, setIndents] = useState([]);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [error, setError] = useState(null);

  const SPREADSHEET_ID = "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const DISPLAY_COLUMNS = [2, 3, 4, 5, 6, 8, 11];

  // Function to fetch data only from FMS sheet
  const fetchFMSData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching data from FMS sheet...");

      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=FMSAttachment`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch FMSAttachment data: ${response.status}`
        );
      }

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Invalid response format from FMSAttachment sheet");
      }

      const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));

      if (!data.table || !data.table.rows) {
        throw new Error("No table data found in FMSAttachment sheet");
      }

      console.log("✅ FMSAttachment data loaded successfully");

      // Process FMS headers
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

      // Process FMS data rows
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
      console.log(
        `📊 Processed ${filteredItems.length} records from FMSAttachment sheet`
      );

      toast.success(
        `Loaded ${filteredItems.length} records from FMSAttachment sheet`,
        {
          duration: 3000,
          position: "top-right",
        }
      );
    } catch (err) {
      console.error("❌ Error fetching FMSAttachment data:", err);
      setError(err.message);
      toast.error(`Failed to load FMSAttachment data: ${err.message}`, {
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
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();

    return DISPLAY_COLUMNS.some((colIndex) => {
      const value = item[`col${colIndex}`];
      return value && value.toString().toLowerCase().includes(term);
    });
  });

  const refreshData = () => {
    console.log("🔄 Refreshing FMSAttachment data...");
    fetchFMSData();
  };

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
        `FMSAttachment_Data_${new Date().toISOString().split("T")[0]}.csv`
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
            Error Loading FMSAttachment Data
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
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full sm:w-auto">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filter
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
                          {searchTerm
                            ? "No results found for your search."
                            : "No data found in FMSAttachment sheet."}
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
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-slate-800">
                    FMSAttachment Record Details
                  </h2>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(selectedIndent)
                      .filter(
                        (key) => key.startsWith("col") && selectedIndent[key]
                      )
                      .map((key) => {
                        const header = sheetHeaders.find(
                          (h) => h.id === key
                        ) || {
                          label: `Column ${key.replace("col", "")}`,
                        };
                        return (
                          <div key={key} className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">
                              {header.label}
                            </label>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-slate-900 font-medium">
                                {selectedIndent[key] || "—"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="flex justify-end mt-8 pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
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
