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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile && selectedContact) {
    return null;
  }

  const getItemClass = (tab) => {
    const active = activeTab === tab;

    return `
      flex items-center justify-center
      w-11 h-11 rounded-xl
      transition-all duration-200
      ${!isMobile ? "mb-6" : ""}
      ${
        active
          ? theme === "dark"
            ? "bg-gray-200 text-gray-900 shadow-md"
            : "bg-gray-800 text-white shadow-md"
          : theme === "dark"
            ? "text-gray-300 hover:bg-gray-700 hover:text-white"
            : "text-gray-700 hover:bg-white hover:shadow-sm"
      }
    `;
  };

  const iconClass = "w-5 h-5";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        ${
          isMobile
            ? "fixed bottom-0 left-0 right-0 h-16 px-4"
            : "w-20 h-screen py-6 border-r"
        }
        ${
          theme === "dark"
            ? "bg-[#202c33] border-gray-700"
            : "bg-[#f1f3f8] border-gray-200"
        }
        flex items-center
        ${isMobile ? "justify-around" : "flex-col"}
        z-40
      `}
    >
      <Link to="/" className={getItemClass("chats")}>
        <FaWhatsapp className={iconClass} />
      </Link>

      <Link to="/status" className={getItemClass("status")}>
        <MdRadioButtonChecked className={iconClass} />
      </Link>

      {!isMobile && <div className="flex-1" />}

      <Link to="/user-profile" className={getItemClass("profile")}>
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="user"
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <FaUserCircle className={iconClass} />
        )}
      </Link>

      <Link to="/setting" className={getItemClass("setting")}>
        <FaCog className={iconClass} />
      </Link>
    </motion.div>
  );
};

export default SideBar;