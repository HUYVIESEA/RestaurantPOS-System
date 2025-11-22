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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Remove /api from the end to get the base URL, then add /restaurantHub
const HUB_URL = API_URL.replace('/api', '') + '/restaurantHub';

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
