import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { ownerRoutes } from './ownerRoutes';


const AppRouter = () => {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/owner" replace />} />

        {ownerRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={<route.component />}>
            {route.children?.map((child) => (
              <Route 
                key={child.path || 'index'} 
                index={child.index} 
                path={child.path} 
                element={<child.component />} 
              />
            ))}
          </Route>
        ))}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;