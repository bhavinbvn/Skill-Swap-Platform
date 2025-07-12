import React, { useState } from "react";
import supabase from "../utils/supabaseClient";
import Swal from "sweetalert2";

export default function UploadImage() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !file) {
      Swal.fire("Error", "User not logged in or file not selected", "error");
      return;
    }

    const filePath = `${user.id}/${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      Swal.fire("Upload Failed", uploadError.message, "error");
      return;
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setImageUrl(publicData.publicUrl);
    Swal.fire("Success", "Image uploaded!", "success");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload Image
      </button>

      {imageUrl && (
        <div className="mt-4">
          <p>Image Preview:</p>
          <img src={imageUrl} alt="Uploaded" className="w-32 h-32 object-cover mt-2" />
        </div>
      )}
    </div>
  );
}
