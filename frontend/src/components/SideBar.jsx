import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useUserStore } from "../store/useUserStore";
import { useLayoutStore } from "../store/layoutStore";
import { motion } from "framer-motion";
import { FaWhatsapp, FaUserCircle, FaCog } from "react-icons/fa";
import { MdRadioButtonChecked } from "react-icons/md";

const SideBar = () => {
  const { theme } = useThemeStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useUserStore();
  const { activeTab, setActiveTab, selectedContact } = useLayoutStore();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("chats");
    } else if (location.pathname === "/status") {
      setActiveTab("status");
    } else if (location.pathname === "/user-profile") {
      setActiveTab("profile");
    } else if (location.pathname === "/setting") {
      setActiveTab("setting");
    }
  }, [location, setActiveTab]);

  if (isMobile && selectedContact) {
    return null;
  }

  const getItemClass = (tabName) => {
    const isActive = activeTab === tabName;
    const base = "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 focus:outline-none";
    if (isActive) {
      return `${base} ${
        theme === "dark"
          ? "bg-[#2a3942] text-[#00a884]"
          : "bg-[#e9edef] text-[#00a884]"
      }`;
    }
    return `${base} ${
      theme === "dark"
        ? "text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942]/50"
        : "text-[#54656f] hover:text-[#111b21] hover:bg-gray-200/50"
    }`;
  };

  const SidebarContent = (
    <>
      <div className={`flex ${isMobile ? "flex-row justify-around w-full" : "flex-col items-center gap-3"}`}>
        <Link
          to="/"
          title="Chats"
          className={getItemClass("chats")}
        >
          <FaWhatsapp className="w-5 h-5" />
        </Link>

        <Link
          to="/status"
          title="Status"
          className={getItemClass("status")}
        >
          <MdRadioButtonChecked className="w-5 h-5" />
        </Link>
      </div>

      {!isMobile && <div className="grow" />}

      <div className={`flex ${isMobile ? "flex-row justify-around w-full" : "flex-col items-center gap-3"}`}>
        <Link
          to="/setting"
          title="Settings"
          className={getItemClass("setting")}
        >
          <FaCog className="w-5 h-5" />
        </Link>

        <Link
          to="/user-profile"
          title="Profile"
          className={getItemClass("profile")}
        >
          {user?.profilePicture ? (
            <img
              src={user?.profilePicture}
              alt="user"
              className={`w-7 h-7 rounded-full object-cover ${
                activeTab === "profile"
                  ? "ring-2 ring-[#00a884] ring-offset-1 " +
                    (theme === "dark" ? "ring-offset-[#202c33]" : "ring-offset-[#f0f2f5]")
                  : ""
              }`}
            />
          ) : (
            <FaUserCircle className="w-5 h-5" />
          )}
        </Link>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`${
        isMobile
          ? "fixed bottom-0 left-0 right-0 h-14 border-t z-40"
          : "w-16 h-screen border-r shrink-0"
      } ${
        theme === "dark"
          ? "bg-[#202c33] border-[#222e35]"
          : "bg-[#f0f2f5] border-[#e9edef]"
      } flex items-center py-3 px-2 ${
        isMobile ? "flex-row justify-around" : "flex-col justify-between"
      }`}
    >
      {SidebarContent}
    </motion.div>
  );
};

export default SideBar;
