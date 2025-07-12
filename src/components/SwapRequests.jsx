import React, { useState, useEffect } from "react";
import { Check, X, Send, Clock, User } from "lucide-react";
import supabase from "../supabaseClient";
import Swal from "sweetalert2";

export default function SwapRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch pending requests (requests sent to current user)
    const { data: pendingData, error: pendingError } = await supabase
      .from("swap_requests")
      .select(`
        *,
        sender:profiles!swap_requests_sender_id_fkey(name, image, skillofferd, skillwanted),
        receiver:profiles!swap_requests_receiver_id_fkey(name, image, skillofferd, skillwanted)
      `)
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    // Fetch sent requests (requests sent by current user)
    const { data: sentData, error: sentError } = await supabase
      .from("swap_requests")
      .select(`
        *,
        sender:profiles!swap_requests_sender_id_fkey(name, image, skillofferd, skillwanted),
        receiver:profiles!swap_requests_receiver_id_fkey(name, image, skillofferd, skillwanted)
      `)
      .eq("sender_id", user.id);

    if (!pendingError) setPendingRequests(pendingData || []);
    if (!sentError) setSentRequests(sentData || []);
    setLoading(false);
  };

  const handleAcceptRequest = async (requestId) => {
    const { error } = await supabase
      .from("swap_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (!error) {
      Swal.fire("Success", "Swap request accepted!", "success");
      fetchRequests();
    } else {
      Swal.fire("Error", "Failed to accept request", "error");
    }
  };

  const handleRejectRequest = async (requestId) => {
    const { error } = await supabase
      .from("swap_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (!error) {
      Swal.fire("Success", "Swap request rejected", "success");
      fetchRequests();
    } else {
      Swal.fire("Error", "Failed to reject request", "error");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    const { error } = await supabase
      .from("swap_requests")
      .delete()
      .eq("id", requestId);

    if (!error) {
      Swal.fire("Success", "Request deleted", "success");
      fetchRequests();
    } else {
      Swal.fire("Error", "Failed to delete request", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted": return "text-green-600 bg-green-100";
      case "rejected": return "text-red-600 bg-red-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Pending Requests */}
      <div>
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Pending Requests ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending requests</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={request.sender?.image || `https://api.dicebear.com/7.x/thumbs/svg?seed=${request.sender?.name}`}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{request.sender?.name}</h3>
                    <p className="text-sm text-gray-500">{request.sender?.location}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Wants to learn:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.skills_wanted?.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Can teach:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.skills_offered?.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition duration-200"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-200"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Requests */}
      <div>
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
          <Send className="w-6 h-6" />
          Sent Requests ({sentRequests.length})
        </h2>
        
        {sentRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sent requests</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sentRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={request.receiver?.image || `https://api.dicebear.com/7.x/thumbs/svg?seed=${request.receiver?.name}`}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{request.receiver?.name}</h3>
                    <p className="text-sm text-gray-500">{request.receiver?.location}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">You want to learn:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.skills_wanted?.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">You can teach:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.skills_offered?.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  {request.status === "pending" && (
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 