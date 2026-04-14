import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';

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
  // Check for explicit env variable first
  const envUrl = import.meta.env.VITE_SIGNALR_HUB_URL;
  if (envUrl) {
    return envUrl;
  }

  // Always use localhost for development
  return 'http://localhost:5000/restaurantHub';
};

const HUB_URL = getHubUrl();

export const SignalRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        withCredentials: true,
        // If you have authentication, you might need to pass the token here
        // accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .configureLogging(signalR.LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          setIsConnected(true);
        })
        .catch((err) => console.error('SignalR Connection Error: ', err));

      connection.onclose(() => {
        setIsConnected(false);
      });

      return () => {
        connection.stop();
      };
    }
  }, [connection]);

  return (
    <SignalRContext.Provider value={{ connection, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};
