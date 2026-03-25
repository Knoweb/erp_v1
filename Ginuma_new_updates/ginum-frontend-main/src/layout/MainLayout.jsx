import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Topbar/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import TabHeader from "../components/TabHeader/TabHeader";

const MainLayout = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar - Hidden on Print */}
      <aside className={`no-print ${isSidebarVisible ? "block" : "hidden"}`}>
        <Sidebar isVisible={isSidebarVisible} />
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 h-full transition-all duration-300 main-content ${
          isSidebarVisible ? "lg:ml-72 ml-0" : "md:ml-1 ml-0"
        }`}
      >
        {/* Header with Fixed Height - Hidden on Print */}
        <header className="no-print">
          <Header
            toggleSidebar={toggleSidebar}
            isSidebarVisible={isSidebarVisible}
          />
        </header>

        {/* Tab Header - Hidden on Print */}
        <div className="no-print tab-header">
          <TabHeader pathname={location.pathname} />
        </div>

        {/* Main Content Area - Full width on Print */}
        <main className="flex-1 bg-gray-100 w-full overflow-auto mt-[4rem] print:mt-0 print:bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
