"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function DummyTrackerDialog({
  isOpen,
  onClose,
  dealerData,
  masterData,
}) {
  const [activeTab, setActiveTab] = useState("interaction");
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamically derive statuses and stages from masterData
  const statuses = masterData
    ? [...new Set(masterData.map((item) => item.col1).filter(Boolean))]
    : [];
  const stages = masterData
    ? [...new Set(masterData.map((item) => item.col2).filter(Boolean))]
    : [];

  useEffect(() => {
    if (isOpen && dealerData) {
      setFormData({
        lastDateOfCall: dealerData.col5 || "",
        totalCall: dealerData.col6 || "",
        olderThen: dealerData.col7 || "",
        customerFeedback: dealerData.col8 || "",
        status: dealerData.col9 || "",
        stage: dealerData.col10 || "",
        nextAction: dealerData.col11 || "",
        nextCallDate: dealerData.col12 || "",
      });
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
      setActiveTab("interaction");
    }
  }, [isOpen, dealerData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerFeedback) {
      newErrors.customerFeedback = "Customer feedback is required.";
    }
    if (!formData.status) {
      newErrors.status = "Status is required.";
    }
    if (!formData.stage) {
      newErrors.stage = "Stage is required.";
    }
    if (!formData.nextAction) {
      newErrors.nextAction = "Next action is required.";
    }
    if (!formData.nextCallDate) {
      newErrors.nextCallDate = "Next call date is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.", {
        position: "top-right",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Submitting data:", formData);
      console.log("Master data available in dialog:", masterData);
      toast.success("Dealer updated successfully!", { position: "top-right" });
      onClose();
    } catch (error) {
      console.error("Error updating dealer:", error);
      toast.error("Failed to update dealer.", { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-800">
            {dealerData ? "Update Dealer Interaction" : "Add New Dealer"}
          </h2>
          <button
            onClick={onClose}
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
              </div>
            )}

            <div className="flex flex-col lg:flex-row justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
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
                    <span>{dealerData ? "Updating..." : "Adding..."}</span>
                  </div>
                ) : (
                  <span>{dealerData ? "Update Dealer" : "Add Dealer"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
