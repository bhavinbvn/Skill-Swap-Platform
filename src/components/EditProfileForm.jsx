// src/components/EditProfileForm.jsx
import React, { useState } from "react";
import { Save } from "lucide-react";

const availabilityOptions = ["Weekdays", "Evenings", "Weekends"];
const skillOptions = ["JavaScript", "Python", "Figma", "Design", "UX", "Marketing"];

export default function EditProfileForm({ profile, setProfile, uploading, setFile, updateProfile }) {
  const [errors, setErrors] = useState({});

  const handleValidation = () => {
    const newErrors = {};
    if (!profile.name?.trim()) newErrors.name = "Name is required";
    if (!profile.location?.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleArrayChange = (key, value) => {
    const current = (profile[key] || "").split(",").map(s => s.trim()).filter(Boolean);
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setProfile({ ...profile, [key]: updated.join(", ") });
  };

  return (
    <div className="w-full">
      <input
        className="border p-2 mb-2 w-full"
        value={profile.name || ""}
        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        placeholder="Name"
      />
      {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

      <input
        className="border p-2 mb-2 w-full"
        value={profile.location || ""}
        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
        placeholder="Location"
      />
      {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}

      <div className="mb-2">
        <label className="block font-medium mb-1">Skills Offered</label>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map(skill => (
            <label key={skill} className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={(profile.skillofferd || "").includes(skill)}
                onChange={() => handleArrayChange("skillofferd", skill)}
              />
              {skill}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <label className="block font-medium mb-1">Skills Wanted</label>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map(skill => (
            <label key={skill} className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={(profile.skillwanted || "").includes(skill)}
                onChange={() => handleArrayChange("skillwanted", skill)}
              />
              {skill}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <label className="block font-medium mb-1">Availability</label>
        <div className="flex flex-wrap gap-2">
          {availabilityOptions.map(slot => (
            <label key={slot} className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={(profile.availability || "").includes(slot)}
                onChange={() => handleArrayChange("availability", slot)}
              />
              {slot}
            </label>
          ))}
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />

      {uploading && (
        <p className="text-sm text-blue-500 mb-2 text-center animate-pulse">
          Uploading image...
        </p>
      )}

      <button
        className="flex items-center justify-center gap-2 text-green-600 hover:text-green-800 w-full py-2 rounded transition duration-200"
        onClick={() => {
          if (handleValidation()) updateProfile();
        }}
        disabled={uploading}
      >
        <Save size={18} />
        Save Changes
      </button>
    </div>
  );
}
