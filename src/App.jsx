"use client";

import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Page components
import Dashboard from "./pages/Dashboard";
import DealerForm from "./pages/DealerForm";
import History from "./pages/History";
import Attendance from "./pages/Attendents";
import Tracker from "./pages/Tracker";
import Reports from "./pages/Reports";

import "./index.css";
import Login from "./pages/Login";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

// Protected route component
const ProtectedRoute = ({ children, isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCounts, setPendingCounts] = useState({
    indents: 0,
    approvals: 0,
    threeParty: 0,
    storeOut: 0,
  });
  const [dataInitialized, setDataInitialized] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loginStatus);
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Function to handle successful login
  const handleLoginSuccess = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    // Use navigate instead of window.location for better UX
    window.location.href = "/login";
  };

  useEffect(() => {
    // Only run this effect if user is logged in
    if (!isLoggedIn) return;

    // Initialize test data if not already done
    if (
      !localStorage.getItem("indents") ||
      !localStorage.getItem("inventory")
    ) {
      setDataInitialized(true);
    }

    // Set up global tab change handler
    window.setActiveTab = (tab) => {
      setActiveTab(tab);
    };

    // Calculate pending counts
    const calculateCounts = () => {
      const storedIndents = JSON.parse(localStorage.getItem("indents") || "[]");

      const pendingIndents = storedIndents.filter(
        (indent) => indent.status === "Pending"
      ).length;
      const pendingThreeParty = storedIndents.filter(
        (indent) =>
          indent.status === "Three Party" &&
          indent.threePartyInfo &&
          !indent.threePartyApproval
      ).length;

      const pendingStoreOut = storedIndents.filter(
        (indent) =>
          (indent.indentStatus === "Store Out" ||
            indent.status === "Store Out") &&
          indent.status !== "Store Out Completed"
      ).length;

      setPendingCounts({
        indents: pendingIndents,
        approvals: pendingIndents,
        threeParty: pendingThreeParty,
        storeOut: pendingStoreOut,
      });
    };

    calculateCounts();

    // Set up interval to refresh counts
    const refreshInterval = setInterval(calculateCounts, 30000);

    return () => {
      delete window.setActiveTab;
      clearInterval(refreshInterval);
    };
  }, [isLoggedIn]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setIsMobileMenuOpen(false);
  };

  const handleResetData = () => {
    setDataInitialized(true);
    // Force refresh counts
    const storedIndents = JSON.parse(localStorage.getItem("indents") || "[]");
    const pendingIndents = storedIndents.filter(
      (indent) => indent.status === "Pending"
    ).length;
    const pendingThreeParty = storedIndents.filter(
      (indent) =>
        indent.status === "Three Party" &&
        indent.threePartyInfo &&
        !indent.threePartyApproval
    ).length;
    const pendingStoreOut = storedIndents.filter(
      (indent) =>
        (indent.indentStatus === "Store Out" ||
          indent.status === "Store Out") &&
        indent.status !== "Store Out Completed"
    ).length;

    setPendingCounts({
      indents: pendingIndents,
      approvals: pendingIndents,
      threeParty: pendingThreeParty,
      storeOut: pendingStoreOut,
    });
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login page - accessible when not logged in */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Parent route for all authenticated content */}
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <AuthenticatedLayout
                activeTab={activeTab}
                handleTabChange={handleTabChange}
                pendingCounts={pendingCounts}
                handleResetData={handleResetData}
                handleLogout={handleLogout}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                dataInitialized={dataInitialized}
                setDataInitialized={setDataInitialized}
              />
            </ProtectedRoute>
          }
        >
          {/* Nested routes for authenticated users */}
          <Route index element={<Dashboard />} />
          <Route path="dealer-form" element={<DealerForm />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="history" element={<History />} />
          <Route path="reports" element={<Reports />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>

        {/* Fallback for any other path */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />}
        />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
