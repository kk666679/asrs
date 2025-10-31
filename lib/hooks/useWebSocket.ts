import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { RealtimeUpdate } from '@/lib/types';

interface UseWebSocketOptions {
  url?: string;
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    enabled = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!enabled || socketRef.current?.connected) return;

    try {
      socketRef.current = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        forceNew: true,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        onConnect?.();
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect if not manually disconnected
        if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionError(error);
        onError?.(error);
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      });

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError(error as Error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
  };

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const unsubscribe = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit:', event);
    }
  };

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, url]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    emit,
  };
};

// Specialized hook for real-time updates
export const useRealtimeUpdates = (enabled = true) => {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const { subscribe, unsubscribe, isConnected } = useWebSocket({ enabled });

  useEffect(() => {
    if (!isConnected) return;

    const handleUpdate = (update: RealtimeUpdate) => {
      setUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates
    };

    subscribe('realtime-update', handleUpdate);

    return () => {
      unsubscribe('realtime-update', handleUpdate);
    };
  }, [isConnected, subscribe, unsubscribe]);

  return {
    updates,
    isConnected,
    clearUpdates: () => setUpdates([]),
  };
};
