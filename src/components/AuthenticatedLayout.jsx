"use client";

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebaar"; // Assuming Sidebar is in src/components/Sidebaar

export default function AuthenticatedLayout({
  activeTab,
  handleTabChange,
  pendingCounts,
  handleResetData,
  handleLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  dataInitialized,
  setDataInitialized,
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          pendingCounts={pendingCounts}
          handleResetData={handleResetData}
          handleLogout={handleLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 md:p-6">
            {dataInitialized && (
              <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-md text-green-800 flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Test data has been initialized successfully! You can now
                    explore the application.
                  </span>
                </div>
                <button
                  className="px-3 py-1 border border-green-300 text-green-700 hover:bg-green-200 rounded-md text-sm"
                  onClick={() => setDataInitialized(false)}
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <Outlet /> {/* This is where nested routes will render */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
