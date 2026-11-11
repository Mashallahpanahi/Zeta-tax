
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen min-h-0 w-full gap-2 overflow-hidden bg-[#F0F2F8] p-2 font-sans sm:gap-3 sm:p-3 lg:gap-4 lg:p-4">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-3xl">
        <Header />

        <main className="min-h-0 flex-1 overflow-x-auto overflow-y-auto bg-white p-3 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0 xl:p-8 xl:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
