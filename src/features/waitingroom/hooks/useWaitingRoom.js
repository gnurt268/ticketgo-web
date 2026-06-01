import { useState, useEffect, useCallback, useRef } from 'react';
import waitingRoomAPI from '../waitingRoomAPI';

/**
 * Trạng thái của user trong queue
 */
export const QUEUE_STATUS = {
  NOT_JOINED: 'NOT_JOINED',
  PRE_QUEUE: 'PRE_QUEUE',
  WAITING: 'WAITING',
  READY: 'READY',
  SHOPPING: 'SHOPPING',
  EXPIRED: 'EXPIRED',
  LEFT: 'LEFT',
  COMPLETED: 'COMPLETED',
};

/**
 * Trạng thái của waiting room
 */
export const ROOM_STATUS = {
  SCHEDULED: 'SCHEDULED',
  PRE_QUEUE: 'PRE_QUEUE',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
};

const POLL_INTERVAL = 3000;
const COUNTDOWN_INTERVAL = 1000;

/**
 * Custom hook quản lý waiting room
 */
const useWaitingRoom = (eventId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waitingRoom, setWaitingRoom] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [userStatus, setUserStatus] = useState(QUEUE_STATUS.NOT_JOINED);
  const [countdown, setCountdown] = useState(0);
  const [isJoining, setIsJoining] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  /**
   * Fetch waiting room info
   */
  const fetchWaitingRoom = useCallback(async () => {
    try {
      const response = await waitingRoomAPI.getByEventId(eventId);
      setWaitingRoom(response.data);
      
      if (response.data?.saleStartTime) {
        const startTime = new Date(response.data.saleStartTime).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((startTime - now) / 1000));
        setCountdown(diff);
      }
      
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Sự kiện này không có phòng chờ');
      } else {
        setError(err.response?.data?.message || 'Không thể tải thông tin phòng chờ');
      }
      return null;
    }
  }, [eventId]);

  /**
   * Fetch queue status
   */
  const fetchQueueStatus = useCallback(async () => {
    try {
      const response = await waitingRoomAPI.getQueueStatus(eventId);
      const status = response.data;
      setQueueStatus(status);
      
      if (status?.status) {
        setUserStatus(status.status);
      }
      
      return status;
    } catch (err) {
      const sts = err.response?.status;
      if (sts === 404 || sts === 400) {
        setUserStatus(QUEUE_STATUS.NOT_JOINED);
        setQueueStatus(null);
      }
      return null;
    }
  }, [eventId]);

  /**
   * Join queue
   */
  const joinQueue = useCallback(async (options = {}) => {
    setIsJoining(true);
    setError(null);
    
    try {
      const response = await waitingRoomAPI.joinQueue(eventId, options);
      setQueueStatus(response.data);
      setUserStatus(response.data?.status || QUEUE_STATUS.PRE_QUEUE);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể vào hàng chờ';
      setError(message);
      return null;
    } finally {
      setIsJoining(false);
    }
  }, [eventId]);

  /**
   * Enter protected zone
   */
  const enterProtectedZone = useCallback(async () => {
    if (!queueStatus?.accessToken) {
      setError('Không có quyền truy cập');
      return null;
    }

    setIsEntering(true);
    setError(null);
    
    try {
      const response = await waitingRoomAPI.enterProtectedZone(
        eventId,
        queueStatus.accessToken
      );
      setUserStatus(QUEUE_STATUS.SHOPPING);
      setQueueStatus(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể vào mua vé';
      setError(message);
      await fetchQueueStatus();
      return null;
    } finally {
      setIsEntering(false);
    }
  }, [eventId, queueStatus?.accessToken, fetchQueueStatus]);

  /**
   * Leave queue
   */
  const leaveQueue = useCallback(async () => {
    try {
      await waitingRoomAPI.leaveQueue(eventId);
      setUserStatus(QUEUE_STATUS.LEFT);
      setQueueStatus(null);
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể rời hàng chờ';
      setError(message);
      return false;
    }
  }, [eventId]);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Format countdown
   */
  const formatCountdown = useCallback((seconds) => {
    if (seconds <= 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Format wait time
   */
  const formatWaitTime = useCallback((seconds) => {
    if (!seconds || seconds <= 0) return 'Ít hơn 1 phút';
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `Khoảng ${hours} giờ ${mins > 0 ? `${mins} phút` : ''}`;
    }
    if (mins > 0) {
      return `Khoảng ${mins} phút`;
    }
    return 'Ít hơn 1 phút';
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchWaitingRoom();
      await fetchQueueStatus();
      setLoading(false);
    };
    
    if (eventId) {
      init();
    }
  }, [eventId, fetchWaitingRoom, fetchQueueStatus]);

  // Polling
  useEffect(() => {
    const shouldPoll = [
      QUEUE_STATUS.PRE_QUEUE,
      QUEUE_STATUS.WAITING,
      QUEUE_STATUS.READY,
      QUEUE_STATUS.SHOPPING,
    ].includes(userStatus);

    if (shouldPoll) {
      pollIntervalRef.current = setInterval(fetchQueueStatus, POLL_INTERVAL);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [userStatus, fetchQueueStatus]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchWaitingRoom();
            fetchQueueStatus();
            return 0;
          }
          return prev - 1;
        });
      }, COUNTDOWN_INTERVAL);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [countdown, fetchWaitingRoom, fetchQueueStatus]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Computed
  const isInQueue = [
    QUEUE_STATUS.PRE_QUEUE,
    QUEUE_STATUS.WAITING,
    QUEUE_STATUS.READY,
    QUEUE_STATUS.SHOPPING,
  ].includes(userStatus);

  const canJoin = 
    userStatus === QUEUE_STATUS.NOT_JOINED && 
    waitingRoom?.canJoinNow === true;

  const canEnter = 
    userStatus === QUEUE_STATUS.READY && 
    queueStatus?.accessToken;

  return {
    loading,
    error,
    waitingRoom,
    queueStatus,
    userStatus,
    countdown,
    isJoining,
    isEntering,
    isInQueue,
    canJoin,
    canEnter,
    position: queueStatus?.position || 0,
    peopleAhead: queueStatus?.peopleAhead || 0,
    totalInQueue: queueStatus?.totalInQueue || 0,
    estimatedWaitSeconds: queueStatus?.estimatedWaitSeconds || 0,
    joinQueue,
    enterProtectedZone,
    leaveQueue,
    clearError,
    fetchWaitingRoom,
    fetchQueueStatus,
    formatCountdown,
    formatWaitTime,
  };
};

export default useWaitingRoom;