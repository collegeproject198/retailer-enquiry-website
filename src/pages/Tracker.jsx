"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

import { DownloadIcon, FilterIcon, SearchIcon, Plus, Eye } from "lucide-react";
import TrackerDialog from "../components/TrackerDialog";

const Tracker = () => {
  const [indents, setIndents] = useState([]);
  const [masterSheetData, setMasterSheetData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [col2Filter, setCol2Filter] = useState("");
  const [col4Filter, setCol4Filter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);

  const SPREADSHEET_ID = "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const DISPLAY_COLUMNS = [1, 4, 3, 9, 7];
  const trackerData = [
    { id: "col1", label: "Dealer Code" },
    { id: "col4", label: "District Name" },
    { id: "col3", label: "Sales Person Name" },
    { id: "col9", label: "Avg Qty" },
    { id: "col7", label: "Address" },
  ];

  const fetchSheetData = async (sheetName) => {
    console.log(`🔄 Fetching data from ${sheetName} sheet...`);
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${sheetName} data: ${response.status}`);
    }

    const text = await response.text();
    console.log(`Raw response text from ${sheetName}:`, text);
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error(
        `Invalid response format from ${sheetName} sheet. Could not find JSON boundaries.`
      );
    }

    const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));

    if (!data.table || !data.table.rows) {
      throw new Error(`No table data found in ${sheetName} sheet`);
    }
    console.log(`✅ ${sheetName} data loaded successfully`);
    return data;
  };

  const fetchTrackerData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [fmsData, masterData] = await Promise.all([
        fetchSheetData("FMS").catch((err) => {
          console.error("Error fetching FMS data:", err);
          throw new Error(`FMS sheet: ${err.message}`);
        }),
        fetchSheetData("Master").catch((err) => {
          console.error("Error fetching Master data:", err);
          throw new Error(`Master sheet: ${err.message}`);
        }),
      ]);

      const newHeaders = [];
      if (fmsData.table.cols) {
        fmsData.table.cols.forEach((col, index) => {
          const label = col.label || `Column ${index}`;
          if (DISPLAY_COLUMNS.includes(index)) {
            newHeaders.push({ id: `col${index}`, label });
          }
        });
      }
      setSheetHeaders(newHeaders);

      const processRows = (dataRows) => {
        return dataRows.slice(6).map((row, rowIndex) => {
          const itemObj = {
            _id: `${rowIndex}-${Math.random().toString(36).substr(2, 9)}`,
            _rowIndex: rowIndex + 7,
          };

          if (row.c) {
            row.c.forEach((cell, i) => {
              itemObj[`col${i}`] = cell?.v ?? cell?.f ?? "";
            });
          }

          return itemObj;
        });
      };

      const fmsItems = processRows(fmsData.table.rows);
      const masterItems = processRows(masterData.table.rows);

      // Filter out completely empty rows for FMS data
      const filteredFMSItems = fmsItems.filter((item) => {
        return DISPLAY_COLUMNS.some((colIndex) => {
          const value = item[`col${colIndex}`];
          return (
            value !== undefined && value !== null && String(value).trim() !== ""
          );
        });
      });

      // Log both datasets for debugging
      console.log("FMS Data:", filteredFMSItems);
      console.log("Master Data:", masterItems);

      setIndents(filteredFMSItems);
      setMasterSheetData(masterItems);

      toast.success(
        `${filteredFMSItems.length} FMS records and ${masterItems.length} Master records fetched!`,
        {
          duration: 3000,
          position: "top-right",
        }
      );
    } catch (err) {
      console.error("❌ Error fetching data:", err);
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
    fetchTrackerData();
  }, []);

  const filteredIndents = indents.filter((item) => {
    const term = searchTerm.toLowerCase();
    const col2Val = String(item.col2 || "").toLowerCase();
    const col4Val = String(item.col4 || "").toLowerCase();

    // Column O and P condition
    const colO = item.col14;
    const colP = item.col15;

    const isColOEmpty = !colO || String(colO).trim() === "";
    const isColPNotEmpty = colP && String(colP).trim() !== "";

    if (isColOEmpty && isColPNotEmpty) {
      return false;
    }

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

  const exportData = () => {
    try {
      const csvContent = [
        sheetHeaders.map((header) => header.label).join(","),
        ...filteredIndents.map((item) =>
          sheetHeaders
            .map((header) => {
              const value = item[header.id] || "";
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

  const refreshData = () => {
    fetchTrackerData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Tracker data...</p>
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
            onClick={fetchTrackerData}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  console.log(filteredIndents, masterSheetData, "filteredIndents");
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 p-3 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 px-2 sm:px-8 py-2 sm:py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Dealer Tracking
                  </h3>
                  <p className="text-green-50 text-lg">
                    Comprehensive view of all dealer interactions and follow-ups
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={refreshData}
                    className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <FilterIcon className="h-4 w-4" />
                    Refresh
                  </button>
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
            <div className="p-2 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="relative w-full max-w-md">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search dealers..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
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
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
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
                          No results found.
                        </td>
                      </tr>
                    ) : (
                      filteredIndents.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                        >
                          {sheetHeaders.map((header) => (
                            <td
                              key={header.id}
                              className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900"
                            >
                              {item?.[header.id] || "—"}
                            </td>
                          ))}
                          <td className="px-6 py-4 text-right">
                            <button
                              className="bg-gradient-to-r from-green-100 to-teal-100 text-green-700 border border-green-200 hover:from-green-200 hover:to-teal-200 font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-all duration-200"
                              onClick={() => {
                                setSelectedIndent(item);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" /> Update
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
        </div>
      </div>
      <TrackerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        dealerData={selectedIndent}
        masterData={masterSheetData}
      />
    </>
  );
};

export default Tracker;
