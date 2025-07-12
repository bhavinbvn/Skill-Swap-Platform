
import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import Navbar from "./Navbar";
import supabase from "../supabaseClient";
import SendSwapRequest from "./SendSwapRequest";

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchProfilesWithRatings();
  }, []);

  const fetchProfilesWithRatings = async () => {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("privacy", false); // ✅ only public profiles

  if (profileError) {
    console.error("Error fetching profiles:", profileError.message);
    return;
  }

  const { data: ratingsData, error: ratingsError } = await supabase
    .from("ratings")
    .select("user_id, rating");

  if (ratingsError) {
    console.error("Error fetching ratings:", ratingsError.message);
    return;
  }

  const ratingMap = {};
  ratingsData?.forEach(({ user_id, rating }) => {
    if (!ratingMap[user_id]) ratingMap[user_id] = [];
    ratingMap[user_id].push(rating);
  });

  const avgRatingMap = {};
  Object.entries(ratingMap).forEach(([userId, ratings]) => {
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    avgRatingMap[userId] = avg.toFixed(1);
  });

  const mergedProfiles = profileData.map((p) => ({
    ...p,
    skillofferd: typeof p.skillofferd === "string" ? p.skillofferd.split(",").map(s => s.trim()) : p.skillofferd,
    skillwanted: typeof p.skillwanted === "string" ? p.skillwanted.split(",").map(s => s.trim()) : p.skillwanted,
    availability: typeof p.availability === "string" ? p.availability.split(",").map(s => s.trim()) : p.availability,
    avgRating: avgRatingMap[p.id] || null,
  }));

  setProfiles(mergedProfiles);
};

  const handleSendRequest = (user) => {
    setSelectedUser(user);
    setShowSwapModal(true);
  };

  const handleRequestSent = () => {
    fetchProfilesWithRatings(); // Refresh the list
  };


  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100">
      <Navbar />
      <div className="p-6 flex flex-wrap gap-6 justify-center">
        {profiles.length === 0 ? (
          <p className="text-gray-500 text-lg">No users found.</p>
        ) : (
          profiles.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-xl p-6 w-72 hover:shadow-2xl transition duration-300"
            >
              <img
                src={
                  user.image ||
                  `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.name}`
                }
                alt="Avatar"
                className="w-20 h-20 rounded-full mx-auto border-4 border-indigo-300 mb-4 object-cover"
              />
              <h2 className="text-center text-lg font-semibold text-indigo-700">
                {user.name || "Unnamed User"}
              </h2>
              <p className="text-center text-sm text-gray-600 mb-1">
                {user.location || "No location"}
              </p>

              {/* ⭐ Rating */}
              <p className="text-center text-yellow-500 font-medium mb-2">
                ⭐ {user.avgRating ? `${user.avgRating} / 5` : "No ratings yet"}
              </p>

              {/* ✅ Skills Offered */}
              <div className="text-sm text-gray-700 mb-2">
                <strong>Skills Offered:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(user.skillofferd || []).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* ✅ Skills Wanted */}
              <div className="text-sm text-gray-700 mb-2">
                <strong>Skills Wanted:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(user.skillwanted || []).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* ✅ Availability */}
              <div className="text-sm text-gray-700 mb-4">
                <strong>Availability:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(user.availability || []).map((slot, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              {/* Send Swap Request Button */}
              <button
                onClick={() => handleSendRequest(user)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition duration-200"
              >
                <Send className="w-4 h-4" />
                Send Swap Request
              </button>
            </div>
          ))
        )}
      </div>

      {/* Swap Request Modal */}
      {showSwapModal && selectedUser && (
        <SendSwapRequest
          user={selectedUser}
          onClose={() => {
            setShowSwapModal(false);
            setSelectedUser(null);
          }}
          onRequestSent={handleRequestSent}
        />
      )}
    </div>
  );
}
