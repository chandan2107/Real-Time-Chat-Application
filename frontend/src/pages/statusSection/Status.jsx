import React, { useState, useEffect } from "react";

import useThemeStore from "../store/useThemeStore";
import useUserStore from "../store/useUserStore";
import useStatusStore from "../store/useStatusStore";


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
      setShowFileMenu(false)
      if(file.type.startsWith("image/") || file.type.startsWith("video/")){
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
    <div>Status</div>
  );
};

export default Status;