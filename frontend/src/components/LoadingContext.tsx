import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { FourSquare } from "react-loading-indicators";
import { Backdrop } from "@mui/material";

interface LoadingContextType {
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T>(apiPromise: Promise<T>, minDelay?: number) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoading = useCallback(() => setLoading(true), []);
  const hideLoading = useCallback(() => setLoading(false), []);

  const withLoading = useCallback(async <T,>(apiPromise: Promise<T>, minDelay = 3000): Promise<T> => {
    showLoading();
    const timer = new Promise((resolve) => setTimeout(resolve, minDelay));
    
    try {
      const [result] = await Promise.all([apiPromise, timer]);
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const contextValue = useMemo(() => ({
    showLoading,
    hideLoading,
    withLoading
  }), [showLoading, hideLoading, withLoading]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1000, 
          flexDirection: 'column', 
          gap: 2 
        }}
        open={loading}
      >
        <FourSquare color="#1976d2" size="medium" text="กำลังดำเนินการ..." textColor="#1976d2" />
      </Backdrop>
    </LoadingContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};