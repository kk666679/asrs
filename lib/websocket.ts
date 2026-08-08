import { useEffect, useRef, useState, useCallback } from 'react';

type EventCallback = (data: any) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<EventCallback>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 2000;
  private maxReconnectDelay = 30000;
  private url: string;
  private _state: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private stateListeners = new Set<(state: 'disconnected' | 'connecting' | 'connected') => void>();

  constructor(url: string) {
    this.url = url;
  }

  private setState(state: 'disconnected' | 'connecting' | 'connected') {
    this._state = state;
    this.stateListeners.forEach(cb => cb(state));
  }

  connect() {
    if (this._state !== 'disconnected') return;
    this.setState('connecting');
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.setState('connected');
        this.reconnectDelay = 2000;
      };
      this.ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);
          this.listeners.get(type)?.forEach(cb => cb(payload));
          this.listeners.get('*')?.forEach(cb => cb({ type, payload }));
        } catch {}
      };
      this.ws.onclose = () => {
        this.setState('disconnected');
        this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.setState('disconnected');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }

  emit(event: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, payload: data }));
    }
  }

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
    if (this._state === 'disconnected') this.connect();
  }

  unsubscribe(event: string, callback?: EventCallback) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(callback);
    }
  }

  onStateChange(cb: (state: 'disconnected' | 'connecting' | 'connected') => void) {
    this.stateListeners.add(cb);
    return () => { this.stateListeners.delete(cb); };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.setState('disconnected');
  }

  get connectionState() {
    return this._state;
  }
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
export const websocketManager = new WebSocketManager(WS_URL);

export const useWebSocket = () => {
  const [state, setState] = useState(websocketManager.connectionState);

  useEffect(() => {
    const unsub = websocketManager.onStateChange((s) => setState(s));
    return unsub;
  }, []);

  const subscribe = useCallback((event: string, cb: EventCallback) => {
    websocketManager.subscribe(event, cb);
    return () => websocketManager.unsubscribe(event, cb);
  }, []);

  return {
    isConnected: state === 'connected',
    connectionState: state,
    emit: websocketManager.emit.bind(websocketManager),
    subscribe,
    unsubscribe: websocketManager.unsubscribe.bind(websocketManager),
  };
};

export const useWebSocketEvent = <T = any>(event: string, callback: (data: T) => void) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (data: T) => callbackRef.current(data);
    websocketManager.subscribe(event, handler);
    return () => websocketManager.unsubscribe(event, handler);
  }, [event]);
};
