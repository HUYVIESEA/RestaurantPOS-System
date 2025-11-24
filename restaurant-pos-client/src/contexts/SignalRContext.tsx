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

// Auto-detect Hub URL based on current hostname (same logic as api.ts)
const getHubUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocalhost) {
    return 'http://localhost:5000/restaurantHub';
  }
  
  // For LAN access, use current hostname
  const protocol = window.location.protocol;
  const apiPort = 5000;
  const hubUrl = `${protocol}//${hostname}:${apiPort}/restaurantHub`;
  
  console.log('🔌 SignalR Hub URL:', hubUrl);
  return hubUrl;
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
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('SignalR Connected');
          setIsConnected(true);
        })
        .catch((err) => console.error('SignalR Connection Error: ', err));

      connection.onclose(() => {
        setIsConnected(false);
        console.log('SignalR Disconnected');
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
