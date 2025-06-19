import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Home,
  Calendar,
  Menu,
  X,
  History,
  FileSpreadsheet,
} from "lucide-react";

function Sidebar({ userType, username, tabs = [] }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const cn = (...classes) => classes.filter(Boolean).join(" ");

  const availableRoutes = [
    { label: "Dashboard", icon: Home, href: "/", color: "text-sky-500" },
    {
      label: "Dealer Form",
      icon: ClipboardList,
      href: "/dealer-form",
      color: "text-violet-500",
    },
    {
      label: "Tracker",
      icon: FileSpreadsheet,
      href: "/tracker",
      color: "text-green-600",
    },
    {
      label: "History",
      icon: History,
      href: "/history",
      color: "text-pink-700",
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/reports",
      color: "text-orange-500",
    },
    {
      label: "Attendance",
      icon: Calendar,
      href: "/attendance",
      color: "text-emerald-500",
    },
  ];

  // Filter routes based on the tabs prop
  const filteredRoutes =
    tabs.length > 0
      ? availableRoutes.filter((route) => tabs.includes(route.label))
      : availableRoutes;

  return (
    <>
      {/* Overlay for mobile */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-gradient-to-b from-purple-50 via-blue-50 to-indigo-50 border-r border-slate-200/80 shadow-xl transition-all duration-300 ease-in-out",
          "lg:relative lg:translate-x-0 lg:shadow-lg",
          isCollapsed ? "translate-x-0 w-72" : "-translate-x-full w-72",
          "lg:w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/50">
          <h1
            className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-xl 
               w-full text-center lg:text-left"
          >
            {isCollapsed ? "REMS" : "Retail EMS"}
          </h1>

          {/* Close button: visible only on mobile */}
          <button
            className="lg:hidden absolute right-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg"
            onClick={() => setIsCollapsed(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              onClick={() => {
                if (window.innerWidth < 1024) setIsCollapsed(false);
              }}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                "hover:bg-white/60 hover:shadow-sm hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white/60",
                location.pathname === route.href
                  ? "bg-white shadow-md text-slate-900 border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title={route.label}
            >
              <route.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  route.color,
                  location.pathname === route.href && "drop-shadow-sm"
                )}
              />
              <span className="truncate">{route.label}</span>
              {location.pathname === route.href && (
                <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile toggle */}
      <button
        className="fixed top-2 left-3 z-50 lg:hidden rounded-xl bg-white shadow-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 p-3"
        onClick={() => setIsCollapsed(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop toggle */}
      <button
        className="hidden lg:block fixed top-4 left-4 z-30 rounded-xl bg-white shadow-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 p-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </button>
    </>
  );
}

export default Sidebar;
