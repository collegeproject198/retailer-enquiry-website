"use client";

import { useState } from "react";
import {
  DownloadIcon,
  FilterIcon,
  SearchIcon,
  ArrowUpDown,
} from "lucide-react";

// Mock data for the reports
const reportData = [
  {
    uniqueCode: "DLR001",
    salesPersonName: "Rahul Sharma",
    dealerName: "Sunrise Electronics",
    district: "Mumbai",
    state: "Maharashtra",
    dealerSize: "Large",
    lastOrderDate: "2023-03-15",
    lastOrderBefore: "30 days",
    lastDateOfCall: "2023-04-10",
    lastCallBefore: "5 days",
    mtd: "₹45,000",
    ytd: "₹1,25,000",
    pendingAmount: "₹12,500",
    noOfBills: 5,
    status: "Active",
  },
  {
    uniqueCode: "DLR002",
    salesPersonName: "Priya Patel",
    dealerName: "Galaxy Appliances",
    district: "Ahmedabad",
    state: "Gujarat",
    dealerSize: "Medium",
    lastOrderDate: "2023-04-02",
    lastOrderBefore: "13 days",
    lastDateOfCall: "2023-04-12",
    lastCallBefore: "3 days",
    mtd: "₹32,000",
    ytd: "₹98,000",
    pendingAmount: "₹8,000",
    noOfBills: 3,
    status: "Active",
  },
  {
    uniqueCode: "DLR003",
    salesPersonName: "Vikram Singh",
    dealerName: "Metro Retail Solutions",
    district: "Bangalore",
    state: "Karnataka",
    dealerSize: "Enterprise",
    lastOrderDate: "2023-02-28",
    lastOrderBefore: "45 days",
    lastDateOfCall: "2023-04-05",
    lastCallBefore: "10 days",
    mtd: "₹0",
    ytd: "₹2,50,000",
    pendingAmount: "₹75,000",
    noOfBills: 8,
    status: "Inactive",
  },
  {
    uniqueCode: "DLR004",
    salesPersonName: "Ananya Desai",
    dealerName: "Prime Distributors",
    district: "Chennai",
    state: "Tamil Nadu",
    dealerSize: "Large",
    lastOrderDate: "2023-04-08",
    lastOrderBefore: "7 days",
    lastDateOfCall: "2023-04-15",
    lastCallBefore: "0 days",
    mtd: "₹65,000",
    ytd: "₹1,80,000",
    pendingAmount: "₹0",
    noOfBills: 6,
    status: "Active",
  },
  {
    uniqueCode: "DLR005",
    salesPersonName: "Rajesh Kumar",
    dealerName: "Techno World",
    district: "Delhi",
    state: "Delhi",
    dealerSize: "Small",
    lastOrderDate: "2023-01-20",
    lastOrderBefore: "85 days",
    lastDateOfCall: "2023-03-25",
    lastCallBefore: "21 days",
    mtd: "₹0",
    ytd: "₹45,000",
    pendingAmount: "₹15,000",
    noOfBills: 2,
    status: "Inactive",
  },
  {
    uniqueCode: "DLR006",
    salesPersonName: "Neha Gupta",
    dealerName: "Digital Hub",
    district: "Pune",
    state: "Maharashtra",
    dealerSize: "Medium",
    lastOrderDate: "2023-04-05",
    lastOrderBefore: "10 days",
    lastDateOfCall: "2023-04-08",
    lastCallBefore: "7 days",
    mtd: "₹28,000",
    ytd: "₹85,000",
    pendingAmount: "₹5,000",
    noOfBills: 4,
    status: "Active",
  },
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = reportData.filter(
    (item) =>
      item.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.salesPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-3">
            Performance Reports
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            View and analyze dealer performance data
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Dealer Performance Report
                </h3>
                <p className="text-orange-50 text-lg">
                  Comprehensive view of all dealers and their performance
                  metrics
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
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-700 font-medium"
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
                      <div className="flex items-center gap-2">
                        Unique Code
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        Sales Person
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        Dealer Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      District
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      State
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Dealer Size
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Last Order Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Last Order Before
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Last Date Of Call
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Last Call Before
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      MTD
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      YTD
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Pending Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      No Of Bills
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={15}
                        className="px-6 py-12 text-center text-slate-500 font-medium"
                      >
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr
                        key={item.uniqueCode}
                        className="hover:bg-slate-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          {item.uniqueCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.salesPersonName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                          {item.dealerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.state}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.dealerSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.lastOrderDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.lastOrderBefore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.lastDateOfCall}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.lastCallBefore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                          {item.mtd}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                          {item.ytd}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                          {item.pendingAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.noOfBills}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                              item.status === "Active"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {item.status}
                          </span>
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
  );
}
