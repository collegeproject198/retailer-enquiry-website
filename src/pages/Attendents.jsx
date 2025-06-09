"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { format } from "date-fns";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const predefinedLocations = [
    "Mumbai Office",
    "Delhi Office",
    "Bangalore Office",
    "Client Site - Andheri",
    "Client Site - Powai",
    "Field Work",
    "Work From Home",
  ];
  const [formData, setFormData] = useState({
    status: "",
    location: "Mumbai Office",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    reason: "",
  });

  // IMPORTANT: Ensure this URL is the *correct and currently deployed* URL for your Google Apps Script web app.
  // If you redeploy your script, this URL might change.
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw8__1g2ZzS5ChsMo1_eIsUdH-VP3Jd0QaBC2tTTGueSCkdoZsnIlJENIDdJpHo8bFWxw/exec";

  useEffect(() => {
    setInventory(predefinedLocations);
  }, []);

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 p-4 rounded-md text-white z-50 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (formData.status === "Leave") {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.reason) newErrors.reason = "Reason is required for leave";
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked!");

    const formIsValid = validateForm();
    if (!formIsValid) {
      setErrors(validateForm());
      return;
    }
    setErrors({});

    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();

      const rowData = [
        timestamp,
        formData.startDate,
        formData.endDate,
        formData.status,
        formData.location,
        formData.reason,
      ];

      console.log("Row data to be submitted:", rowData);

      // --- Google Sheets submission logic moved here ---
      const payload = {
        sheetName: "Attendance", // Ensure this matches your sheet name
        action: "insert",
        rowData: JSON.stringify(rowData), // Use the rowData prepared above
      };

      console.log("--- Data being sent to Google Sheets ---");
      console.log(payload);
      console.log("---------------------------------------");

      const urlEncodedData = new URLSearchParams(payload);

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlEncodedData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `HTTP error! Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error(
          `Server responded with status ${response.status}: ${
            errorText || response.statusText || "Unknown error"
          }`
        );
      }

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const rawResponseText = await response.text();
        console.warn(
          "Received non-JSON response from Google Apps Script:",
          rawResponseText
        );
        result = {
          success: true,
          message: "Submission successful, non-JSON response received.",
        };
      }

      console.log("Google Sheets submission response:", result);

      if (!result.success) {
        throw new Error(result.error || "Failed to submit to Google Sheets");
      }
      // --- End of Google Sheets submission logic ---

      showToast(`Your ${formData.status} has been recorded.`);

      setAttendance((prev) => [...prev, { ...formData, timestamp }]);

      setFormData({
        status: "",
        location: "Mumbai Office",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: "",
        reason: "",
      });
      setUseCustomLocation(false);
    } catch (error) {
      console.error("Submission error:", error);
      showToast(
        `Error submitting attendance: ${error.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const showLeaveFields = formData.status === "Leave";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Attendance Management
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Mark your attendance and manage your work schedule
          </p>
        </div>

        {/* Mark Attendance Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Mark Attendance
            </h3>
            <p className="text-emerald-50 text-lg">
              Record your daily attendance or apply for leave
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            {" "}
            {/* Added p-8 for padding */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-slate-700 font-medium"
                >
                  <option value="">Select status</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="Leave">Leave</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-2 font-medium">
                    {errors.status}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Location
                </label>
                {useCustomLocation ? (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter your location"
                      className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    <button
                      type="button"
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all duration-200 text-slate-600 hover:text-slate-700"
                      onClick={() => setUseCustomLocation(false)}
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={showLeaveFields}
                      className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-slate-700 font-medium disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      {predefinedLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all duration-200 text-slate-600 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setUseCustomLocation(true)}
                      disabled={showLeaveFields}
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div>
                )}
                {errors.location && (
                  <p className="text-red-500 text-sm mt-2 font-medium">
                    {errors.location}
                  </p>
                )}
              </div>
            </div>
            {!showLeaveFields && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                <div className="text-sm font-semibold text-emerald-700 mb-2">
                  Current Date & Time
                </div>
                <div className="text-2xl font-bold text-emerald-800">
                  {format(new Date(), "PPP p")}
                </div>
              </div>
            )}
            {showLeaveFields && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Enter reason for leave"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-slate-700 font-medium min-h-32 resize-none"
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm mt-2 font-medium">
                      {errors.reason}
                    </p>
                  )}
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full lg:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? showLeaveFields
                  ? "Submitting Leave..."
                  : "Marking Attendance..."
                : showLeaveFields
                ? "Submit Leave Request"
                : "Mark Attendance"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
