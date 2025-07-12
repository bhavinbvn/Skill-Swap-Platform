import React, { useState } from "react";
import { Send, X } from "lucide-react";
import supabase from "../supabaseClient";
import Swal from "sweetalert2";

export default function SendSwapRequest({ user, onClose, onRequestSent }) {
  const [selectedSkillsWanted, setSelectedSkillsWanted] = useState([]);
  const [selectedSkillsOffered, setSelectedSkillsOffered] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSkillToggle = (skill, type) => {
    if (type === "wanted") {
      setSelectedSkillsWanted(prev => 
        prev.includes(skill) 
          ? prev.filter(s => s !== skill)
          : [...prev, skill]
      );
    } else {
      setSelectedSkillsOffered(prev => 
        prev.includes(skill) 
          ? prev.filter(s => s !== skill)
          : [...prev, skill]
      );
    }
  };

  const handleSubmit = async () => {
    if (selectedSkillsWanted.length === 0 || selectedSkillsOffered.length === 0) {
      Swal.fire("Error", "Please select at least one skill you want to learn and one skill you can offer", "error");
      return;
    }

    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      Swal.fire("Error", "You must be logged in to send requests", "error");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("swap_requests").insert({
      sender_id: currentUser.id,
      receiver_id: user.id,
      skills_wanted: selectedSkillsWanted,
      skills_offered: selectedSkillsOffered,
      status: "pending"
    });

    setLoading(false);

    if (error) {
      Swal.fire("Error", "Failed to send request: " + error.message, "error");
    } else {
      Swal.fire("Success", "Swap request sent successfully!", "success");
      onRequestSent();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Send Swap Request</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <img
              src={user.image || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.name}`}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.location}</p>
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Skills you want to learn from {user.name}:</h3>
            <div className="grid grid-cols-2 gap-2">
              {(user.skillofferd || []).map((skill) => (
                <label key={skill} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSkillsWanted.includes(skill)}
                    onChange={() => handleSkillToggle(skill, "wanted")}
                    className="rounded"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills Offered */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Skills you can teach {user.name}:</h3>
            <div className="grid grid-cols-2 gap-2">
              {(user.skillwanted || []).map((skill) => (
                <label key={skill} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSkillsOffered.includes(skill)}
                    onChange={() => handleSkillToggle(skill, "offered")}
                    className="rounded"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedSkillsWanted.length > 0 || selectedSkillsOffered.length > 0 ? (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Request Summary:</h4>
              {selectedSkillsWanted.length > 0 && (
                <p className="text-sm text-blue-700 mb-1">
                  <strong>Want to learn:</strong> {selectedSkillsWanted.join(", ")}
                </p>
              )}
              {selectedSkillsOffered.length > 0 && (
                <p className="text-sm text-blue-700">
                  <strong>Can teach:</strong> {selectedSkillsOffered.join(", ")}
                </p>
              )}
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedSkillsWanted.length === 0 || selectedSkillsOffered.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 