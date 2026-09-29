import {create} from "zustand";
import { axiosInstance } from "../services/url.service";
import { getSocket } from "../services/chat.service";

const useStatusStore = create((set, get) => ({
  
  statuses: [],
  loading: false,
  error: null,

  setStatus: (statuses) => set({ statuses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  initializeSocket: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("new_status", (newStatus) => {
      set((state) => ({
        statuses: state.statuses.some((s) => s._id === newStatus._id)
    ? state.statuses: [newStatus, ...state.statuses]
        
        
      }))
    });

    
    socket.on("status_deleted", (statusId) => {
      set((state) => ({
        statuses: state.statuses.filter((s) => s._id !== statusId)
      }));
    });

    socket.on("status_viewed", ({ statusId, viewers }) => {
      set((state) => ({
        statuses: state.statuses.map((status) =>
          status._id === statusId ? { ...status, viewers } : status
        )
      }));
    });
  },


  cleanupSocket: () => {
    const socket = getSocket();
    if (socket) {
      socket.off("new_status");
      socket.off("status_deleted");
      socket.off("status_viewed");
    }
  },

  
  fetchStatuses: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/status");
      set({ statuses: data.data, loading: false });
    } catch (error) {
      console.error("Error fetching status", error);
      set({ error: error.message, loading: false });
    }
  },

 
  createStatus: async (statusData) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      if (statusData.file) {
        formData.append("media", statusData.file);
      }
      if (statusData.content && statusData.content.trim()) {
        formData.append("content", statusData.content);
      }

      const { data } = await axiosInstance.post("/status", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (data.data) {
        set((state) => ({
          statuses: state.statuses.some((s) => s._id === data.data._id)?
          state.statuses: [data.data, ...state.statuses] 
        }));
        console.log("Updated statuses:", get().statuses);
      }

      
    } catch (error) {
      console.error("Error creating status", error);
      set({ error: error.message, loading: false });
      throw error;
    } finally {
    // Always stop the loader after success or failure
    set({ loading: false });
  }
  },

  // Mark status as viewed
  viewStatus: async (statusId) => {
    

    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/status/${statusId}/view`);
      
        set((state) => ({
          statuses: state.statuses.map((status) =>
            status._id === statusId ? {...status} : status
          ),
          loading: false
        }));
      
    } catch (error) {
      set({ error: error.message,loading:false });
    }
  },

  // Delete status
  deleteStatus: async (statusId) => {
    
    try {
        set({ loading: true, error: null });
      await axiosInstance.delete(`/status/${statusId}`);
      set((state) => ({
        statuses: state.statuses.filter((s) => s._id !== statusId),
        loading: false
      }));
    } catch (error) {
      console.error("Error deleting status", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },


  getStatusViewers: async (statusId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get(`/status/${statusId}/viewers`);
      
      return data.data;
    } catch (error) {
      console.error("Error getting status viewers", error);
      set({ error: error.message, loading: false });
      throw error
    }
  },

  
  getGroupedStatus: () => {
    const {statuses} = get();
    return statuses.reduce((acc, status) => {
      const statusUserId = status.user?._id;
      if (!acc[statusUserId]) {
        acc[statusUserId] = {
          id: statusUserId,
          name: status?.user?.username,
          avatar: status?.user?.profilePicture,
          statuses: []
        };
      }
      acc[statusUserId].statuses.push({
        id: status._id,
        media: status.content,
        contentType: status.contentType,
        timestamp: status.createdAt,
        viewers: status.viewers
      });
      return acc;
    }, {});
  },

  
  getUserStatuses: (userId) => {
    const groupedStatus = get().getGroupedStatus();
    return userId ? groupedStatus[userId] : null;
  },

  
  getOtherStatuses: (userId) => {
    const groupedStatus = get().getGroupedStatus();
    return Object.values(groupedStatus).filter(
      (contact) => contact.id !== userId
    );
  },

  // Clear error message
  clearError: () => set({ error: null }),

  // Reset store to initial state
  reset: () => set({ statuses: [], loading: false, error: null })
}));

export default useStatusStore;
