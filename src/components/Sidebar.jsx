import React from "react";
import { NavLink } from "react-router-dom";
import Contact from "./ContactUs";
import { LayoutDashboard, User, FileText, Settings } from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
    { name: "Contact Us", path: "/Contact" , icon: <FileText size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow z-40 p-4 mt-6 ml-4 rounded-lg h-auto">
      <h2 className="text-xl font-bold text-100 mb-6">Navigation</h2>
      <nav className="flex flex-col space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-indigo-50"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
