import React, { useState, useEffect } from "react";
import { FaPlus, FaCamera, FaEllipsisH, FaTimes } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import StatusPreview from "./StatusPreview";
import StatusList from "./StatusList";
import { useUserStore } from "../../store/useUserStore";
import useStatusStore from "../../store/useStatusStore";
import formatTimestamp from "../../utils/formatTime";
import Layout from "../../components/Layout";
import { useThemeStore } from "../../store/useThemeStore";

const Status = () => {
  const [previewContact, setPreviewContact] = useState(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [showOption, setShowOption] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [filePreview, setFilePreview] = useState(null);

  const { theme } = useThemeStore();
  const { user } = useUserStore();

  const {
    statuses,
    loading,
    error,
    fetchStatuses,
    createStatus,
    viewStatus,
    deleteStatus,
    getUserStatuses,
    getOtherStatuses,
    clearError,
    initializeSocket,
    cleanupSocket
  } = useStatusStore();

  const userStatuses = getUserStatuses(user?.id);
  const otherStatuses = getOtherStatuses(user?.id);

  useEffect(() => {
    fetchStatuses();
    initializeSocket();

    return () => {
      cleanupSocket();
    };
  }, [user?.id]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleCreateStatus = async () => {
    if (!newStatus.trim() && !selectedFile) return;
    try {
      await createStatus({
        content: newStatus,
        file: selectedFile
      });
      setNewStatus("");
      setSelectedFile(null);
      setFilePreview(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating status", error);
    }
  };

  const handleViewStatus = async (statusId) => {
    try {
      await viewStatus(statusId);
    } catch (err) {
      console.error("Error viewing status", err);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    try {
      await deleteStatus(statusId);
      setShowOption(false);
      handlePreviewClose();
    } catch (err) {
      console.error("Error deleting status", err);
    }
  };

  const handlePreviewClose = () => {
    setPreviewContact(null);
    setCurrentStatusIndex(0);
  };

  const handlePreviewNext = () => {
    if (currentStatusIndex < previewContact.statuses.length - 1) {
      setCurrentStatusIndex((prev) => prev + 1);
    } else {
      handlePreviewClose();
    }
  };

  const handlePreviewPrev = () => {
    setCurrentStatusIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleStatusPreview = (contact, statusIndex = 0) => {
    setPreviewContact(contact);
    setCurrentStatusIndex(statusIndex);
    if (contact.statuses[statusIndex]) {
      handleViewStatus(contact.statuses[statusIndex].id);
    }
  };

  return (
    <Layout
      isStatusPreviewOpen={!!previewContact}
      statusPreviewContent={
        previewContact && (
          <StatusPreview
            contact={previewContact}
            currentIndex={currentStatusIndex}
            onClose={handlePreviewClose}
            onNext={handlePreviewNext}
            onPrev={handlePreviewPrev}
            onDelete={handleDeleteStatus}
            theme={theme}
            currentUser={user}
            loading={loading}
          />
        )
      }
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
          className={`h-[60px] px-4 flex items-center justify-between shrink-0 ${
            theme === "dark" ? "bg-[#202c33]" : "bg-[#f0f2f5]"
          }`}
        >
          <h1 className="text-[19px] font-bold text-[#111b21] dark:text-[#e9edef]">
            Status
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            title="New status"
            className="p-2 text-[#54656f] dark:text-[#8696a0] hover:text-[#111b21] dark:hover:text-[#e9edef] rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <FaCamera className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm px-4 py-2.5 mx-4 mt-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              <RxCross2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User's Own Status Section */}
          <div
            className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition border-b ${
              theme === "dark"
                ? "border-[#222e35] hover:bg-[#202c33]"
                : "border-[#e9edef] hover:bg-[#f5f6f6]"
            }`}
            onClick={() =>
              userStatuses ? handleStatusPreview(userStatuses) : setShowCreateModal(true)
            }
          >
            <div className="relative shrink-0">
              <img
                src={user?.profilePicture || "/placeholder.svg"}
                alt={user?.username}
                className="w-12 h-12 rounded-full object-cover"
              />

              {/* Status Ring / Segment Indicator */}
              {userStatuses ? (
                <>
                  <svg
                    className="absolute top-0 left-0 w-12 h-12 pointer-events-none"
                    viewBox="0 0 100 100"
                  >
                    {userStatuses.statuses.map((_, index) => {
                      const total = userStatuses.statuses.length;
                      const circumference = 2 * Math.PI * 48;
                      const segmentLength = circumference / total;
                      const offset = index * segmentLength;

                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="48"
                          fill="none"
                          stroke="#25d366"
                          strokeWidth="4"
                          strokeDasharray={`${segmentLength - (total > 1 ? 4 : 0)} ${total > 1 ? 4 : 0}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 50 50)"
                        />
                      );
                    })}
                  </svg>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateModal(true);
                    }}
                    className="absolute -bottom-0.5 -right-0.5 bg-[#00a884] text-white p-1 rounded-full border-2 border-white dark:border-[#111b21]"
                  >
                    <FaPlus className="h-2.5 w-2.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateModal(true);
                  }}
                  className="absolute -bottom-0.5 -right-0.5 bg-[#00a884] text-white p-1 rounded-full border-2 border-white dark:border-[#111b21]"
                >
                  <FaPlus className="h-2.5 w-2.5" />
                </button>
              )}
            </div>

            {/* My Status Information */}
            <div className="flex-1 min-w-0">
              <p className="font-normal text-[16px] text-[#111b21] dark:text-[#e9edef] truncate">
                My Status
              </p>
              <p className="text-xs text-[#667781] dark:text-[#8696a0] truncate mt-0.5">
                {userStatuses
                  ? `${userStatuses.statuses.length} status${
                      userStatuses.statuses.length > 1 ? "es" : ""
                    } • ${formatTimestamp(
                      userStatuses.statuses[userStatuses.statuses.length - 1]
                        .timestamp
                    )}`
                  : "Tap to add status update"}
              </p>
            </div>

            {/* Options Dropdown Button */}
            {userStatuses && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOption(!showOption);
                  }}
                  className="p-2 text-[#54656f] dark:text-[#8696a0] hover:text-[#111b21] dark:hover:text-[#e9edef] rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <FaEllipsisH className="h-4 w-4" />
                </button>

                {showOption && (
                  <div
                    className={`absolute right-0 top-10 w-40 rounded-xl shadow-lg border py-1.5 z-30 ${
                      theme === "dark"
                        ? "bg-[#202c33] border-[#222e35] text-[#e9edef]"
                        : "bg-white border-gray-100 text-[#111b21]"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCreateModal(true);
                        setShowOption(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                    >
                      <FaCamera className="h-3.5 w-3.5 text-[#00a884]" />
                      Add Status
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusPreview(userStatuses);
                        setShowOption(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    >
                      View Status
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#00a884] border-t-transparent"></div>
            </div>
          )}

          {/* Recent Updates List */}
          {!loading && otherStatuses.length > 0 && (
            <div className="py-2">
              <h3 className="px-4 pt-3 pb-1 text-xs font-semibold text-[#008069] dark:text-[#00a884] uppercase tracking-wider">
                Recent updates
              </h3>
              {otherStatuses.map((contact) => (
                <StatusList
                  key={contact?.id}
                  contact={contact}
                  onPreview={() => handleStatusPreview(contact)}
                  theme={theme}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && statuses.length === 0 && !userStatuses && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3 text-[#54656f] dark:text-[#8696a0]">
                <FaCamera className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium mb-1 text-[#111b21] dark:text-[#e9edef]">
                No status updates yet
              </h3>
              <p className="text-xs text-[#667781] dark:text-[#8696a0]">
                Be the first to share a status update
              </p>
            </div>
          )}
        </div>

        {/* Create Status Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
              className={`p-6 rounded-2xl max-w-md w-full shadow-2xl border ${
                theme === "dark"
                  ? "bg-[#202c33] border-[#222e35] text-[#e9edef]"
                  : "bg-white border-gray-100 text-[#111b21]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Status</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewStatus("");
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="text-[#8696a0] hover:text-[#54656f] p-1 cursor-pointer"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>

              {/* Media File Preview */}
              {filePreview && (
                <div className="mb-4 relative rounded-xl overflow-hidden bg-black/10">
                  {selectedFile?.type.startsWith("video/") ? (
                    <video
                      src={filePreview}
                      controls
                      className="w-full max-h-48 object-cover rounded-xl"
                    />
                  ) : (
                    <img
                      src={filePreview}
                      alt="file-preview"
                      className="w-full max-h-48 object-cover rounded-xl"
                    />
                  )}
                </div>
              )}

              {/* Status Text Input */}
              <textarea
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="What's on your mind?"
                className={`w-full p-3 text-sm rounded-xl mb-4 border outline-none resize-none ${
                  theme === "dark"
                    ? "bg-[#111b21] text-white border-[#222e35] focus:border-[#00a884]"
                    : "bg-[#f0f2f5] text-black border-gray-200 focus:border-[#00a884]"
                }`}
                rows={3}
              />

              <div className="mb-5">
                <label className="block text-xs font-medium text-[#667781] dark:text-[#8696a0] mb-1.5">
                  Attach photo or video
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="text-xs text-[#667781] dark:text-[#8696a0] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#00a884] file:text-white hover:file:bg-[#008f6f] cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewStatus("");
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-[#667781] dark:text-[#8696a0] hover:text-[#111b21] dark:hover:text-[#e9edef] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStatus}
                  disabled={loading || (!newStatus.trim() && !selectedFile)}
                  className="px-5 py-2 bg-[#00a884] hover:bg-[#008f6f] text-white text-sm font-medium rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Posting..." : "Share"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Status;