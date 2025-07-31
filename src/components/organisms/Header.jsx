import React, { useContext } from "react";
import { useSelector } from 'react-redux';
import ApperIcon from "@/components/ApperIcon";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../App";

const Header = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/jobs":
        return "Jobs";
      case "/candidates":
        return "Candidates";
      case "/clients":
        return "Clients";
      default:
        return "Dashboard";
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="Menu" size={24} />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="lg:hidden">
            <h1 className="text-xl font-bold font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              TalentBridge
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ApperIcon name="Bell" size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ApperIcon name="Settings" size={20} />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <ApperIcon name="LogOut" size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
            <ApperIcon name="User" size={16} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;