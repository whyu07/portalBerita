import React from 'react';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-shell">
      {/* 
        DashboardSidebar is rendered inside AdminDashboard to preserve existing state flow,
        but we provide the layout wrapper here. If children are passed, we render them, 
        otherwise Outlet.
      */}
      {children || <Outlet />}
    </div>
  );
};
