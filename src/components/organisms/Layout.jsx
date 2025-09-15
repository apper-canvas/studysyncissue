import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import MobileNavigation from "@/components/organisms/MobileNavigation";
import ApperIcon from "@/components/ApperIcon";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">StudySync</span>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="Menu" className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Page Content */}
          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </div>
  );
};

export default Layout;