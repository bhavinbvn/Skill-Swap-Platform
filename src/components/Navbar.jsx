// src/components/Navbar.jsx
import React, { useRef, useState, useEffect } from "react";
import { Bell, LogOut, Pencil, Search, Users, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";
import Swal from "sweetalert2";
import EditProfileForm from "./EditProfileForm";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState({
    name: "",
    image: "",
    location: "",
    skillofferd: "",
    skillwanted: "",
    availability: "",
    privacy: false,
  });

  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    getProfile();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile({
        ...data,
        skillofferd: (data.skillofferd || []).join(", "),
        skillwanted: (data.skillwanted || []).join(", "),
        availability: (data.availability || []).join(", "),
      });
    }
  }

  async function updateProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  let imageUrl = profile.image;

  if (file) {
    setUploading(true);
    const filePath = `${user.id}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    setUploading(false);

    if (uploadError) {
      Swal.fire("Error", uploadError.message, "error");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    imageUrl = urlData.publicUrl;
  }

  const payload = {
    id: user.id,
    name: profile.name || "",
    image: imageUrl,
    location: profile.location || "",
    skillofferd: (profile.skillofferd || "").split(",").map(s => s.trim()).filter(Boolean),
    skillwanted: (profile.skillwanted || "").split(",").map(s => s.trim()).filter(Boolean),
    availability: (profile.availability || "").split(",").map(s => s.trim()).filter(Boolean),
    privacy: !!profile.privacy,
  };

  console.log("Sending payload to Supabase:", payload);

  const { error } = await supabase.from("profiles").upsert(payload);

  if (!error) {
    setEditing(false);
    setFile(null);
    setDropdownOpen(false);
    getProfile();
    Swal.fire("Success", "Profile updated successfully", "success");
  } else {
    console.error("Supabase Error:", error);
    Swal.fire("Error", error.message, "error");
  }
}

  function handleClickOutside(e) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
      setEditing(false);
    }
  }

  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 shadow bg-white">
      <h1 className="text-2xl font-bold text-indigo-600">SkillSwap</h1>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-6">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
            location.pathname === "/dashboard" 
              ? "bg-indigo-100 text-indigo-700" 
              : "text-gray-600 hover:text-indigo-600"
          }`}
        >
          <Home className="w-5 h-5" />
          Dashboard
        </button>
        
        <button
          onClick={() => navigate("/search")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
            location.pathname === "/search" 
              ? "bg-indigo-100 text-indigo-700" 
              : "text-gray-600 hover:text-indigo-600"
          }`}
        >
          <Search className="w-5 h-5" />
          Find Users
        </button>
        
        <button
          onClick={() => navigate("/requests")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
            location.pathname === "/requests" 
              ? "bg-indigo-100 text-indigo-700" 
              : "text-gray-600 hover:text-indigo-600"
          }`}
        >
          <Users className="w-5 h-5" />
          Requests
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group cursor-pointer">
          <Bell className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition duration-200" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            3
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <img
            src={file ? URL.createObjectURL(file) : profile.image}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 bg-white shadow-xl rounded-xl w-80 p-6 z-50">
              <div className="flex flex-col items-center mb-4">
                <img
                  src={file ? URL.createObjectURL(file) : profile.image}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4"
                />
                <p className="text-sm font-semibold">{profile.name || "User"}</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>

              {!editing ? (
                <>
                  <button
                    className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 w-full py-2 rounded mb-3 transition duration-200"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil size={18} />
                    Edit Profile
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 text-red-500 hover:text-red-700 w-full py-2 rounded transition duration-200"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      Swal.fire("Logged out", "You have been logged out", "success").then(() =>
                        window.location.reload()
                      );
                    }}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <EditProfileForm
                  profile={profile}
                  setProfile={setProfile}
                  uploading={uploading}
                  setFile={setFile}
                  updateProfile={updateProfile}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
