import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { getCurrentUser, logoutUser, isSupervisor } from './data/authService';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check for an existing logged in user on component mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  // Handle successful login
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Handle navigation between tabs
  const handleNavigation = (tabName) => {
    setActiveTab(tabName);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-800">Loading...</div>
      </div>
    );
  }

  // If no user is logged in, show login screen
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={currentUser} onLogout={handleLogout} onNavigate={handleNavigation} />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} onNavigate={handleNavigation} isSupervisor={isSupervisor()} />
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'users' ? (
            <UserManagement />
          ) : (
            <MainContent />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;