"use client";

import React, { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DealerForm from "./pages/DealerForm";
import History from "./pages/History";
import Attendance from "./pages/Attendents";
import Tracker from "./pages/Tracker";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebaar";

export const AuthContext = createContext(null);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("currentUser");
    const storedUserType = localStorage.getItem("userType");

    if (auth === "true" && storedUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(storedUser));
      setUserType(storedUserType);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const loginUrl =
        "https://docs.google.com/spreadsheets/d/1QWL1ZvOOOOn28yRNuemwCsUQ6nugEMo5g4p64Sj8fs0/gviz/tq?tqx=out:json&sheet=Master";
      const response = await fetch(loginUrl);
      const text = await response.text();

      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      const jsonData = text.substring(jsonStart, jsonEnd);
      const data = JSON.parse(jsonData);

      if (!data?.table?.rows) {
        showNotification("Failed to fetch user data", "error");
        return false;
      }

      const foundUser = data.table.rows.find(
        (row) => row.c?.[7]?.v === username && row.c?.[8]?.v === password
      );

      if (foundUser) {
        const userInfo = {
          username,
          loginTime: new Date().toISOString(),
        };

        setIsAuthenticated(true);
        setCurrentUser(userInfo);
        setUserType(foundUser.c?.[9]?.v || "user");

        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", JSON.stringify(userInfo));
        localStorage.setItem("userType", foundUser.c?.[9]?.v || "user");

        showNotification(`Welcome, ${username}!`, "success");
        return true;
      } else {
        showNotification("Invalid credentials", "error");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      showNotification("An error occurred during login", "error");
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserType(null);
    localStorage.clear();
    showNotification("Logged out successfully", "success");
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const isAdmin = () => userType === "admin";

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (adminOnly && !isAdmin()) {
      showNotification(
        "You don't have permission to access this page",
        "error"
      );
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        userType,
        isAdmin,
        showNotification,
      }}
    >
      <Router>
        <div className="flex h-screen bg-gray-50 text-gray-900">
          {/* Sidebar */}
          {isAuthenticated && (
            <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white z-20 shadow-lg">
              <Sidebar
                logout={logout}
                userType={userType}
                username={currentUser?.username}
              />
            </div>
          )}

          {/* Main Content Wrapper */}
          <div
            className={`flex flex-col flex-1 overflow-hidden ${
              isAuthenticated ? "ml-64" : ""
            }`}
          >
            {/* Notification bar */}
            {notification && (
              <div
                className={`p-4 text-sm ${
                  notification.type === "error"
                    ? "bg-red-100 text-red-700"
                    : notification.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {notification.message}
              </div>
            )}

            {/* Scrollable Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
              <Routes>
                <Route
                  path="/login"
                  element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dealer-form"
                  element={
                    <ProtectedRoute>
                      <DealerForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tracker"
                  element={
                    <ProtectedRoute>
                      <Tracker />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <ProtectedRoute>
                      <Attendance />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
