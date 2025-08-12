import React, { useState, useEffect } from 'react';
import SalesReportForm from './SalesReportForm';
import SavedReports from './SavedReports';
import InstallmentLookup from './InstallmentLookup';
import InstallmentPayment from './InstallmentPayment';
import UserManagement from './UserManagement';
import SupervisorDashboard from './SupervisorDashboard';
import ExportReports from './ExportReports';
import AdvancedFilter from './AdvancedFilter';
import { isSupervisor } from '../data/authService';

const MainContent = () => {
  const [activeTab, setActiveTab] = useState('newReport');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isUserSupervisor, setIsUserSupervisor] = useState(false);
  
  useEffect(() => {
    // Check if user is supervisor
    setIsUserSupervisor(isSupervisor());
    
    // If user is supervisor, show the statistics dashboard by default
    if (isSupervisor()) {
      setActiveTab('supervisorDashboard');
    }
  }, []);
  
  const handleInstallmentSubmit = (bookingData) => {
    setSelectedBooking(bookingData);
  };
  
  const handlePaymentSuccess = () => {
    // After successful payment, clear selected booking and switch to saved reports
    setSelectedBooking(null);
    setActiveTab('savedReports');
  };
  
  const handleCancelPayment = () => {
    setSelectedBooking(null);
  };
  
  const renderContent = () => {
    // If there's a booking selected for installment payment, show payment screen
    if (selectedBooking) {
      return (
        <InstallmentPayment 
          bookingData={selectedBooking} 
          onCancel={handleCancelPayment} 
          onSuccess={handlePaymentSuccess}
        />
      );
    }
    
    // Otherwise show the active tab content
    switch (activeTab) {
      case 'newReport':
        return <SalesReportForm />;
      case 'savedReports':
        return <SavedReports />;
      case 'installment':
        return <InstallmentLookup onInstallmentSubmit={handleInstallmentSubmit} />;
      case 'userManagement':
        return isUserSupervisor ? <UserManagement /> : <SalesReportForm />;
      case 'supervisorDashboard':
        return isUserSupervisor ? <SupervisorDashboard /> : <SalesReportForm />;
      case 'exportReports':
        return isUserSupervisor ? <ExportReports /> : <SalesReportForm />;
      case 'advancedFilter':
        return isUserSupervisor ? <AdvancedFilter /> : <SalesReportForm />;
      default:
        return <SalesReportForm />;
    }
  };
  
  return (
    <div className="space-y-6">
      {!selectedBooking && (
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-8 px-4">
            {isUserSupervisor && (
              <button
                onClick={() => setActiveTab('supervisorDashboard')}
                className={`${
                  activeTab === 'supervisorDashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Statistics
              </button>
            )}
            <button
              onClick={() => setActiveTab('newReport')}
              className={`${
                activeTab === 'newReport'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              New Report
            </button>
            <button
              onClick={() => setActiveTab('savedReports')}
              className={`${
                activeTab === 'savedReports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Saved Reports
            </button>
            {isUserSupervisor && (
              <button
                onClick={() => setActiveTab('advancedFilter')}
                className={`${
                  activeTab === 'advancedFilter'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Advanced Filter
              </button>
            )}
            {isUserSupervisor && (
              <button
                onClick={() => setActiveTab('exportReports')}
                className={`${
                  activeTab === 'exportReports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Export Reports
              </button>
            )}
            <button
              onClick={() => setActiveTab('installment')}
              className={`${
                activeTab === 'installment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Installment Lookup
            </button>
            {isUserSupervisor && (
              <button
                onClick={() => setActiveTab('userManagement')}
                className={`${
                  activeTab === 'userManagement'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                User Management
              </button>
            )}
          </nav>
        </div>
      )}
      
      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default MainContent;