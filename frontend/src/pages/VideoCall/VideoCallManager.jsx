import React, { useCallback, useEffect } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useVideoCallStore } from '../../store/vedioCallStore';
import VideoCallModal from './VideoCallModal';

const VideoCallManager = ({ socket }) => {
  const {
    setIncomingCall,
    setCurrentCall,
    setCallType,
    setCallModalOpen,
    endCall,
    setCallStatus,
  } = useVideoCallStore();

  const { user } = useUserStore();

  // Handle incoming calls and call failures
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({
      callerId,
      callerName,
      callerAvatar,
      callType,
      callId,
    }) => {
      setIncomingCall({
        callerId,
        callerName,
        callerAvatar,
        callId,
      });

      setCallType(callType);
      setCallModalOpen(true);
      setCallStatus('ringing');
    };

    const handleCallEnded = () => {
      setCallStatus('failed');

      setTimeout(() => {
        endCall();
      }, 2000);
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_failed', handleCallEnded);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_failed', handleCallEnded);
    };
  }, [
    socket,
    setIncomingCall,
    setCallType,
    setCallModalOpen,
    setCallStatus,
    endCall,
  ]);

  // Initiate a call
  const initiateCall = useCallback(
    (receiverId, receiverName, receiverAvatar, callType = 'video') => {
      if (!socket || !user?._id) return;

      const callId = `${user._id}-${receiverId}-${Date.now()}`;

      const callData = {
        callId,
        participantId: receiverId,
        participantName: receiverName,
        participantAvatar: receiverAvatar,
      };

      setCurrentCall(callData);
      setCallType(callType);
      setCallModalOpen(true);
      setCallStatus('calling');

      socket.emit('initiate_call', {
        callId,
        callerId: user._id,
        receiverId,
        callType,
        callerInfo: {
          username: user.username,
          profilePicture: user.profilePicture,
        },
      });
    },
    [
      user,
      socket,
      setCurrentCall,
      setCallType,
      setCallModalOpen,
      setCallStatus,
    ]
  );

  // Expose the initiateCall function through the store
  useEffect(() => {
    useVideoCallStore.getState().initiateCall = initiateCall;

    return () => {
      if (
        useVideoCallStore.getState().initiateCall === initiateCall
      ) {
        useVideoCallStore.getState().initiateCall = null;
      }
    };
  }, [initiateCall]);

  return <VideoCallModal socket={socket} />;
};

export default VideoCallManager;