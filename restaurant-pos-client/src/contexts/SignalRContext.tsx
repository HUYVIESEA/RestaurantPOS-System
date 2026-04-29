import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { useNotifications } from './NotificationContext';

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
});

export const useSignalR = () => useContext(SignalRContext);

// Auto-detect Hub URL based on current hostname
const getHubUrl = () => {
  const envUrl = import.meta.env.VITE_SIGNALR_HUB_URL;
  if (envUrl) {
    return envUrl;
  }
  
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // If accessing via LAN (not localhost), use the current IP for Hub
  if (!isLocalhost) {
    return `${window.location.protocol}//${hostname}:5000/restaurantHub`;
  }

  return 'http://localhost:5000/restaurantHub';
};

const HUB_URL = getHubUrl();

export const SignalRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        withCredentials: true,
        accessTokenFactory: () => localStorage.getItem('token') || '',
      })
      .configureLogging(signalR.LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.on('OrderCreated', (orderId: number) => {
        addNotification('order', 'Đơn hàng mới', `Có đơn hàng mới #${orderId}`, `/orders`);
      });

      connection.on('OrderUpdated', (orderId: number) => {
        addNotification('info', 'Cập nhật đơn hàng', `Đơn hàng #${orderId} đã được cập nhật`);
      });

      connection.on('OrderCompleted', (orderId: number) => {
        addNotification('success', 'Thanh toán thành công', `Đơn hàng #${orderId} đã hoàn tất`, `/orders`);
      });

      connection.on('TableUpdated', (tableId: number) => {
        addNotification('table', 'Cập nhật bàn', `Bàn ${tableId} đã thay đổi trạng thái`);
      });

      connection.on('ReceiveNotification', (message: string) => {
        addNotification('info', 'Thông báo', message);
      });

      connection.on('DevicesUpdated', () => {
        addNotification('info', 'Thiết bị', 'Danh sách thiết bị đã được cập nhật');
      });

      connection.start()
        .then(() => {
          setIsConnected(true);
          console.log('SignalR Connected');
        })
        .catch((err) => console.error('SignalR Connection Error: ', err));

      connection.onclose(() => {
        setIsConnected(false);
      });

      return () => {
        connection.stop();
      };
    }
  }, [connection, addNotification]);

  return (
    <SignalRContext.Provider value={{ connection, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};
