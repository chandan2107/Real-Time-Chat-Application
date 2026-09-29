import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaCamera, FaEllipsisH, FaMobileAlt, FaTimes } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import StatusPreview from "./StatusPreview";
import StatusList from "./StatusList";
import {useUserStore} from "../../store/useUserStore";
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

  // Create sttatus
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`h-screen border-r ${theme === "dark"
            ? "bg-[#0c1218] text-white border-gray-600"
            : "bg-gray-100 text-black border-gray-200"
          }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center shadow-md p-4 ${theme === "dark" ? "bg-[#111b21] text-white" : "bg-white text-black"
            }`}
        >
          <h2 className="text-2xl font-bold">Status</h2>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mt-2 mb-2">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={clearError}
              className="float-right text-red-500 hover:text-red-700"
            >
              <RxCross2 className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Scrollable Main Content */}
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {/* User's Own Status Section */}
          <div
            className={`flex items-center space-x-4 p-3 shadow-md ${theme === "dark" ? "bg-[#111b21]" : "bg-white"
              }`}
          >
            <div
              className="relative cursor-pointer"
              onClick={() =>
                userStatuses ? handleStatusPreview(userStatuses) : setShowCreateModal(true)
              }

            >
              <img
                src={user?.profilePicture || "/placeholder.svg"}
                alt={user?.username}
                className="w-12 h-12 rounded-full object-cover"
              />

              {/* Status Ring / Segment Indicator */}
              {userStatuses ? (
                <>
                  <svg
                    className="absolute top-0 left-0 w-12 h-12"
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
                          strokeDasharray={`${segmentLength - 5} 5`}
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
                    className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full"
                  >
                    <FaPlus className="h-2 w-2" />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateModal(true);
                  }}
                  className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full"
                >
                  <FaPlus className="h-2 w-2" />
                </button>
              )}
            </div>




            {/* My Status Information */}
            <div className="flex flex-col items-start flex-1">
              <p className="font-semibold">My Status</p>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                {userStatuses ?
                  `${userStatuses.statuses.length} status ${userStatuses.statuses.length > 1 ? " . " : ""
                  }  ${formatTimestamp(
                    userStatuses.statuses[userStatuses.statuses.length - 1]
                      .timestamp
                  )}`
                  :
                  "Tap to add status update"
                }
              </p>
            </div>

            {/* Options Dropdown Button */}
            {userStatuses && (
              <button
                onClick={() => setShowOption(!showOption)}
                className={`ml-auto ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                <FaEllipsisH className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Dropdown Options (Add Status / View Status) */}
          {showOption && userStatuses && (
            <div
              className={`p-2 shadow-md ${theme === "dark" ? "bg-[#111b21]" : "bg-white"
                }`}
            >
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setShowOption(false);
                }}
                className="w-full text-left text-green-500 py-2 px-2 hover:bg-gray-100 rounded flex items-center"
              >
                <FaCamera className="inline-block mr-2" />
                Add Status
              </button>
              <button
                onClick={() => {
                  handleStatusPreview(userStatuses);
                  setShowOption(false);
                }}
                className="w-full text-left text-blue-500 py-2 px-2 hover:bg-gray-100 rounded"
              >
                View Status
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}

          {/* Recent Updates List */}
          {!loading && otherStatuses.length > 0 && (
            <div className={`p-4 space-y-4 mt-4 shadow-md ${theme === "dark" ? "bg-[rgb(17,27,33)]" : "bg-white"
              }`}>
              <h3
                className={`font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                Recent updates
              </h3>
              {otherStatuses.map((contact, index) => (
                <React.Fragment key={contact?.id}>
                  <StatusList
                    contact={contact}
                    onPreview={() => handleStatusPreview(contact)}
                    theme={theme}
                  />
                  {index < otherStatuses.length - 1 && (
                    <hr
                      className={
                        theme === "dark"
                          ? "border-gray-700"
                          : "border-gray-200"
                      }
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && statuses.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div
                className={`text-6xl mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-300"
                  }`}
              >
                📱
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                No status updates yet
              </h3>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-600"
                  }`}
              >
                Be the first to share a status update
              </p>
            </div>
          )}
        </div>

        {/* Create Status Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`p-6 rounded-lg max-w-md w-full mx-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-black"
                  }`}
              >
                Create Status
              </h3>

              {/* Media File Preview */}
              {filePreview && (
                <div className="mb-4 relative">
                  {selectedFile?.type.startsWith("video/") ? (
                    <video
                      src={filePreview}
                      controls
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <img
                      src={filePreview}
                      alt="file-preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>
              )}

              {/* Status Text Input */}
              <textarea
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="What's on your mind?"
                className={`w-full p-3 border rounded-lg mb-4 ${theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                  }`}
                rows={3}
              />
            

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="mb-4"
            />

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
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStatus}
                disabled={loading || (!newStatus.trim() && !selectedFile)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
          </div>

        )}
      </motion.div>
    </Layout>
  );
};

export default Status;