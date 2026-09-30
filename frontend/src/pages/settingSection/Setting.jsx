import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaComment, FaMoon, FaQuestionCircle, FaSearch, FaSignOutAlt, FaSun, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { logoutUser } from '../../services/user.service';
import { useThemeStore } from '../../store/useThemeStore';
import Layout from '../../components/Layout';

const Setting = () => {
  const [isThemeDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { theme } = useThemeStore();
  const { user, clearUser } = useUserStore();

  const toggleThemeDialog = () => {
    setIsDialogOpen(!isThemeDialogOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUser();
      localStorage.removeItem("auth_token");
      toast.success("User logged out successfully");
      navigate("/user-login");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const settingsOptions = [
    { icon: FaUser, label: "Account", desc: "Security, profile info", href: "/user-profile" },
    { icon: FaComment, label: "Chats", desc: "Chat history, wallpaper", href: "/" },
    { icon: FaQuestionCircle, label: "Help", desc: "Help center, contact us", href: "/help" },
  ];

  const filteredOptions = settingsOptions.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout
      isThemeDialogOpen={isThemeDialogOpen}
      toggleThemeDialog={toggleThemeDialog}
    >
      <div
        className={`h-full w-full flex flex-col border-r ${
          theme === "dark"
            ? "bg-[#111b21] border-[#222e35] text-[#e9edef]"
            : "bg-white border-[#e9edef] text-[#111b21]"
        }`}
      >
        {/* Header */}
        <div
          className={`h-[60px] px-4 flex items-center shrink-0 ${
            theme === "dark" ? "bg-[#202c33]" : "bg-[#f0f2f5]"
          }`}
        >
          <h1 className="text-[19px] font-bold text-[#111b21] dark:text-[#e9edef]">
            Settings
          </h1>
        </div>

        {/* Search */}
        <div className={`p-2.5 shrink-0 ${theme === "dark" ? "bg-[#111b21]" : "bg-white"}`}>
          <div
            className={`flex items-center px-3 py-1.5 rounded-lg ${
              theme === "dark" ? "bg-[#202c33]" : "bg-[#f0f2f5]"
            }`}
          >
            <FaSearch className="h-4 w-4 text-[#54656f] dark:text-[#8696a0] mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings"
              className="w-full bg-transparent text-sm outline-none text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0]"
            />
          </div>
        </div>

        {/* Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Card */}
          <Link
            to="/user-profile"
            className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition border-b ${
              theme === "dark"
                ? "border-[#222e35] hover:bg-[#202c33]"
                : "border-[#e9edef] hover:bg-[#f5f6f6]"
            }`}
          >
            <img
              src={user?.profilePicture || "/placeholder.svg"}
              alt="profile"
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-medium text-[16px] text-[#111b21] dark:text-[#e9edef] truncate">
                {user?.username || "You"}
              </h2>
              <p className="text-xs text-[#667781] dark:text-[#8696a0] truncate mt-0.5">
                {user?.about || "Hey there! I am using WhatsApp."}
              </p>
            </div>
          </Link>

          {/* Links */}
          <div className="py-1">
            {filteredOptions.map((item) => (
              <Link
                to={item.href}
                key={item.label}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition ${
                  theme === "dark" ? "hover:bg-[#202c33]" : "hover:bg-[#f5f6f6]"
                }`}
              >
                <div className="text-[#54656f] dark:text-[#8696a0] shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div
                  className={`flex-1 min-w-0 pb-1 border-b ${
                    theme === "dark" ? "border-[#222e35]" : "border-[#e9edef]"
                  }`}
                >
                  <p className="text-[15px] font-normal text-[#111b21] dark:text-[#e9edef]">
                    {item.label}
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696a0] truncate">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleThemeDialog}
              className={`w-full flex items-center gap-4 px-4 py-3 text-left cursor-pointer transition ${
                theme === "dark" ? "hover:bg-[#202c33]" : "hover:bg-[#f5f6f6]"
              }`}
            >
              <div className="text-[#54656f] dark:text-[#8696a0] shrink-0">
                {theme === "dark" ? (
                  <FaMoon className="h-5 w-5" />
                ) : (
                  <FaSun className="h-5 w-5" />
                )}
              </div>
              <div
                className={`flex-1 flex items-center justify-between min-w-0 pb-1 border-b ${
                  theme === "dark" ? "border-[#222e35]" : "border-[#e9edef]"
                }`}
              >
                <div>
                  <p className="text-[15px] font-normal text-[#111b21] dark:text-[#e9edef]">
                    Theme
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696a0]">
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </p>
                </div>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 px-4 py-3 mt-4 text-left cursor-pointer transition ${
                theme === "dark"
                  ? "text-red-400 hover:bg-[#202c33]"
                  : "text-red-500 hover:bg-[#f5f6f6]"
              }`}
            >
              <div className="shrink-0">
                <FaSignOutAlt className="h-5 w-5" />
              </div>
              <div className="flex-1 text-[15px] font-medium">
                Log out
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Setting;