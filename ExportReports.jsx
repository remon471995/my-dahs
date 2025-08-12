import React, { useState, useEffect } from 'react';
import { getSavedReports } from '../data/storageService';

const ExportReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    startDate: '',
    endDate: '',
    region: '',
    agent: '',
    service: '',
  });
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  useEffect(() => {
    loadReports();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [reports, filterOptions]);
  
  useEffect(() => {
    // Update selectAll state based on selections
    if (filteredReports.length === 0) {
      setSelectAll(false);
    } else {
      setSelectAll(selectedReports.length === filteredReports.length);
    }
  }, [selectedReports, filteredReports]);
  
  const loadReports = () => {
    const savedReports = getSavedReports(false); // Get all reports
    setReports(savedReports);
    setFilteredReports(savedReports);
  };
  
  const applyFilters = () => {
    let filtered = [...reports];
    
    // Filter by date range
    if (filterOptions.startDate) {
      const startDate = new Date(filterOptions.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate >= startDate;
      });
    }
    
    if (filterOptions.endDate) {
      const endDate = new Date(filterOptions.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate <= endDate;
      });
    }
    
    // Filter by region
    if (filterOptions.region) {
      filtered = filtered.filter(report => report.region === filterOptions.region);
    }
    
    // Filter by agent
    if (filterOptions.agent) {
      filtered = filtered.filter(report => report.agentName === filterOptions.agent);
    }
    
    // Filter by service
    if (filterOptions.service) {
      filtered = filtered.filter(report => report.service === filterOptions.service);
    }
    
    setFilteredReports(filtered);
    
    // Reset selections when filters change
    setSelectedReports([]);
    setSelectAll(false);
  };
  
  const handleFilterChange = (field, value) => {
    setFilterOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else {
        return [...prev, reportId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
    setSelectAll(!selectAll);
  };
  
  const getUniqueValues = (field) => {
    const values = [...new Set(reports.map(report => report[field]))];
    return values.filter(Boolean);
  };
  
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };
  
  const exportToCsv = () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report to export');
      return;
    }
    
    const reportsToExport = filteredReports.filter(report => 
      selectedReports.includes(report.id)
    );
    
    // Define CSV headers
    const headers = [
      'Date',
      'Booking ID',
      'Agent',
      'Region',
      'Customer Name',
      'Service',
      'Provider',
      'Destination',
      'Check-In',
      'Pax',
      'Currency',
      'Net Rate',
      'Selling Rate',
      'Payment Method',
      'Installment',
      'Paid Amount',
      'Due Date'
    ];
    
    // Map report data to CSV rows
    const rows = reportsToExport.map(report => [
      new Date(report.timestamp).toLocaleDateString(),
      report.bookingId,
      report.agentName,
      report.region,
      report.customerName,
      report.service,
      report.provider,
      report.destination,
      report.checkIn || '',
      report.paxNumber,
      report.currency,
      report.netRate,
      report.sellingRate,
      report.paymentMethod,
      report.installment,
      report.installment === 'Yes' ? report.installmentPaid : '',
      report.installment === 'Yes' ? report.dueDate : ''
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales-reports-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToJson = () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report to export');
      return;
    }
    
    const reportsToExport = filteredReports.filter(report => 
      selectedReports.includes(report.id)
    );
    
    const jsonContent = JSON.stringify(reportsToExport, null, 2);
    const encodedUri = encodeURI('data:application/json;charset=utf-8,' + jsonContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales-reports-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Export Reports</h1>
      
      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filter Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filterOptions.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filterOptions.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              value={filterOptions.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">All Regions</option>
              {getUniqueValues('region').map((region, index) => (
                <option key={index} value={region}>{region}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select
              value={filterOptions.agent}
              onChange={(e) => handleFilterChange('agent', e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">All Agents</option>
              {getUniqueValues('agentName').map((agent, index) => (
                <option key={index} value={agent}>{agent}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={filterOptions.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">All Services</option>
              {getUniqueValues('service').map((service, index) => (
                <option key={index} value={service}>{service}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Reports Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">
            Reports ({filteredReports.length})
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={exportToCsv}
              disabled={selectedReports.length === 0}
              className={`px-4 py-2 text-sm font-medium rounded-md
                ${selectedReports.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Export to CSV
            </button>
            
            <button
              onClick={exportToJson}
              disabled={selectedReports.length === 0}
              className={`px-4 py-2 text-sm font-medium rounded-md
                ${selectedReports.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              Export to JSON
            </button>
          </div>
        </div>
        
        {filteredReports.length === 0 ? (
          <div className="text-gray-500 italic text-center py-12">
            No reports match the selected filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span>Select All</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => handleSelectReport(report.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.timestamp)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.bookingId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.customerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.agentName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.region}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.service}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.currency} {report.sellingRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportReports;