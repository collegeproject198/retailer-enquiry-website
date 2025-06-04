import React, { useState } from "react";
import {
  DownloadIcon,
  FilterIcon,
  SearchIcon,
  ChevronDown,
  Plus,
  Eye,
} from "lucide-react";

const statuses = ["New", "In Progress", "Completed", "On Hold", "Cancelled"];
const stages = [
  "Initial Contact",
  "Needs Assessment",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];
const states = ["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Delhi"];
const districts = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
  Delhi: [
    "New Delhi",
    "North Delhi",
    "South Delhi",
    "East Delhi",
    "West Delhi",
  ],
};
const dealerSizes = ["Small", "Medium", "Large", "Enterprise"];

// Mock data for the tracker
const trackerData = [
  {
    uniqueCode: "DLR001",
    stateName: "Maharashtra",
    districtName: "Mumbai",
    salesPersonName: "Rahul Sharma",
    dealerName: "Sunrise Electronics",
    aboutDealer: "Premium electronics retailer with 5 years in business",
    address: "123 Main St, Mumbai",
    dealerSize: "Large",
    avgQty: "500",
    contactNumber: "9876543210",
    emailAddress: "rahul.sharma@example.com",
    dateOfBirth: "1990-05-15",
    anniversary: "2022-11-20",
    lastDateOfCall: "2023-04-10",
    customerFeedback:
      "Interested in new product line. Requested catalog and pricing.",
    status: "In Progress",
    stage: "Needs Assessment",
    nextAction: "Send product catalog and pricing",
    nextCallDate: "2023-04-25",
    orderQty: "",
    orderedProducts: "",
    orderValue: "",
    totalCall: "12",
    olderThen: "5 days",
  },
  {
    uniqueCode: "DLR002",
    stateName: "Gujarat",
    districtName: "Ahmedabad",
    salesPersonName: "Priya Patel",
    dealerName: "Galaxy Appliances",
    aboutDealer: "Home appliances dealer with strong market presence",
    address: "456 Market Rd, Ahmedabad",
    dealerSize: "Medium",
    avgQty: "300",
    contactNumber: "8765432109",
    emailAddress: "priya.patel@example.com",
    dateOfBirth: "1988-08-22",
    anniversary: "2021-06-10",
    lastDateOfCall: "2023-04-12",
    customerFeedback: "Placed order for 50 units of Model X100.",
    status: "Completed",
    stage: "Closed Won",
    nextAction: "Follow up on delivery",
    nextCallDate: "2023-04-30",
    orderQty: "50",
    orderedProducts: "Model X100",
    orderValue: "₹75,000",
    totalCall: "8",
    olderThen: "3 days",
  },
  {
    uniqueCode: "DLR003",
    stateName: "Karnataka",
    districtName: "Bangalore",
    salesPersonName: "Vikram Singh",
    dealerName: "Metro Retail Solutions",
    aboutDealer: "Large retail chain with multiple locations",
    address: "789 Tech Park, Bangalore",
    dealerSize: "Enterprise",
    avgQty: "1200",
    contactNumber: "7654321098",
    emailAddress: "vikram.singh@example.com",
    dateOfBirth: "1975-03-10",
    anniversary: "2020-09-15",
    lastDateOfCall: "2023-04-05",
    customerFeedback:
      "Concerned about delivery timelines. Needs faster shipping.",
    status: "On Hold",
    stage: "Negotiation",
    nextAction: "Discuss with logistics team",
    nextCallDate: "2023-04-20",
    orderQty: "",
    orderedProducts: "",
    orderValue: "",
    totalCall: "15",
    olderThen: "10 days",
  },
];

export default function TrackerDialog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    uniqueCode: "",
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
    dateOfBirth: "",
    anniversary: "",
    lastDateOfCall: "",
    customerFeedback: "",
    status: "",
    stage: "",
    nextAction: "",
    nextCallDate: "",
    orderQty: "",
    orderedProducts: "",
    orderValue: "",
    totalCall: "",
    olderThen: "",
  });
  const [errors, setErrors] = useState({});

  const filteredData = trackerData.filter(
    (item) =>
      item.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.salesPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleStateChange = (e) => {
    const state = e.target.value;
    setFormData((prev) => ({
      ...prev,
      stateName: state,
      districtName: "",
    }));
  };

  const handleRowClick = (dealer) => {
    setSelectedDealer(dealer.uniqueCode);
    setFormData({
      uniqueCode: dealer.uniqueCode,
      stateName: dealer.stateName,
      districtName: dealer.districtName,
      salesPersonName: dealer.salesPersonName,
      dealerName: dealer.dealerName,
      aboutDealer: dealer.aboutDealer,
      address: dealer.address,
      dealerSize: dealer.dealerSize,
      avgQty: dealer.avgQty,
      contactNumber: dealer.contactNumber,
      emailAddress: dealer.emailAddress,
      dateOfBirth: dealer.dateOfBirth,
      anniversary: dealer.anniversary,
      lastDateOfCall: dealer.lastDateOfCall,
      customerFeedback: dealer.customerFeedback || "",
      status: dealer.status || "",
      stage: dealer.stage || "",
      nextAction: dealer.nextAction || "",
      nextCallDate: dealer.nextCallDate,
      orderQty: dealer.orderQty || "",
      orderedProducts: dealer.orderedProducts || "",
      orderValue: dealer.orderValue || "",
      totalCall: dealer.totalCall || "",
      olderThen: dealer.olderThen || "",
    });
    setIsDialogOpen(true);
    setActiveTab("basic");
  };

  const handleAddNew = () => {
    setSelectedDealer(null);
    setFormData({
      uniqueCode: `DLR${Math.floor(1000 + Math.random() * 9000)}`,
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
      dateOfBirth: "",
      anniversary: "",
      lastDateOfCall: "",
      customerFeedback: "",
      status: "",
      stage: "",
      nextAction: "",
      nextCallDate: "",
      orderQty: "",
      orderedProducts: "",
      orderValue: "",
      totalCall: "",
      olderThen: "",
    });
    setIsDialogOpen(true);
    setActiveTab("basic");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerFeedback || formData.customerFeedback.length < 5) {
      newErrors.customerFeedback =
        "Customer feedback must be at least 5 characters";
    }
    if (!formData.status) newErrors.status = "Please select a status";
    if (!formData.stage) newErrors.stage = "Please select a stage";
    if (!formData.nextAction || formData.nextAction.length < 5) {
      newErrors.nextAction = "Next action must be at least 5 characters";
    }
    if (!formData.nextCallDate) newErrors.nextCallDate = "Please select a date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log(formData);
      alert("Dealer tracking information has been updated successfully.");
      setFormData({
        uniqueCode: "",
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
        dateOfBirth: "",
        anniversary: "",
        lastDateOfCall: "",
        customerFeedback: "",
        status: "",
        stage: "",
        nextAction: "",
        nextCallDate: "",
        orderQty: "",
        orderedProducts: "",
        orderValue: "",
        totalCall: "",
        olderThen: "",
      });
      setIsDialogOpen(false);
      setSelectedDealer(null);
    }
  };

  function getStatusColor(status) {
    switch (status) {
      case "New":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200";
      case "In Progress":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200";
      case "Completed":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "On Hold":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200";
      case "Cancelled":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200";
      default:
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200";
    }
  }

  const showOrderFields =
    formData.status === "Completed" && formData.stage === "Closed Won";

  return (
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
            onClick={handleAddNew}
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
                <button className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Filter
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Dealer Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      State Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      District Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Sales Person Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Dealer Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Dealer Size
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Last Date Of Call
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Customer Feedback
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Stage
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Next Action
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Next Date Of Call
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={13}
                        className="px-6 py-12 text-center text-slate-500 font-medium"
                      >
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr
                        key={item.uniqueCode}
                        className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          {item.uniqueCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.stateName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.districtName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.salesPersonName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                          {item.dealerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.dealerSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.lastDateOfCall}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium max-w-xs truncate">
                          {item.customerFeedback}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusColor(item.status)}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.stage}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium max-w-xs truncate">
                          {item.nextAction}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.nextCallDate}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="bg-gradient-to-r from-green-100 to-teal-100 text-green-700 border border-green-200 hover:from-green-200 hover:to-teal-200 font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-all duration-200"
                            onClick={() => handleRowClick(item)}
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
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedDealer
                    ? "Update Dealer Interaction"
                    : "Add New Dealer"}
                </h2>
                <p className="text-green-50 text-lg">
                  {selectedDealer
                    ? `Updating information for dealer ${selectedDealer}`
                    : "Enter new dealer information"}
                </p>
              </div>

              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 p-2 rounded-xl">
                  <button
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === "basic"
                        ? "bg-white text-green-700 shadow-md border border-green-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                    onClick={() => setActiveTab("basic")}
                  >
                    Basic Info
                  </button>
                  <button
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === "interaction"
                        ? "bg-white text-green-700 shadow-md border border-green-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                    onClick={() => setActiveTab("interaction")}
                  >
                    Interaction
                  </button>
                  <button
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === "order"
                        ? "bg-white text-green-700 shadow-md border border-green-200"
                        : showOrderFields
                        ? "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                        : "opacity-50 cursor-not-allowed text-slate-400"
                    }`}
                    onClick={() => showOrderFields && setActiveTab("order")}
                    disabled={!showOrderFields}
                  >
                    Order Details
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {activeTab === "basic" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Dealer Code
                          </label>
                          <input
                            type="text"
                            name="uniqueCode"
                            value={formData.uniqueCode}
                            readOnly
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-slate-700 font-medium"
                          />
                        </div>

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
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            State Name
                          </label>
                          <select
                            name="stateName"
                            value={formData.stateName}
                            onChange={handleStateChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          >
                            <option value="">Select state</option>
                            {states.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            District Name
                          </label>
                          <select
                            name="districtName"
                            value={formData.districtName}
                            onChange={handleInputChange}
                            disabled={!formData.stateName}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            <option value="">Select district</option>
                            {formData.stateName &&
                              districts[formData.stateName]?.map((district) => (
                                <option key={district} value={district}>
                                  {district}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
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
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          About Dealer
                        </label>
                        <textarea
                          name="aboutDealer"
                          value={formData.aboutDealer}
                          onChange={handleInputChange}
                          placeholder="Enter information about the dealer"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium min-h-24 resize-none"
                        />
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
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium min-h-24 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Dealer Size
                          </label>
                          <select
                            name="dealerSize"
                            value={formData.dealerSize}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          >
                            <option value="">Select dealer size</option>
                            {dealerSizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
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
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="emailAddress"
                            value={formData.emailAddress}
                            onChange={handleInputChange}
                            placeholder="Enter email address"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Date Of Birth
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
                        </div>
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
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                        />
                      </div>
                    </div>
                  )}

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

                  {activeTab === "order" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Order Qty
                          </label>
                          <input
                            type="number"
                            name="orderQty"
                            value={formData.orderQty}
                            onChange={handleInputChange}
                            placeholder="Enter quantity"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Value Of Order
                          </label>
                          <input
                            type="number"
                            name="orderValue"
                            value={formData.orderValue}
                            onChange={handleInputChange}
                            placeholder="Enter value"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                          />
                        </div>
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
                          placeholder="Enter products"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row justify-end gap-4 pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 hover:from-green-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {selectedDealer ? "Update" : "Add"} Dealer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
