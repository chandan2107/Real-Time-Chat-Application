import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const NewChatDrawer = ({ isOpen, onClose, contacts, onSelectContact, theme }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Reset search whenever drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const trimmed = searchQuery.trim().toLowerCase();

  // Only filter and show users when a search query is entered
  const filteredContacts = trimmed
    ? contacts?.filter((contact) => {
        const username = contact?.username?.toLowerCase() || "";
        const phone = contact?.phoneNumber?.toLowerCase() || "";
        const fullPhone = `${contact?.phoneSuffix || ""}${contact?.phoneNumber || ""}`.toLowerCase();
        const email = contact?.email?.toLowerCase() || "";

        return (
          username.includes(trimmed) ||
          phone.includes(trimmed) ||
          fullPhone.includes(trimmed) ||
          email.includes(trimmed)
        );
      })
    : [];

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween", duration: 0.2 }}
          className={`absolute inset-0 z-30 flex flex-col ${
            theme === "dark" ? "bg-[#111b21] text-[#e9edef]" : "bg-white text-[#111b21]"
          }`}
        >
          {/* WhatsApp Header */}
          <div
            className={`h-[60px] px-4 flex items-center gap-4 shrink-0 ${
              theme === "dark" ? "bg-[#202c33] text-[#e9edef]" : "bg-[#008069] text-white"
            }`}
          >
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
              title="Back"
            >
              <FaArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-[19px] font-medium">New chat</h2>
          </div>

          {/* Search Bar */}
          <div
            className={`p-2.5 shrink-0 border-b ${
              theme === "dark" ? "bg-[#111b21] border-[#222e35]" : "bg-white border-[#e9edef]"
            }`}
          >
            <div
              className={`flex items-center rounded-lg px-3 py-1.5 transition ${
                theme === "dark" ? "bg-[#202c33] text-white" : "bg-[#f0f2f5] text-[#111b21]"
              }`}
            >
              <FaSearch
                className={`w-3.5 h-3.5 mr-3 shrink-0 ${
                  theme === "dark" ? "text-[#8696a0]" : "text-[#54656f]"
                }`}
              />
              <input
                type="text"
                placeholder="Search by name, phone or email"
                className={`w-full bg-transparent text-sm focus:outline-none ${
                  theme === "dark"
                    ? "placeholder-[#8696a0] text-white"
                    : "placeholder-[#54656f] text-[#111b21]"
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Contacts Area */}
          <div className="flex-1 overflow-y-auto">
            {!trimmed ? (
              /* Initial state when clicking + (no users showing) */
              <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3 text-[#54656f] dark:text-[#8696a0]">
                  <FaSearch className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-[#111b21] dark:text-[#e9edef] mb-1">
                  Search for a user
                </p>
                <p className="text-xs text-[#667781] dark:text-[#8696a0] max-w-xs leading-relaxed">
                  Enter a username, phone number, or email to find them and start a conversation.
                </p>
              </div>
            ) : filteredContacts.length === 0 ? (
              /* No matching search results */
              <div className="py-12 px-4 text-center text-sm text-[#667781] dark:text-[#8696a0]">
                No users found matching "{searchQuery}"
              </div>
            ) : (
              /* Matching Results */
              <div className="py-2">
                <div className="px-4 pt-1 pb-2">
                  <span className="text-xs font-semibold text-[#008069] dark:text-[#00a884] uppercase tracking-wider">
                    Search Results ({filteredContacts.length})
                  </span>
                </div>
                {filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => {
                      onSelectContact(contact);
                      handleClose();
                    }}
                    className={`px-4 py-3 flex items-center gap-3.5 cursor-pointer transition ${
                      theme === "dark" ? "hover:bg-[#202c33]" : "hover:bg-[#f5f6f6]"
                    }`}
                  >
                    <img
                      src={contact?.profilePicture || "/placeholder.svg"}
                      alt={contact?.username}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0 border-b border-[#e9edef] dark:border-[#222e35] pb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[16px] font-normal text-[#111b21] dark:text-[#e9edef] truncate">
                          {contact?.username}
                        </h3>
                        {contact?.phoneNumber && (
                          <span className="text-xs text-[#8696a0] ml-2 shrink-0">
                            {contact?.phoneSuffix || ""} {contact?.phoneNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#667781] dark:text-[#8696a0] truncate mt-0.5">
                        {contact?.email || contact?.about || "Hey there! I am using WhatsApp."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewChatDrawer;
