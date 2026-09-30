import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useThemeStore } from '../../store/useThemeStore';
import { FaCommentDots, FaPlus, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import formatTimestamp from '../../utils/formatTime';
import { useLayoutStore } from '../../store/layoutStore';
import { useChatStore } from '../../store/chatStore';
import NewChatDrawer from './NewChatDrawer';

const ChatList = ({ contacts, onRefreshContacts }) => {
  const setSelectedContact = useLayoutStore((state) => state.setSelectedContact);
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const { conversations } = useChatStore();
  const [searchTerms, setSearchTerms] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const isSearching = Boolean(searchTerms.trim());
  const q = searchTerms.toLowerCase().trim();

  // Filter contacts:
  // If searching: search across all contacts by username, phone, email, or about.
  // If NOT searching: only show active conversations (has conversation / last message / currently selected).
  const filteredContacts = contacts?.filter((contact) => {
    if (isSearching) {
      const matchName = contact?.username?.toLowerCase().includes(q);
      const matchPhone = contact?.phoneNumber?.includes(q);
      const matchEmail = contact?.email?.toLowerCase().includes(q);
      const matchAbout = contact?.about?.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchAbout;
    }

    const hasActiveChat =
      Boolean(contact?.conversation && (contact?.conversation?.lastMessage || contact?.conversation?._id)) ||
      Boolean(conversations?.data?.some((conv) => conv.participants?.some((p) => p._id === contact._id))) ||
      Boolean(selectedContact?._id === contact._id);

    return hasActiveChat;
  });

  return (
    <div
      className={`relative w-full h-full border-r flex flex-col overflow-hidden ${
        theme === "dark"
          ? "bg-[#111b21] border-[#222e35]"
          : "bg-white border-[#e9edef]"
      }`}
    >
      {/* WhatsApp New Chat Slide-over Drawer */}
      <NewChatDrawer
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        contacts={contacts}
        onSelectContact={(contact) => {
          setSelectedContact(contact);
          setIsNewChatOpen(false);
        }}
        theme={theme}
      />

      {/* WhatsApp ChatList Header */}
      <div
        className={`h-14 px-4 flex items-center justify-between shrink-0 ${
          theme === "dark" ? "bg-[#111b21]" : "bg-white"
        }`}
      >
        <h1
          className={`text-xl font-bold tracking-tight ${
            theme === "dark" ? "text-[#e9edef]" : "text-[#111b21]"
          }`}
        >
          Chats
        </h1>

        <button
          onClick={() => setIsNewChatOpen(true)}
          className={`p-2 rounded-full transition cursor-pointer ${
            theme === "dark"
              ? "text-[#aebac1] hover:bg-[#202c33]"
              : "text-[#54656f] hover:bg-gray-100"
          }`}
          title="New chat"
        >
          <FaPlus className="w-4 h-4" />
        </button>
      </div>

      {/* WhatsApp Search Bar */}
      <div
        className={`px-3 py-2 border-b shrink-0 ${
          theme === "dark"
            ? "border-[#222e35] bg-[#111b21]"
            : "border-[#e9edef] bg-white"
        }`}
      >
        <div
          className={`flex items-center rounded-lg px-3 py-1.5 transition ${
            theme === "dark"
              ? "bg-[#202c33] text-white"
              : "bg-[#f0f2f5] text-[#111b21]"
          }`}
        >
          <FaSearch
            className={`w-3.5 h-3.5 mr-3 shrink-0 ${
              theme === "dark" ? "text-[#8696a0]" : "text-[#54656f]"
            }`}
          />
          <input
            type="text"
            placeholder="Search or start new chat"
            className={`w-full bg-transparent text-sm focus:outline-none ${
              theme === "dark"
                ? "placeholder-[#8696a0] text-white"
                : "placeholder-[#54656f] text-[#111b21]"
            }`}
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="overflow-y-auto flex-1 divide-y-0">
        {filteredContacts?.length === 0 ? (
          isSearching ? (
            <div className="py-12 px-4 text-center">
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-[#8696a0]" : "text-[#667781]"
                }`}
              >
                No chats, contacts or messages found matching "{searchTerms}"
              </p>
            </div>
          ) : (
            <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3 text-[#54656f] dark:text-[#8696a0]">
                <FaCommentDots className="h-6 w-6 opacity-75" />
              </div>
              <p className="text-[15px] font-medium text-[#111b21] dark:text-[#e9edef] mb-1">
                No chats yet
              </p>
              <p className="text-xs text-[#667781] dark:text-[#8696a0] max-w-xs leading-relaxed mb-4">
                Search for someone or tap the + button to find users by username, phone number, or email and start a conversation.
              </p>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="px-4 py-2 bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-medium rounded-lg transition cursor-pointer"
              >
                Start a new chat
              </button>
            </div>
          )
        ) : (
          filteredContacts?.map((contact) => {
            const isSelected = selectedContact?._id === contact?._id;
            return (
              <motion.div
                key={contact._id}
                onClick={() => setSelectedContact(contact)}
                className={`px-3.5 py-3 flex items-center cursor-pointer transition-colors duration-100 ${
                  isSelected
                    ? theme === "dark"
                      ? "bg-[#2a3942]"
                      : "bg-[#f0f2f5]"
                    : theme === "dark"
                    ? "hover:bg-[#202c33]"
                    : "hover:bg-[#f5f6f6]"
                }`}
              >
                <img
                  src={contact?.profilePicture || "/placeholder.svg"}
                  alt={contact?.username}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />

                <div className="ml-3.5 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h2
                      className={`text-base font-normal tracking-tight truncate ${
                        theme === "dark" ? "text-[#e9edef]" : "text-[#111b21]"
                      }`}
                    >
                      {contact?.username}
                    </h2>
                    {contact?.conversation?.lastMessage?.createdAt && (
                      <span
                        className={`text-xs ml-2 shrink-0 ${
                          theme === "dark" ? "text-[#8696a0]" : "text-[#667781]"
                        }`}
                      >
                        {formatTimestamp(
                          contact?.conversation?.lastMessage?.createdAt
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <p
                      className={`text-sm truncate ${
                        theme === "dark" ? "text-[#8696a0]" : "text-[#667781]"
                      }`}
                    >
                      {contact?.conversation?.lastMessage?.content || "Tap to chat"}
                    </p>

                    {contact?.conversation?.unreadCount > 0 &&
                      String(contact?.conversation?.lastMessage?.receiver) ===
                        String(user?._id) && (
                        <span className="ml-2 shrink-0 bg-[#25d366] text-white text-xs font-semibold px-1.5 min-w-5 h-5 rounded-full flex items-center justify-center">
                          {contact?.conversation?.unreadCount}
                        </span>
                      )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
