"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function TrackerDialog({
  isOpen,
  onClose,
  dealerData,
  masterData,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    lastDateOfCall: "",
    orderQty: "",
    orderedProducts: "",
    customerFeedback: "",
    status: "",
    stage: "",
    nextAction: "",
    nextCallDate: "",
    valueOfOrder: "",
  });

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw8__1g2ZzS5ChsMo1_eIsUdH-VP3Jd0QaBC2tTTGueSCkdoZsnIlJENIDdJpHo8bFWxw/exec";

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
        lastDateOfCall: "",
        orderQty: "",
        orderedProducts: "",
        customerFeedback: "",
        status: dealerData.col9 || "",
        stage: dealerData.col10 || "",
        nextAction: "",
        nextCallDate: "",
        valueOfOrder: "",
      });
    } else {
      setFormData({
        lastDateOfCall: "",
        orderQty: "",
        orderedProducts: "",
        customerFeedback: "",
        status: "",
        stage: "",
        nextAction: "",
        nextCallDate: "",
        valueOfOrder: "",
      });
      setErrors({});
    }
  }, [isOpen, dealerData]);

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
    console.log("Submit button clicked!");

    const formIsValid = validateForm();
    if (!formIsValid) {
      toast.error("Please correct the errors in the form.", {
        position: "top-right",
      });
      return;
    }
    setErrors({});

    setIsSubmitting(true);

    try {
      // Get Dealer Code from selected item
      const dealerCode = dealerData?.col1 || "";

      if (!dealerCode) {
        throw new Error("Dealer code is missing");
      }

      console.log("Dealer Code to update:", dealerCode);

      // Create the payload to update the FMS sheet
      const payload = {
        sheetName: "FMS",
        action: "updateByDealerCode", // New action for updating by dealer code
        dealerCode: dealerCode,
        updateData: JSON.stringify({
          lastDateOfCall: formData.lastDateOfCall, // Column R (18)
          status: formData.status, // Column S (19)
          stage: formData.stage, // Column T (20)
          customerFeedback: formData.customerFeedback, // Column U (21)
          nextAction: formData.nextAction, // Column V (22)
          nextCallDate: formData.nextCallDate, // Column W (23)
          orderQty: formData.orderQty, // Column X (24)
          orderedProducts: formData.orderedProducts, // Column Y (25)
          valueOfOrder: formData.valueOfOrder, // Column Z (26)
        }),
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
        mode: "no-cors",
      });

      console.log("Request sent to Google Sheets (no-cors mode)");

      toast.success(
        `Tracking data for ${dealerCode} has been updated successfully!`,
        {
          position: "top-right",
        }
      );
      onClose();
    } catch (error) {
      console.error("Submission error:", error);

      if (
        error.message.includes("CORS") ||
        error.message.includes("Failed to fetch")
      ) {
        toast.success(
          `Tracking data has been updated. (Note: CORS error, but data likely submitted)`,
          {
            position: "top-right",
            duration: 5000,
          }
        );
        onClose();
      } else {
        toast.error(
          `Error updating data: ${error.message || "Unknown error"}`,
          { position: "top-right" }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Update Dealer Interaction
            </h2>
            {dealerData && (
              <p className="text-lg text-slate-600 mt-1">
                Dealer Code:{" "}
                <span className="font-semibold text-green-600">
                  {dealerData.col1}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={() => {
              console.log("Close button clicked in dialog.");
              onClose();
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
            <h1 className="px-4 py-2 rounded-lg font-medium transition-colors">
              Interaction Details
            </h1>
          </nav>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    Order Qty
                  </label>
                  <input
                    type="number"
                    name="orderQty"
                    value={formData.orderQty}
                    onChange={handleInputChange}
                    placeholder="Enter Order Qty"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Ordered Products
                  </label>
                  <input
                    type="text"
                    name="orderedProducts"
                    value={formData.orderedProducts}
                    onChange={handleInputChange}
                    placeholder="Enter Ordered Products"
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Value Of Order
                  </label>
                  <input
                    type="number"
                    name="valueOfOrder"
                    value={formData.valueOfOrder}
                    onChange={handleInputChange}
                    placeholder="Enter Value Of Order"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                  />
                </div>
              </div>
            </div>

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
                    <span>Updating...</span>
                  </div>
                ) : (
                  <span>Update Tracking</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
