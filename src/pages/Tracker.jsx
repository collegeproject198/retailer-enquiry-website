"use client";

import { useState, useEffect } from "react";

import { Toaster } from "react-hot-toast";
import { DownloadIcon, FilterIcon, SearchIcon, Plus, Eye } from "lucide-react";

const Tracker = () => {
  const [indents, setIndents] = useState([]);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [allSheetHeaders, setAllSheetHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [qtyNote, setQtyNote] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [stages, setStages] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [formData, setFormData] = useState({
    lastDateOfCall: "",
    totalCall: "",
    olderThen: "",
    customerFeedback: "",
    status: "",
    stage: "",
    nextAction: "",
    nextCallDate: "",
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("interaction");
  const [showOrderFields, setShowOrderFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const SPREADSHEET_ID = "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw8__1g2ZzS5ChsMo1_eIsUdH-VP3Jd0QaBC2tTTGueSCkdoZsnIlJENIDdJpHo8bFWxw/exec";

  const DISPLAY_COLUMNS = [2, 3, 4, 5, 6, 8, 11];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerFeedback) {
      newErrors.customerFeedback = "Customer Feedback is required.";
    }
    if (!formData.status) {
      newErrors.status = "Status is required.";
    }
    if (!formData.stage) {
      newErrors.stage = "Stage is required.";
    }
    if (!formData.nextAction) {
      newErrors.nextAction = "Next Action is required.";
    }
    if (!formData.nextCallDate) {
      newErrors.nextCallDate = "Next Call Date is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generic function to fetch raw table data from a sheet
  const fetchRawSheetData = async (sheetName) => {
    try {
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`
      );

      if (!response.ok) throw new Error(`Failed to fetch ${sheetName} data`);
      const text = await response.text();

      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      return json.table;
    } catch (err) {
      console.error(`Error fetching ${sheetName}:`, err);
      throw new Error(`Failed to load ${sheetName} data`);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fmsTable, dropdownTable, masterTable] = await Promise.all([
        fetchRawSheetData("FMS"),
        fetchRawSheetData("data fetch"),
        fetchRawSheetData("MASTER"),
      ]);
      console.log("FMS Table data loaded:", fmsTable);

      // Process FMS data
      const fmsHeaders = [];
      const allFmsHeaders = [];

      // First, log all columns for debugging
      console.log(
        "All columns:",
        fmsTable.cols.map((col, i) => `${i}: ${col.label}`)
      );

      fmsTable.cols.forEach((col, index) => {
        const label = col.label || `Column ${index}`;
        allFmsHeaders.push({ id: `col${index}`, label });
        if (DISPLAY_COLUMNS.includes(index)) {
          fmsHeaders.push({ id: `col${index}`, label });
        }
      });

      // Try without slice first to see all data
      const fmsItems = fmsTable.rows.map((row, rowIndex) => {
        const itemObj = {
          _id: `${rowIndex}-${Math.random().toString(36).substr(2, 9)}`,
          _rowIndex: rowIndex + 1,
        };

        // Log first row for debugging
        if (rowIndex === 0) {
          console.log(
            "First row data:",
            row.c.map((cell, i) => `${i}: ${cell?.v ?? cell?.f ?? "empty"}`)
          );
        }

        row.c.forEach((cell, i) => {
          itemObj[`col${i}`] = cell?.v ?? cell?.f ?? "";
        });

        return itemObj;
      });

      setIndents(fmsItems);
      setSheetHeaders(fmsHeaders);
      setAllSheetHeaders(allFmsHeaders);
      console.log("Processed FMS items:", fmsItems.slice(0, 3));

      // Process Master data (starts from row 1, 1-indexed row 2)
      const masterItems = masterTable.rows.slice(1).map((row, rowIndex) => {
        const itemObj = {
          _id: Math.random().toString(36).substring(2),
          _rowIndex: rowIndex + 2, // 1-indexed row in Google Sheet
        };
        row.c.forEach((cell, i) => {
          itemObj[`col${i}`] = cell?.v ?? "";
        });
        return itemObj;
      });
      setMasterData(masterItems);
      console.log("Master data loaded:", masterItems.slice(0, 3));

      // Extract stages from masterData for the "Select stage" dropdown (Column C is col2)
      const masterStages = masterItems
        .map((item) => item.col2)
        .filter((value) => value);
      setStages(masterStages);
      console.log("Stages from Master data (col C):", masterStages);

      // Extract statuses from masterData for the "Select status" dropdown (Column D is col3)
      const masterStatuses = masterItems
        .map((item) => item.col3)
        .filter((value) => value);
      setStatuses(masterStatuses);
      console.log("Statuses from Master data (col D):", masterStatuses);
    } catch (err) {
      setError(err.message);
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (isDialogOpen && selectedIndent) {
      console.log("Selected indent for update:", selectedIndent);
      setFormData({
        lastDateOfCall: selectedIndent?.col13 || "",
        totalCall: selectedIndent?.col14 || "",
        olderThen: selectedIndent?.col15 || "",
        customerFeedback: selectedIndent?.col16 || "",
        status: selectedIndent?.col17 || "",
        stage: selectedIndent?.col18 || "",
        nextAction: selectedIndent?.col19 || "",
        nextCallDate: selectedIndent?.col20 || "",
      });
      setShowOrderFields(selectedIndent?.col17 === "Order Placed");
    } else if (isAddDialogOpen) {
      setFormData({
        lastDateOfCall: "",
        totalCall: "",
        olderThen: "",
        customerFeedback: "",
        status: "",
        stage: "",
        nextAction: "",
        nextCallDate: "",
      });
      setShowOrderFields(false);
    } else {
      setFormData({
        lastDateOfCall: "",
        totalCall: "",
        olderThen: "",
        customerFeedback: "",
        status: "",
        stage: "",
        nextAction: "",
        nextCallDate: "",
      });
      setErrors({});
    }
  }, [isDialogOpen, isAddDialogOpen, selectedIndent]);

  const handleStatusChange = async () => {
    if (!validateForm()) {
      Toaster.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    const currentData = selectedIndent;

    try {
      console.log("🚀 Starting form submission process...");
      console.log("📝 Form data being submitted:", formData);

      const action = isAddDialogOpen ? "add" : "update";
      const rowIndex = isAddDialogOpen ? "" : currentData?._rowIndex;
      console.log("🔄 Action:", action, "Row Index:", rowIndex);

      const updateDataArray = Array(22).fill("");

      if (action === "update") {
        allSheetHeaders.forEach((header) => {
          const colIndex = Number.parseInt(header.id.replace("col", ""));
          if (currentData?.[header.id] !== undefined) {
            updateDataArray[colIndex] = currentData?.[header.id];
          }
        });
      }

      // Map form data to specific columns
      updateDataArray[13] = formData.lastDateOfCall;
      updateDataArray[14] = formData.totalCall;
      updateDataArray[15] = formData.olderThen;
      updateDataArray[16] = formData.customerFeedback;
      updateDataArray[17] = formData.status;
      updateDataArray[18] = formData.stage;
      updateDataArray[19] = formData.nextAction;
      updateDataArray[20] = formData.nextCallDate;

      // Add current timestamp
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(
        2,
        "0"
      )}/${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}/${today.getFullYear()}`;
      updateDataArray[21] = formattedDate;

      console.log("📊 Data array to be sent:", updateDataArray);
      console.log("🌐 Sending request to:", SCRIPT_URL);

      // Prepare request body for Google Apps Script
      const requestBody = new URLSearchParams({
        action: action,
        sheetName: "Tracking History", // Explicitly using "Tracking History" sheet
        rowIndex: rowIndex.toString(),
        rowData: JSON.stringify(updateDataArray),
      });

      console.log("📤 Request body details:", {
        action: action,
        sheetName: "Tracking History",
        rowIndex: rowIndex.toString(),
        rowDataLength: updateDataArray.length,
        formDataMapped: {
          col13: updateDataArray[13], // lastDateOfCall
          col14: updateDataArray[14], // totalCall
          col15: updateDataArray[15], // olderThen
          col16: updateDataArray[16], // customerFeedback
          col17: updateDataArray[17], // status
          col18: updateDataArray[18], // stage
          col19: updateDataArray[19], // nextAction
          col20: updateDataArray[20], // timestamp
        },
      });

      // Send request to Google Apps Script
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      });

      console.log("✅ Response received (no-cors mode):", response);
      console.log("📋 Request sent successfully to Tracking History sheet");

      // Show success Toaster notification
      Toaster.success(
        `🎉 Dealer ${
          action === "add" ? "added" : "updated"
        } successfully in Tracking History sheet!`,
        {
          duration: 4000,
          position: "top-right",
        }
      );

      // Close dialog and reset form
      setIsDialogOpen(false);
      setIsAddDialogOpen(false);
      setSelectedIndent(null);
      setQtyNote("");

      console.log("⏳ Waiting 2 seconds before reloading data...");
      setTimeout(() => {
        console.log("🔄 Reloading data from sheets...");
        loadAllData();
      }, 2000);
    } catch (error) {
      const action = isAddDialogOpen ? "adding" : "updating";
      console.error(`❌ Error ${action} dealer data:`, error);
      Toaster.error(
        `Failed to ${action.slice(0, -3)} dealer data. Please try again.`,
        {
          duration: 4000,
          position: "top-right",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Form submitted with data:", formData);
    console.log("🎯 Submitting to Tracking History sheet via:", SCRIPT_URL);
    await handleStatusChange();
  };

  const filteredIndents = indents.filter((item) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();

    return DISPLAY_COLUMNS.some((colIndex) => {
      const value = item?.[`col${colIndex}`];
      return value && value.toString().toLowerCase().includes(term);
    });
  });

  const refreshData = () => {
    console.log("🔄 Refreshing data...");
    loadAllData();
    Toaster.success("Data refreshed from Google Sheet", {
      duration: 3000,
      position: "top-right",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">Error: {error}</p>
          <button
            onClick={loadAllData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {" "}
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                Dealer Tracker
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Track and update dealer interactions
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddDialogOpen(true);
                setIsDialogOpen(true);
                setSelectedIndent(null);
                console.log("➕ Opening add dealer dialog");
              }}
              className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 hover:from-green-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <Plus className="h-5 w-5" /> Add New Dealer
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Dealer Tracking
                  </h3>
                  <p className="text-green-50 text-lg">
                    Comprehensive view of all dealer interactions and follow-ups
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={refreshData}
                    className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <FilterIcon className="h-4 w-4" />
                    Refresh
                  </button>
                  <button className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2">
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
                      {sheetHeaders.map((header) => (
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
                                console.log(
                                  "✏️ Selected item for update:",
                                  item
                                );
                                setSelectedIndent(item);
                                setIsDialogOpen(true);
                                setQtyNote(item?.col7?.toString() || "");
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

          {/* Dealer Interaction Dialog */}
          {(isDialogOpen || isAddDialogOpen) && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-slate-800">
                    {selectedIndent
                      ? "Update Dealer Interaction"
                      : "Add New Dealer"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsDialogOpen(false);
                      setIsAddDialogOpen(false);
                    }}
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
                <div className="px-8 py-4 border-b border-slate-200">
                  <nav className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab("interaction")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === "interaction"
                          ? "bg-green-100 text-green-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Interaction Details
                    </button>
                  </nav>
                </div>
                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === "interaction" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                              Last Date Of Call
                            </label>
                            <input
                              type="date"
                              name="lastDateOfCall"
                              value={formData.lastDateOfCall}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                              Total Call
                            </label>
                            <input
                              type="number"
                              name="totalCall"
                              value={formData.totalCall}
                              onChange={handleInputChange}
                              placeholder="Enter total calls"
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                              Older Then
                            </label>
                            <input
                              type="text"
                              name="olderThen"
                              value={formData.olderThen}
                              onChange={handleInputChange}
                              placeholder="Enter days"
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Customer Feedback
                          </label>
                          <textarea
                            name="customerFeedback"
                            value={formData.customerFeedback}
                            onChange={handleInputChange}
                            placeholder="Enter customer feedback"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium min-h-24 resize-none"
                          />
                          {errors.customerFeedback && (
                            <p className="text-red-500 text-sm mt-2 font-medium">
                              {errors.customerFeedback}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                              Status
                            </label>
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                            >
                              <option value="">Select status</option>
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            {errors.status && (
                              <p className="text-red-500 text-sm mt-2 font-medium">
                                {errors.status}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                              Stage
                            </label>
                            <select
                              name="stage"
                              value={formData.stage}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                            >
                              <option value="">Select stage</option>
                              {stages.map((stage) => (
                                <option key={stage} value={stage}>
                                  {stage}
                                </option>
                              ))}
                            </select>
                            {errors.stage && (
                              <p className="text-red-500 text-sm mt-2 font-medium">
                                {errors.stage}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Next Action
                          </label>
                          <input
                            type="text"
                            name="nextAction"
                            value={formData.nextAction}
                            onChange={handleInputChange}
                            placeholder="Enter next action"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
                          {errors.nextAction && (
                            <p className="text-red-500 text-sm mt-2 font-medium">
                              {errors.nextAction}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Next Date Of Call
                          </label>
                          <input
                            type="date"
                            name="nextCallDate"
                            value={formData.nextCallDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
                          {errors.nextCallDate && (
                            <p className="text-red-500 text-sm mt-2 font-medium">
                              {errors.nextCallDate}
                            </p>
                          )}
                        </div>

                        {showOrderFields && (
                          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                            <p className="text-sm text-green-700 font-medium">
                              Order details available. Click the "Order Details"
                              tab to fill them.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row justify-end gap-4 pt-6 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setIsAddDialogOpen(false);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 hover:from-green-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>
                              {selectedIndent ? "Updating..." : "Adding..."}
                            </span>
                          </div>
                        ) : (
                          <span>
                            {selectedIndent ? "Update Dealer" : "Add Dealer"}
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Tracker;
