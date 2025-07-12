import React, { useState, useEffect } from "react";
import { Search, Filter, Send } from "lucide-react";
import supabase from "../supabaseClient";
import SendSwapRequest from "./SendSwapRequest";

export default function SearchUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const skillOptions = [
    "JavaScript", "Python", "React", "Node.js", "Design", "UX", "Marketing",
    "Figma", "Photoshop", "Excel", "Word", "PowerPoint", "SQL", "Java",
    "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "Dart",
    "Flutter", "React Native", "Vue.js", "Angular", "TypeScript", "GraphQL",
    "MongoDB", "PostgreSQL", "MySQL", "AWS", "Docker", "Kubernetes", "Git",
    "Linux", "Windows", "MacOS", "Mobile Development", "Web Development",
    "Data Science", "Machine Learning", "AI", "Blockchain", "Cybersecurity"
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedSkill]);

  const fetchUsers = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("privacy", false) // Only public profiles
      .neq("id", currentUser?.id); // Exclude current user

    if (!error && data) {
      const usersWithRatings = await Promise.all(
        data.map(async (user) => {
          const { data: ratings } = await supabase
            .from("ratings")
            .select("rating")
            .eq("user_id", user.id);

          const avgRating = ratings && ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : null;

          return {
            ...user,
            skillofferd: typeof user.skillofferd === "string" ? user.skillofferd.split(",").map(s => s.trim()) : user.skillofferd,
            skillwanted: typeof user.skillwanted === "string" ? user.skillwanted.split(",").map(s => s.trim()) : user.skillwanted,
            availability: typeof user.availability === "string" ? user.availability.split(",").map(s => s.trim()) : user.availability,
            avgRating
          };
        })
      );
      setUsers(usersWithRatings);
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term (name or location)
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected skill
    if (selectedSkill) {
      filtered = filtered.filter(user =>
        user.skillofferd?.includes(selectedSkill) ||
        user.skillwanted?.includes(selectedSkill)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSendRequest = (user) => {
    setSelectedUser(user);
    setShowSwapModal(true);
  };

  const handleRequestSent = () => {
    fetchUsers(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Find Skill Partners</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Skill Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none bg-white"
            >
              <option value="">All Skills</option>
              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-center">
            <span className="text-gray-600">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden"
            >
              {/* User Header */}
              <div className="p-6 text-center border-b border-gray-100">
                <img
                  src={user.image || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.name}`}
                  alt="Profile"
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-100"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {user.name || "Unnamed User"}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {user.location || "No location"}
                </p>
                
                {/* Rating */}
                {user.avgRating && (
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium">{user.avgRating}/5</span>
                  </div>
                )}
              </div>

              {/* Skills Section */}
              <div className="p-6 space-y-4">
                {/* Skills Offered */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Can teach:</h4>
                  <div className="flex flex-wrap gap-1">
                    {(user.skillofferd || []).slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {(user.skillofferd || []).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(user.skillofferd || []).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills Wanted */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Wants to learn:</h4>
                  <div className="flex flex-wrap gap-1">
                    {(user.skillwanted || []).slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {(user.skillwanted || []).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(user.skillwanted || []).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available:</h4>
                  <div className="flex flex-wrap gap-1">
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
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleSendRequest(user)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition duration-200"
                >
                  <Send className="w-4 h-4" />
                  Send Swap Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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