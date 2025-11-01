import React from 'react';

// Simplified WebSocket manager that doesn't cause errors
class WebSocketManager {
  private isConnected = false;

  constructor() {
    // Don't auto-connect to prevent errors
  }

  public emit(event: string, data: any) {
    // No-op for development
  }

  public subscribe(event: string, callback: (data: any) => void) {
    // No-op for development
  }

  public unsubscribe(event: string, callback?: (data: any) => void) {
    // No-op for development
  }

  public disconnect() {
    // No-op for development
  }

  public get connectionState(): string {
    return 'disconnected';
  }
}

export const websocketManager = new WebSocketManager();

export const useWebSocket = () => {
  return {
    isConnected: false,
    connectionState: 'disconnected',
    emit: websocketManager.emit.bind(websocketManager),
    subscribe: websocketManager.subscribe.bind(websocketManager),
    unsubscribe: websocketManager.unsubscribe.bind(websocketManager),
  };
};