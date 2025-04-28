import React from "react";
import { Outlet } from "react-router";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      Mobile Sidebar{" "}
      <aside className="w-full max-x-[270px] hidden lg:block">
        Main Sidebar
      </aside>{" "}
      <aside className="children">
        <Outlet />
      </aside>
    </div>
  );
};

export default AdminLayout;
