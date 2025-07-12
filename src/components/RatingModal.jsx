import React, { useState } from "react";
import { Star, X, Send } from "lucide-react";
import supabase from "../supabaseClient";
import Swal from "sweetalert2";

export default function RatingModal({ swapRequest, onClose, onRatingSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire("Error", "Please select a rating", "error");
      return;
    }

    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      Swal.fire("Error", "You must be logged in to submit a rating", "error");
      setLoading(false);
      return;
    }

    // Determine who to rate (the other person in the swap)
    const userToRate = swapRequest.sender_id === currentUser.id 
      ? swapRequest.receiver_id 
      : swapRequest.sender_id;

    const { error } = await supabase.from("ratings").insert({
      user_id: userToRate,
      rater_id: currentUser.id,
      rating: rating,
      comment: comment.trim() || null,
      swap_request_id: swapRequest.id
    });

    setLoading(false);

    if (error) {
      Swal.fire("Error", "Failed to submit rating: " + error.message, "error");
    } else {
      Swal.fire("Success", "Rating submitted successfully!", "success");
      onRatingSubmitted();
      onClose();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const filled = starValue <= (hoveredStar || rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredStar(starValue)}
          onMouseLeave={() => setHoveredStar(0)}
          className="transition-all duration-200 transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 ${
              filled 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300"
            }`}
          />
        </button>
      );
    });
  };

  const getRatingText = () => {
    if (rating === 0) return "Select a rating";
    const texts = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return texts[rating] || "";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Rate Your Swap Experience</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Swap Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Swap Details:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Skills you learned:</strong> {swapRequest.skills_wanted?.join(", ")}</p>
              <p><strong>Skills you taught:</strong> {swapRequest.skills_offered?.join(", ")}</p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-3">
              How would you rate this swap experience?
            </label>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars()}
            </div>
            <p className="text-center text-sm text-gray-600">
              {getRatingText()}
            </p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-2">
              Additional comments (optional):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience, suggestions, or feedback..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows="4"
              maxLength="500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

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
              disabled={loading || rating === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Rating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 