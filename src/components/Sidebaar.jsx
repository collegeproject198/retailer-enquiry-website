"use client";

import { useState } from "react";
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

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
    color: "text-sky-500",
  },
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

function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const cn = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-gradient-to-b from-purple-50 via-blue-50 to-indigo-50 border-r border-slate-200/80 shadow-xl transition-all duration-300 ease-in-out",
          // Desktop behavior
          "lg:relative lg:translate-x-0 lg:shadow-lg",
          // Mobile behavior
          isCollapsed ? "translate-x-0 w-72" : "-translate-x-full w-72",
          // Desktop collapsed state
          "lg:w-64 lg:data-[collapsed=true]:w-20"
        )}
        data-collapsed={isCollapsed}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between h-16 px-4 border-b border-slate-200/50">
          <h1
            className={cn(
              "font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 transition-all duration-300",
              "text-xl lg:text-2xl",
              "lg:data-[collapsed=true]:text-lg"
            )}
          >
            {isCollapsed ? "REMS" : "Retail EMS"}
          </h1>

          {/* Mobile close button */}
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors p-2"
            onClick={() => setIsCollapsed(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out",
                "hover:bg-white/60 hover:shadow-sm hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white/60",
                location.pathname === route.href
                  ? "bg-white shadow-md text-slate-900 border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900",
                // Desktop collapsed state
                "lg:data-[collapsed=true]:justify-center lg:data-[collapsed=true]:px-2"
              )}
              title={route.label}
            >
              <route.icon
                className={cn(
                  "h-5 w-5 transition-colors duration-200 flex-shrink-0",
                  route.color,
                  location.pathname === route.href && "drop-shadow-sm"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-300 truncate",
                  "lg:data-[collapsed=true]:hidden"
                )}
              >
                {route.label}
              </span>

              {/* Active indicator */}
              {location.pathname === route.href && (
                <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full lg:data-[collapsed=true]:hidden" />
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/50">
          <div className="text-xs text-slate-500 text-center lg:data-[collapsed=true]:hidden">
            © 2024 Retail EMS
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden inline-flex items-center justify-center rounded-xl bg-white shadow-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 p-3"
        onClick={() => setIsCollapsed(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Toggle Button */}
      <button
        className="hidden lg:block fixed top-4 left-4 z-30 inline-flex items-center justify-center rounded-xl bg-white shadow-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 p-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </button>
    </>
  );
}

export default Sidebar;
