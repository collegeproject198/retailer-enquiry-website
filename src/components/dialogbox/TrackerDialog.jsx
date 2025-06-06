import React, { useState } from "react";
import { CalendarIcon, MapPin } from "lucide-react";
import { format } from "date-fns";

// Mock data for attendance records
const attendanceRecords = [
  {
    id: 1,
    date: "2023-04-18",
    time: "09:15 AM",
    status: "IN",
    location: "Mumbai Office",
    salesPerson: "Rahul Sharma",
  },
  {
    id: 2,
    date: "2023-04-18",
    time: "06:30 PM",
    status: "OUT",
    location: "Mumbai Office",
    salesPerson: "Rahul Sharma",
  },
  {
    id: 3,
    date: "2023-04-17",
    time: "09:05 AM",
    status: "IN",
    location: "Client Site - Andheri",
    salesPerson: "Rahul Sharma",
  },
  {
    id: 4,
    date: "2023-04-17",
    time: "06:15 PM",
    status: "OUT",
    location: "Client Site - Andheri",
    salesPerson: "Rahul Sharma",
  },
  {
    id: 5,
    date: "2023-04-16",
    time: "00:00 AM",
    status: "Leave",
    location: "N/A",
    salesPerson: "Rahul Sharma",
    reason: "Personal emergency",
    endDate: "2023-04-16",
  },
];

// Predefined locations for quick selection
const predefinedLocations = [
  "Mumbai Office",
  "Delhi Office",
  "Bangalore Office",
  "Client Site - Andheri",
  "Client Site - Powai",
  "Field Work",
  "Work From Home",
];

export default function DummyAttendance() {
  const [formData, setFormData] = useState({
    status: "",
    location: "Mumbai Office",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    reason: "",
  });
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (formData.status === "Leave") {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.reason) newErrors.reason = "Reason is required for leave";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log(formData);

      let message = "";
      if (formData.status === "Leave") {
        message = "Leave request submitted successfully.";
      } else {
        message = `Marked ${formData.status} successfully at ${formData.location}.`;
      }

      alert(message);

      setFormData({
        status: "",
        location: "Mumbai Office",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: "",
        reason: "",
      });
      setUseCustomLocation(false);
    }
  };

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
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
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
              >
                {showLeaveFields ? "Submit Leave Request" : "Mark Attendance"}
              </button>
            </form>
          </div>
        </div>

        {/* Attendance History Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 px-8 py-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Attendance History
            </h3>
            <p className="text-slate-200 text-lg">
              View your recent attendance records
            </p>
          </div>
          <div className="p-8">
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {attendanceRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {record.date || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {record.time || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusColor(record.status || "")}>
                          {record.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {record.location || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium hidden md:table-cell">
                        {record.reason || "N/A"}
                        {record.endDate ? ` (Until ${record.endDate})` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
