import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { FourSquare } from "react-loading-indicators";
import { Backdrop } from "@mui/material";

interface LoadingContextType {
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoading = useCallback(() => setLoading(true), []);
  const hideLoading = useCallback(() => setLoading(false), []);

  const contextValue = useMemo(() => ({
    showLoading,
    hideLoading
  }), [showLoading, hideLoading]);

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