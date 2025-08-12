import React, { useState, useRef, useEffect } from 'react';
import { isSupervisor } from '../data/authService';

const Header = ({ user, onLogout, onNavigate }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 font-bold text-xl">Sales Report System</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Role badge */}
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              user.role === 'supervisor' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
            }`}>
              {user.role === 'supervisor' ? 'Supervisor' : 'Agent'}
            </span>
            
            {/* Region badge */}
            {user.region && user.role !== 'supervisor' && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {user.region}
              </span>
            )}
            
            {/* User dropdown */}
            <div className="ml-3 relative" ref={dropdownRef}>
              <div>
                <button 
                  onClick={toggleDropdown}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <span>{getUserInitials()}</span>
                  </div>
                </button>
              </div>
              
              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="block px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.username}</p>
                  </div>
                  
                  {/* Dashboard link */}
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                  >
                    Dashboard
                  </button>
                  
                  {/* User Management link - only for supervisors */}
                  {isSupervisor() && (
                    <button
                      onClick={() => {
                        onNavigate('users');
                        setDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                    >
                      Manage Users
                    </button>
                  )}
                  
                  {/* Logout button */}
                  <button
                    onClick={onLogout}
                    className="block px-4 py-2 text-sm text-red-600 w-full text-left hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;