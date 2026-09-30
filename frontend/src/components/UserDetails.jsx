import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { toast } from "react-toastify";
import { useThemeStore } from '../store/useThemeStore';
import Layout from './Layout';
import { FaArrowLeft, FaCamera, FaCheck, FaPencilAlt, FaSmile } from 'react-icons/fa';
import { updateUserProfile } from '../services/user.service';
import EmojiPicker from 'emoji-picker-react';
import { MdCancel } from 'react-icons/md';
import { Link } from 'react-router-dom';

const UserDetails = () => {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [showNameEmoji, setShowNameEmoji] = useState(false);
  const [showAboutEmoji, setShowAboutEmoji] = useState(false);
  const { user, setUser } = useUserStore();
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setAbout(user.about || "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (field) => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (field === 'name') {
        formData.append("username", name);
        setIsEditingName(false);
        setShowNameEmoji(false);
      } else if (field === 'about') {
        formData.append("about", about);
        setIsEditingAbout(false);
        setShowAboutEmoji(false);
      }

      if (profilePicture && field === "profile") {
        formData.append("media", profilePicture);
      }

      const updated = await updateUserProfile(formData);
      setUser(updated?.data);
      setProfilePicture(null);
      setPreview(null);
      toast.success("Profile updated");
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
      setLoading(false);
    }
  };

  const handleEmojiSelect = (emoji, field) => {
    if (field === 'name') {
      setName((prev) => prev + emoji.emoji);
      setShowNameEmoji(false);
    } else {
      setAbout((prev) => prev + emoji.emoji);
      setShowAboutEmoji(false);
    }
  };

  return (
    <Layout>
      <div
        className={`h-full w-full flex flex-col border-r ${
          theme === "dark"
            ? "bg-[#111b21] border-[#222e35] text-[#e9edef]"
            : "bg-[#f0f2f5] border-[#e9edef] text-[#111b21]"
        }`}
      >
        {/* WhatsApp Header */}
        <div
          className={`h-[60px] px-4 flex items-center gap-4 shrink-0 ${
            theme === "dark" ? "bg-[#202c33]" : "bg-[#008069] text-white"
          }`}
        >
          <Link
            to="/setting"
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer text-white"
          >
            <FaArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-[19px] font-medium text-white">Profile</h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Avatar Section */}
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer">
              <img
                src={preview || user?.profilePicture || "/placeholder.svg"}
                alt="profile"
                className="w-44 h-44 rounded-full object-cover shadow-sm"
              />

              <label
                htmlFor="profileUpload"
                className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              >
                <FaCamera className="h-6 w-6 mb-1.5" />
                <span className="text-[11px] font-medium tracking-wide uppercase">
                  Change Photo
                </span>
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {preview && (
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => handleSave("profile")}
                  disabled={loading}
                  className="bg-[#00a884] hover:bg-[#008f6f] text-white px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  {loading ? "Saving..." : "Save Photo"}
                </button>
                <button
                  onClick={() => {
                    setProfilePicture(null);
                    setPreview(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    theme === "dark"
                      ? "bg-[#202c33] text-gray-300 hover:bg-[#2a3942]"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Discard
                </button>
              </div>
            )}
          </div>

          {/* Name Section */}
          <div
            className={`p-4 mx-4 mb-4 rounded-xl ${
              theme === "dark" ? "bg-[#202c33]" : "bg-white"
            } shadow-sm border ${
              theme === "dark" ? "border-[#222e35]" : "border-gray-100"
            }`}
          >
            <label className="block text-xs font-medium text-[#008069] dark:text-[#00a884] mb-1">
              Your name
            </label>

            <div className="flex items-center justify-between gap-2">
              {isEditingName ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full py-1 text-sm bg-transparent border-b-2 border-[#00a884] outline-none ${
                      theme === "dark" ? "text-white" : "text-[#111b21]"
                    }`}
                    autoFocus
                  />
                  <button
                    onClick={() => setShowNameEmoji(!showNameEmoji)}
                    className="text-[#8696a0] hover:text-[#54656f] p-1 cursor-pointer"
                  >
                    <FaSmile className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSave("name")}
                    className="text-[#00a884] hover:text-[#008f6f] p-1 cursor-pointer"
                  >
                    <FaCheck className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setShowNameEmoji(false);
                      setName(user?.username || "");
                    }}
                    className="text-[#8696a0] hover:text-red-500 p-1 cursor-pointer"
                  >
                    <MdCancel className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-[15px] font-normal text-[#111b21] dark:text-[#e9edef] truncate">
                    {user?.username || name || "Not set"}
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[#8696a0] hover:text-[#54656f] dark:hover:text-white p-1 cursor-pointer"
                  >
                    <FaPencilAlt className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>

            {showNameEmoji && (
              <div className="relative z-20 mt-2">
                <EmojiPicker
                  onEmojiClick={(emoji) => handleEmojiSelect(emoji, "name")}
                  theme={theme === "dark" ? "dark" : "light"}
                />
              </div>
            )}

            <p className="text-xs text-[#667781] dark:text-[#8696a0] mt-2 leading-relaxed">
              This is not your username or pin. This name will be visible to your WhatsApp contacts.
            </p>
          </div>

          {/* About Section */}
          <div
            className={`p-4 mx-4 mb-4 rounded-xl ${
              theme === "dark" ? "bg-[#202c33]" : "bg-white"
            } shadow-sm border ${
              theme === "dark" ? "border-[#222e35]" : "border-gray-100"
            }`}
          >
            <label className="block text-xs font-medium text-[#008069] dark:text-[#00a884] mb-1">
              About
            </label>

            <div className="flex items-center justify-between gap-2">
              {isEditingAbout ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    id="about"
                    type="text"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className={`w-full py-1 text-sm bg-transparent border-b-2 border-[#00a884] outline-none ${
                      theme === "dark" ? "text-white" : "text-[#111b21]"
                    }`}
                    autoFocus
                  />
                  <button
                    onClick={() => setShowAboutEmoji(!showAboutEmoji)}
                    className="text-[#8696a0] hover:text-[#54656f] p-1 cursor-pointer"
                  >
                    <FaSmile className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSave("about")}
                    className="text-[#00a884] hover:text-[#008f6f] p-1 cursor-pointer"
                  >
                    <FaCheck className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingAbout(false);
                      setShowAboutEmoji(false);
                      setAbout(user?.about || "");
                    }}
                    className="text-[#8696a0] hover:text-red-500 p-1 cursor-pointer"
                  >
                    <MdCancel className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-[15px] font-normal text-[#111b21] dark:text-[#e9edef] truncate">
                    {user?.about || about || "Hey there! I am using WhatsApp."}
                  </span>
                  <button
                    onClick={() => setIsEditingAbout(true)}
                    className="text-[#8696a0] hover:text-[#54656f] dark:hover:text-white p-1 cursor-pointer"
                  >
                    <FaPencilAlt className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>

            {showAboutEmoji && (
              <div className="relative z-20 mt-2">
                <EmojiPicker
                  onEmojiClick={(emoji) => handleEmojiSelect(emoji, "about")}
                  theme={theme === "dark" ? "dark" : "light"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDetails;
