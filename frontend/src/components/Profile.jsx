import React from "react";
import { motion } from "framer-motion";
import { FaUserCircle, FaArrowLeft, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useUserStore } from "../store/useUserStore";

const UserProfile = () => {
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen w-full ${
        isDark ? "bg-[#111b21] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`h-16 flex items-center px-4 border-b ${
          isDark ? "border-gray-700 bg-[#202c33]" : "border-gray-300 bg-white"
        }`}
      >
        <button
          onClick={() => navigate("/")}
          className="mr-4 p-2 rounded-full hover:bg-gray-500/20 transition"
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="text-xl font-semibold">Profile</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto px-5 py-8"
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle
                className={`w-32 h-32 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
            )}

            <button className="absolute bottom-1 right-1 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition">
              <FaEdit className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-2xl font-semibold mt-5">
            {user?.name || "User"}
          </h2>

          <p
            className={`mt-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {user?.email || "No email available"}
          </p>
        </div>

        <div
          className={`mt-10 rounded-xl overflow-hidden shadow-sm ${
            isDark ? "bg-[#202c33]" : "bg-white"
          }`}
        >
          <div className="px-5 py-4 border-b border-gray-500/20">
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Name
            </p>
            <p className="text-lg mt-1">
              {user?.name || "Not available"}
            </p>
          </div>

          <div className="px-5 py-4 border-b border-gray-500/20">
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Email
            </p>
            <p className="text-lg mt-1 break-all">
              {user?.email || "Not available"}
            </p>
          </div>

          <div className="px-5 py-4">
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Phone
            </p>
            <p className="text-lg mt-1">
              {user?.phone || "Not available"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;