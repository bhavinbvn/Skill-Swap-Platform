// AdminRatings.jsx
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function AdminRatings() {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("*, from_user:from_user_id(name), to_user:to_user_id(name), swap:swap_id")
        .order("created_at", { ascending: false });

      if (!error) setRatings(data);
    };

    fetchRatings();
  }, []);

  const deleteRating = async (id) => {
    const { error } = await supabase.from("ratings").delete().eq("id", id);
    if (!error) setRatings((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-xl font-semibold mb-4">Ratings</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {ratings.length === 0 && <p className="text-gray-400">No ratings found.</p>}
        {ratings.map((rating) => (
          <div
            key={rating.id}
            className="border p-3 rounded-md flex flex-col gap-1 hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-medium">
                  From: {rating.from_user?.name || "Unknown"} → To: {rating.to_user?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">Swap ID: {rating.swap_id}</p>
              </div>
              <button
                className="text-red-500 hover:text-red-700 text-sm"
                onClick={() => deleteRating(rating.id)}
              >
                Delete
              </button>
            </div>
            <p className="text-sm">Rating: {rating.rating} / 5</p>
            <p className="text-gray-600 text-sm">{rating.feedback || "No feedback provided."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
