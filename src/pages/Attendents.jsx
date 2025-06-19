"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
// Using native JavaScript Date methods instead of date-fns
import AttendanceHistory from "../components/AttendanceHistory";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationData, setLocationData] = useState(null);

  // Helper function to format date to YYYY-MM-DD
  const formatDateInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Helper function to format date to DD/MM/YYYY
  const formatDateDDMMYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to format date and time to DD/MM/YYYY HH:MM:SS
  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Helper function to format date for display
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [formData, setFormData] = useState({
    status: "",
    startDate: formatDateInput(new Date()),
    endDate: "",
    reason: "",
  });

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw8__1g2ZzS5ChsMo1_eIsUdH-VP3Jd0QaBC2tTTGueSCkdoZsnIlJENIDdJpHo8bFWxw/exec";

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 p-4 rounded-md text-white z-50 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  // Function to get formatted address using reverse geocoding
  const getFormattedAddress = async (latitude, longitude) => {
    try {
      // Using a free geocoding service (Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        return data.display_name;
      } else {
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    } catch (error) {
      console.error("Error getting formatted address:", error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  // Function to get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

          // Get proper formatted address
          const formattedAddress = await getFormattedAddress(
            latitude,
            longitude
          );

          const locationInfo = {
            latitude,
            longitude,
            mapLink,
            formattedAddress,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy,
          };

          resolve(locationInfo);
        },
        (error) => {
          const errorMessages = {
            1: "Location permission denied. Please enable location services.",
            2: "Location information unavailable.",
            3: "Location request timed out.",
          };
          reject(
            new Error(errorMessages[error.code] || "An unknown error occurred.")
          );
        },
        options
      );
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.status) newErrors.status = "Status is required";
    if (formData.status === "Leave") {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.reason) newErrors.reason = "Reason is required for leave";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked!");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsGettingLocation(true);

    try {
      // Get current location for all statuses (IN/OUT/LEAVE)
      let currentLocation = null;
      try {
        currentLocation = await getCurrentLocation();
        console.log("Location captured:", currentLocation);
      } catch (locationError) {
        console.error("Location error:", locationError);
        showToast(locationError.message, "error");
        setIsSubmitting(false);
        setIsGettingLocation(false);
        return;
      }

      setIsGettingLocation(false);

      const currentDate = new Date();
      const timestamp = formatDateTime(currentDate);
      const dateOnly = formatDateDDMMYYYY(currentDate);

      let rowData = [];

      // Prepare data based on status
      if (formData.status === "IN" || formData.status === "OUT") {
        // For IN/OUT: Columns A,B,D,F,G,H,I
        rowData = [
          timestamp, // Column A - Timestamp
          dateOnly, // Column B - Date
          "", // Column C - Empty for IN/OUT
          formData.status, // Column D - Status
          "", // Column E - Empty for IN/OUT
          currentLocation.latitude, // Column F - Latitude
          currentLocation.longitude, // Column G - Longitude
          currentLocation.mapLink, // Column H - Map Link
          currentLocation.formattedAddress, // Column I - Formatted Address
        ];
      } else if (formData.status === "Leave") {
        // For LEAVE: Columns A,B,C,D,E,F,G,H,I
        // Convert start and end dates from YYYY-MM-DD to DD/MM/YYYY format
        const startDateFormatted = formData.startDate
          ? formatDateDDMMYYYY(new Date(formData.startDate + "T00:00:00"))
          : "";
        const endDateFormatted = formData.endDate
          ? formatDateDDMMYYYY(new Date(formData.endDate + "T00:00:00"))
          : "";

        rowData = [
          timestamp, // Column A - Timestamp
          startDateFormatted, // Column B - Start Date (DD/MM/YYYY)
          endDateFormatted, // Column C - End Date (DD/MM/YYYY)
          formData.status, // Column D - Status
          formData.reason, // Column E - Reason
          currentLocation.latitude, // Column F - Latitude
          currentLocation.longitude, // Column G - Longitude
          currentLocation.mapLink, // Column H - Map Link
          currentLocation.formattedAddress, // Column I - Formatted Address
        ];
      }

      console.log("Row data to be submitted:", rowData);

      const payload = {
        sheetName: "Attendance",
        action: "insert",
        rowData: JSON.stringify(rowData),
      };

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

      if (result && result.success === false) {
        throw new Error(result.error || "Failed to submit to Google Sheets");
      }

      showToast(`Your ${formData.status} has been recorded successfully!`);

      setAttendance((prev) => [
        ...prev,
        { ...formData, timestamp, location: currentLocation },
      ]);

      // Reset form
      setFormData({
        status: "",
        startDate: formatDateInput(new Date()),
        endDate: "",
        reason: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      showToast(
        `Error submitting attendance: ${error.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
      setIsGettingLocation(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-0 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="pb-3 text-3xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Attendance Management
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Mark your attendance with automatic location detection
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
            <div className="grid gap-6 lg:grid-cols-1">
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
            </div>

            {!showLeaveFields && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                <div className="text-sm font-semibold text-emerald-700 mb-2">
                  Current Date & Time
                </div>
                <div className="text-sm sm:text-2xl font-bold text-emerald-800">
                  {formatDateDisplay(new Date())}
                </div>
                {(formData.status === "IN" || formData.status === "OUT") && (
                  <div className="mt-3 text-sm text-emerald-600">
                    📍 Location will be automatically captured when you submit
                  </div>
                )}
              </div>
            )}

            {showLeaveFields && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-0 sm:p-6 border border-amber-100 mb-6">
                <div className="text-sm font-semibold text-amber-700 mb-2">
                  Leave Application
                </div>
                <div className="text-lg font-bold text-amber-800">
                  {formatDateDisplay(new Date())}
                </div>
                <div className="mt-3 text-sm text-amber-600">
                  📍 Current location will be captured for leave application
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
              className="w-full lg:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isSubmitting || isGettingLocation}
            >
              {isGettingLocation ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Getting Location...
                </span>
              ) : isSubmitting ? (
                showLeaveFields ? (
                  "Submitting Leave..."
                ) : (
                  "Marking Attendance..."
                )
              ) : showLeaveFields ? (
                "Submit Leave Request"
              ) : (
                "Mark Attendance"
              )}
            </button>
          </form>
        </div>
      </div>
      <AttendanceHistory />
    </div>
  );
};

export default Attendance;
