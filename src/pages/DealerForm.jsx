"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns"; // Import format from date-fns

function DealerForm() {
  const [formData, setFormData] = useState({
    dealerCode: "",
    stateName: "",
    districtName: "",
    salesPersonName: "",
    dealerName: "",
    aboutDealer: "",
    address: "",
    dealerSize: "",
    avgQty: "",
    contactNumber: "",
    emailAddress: "",
    dob: "", // Date of Birth
    anniversary: "", // Anniversary Date
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fetchedDealerSizes, setFetchedDealerSizes] = useState([]);
  const [isLoadingDealerSizes, setIsLoadingDealerSizes] = useState(true);
  const [errorDealerSizes, setErrorDealerSizes] = useState(null);

  const SPREADSHEET_ID_FOR_DEALER_SIZES =
    "1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0";
  const APPS_SCRIPT_URL_FOR_SUBMISSION =
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

  const fetchMasterDataForDealerSizes = async () => {
    setIsLoadingDealerSizes(true);
    setErrorDealerSizes(null);
    try {
      const GID = "1319416673";
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID_FOR_DEALER_SIZES}/gviz/tq?tqx=out:json&gid=${GID}`
      );

      if (!response.ok) throw new Error(`Failed to fetch MASTER data`);
      const text = await response.text();

      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));

      let masterItems = [];
      if (data.table.rows.length > 1) {
        masterItems = data.table.rows.slice(1).map((row) => {
          const itemObj = {};
          row.c.forEach((cell, i) => {
            itemObj[`col${i}`] = cell && cell.v !== null ? cell.v : "";
          });
          return itemObj;
        });
      }

      const sizes = new Set();
      masterItems.forEach((item) => {
        if (item.col0) {
          sizes.add(item.col0);
        }
      });
      setFetchedDealerSizes(Array.from(sizes));
    } catch (err) {
      console.error(`Error fetching MASTER data for dealer sizes:`, err);
      setErrorDealerSizes(`Failed to load dealer sizes: ${err.message}`);
    } finally {
      setIsLoadingDealerSizes(false);
    }
  };

  useEffect(() => {
    fetchMasterDataForDealerSizes();
  }, []);

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

    if (!formData.stateName.trim())
      newErrors.stateName = "State name is required";
    if (!formData.districtName.trim())
      newErrors.districtName = "District name is required";
    if (!formData.dealerCode.trim())
      newErrors.dealerCode = "Dealer Code is required";
    if (
      !formData.salesPersonName.trim() ||
      formData.salesPersonName.length < 2
    ) {
      newErrors.salesPersonName =
        "Sales person name must be at least 2 characters";
    }
    if (!formData.dealerName.trim() || formData.dealerName.length < 2) {
      newErrors.dealerName = "Dealer name must be at least 2 characters";
    }
    if (!formData.contactNumber.trim() || formData.contactNumber.length < 10) {
      newErrors.contactNumber = "Contact number must be at least 10 digits";
    }
    if (
      !formData.emailAddress.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)
    ) {
      newErrors.emailAddress = "Valid Email Address is required";
    }
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.anniversary)
      newErrors.anniversary = "Anniversary Date is required";
    if (!formData.aboutDealer.trim() || formData.aboutDealer.length < 10) {
      newErrors.aboutDealer = "About dealer must be at least 10 characters";
    }
    if (!formData.address.trim() || formData.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }
    if (!formData.dealerSize)
      newErrors.dealerSize = "Please select a dealer size";
    if (!formData.avgQty.trim())
      newErrors.avgQty = "Average quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitToGoogleSheets = async (sheetName, rowData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("sheetName", sheetName);
      formDataToSend.append("action", "insert");
      formDataToSend.append("rowData", JSON.stringify(rowData));

      const response = await fetch(APPS_SCRIPT_URL_FOR_SUBMISSION, {
        method: "POST",
        body: formDataToSend,
        mode: "no-cors",
      });

      if (response.type === "opaque") {
        console.log("Request sent with no-cors mode. Assuming success.");
        return { success: true };
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to submit to Google Sheets");
      }
      return result;
    } catch (error) {
      console.error("Google Sheets submission error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Format timestamp, DOB, and Anniversary
      const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const formattedDob = formData.dob
        ? format(new Date(formData.dob), "yyyy-MM-dd")
        : "";
      const formattedAnniversary = formData.anniversary
        ? format(new Date(formData.anniversary), "yyyy-MM-dd")
        : "";

      // IMPORTANT: Adjust the order of these values to match the columns in your "FMS" Google Sheet.
      const rowData = [
        timestamp, // Column A
        formData.dealerCode, // Column B
        formData.stateName, // Column C
        formData.districtName, // Column D
        formData.salesPersonName, // Column E
        formData.dealerName, // Column f
        formData.aboutDealer, // Column g
        formData.address, // Column h
        formData.dealerSize, // Column L
        formData.avgQty, // Column M
        formData.contactNumber, // Column N
        formData.emailAddress, // Column N
        formattedDob, // Column F
        formattedAnniversary, // Column G
      ];

      const targetSheetName = "FMS"; // Target sheet name is "FMS"

      console.log("Submitting data to Google Sheet:", rowData);
      await submitToGoogleSheets(targetSheetName, rowData);

      showToast("Dealer registered successfully!");

      setFormData({
        stateName: "",
        districtName: "",
        salesPersonName: "",
        dealerName: "",
        aboutDealer: "",
        address: "",
        dealerSize: "",
        avgQty: "",
        contactNumber: "",
        dealerCode: "",
        emailAddress: "",
        dob: "",
        anniversary: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      showToast(`Error submitting form: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Dealer Registration
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Enter dealer information and details to register a new dealer
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 px-8 py-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Dealer Information
            </h3>
            <p className="text-purple-50 text-lg">
              Fill in the details about the dealer and sales person
            </p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Location Information */}
              <div className="space-y-6">
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">
                    Location Information
                  </h4>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      State Name
                    </label>
                    <input
                      type="text"
                      name="stateName"
                      value={formData.stateName}
                      onChange={handleInputChange}
                      placeholder="Enter state name"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.stateName && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.stateName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      District Name
                    </label>
                    <input
                      type="text"
                      name="districtName"
                      value={formData.districtName}
                      onChange={handleInputChange}
                      placeholder="Enter district name"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.districtName && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.districtName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Dealer Code
                    </label>
                    <input
                      type="tel"
                      name="dealerCode"
                      value={formData.dealerCode}
                      onChange={handleInputChange}
                      placeholder="Enter Dealer Code "
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.dealerCode && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.dealerCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">
                    Personal Information
                  </h4>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Sales Person Name
                    </label>
                    <input
                      type="text"
                      name="salesPersonName"
                      value={formData.salesPersonName}
                      onChange={handleInputChange}
                      placeholder="Enter sales person name"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.salesPersonName && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.salesPersonName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Dealer Name
                    </label>
                    <input
                      type="text"
                      name="dealerName"
                      value={formData.dealerName}
                      onChange={handleInputChange}
                      placeholder="Enter dealer name"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.dealerName && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.dealerName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="Enter contact number"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.contactNumber && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.contactNumber}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      placeholder="Enter Email Address"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.emailAddress && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.emailAddress}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Date Of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      placeholder="Date Of Birth"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.dob && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.dob}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Anniversary
                    </label>
                    <input
                      type="date"
                      name="anniversary"
                      value={formData.anniversary}
                      onChange={handleInputChange}
                      placeholder="Anniversary Date"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                    />
                    {errors.anniversary && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.anniversary}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-6">
                <div className="border-l-4 border-indigo-500 pl-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">
                    Business Information
                  </h4>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      About Dealer
                    </label>
                    <textarea
                      name="aboutDealer"
                      value={formData.aboutDealer}
                      onChange={handleInputChange}
                      placeholder="Enter information about the dealer"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium min-h-24 resize-none"
                    />
                    {errors.aboutDealer && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.aboutDealer}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter dealer address"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium min-h-24 resize-none"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Dealer Size
                      </label>
                      <select
                        name="dealerSize"
                        value={formData.dealerSize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                      >
                        <option value="">Select dealer size</option>
                        {isLoadingDealerSizes ? (
                          <option disabled>Loading sizes...</option>
                        ) : errorDealerSizes ? (
                          <option disabled>{errorDealerSizes}</option>
                        ) : (
                          fetchedDealerSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))
                        )}
                      </select>
                      {errors.dealerSize && (
                        <p className="text-red-500 text-sm mt-2 font-medium">
                          {errors.dealerSize}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Average Quantity
                      </label>
                      <input
                        type="number"
                        name="avgQty"
                        value={formData.avgQty}
                        onChange={handleInputChange}
                        placeholder="Enter average quantity"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 font-medium"
                      />
                      {errors.avgQty && (
                        <p className="text-red-500 text-sm mt-2 font-medium">
                          {errors.avgQty}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full lg:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Registering Dealer..." : "Register Dealer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealerForm;
