"use client";

import { useState, useEffect } from "react";

const Attendance = () => {
  const [indents, setIndents] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [indentItems, setIndentItems] = useState([
    {
      id: 1,
      productName: "",
      qty: "",
      uom: "",
      specifications: "",
      priority: "Normal",
      availableQty: "0",
    },
  ]);
  const [formData, setFormData] = useState({
    indenterName: "",
    department: "",
    areaOfUse: "",
    groupHead: "",
    approvedBy: "",
    indentClarification: "",
    attachment: null,
    indentStatus: "Purchase", // New field for indent status
  });

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzdWFtY2H_DBcs26kHp3wPLw_z2G0stPoVb01ohE7l2UKaXKHktPgFL0eF1t7Q3aBX2FA/exec";
  const DRIVE_FOLDER_ID = "19KfXUlyohbh_dYkbjB9E0Hv_VdY4MZi9";

  useEffect(() => {
    // Load existing indents and inventory from memory
    const storedIndents = [];
    const storedInventory = [
      { productName: "Laptop", quantity: "10", uom: "Pcs" },
      { productName: "Mouse", quantity: "25", uom: "Pcs" },
      { productName: "Keyboard", quantity: "15", uom: "Pcs" },
      { productName: "Paper", quantity: "100", uom: "Sheets" },
    ];
    setIndents(storedIndents);
    setInventory(storedInventory);
  }, []);

  const showToast = (message, type = "success") => {
    // Simple toast notification
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 p-4 rounded-md text-white z-50 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.indenterName.trim()) {
      showToast("Indenter Name is required", "error");
      return false;
    }
    if (!formData.department.trim()) {
      showToast("Department is required", "error");
      return false;
    }
    if (!formData.areaOfUse.trim()) {
      showToast("Area Of Use is required", "error");
      return false;
    }
    if (!formData.groupHead.trim()) {
      showToast("Group Head is required", "error");
      return false;
    }
    if (!formData.approvedBy.trim()) {
      showToast("Approved By is required", "error");
      return false;
    }

    // Check if at least one item has valid data
    const validItems = indentItems.filter(
      (item) => item.productName.trim() && item.qty && item.uom.trim()
    );

    if (validItems.length === 0) {
      showToast(
        "At least one product with name, quantity, and UOM is required",
        "error"
      );
      return false;
    }

    // For Store Out, check if quantities don't exceed available stock
    if (formData.indentStatus === "Store Out") {
      for (const item of validItems) {
        if (Number(item.qty) > Number(item.availableQty)) {
          showToast(
            `Quantity for ${item.productName} exceeds available stock`,
            "error"
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStatusChange = (value) => {
    setFormData({
      ...formData,
      indentStatus: value,
    });
  };

  const handleItemChange = (id, field, value) => {
    setIndentItems(
      indentItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // If product name changed, update available quantity from inventory
          if (field === "productName") {
            const inventoryItem = inventory.find(
              (inv) => inv.productName === value
            );
            if (inventoryItem) {
              updatedItem.availableQty = inventoryItem.quantity;
              updatedItem.uom = inventoryItem.uom;
            } else {
              updatedItem.availableQty = "0";
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    const newId =
      indentItems.length > 0
        ? Math.max(...indentItems.map((item) => item.id)) + 1
        : 1;
    setIndentItems([
      ...indentItems,
      {
        id: newId,
        productName: "",
        qty: "",
        uom: "",
        specifications: "",
        priority: "Normal",
        availableQty: "0",
      },
    ]);
  };

  const removeItem = (id) => {
    if (indentItems.length > 1) {
      setIndentItems(indentItems.filter((item) => item.id !== id));
    } else {
      showToast("At least one product is required", "error");
    }
  };

  // Replace the uploadFileToGoogleDrive function with this:
  const uploadFileToGoogleDrive = async (file) => {
    if (!file) return null;

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result.split(",")[1]; // Remove data:type;base64, prefix
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const payload = {
        action: "uploadFile",
        fileName: file.name,
        fileData: base64,
        mimeType: file.type,
        folderId: DRIVE_FOLDER_ID,
      };

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload),
      });

      const result = await response.json();
      if (result.success) {
        return result.fileUrl;
      } else {
        throw new Error(result.error || "File upload failed");
      }
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  const submitToGoogleSheets = async (data) => {
    try {
      const formData = new FormData();
      formData.append("sheetName", "INDENT");
      formData.append("action", "insert");
      formData.append("rowData", JSON.stringify(data));

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: formData,
      });

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

  const handleSubmit = async () => {
    console.log("Submit button clicked!"); // Debug log

    // Validate form first
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate indent number
      const indentNumber = `SI-${String(
        Math.floor(Math.random() * 10000)
      ).padStart(4, "0")}`;

      console.log("Generated indent number:", indentNumber); // Debug log

      // Upload file if exists
      let attachmentUrl = "";
      if (formData.attachment) {
        try {
          showToast("Uploading file...", "success");
          attachmentUrl = await uploadFileToGoogleDrive(formData.attachment);
        } catch (error) {
          showToast(
            "File upload failed, but form will be submitted without attachment",
            "error"
          );
        }
      }

      // Prepare data for Google Sheets - Submit each item as a separate row
      const currentDate = new Date().toISOString().split("T")[0];
      const currentTime = new Date().toLocaleTimeString();
      const timestamp = new Date().toISOString();

      // Filter valid items
      const validItems = indentItems.filter(
        (item) => item.productName.trim() && item.qty && item.uom.trim()
      );

      console.log("Submitting to Google Sheets..."); // Debug log

      // Submit each item as a separate row
      for (const item of validItems) {
        const rowData = [
          timestamp, // Column A - Timestamp
          indentNumber, // Column B - Indent Number
          formData.indenterName, // Column C - Indenter Name
          formData.department, // Column D - Department
          formData.areaOfUse, // Column E - Area Of Use
          formData.groupHead, // Column F - Group Head
          item.productName, // Column J - Product Name
          item.qty, // Column K - Quantity
          item.uom, // Column L - UOM
          item.specifications, // Column M - Specifications
          formData.approvedBy, // Column G - Approved By
          formData.indentStatus, // Column I - Indent Status
          formData.indentClarification, // Column H - Indent Clarification
          // item.priority, // Column N - Priority
          // formData.indentStatus === "Store Out" ? "Store Out" : "Pending", // Column O - Status
          // currentDate, // Column P - Date
          // currentTime, // Column Q - Time
          // "Active", // Column R - Active Status
          attachmentUrl || "", // Column S - Attachment URL
        ];

        // Submit each row individually
        await submitToGoogleSheets(rowData);
      }

      const indentData = {
        indentNumber,
        ...formData,
        items: validItems,
        status: formData.indentStatus === "Store Out" ? "Store Out" : "Pending",
        createdAt: new Date().toISOString(),
        attachmentUrl,
      };

      showToast(
        `Your ${formData.indentStatus} indent has been created with number ${indentNumber}`
      );

      // Update local state
      setIndents((prev) => [...prev, indentData]);

      // Reset form
      setFormData({
        indenterName: "",
        department: "",
        areaOfUse: "",
        groupHead: "",
        approvedBy: "",
        indentClarification: "",
        attachment: null,
        indentStatus: "Purchase",
      });
      setIndentItems([
        {
          id: 1,
          productName: "",
          qty: "",
          uom: "",
          specifications: "",
          priority: "Normal",
          availableQty: "0",
        },
      ]);

      // Reset file input
      const fileInput = document.getElementById("attachment");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Submission error:", error);
      showToast(`Error submitting indent: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-md shadow-md p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-green-800">Products</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-1.5 border border-green-500 rounded-md text-green-600 hover:bg-green-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Product
              </button>
            </div>

            {indentItems.map((item, index) => (
              <div
                key={item.id}
                className="p-4 border border-green-100 rounded-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-green-700">
                    Product {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor={`product-${item.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Product Name *
                    </label>
                    <select
                      id={`product-${item.id}`}
                      value={item.productName}
                      onChange={(e) =>
                        handleItemChange(item.id, "productName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select product</option>
                      {formData.indentStatus === "Store Out" ? (
                        // For Store Out, show only inventory items
                        inventory.map((invItem, idx) => (
                          <option key={idx} value={invItem.productName}>
                            {invItem.productName} ({invItem.quantity}{" "}
                            {invItem.uom} available)
                          </option>
                        ))
                      ) : (
                        // For Purchase, allow any product name
                        <>
                          {inventory.map((invItem, idx) => (
                            <option key={idx} value={invItem.productName}>
                              {invItem.productName} ({invItem.quantity}{" "}
                              {invItem.uom} available)
                            </option>
                          ))}
                          <option value="New Product">
                            New Product (Enter in specifications)
                          </option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`qty-${item.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Quantity *
                    </label>
                    <div className="relative">
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(item.id, "qty", e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {formData.indentStatus === "Store Out" &&
                        Number(item.qty) > Number(item.availableQty) && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                    </div>
                    {formData.indentStatus === "Store Out" && (
                      <p className="text-xs text-gray-500">
                        Available:{" "}
                        <span
                          className={
                            Number(item.availableQty) < Number(item.qty)
                              ? "text-red-500 font-bold"
                              : "text-green-600"
                          }
                        >
                          {item.availableQty} {item.uom}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`uom-${item.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      UOM (Unit of Measurement) *
                    </label>
                    <input
                      id={`uom-${item.id}`}
                      value={item.uom}
                      onChange={(e) =>
                        handleItemChange(item.id, "uom", e.target.value)
                      }
                      required
                      placeholder="e.g., Pcs, Kg, Liters"
                      className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor={`specs-${item.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Specifications
                    </label>
                    <textarea
                      id={`specs-${item.id}`}
                      value={item.specifications}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "specifications",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`priority-${item.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Priority
                    </label>
                    <select
                      id={`priority-${item.id}`}
                      value={item.priority}
                      onChange={(e) =>
                        handleItemChange(item.id, "priority", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`w-full font-bold py-2 px-4 rounded-md ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {isSubmitting ? "Submitting..." : "Submit Indent"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
