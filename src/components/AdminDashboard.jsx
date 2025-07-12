// AdminDashboard.jsx
import React from "react";
import AdminProfiles from "./AdminProfiles";
import AdminSwaps from "./AdminSwaps";
import AdminRatings from "./AdminRatings";

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminProfiles />
        <AdminSwaps />
        <AdminRatings />
      </div>
    </div>
  );
}
