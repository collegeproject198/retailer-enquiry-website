// import React from "react";

// function TrackerDialog() {
//   return <div>TrackerDialog</div>;
// }

// export default TrackerDialog;
"use client";

import { useState } from "react";
import { SearchIcon, FilterIcon, Eye } from "lucide-react";

// Mock data for interaction history
const historyData = [
  {
    id: 1,
    date: "2023-04-18",
    uniqueCode: "DLR001",
    dealerName: "Sunrise Electronics",
    salesPerson: "Rahul Sharma",
    customerFeedback:
      "Interested in new product line. Requested catalog and pricing.",
    status: "In Progress",
    stage: "Needs Assessment",
    nextAction: "Send product catalog and pricing",
    nextCallDate: "2023-04-25",
    orderQty: "",
    orderedProducts: "",
    orderValue: "",
  },
  {
    id: 2,
    date: "2023-04-17",
    uniqueCode: "DLR002",
    dealerName: "Galaxy Appliances",
    salesPerson: "Priya Patel",
    customerFeedback: "Placed order for 50 units of Model X100.",
    status: "Completed",
    stage: "Closed Won",
    nextAction: "Follow up on delivery",
    nextCallDate: "2023-04-30",
    orderQty: "50",
    orderedProducts: "Model X100",
    orderValue: "₹75,000",
  },
  {
    id: 3,
    date: "2023-04-16",
    uniqueCode: "DLR003",
    dealerName: "Metro Retail Solutions",
    salesPerson: "Vikram Singh",
    customerFeedback:
      "Concerned about delivery timelines. Needs faster shipping.",
    status: "On Hold",
    stage: "Negotiation",
    nextAction: "Discuss with logistics team",
    nextCallDate: "2023-04-20",
    orderQty: "",
    orderedProducts: "",
    orderValue: "",
  },
  {
    id: 4,
    date: "2023-04-15",
    uniqueCode: "DLR004",
    dealerName: "Prime Distributors",
    salesPerson: "Ananya Desai",
    customerFeedback: "Requested bulk discount for upcoming order.",
    status: "In Progress",
    stage: "Proposal",
    nextAction: "Prepare discount proposal",
    nextCallDate: "2023-04-22",
    orderQty: "",
    orderedProducts: "",
    orderValue: "",
  },
  {
    id: 5,
    date: "2023-04-14",
    uniqueCode: "DLR005",
    dealerName: "Techno World",
    salesPerson: "Rajesh Kumar",
    customerFeedback:
      "Not interested in current offerings. Will reconsider in Q3.",
    status: "Cancelled",
    stage: "Closed Lost",
    nextAction: "Reconnect in Q3",
    nextCallDate: "2023-07-15",
    orderQty: "",
    orderedProducts: "",
    orderValue: "",
  },
  {
    id: 6,
    date: "2023-04-13",
    uniqueCode: "DLR006",
    dealerName: "Digital Hub",
    salesPerson: "Neha Gupta",
    customerFeedback:
      "Ordered 25 units of Model A200 and 15 units of Model B100.",
    status: "Completed",
    stage: "Closed Won",
    nextAction: "Delivery follow-up",
    nextCallDate: "2023-04-28",
    orderQty: "40",
    orderedProducts: "Model A200, Model B100",
    orderValue: "₹62,000",
  },
];

function HistoryDummy() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    uniqueCode: true,
    dealerName: true,
    salesPerson: true,
    status: true,
    stage: true,
    nextAction: true,
    nextCallDate: true,
    orderDetails: true,
  });

  const filteredData = historyData.filter(
    (item) =>
      (item.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.salesPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedDate || item.date === selectedDate)
  );

  function getStatusColor(status) {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "In Progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "On Hold":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }
  }

  const viewDetails = (record) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Interaction History
        </h1>
        <p className="text-muted-foreground">
          View history of all dealer interactions
        </p>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-pink-200">
        <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Dealer Interaction History
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete record of all dealer interactions and updates
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full sm:w-auto">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search interactions..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full sm:w-auto"
              >
                Clear date filter
              </button>
            )}
          </div>

          <div className="rounded-md border overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {visibleColumns.date && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                      Date
                    </th>
                  )}
                  {visibleColumns.uniqueCode && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                      Unique Code
                    </th>
                  )}
                  {visibleColumns.dealerName && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                      Dealer Name
                    </th>
                  )}
                  {visibleColumns.salesPerson && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                      Sales Person
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                      Status
                    </th>
                  )}
                  {visibleColumns.stage && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                      Stage
                    </th>
                  )}
                  {visibleColumns.nextAction && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                      Next Action
                    </th>
                  )}
                  {visibleColumns.nextCallDate && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                      Next Call Date
                    </th>
                  )}
                  {visibleColumns.orderDetails && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap">
                      Order Details
                    </th>
                  )}
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredData.length === 0 ? (
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td
                      colSpan={
                        Object.values(visibleColumns).filter(Boolean).length + 1
                      }
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center h-24"
                    >
                      No results found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {visibleColumns.date && (
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {item.date}
                        </td>
                      )}
                      {visibleColumns.uniqueCode && (
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
                          {item.uniqueCode}
                        </td>
                      )}
                      {visibleColumns.dealerName && (
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {item.dealerName}
                        </td>
                      )}
                      {visibleColumns.salesPerson && (
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {item.salesPerson}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.stage && (
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {item.stage}
                        </td>
                      )}
                      {visibleColumns.nextAction && (
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 max-w-xs truncate">
                          {item.nextAction}
                        </td>
                      )}
                      {visibleColumns.nextCallDate && (
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {item.nextCallDate}
                        </td>
                      )}
                      {visibleColumns.orderDetails && (
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {item.orderQty && (
                            <div className="text-xs">
                              <div>Qty: {item.orderQty}</div>
                              <div>Value: {item.orderValue}</div>
                            </div>
                          )}
                        </td>
                      )}
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                        <button
                          onClick={() => viewDetails(item)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
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

      {/* Detail Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                Interaction Details
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedRecord &&
                  `${selectedRecord.dealerName} - ${selectedRecord.date}`}
              </p>
            </div>

            {selectedRecord && (
              <div className="w-full">
                <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-2">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                      activeTab === "details"
                        ? "bg-background text-foreground shadow-sm"
                        : ""
                    }`}
                  >
                    Basic Details
                  </button>
                  <button
                    onClick={() => setActiveTab("feedback")}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                      activeTab === "feedback"
                        ? "bg-background text-foreground shadow-sm"
                        : ""
                    }`}
                  >
                    Feedback & Next Steps
                  </button>
                </div>

                {activeTab === "details" && (
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Unique Code
                        </h4>
                        <p className="text-base">{selectedRecord.uniqueCode}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Date
                        </h4>
                        <p className="text-base">{selectedRecord.date}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Dealer Name
                        </h4>
                        <p className="text-base">{selectedRecord.dealerName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Sales Person
                        </h4>
                        <p className="text-base">
                          {selectedRecord.salesPerson}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Status
                        </h4>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusColor(
                            selectedRecord.status
                          )}`}
                        >
                          {selectedRecord.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Stage
                        </h4>
                        <p className="text-base">{selectedRecord.stage}</p>
                      </div>
                    </div>

                    {selectedRecord.orderQty && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">
                          Order Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Quantity
                            </h4>
                            <p className="text-base">
                              {selectedRecord.orderQty}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Products
                            </h4>
                            <p className="text-base">
                              {selectedRecord.orderedProducts}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Value
                            </h4>
                            <p className="text-base">
                              {selectedRecord.orderValue}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "feedback" && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Customer Feedback
                      </h4>
                      <p className="text-base p-3 bg-muted rounded-md">
                        {selectedRecord.customerFeedback}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Next Action
                        </h4>
                        <p className="text-base">{selectedRecord.nextAction}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Next Call Date
                        </h4>
                        <p className="text-base">
                          {selectedRecord.nextCallDate}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <span className="sr-only">Close</span>✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryDummy;
