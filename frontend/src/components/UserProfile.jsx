import React, { useState } from "react";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useUserStore } from "../store/useUserStore";

const UserProfile = () => {
  const { theme } = useThemeStore();
  const { user, updateUser } = useUserStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
  const [isEditing, setIsEditing] = useState(false);

  const dark = theme === "dark";

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfilePicture(imageUrl);
  };

  const handleSave = async () => {
    try {
      await updateUser({
        name,
        phone,
        profilePicture
      });

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`min-h-screen ${dark ? "bg-[#111b21] text-white" : "bg-gray-100 text-black"}`}>

      <div className={`flex items-center gap-4 p-4 border-b ${
        dark ? "bg-[#202c33] border-gray-700" : "bg-white border-gray-300"
      }`}>
        <button onClick={() => navigate("/")}>
          <FaArrowLeft />
        </button>

        <h1 className="text-xl font-semibold">Profile</h1>
      </div>

      <div className="max-w-md mx-auto p-6">

        <div className="flex flex-col items-center">

          <label className="cursor-pointer">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="profile"
                className="w-28 h-28 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-28 h-28 text-gray-400" />
            )}

            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            )}
          </label>

          <h2 className="text-2xl font-semibold mt-4">
            {user?.name || "User"}
          </h2>

          <p className="text-gray-500">
            {user?.email}
          </p>
        </div>

        <div className={`mt-8 rounded-lg ${
          dark ? "bg-[#202c33]" : "bg-white"
        }`}>

          <div className="p-4 border-b border-gray-500/20">
            <p className="text-sm text-gray-500">Name</p>

            {isEditing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-2 p-2 rounded bg-gray-200 text-black"
              />
            ) : (
              <p className="mt-1">{user?.name || "Not available"}</p>
            )}
          </div>

          <div className="p-4 border-b border-gray-500/20">
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 break-all">
              {user?.email || "Not available"}
            </p>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-500">Phone</p>

            {isEditing ? (
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-2 p-2 rounded bg-gray-200 text-black"
              />
            ) : (
              <p className="mt-1">
                {user?.phone || "Not available"}
              </p>
            )}
          </div>

        </div>

        <div className="mt-6">

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-500 text-white py-2 rounded"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="w-1/2 border py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="w-1/2 bg-blue-500 text-white py-2 rounded"
              >
                Save
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default UserProfile;