import React, { useState, useEffect } from 'react';
import { getSavedReports } from '../data/storageService';

const AdvancedFilter = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: '',
      endDate: ''
    },
    bookingType: '',
    region: '',
    agentName: '',
    service: '',
    provider: '',
    destination: '',
    customerName: '',
    amountRange: {
      min: '',
      max: ''
    },
    paymentMethod: '',
    installment: ''
  });
  
  useEffect(() => {
    loadReports();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [reports, filters]);
  
  const loadReports = () => {
    const savedReports = getSavedReports(false); // Get all reports without filtering
    setReports(savedReports);
    setFilteredReports(savedReports);
  };
  
  const applyFilters = () => {
    let filtered = [...reports];
    
    // Date range filter
    if (filters.dateRange.startDate) {
      const startDate = new Date(filters.dateRange.startDate);
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate >= startDate;
      });
    }
    
    if (filters.dateRange.endDate) {
      const endDate = new Date(filters.dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate <= endDate;
      });
    }
    
    // Simple string filters
    if (filters.bookingType) {
      filtered = filtered.filter(report => report.bookingType === filters.bookingType);
    }
    
    if (filters.region) {
      filtered = filtered.filter(report => report.region === filters.region);
    }
    
    if (filters.agentName) {
      filtered = filtered.filter(report => report.agentName === filters.agentName);
    }
    
    if (filters.service) {
      filtered = filtered.filter(report => report.service === filters.service);
    }
    
    if (filters.provider) {
      filtered = filtered.filter(report => report.provider === filters.provider);
    }
    
    if (filters.destination) {
      filtered = filtered.filter(report => report.destination === filters.destination);
    }
    
    // Partial text match for customer name
    if (filters.customerName) {
      const searchTerm = filters.customerName.toLowerCase();
      filtered = filtered.filter(report => 
        report.customerName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Amount range filters
    if (filters.amountRange.min) {
      const minAmount = parseFloat(filters.amountRange.min);
      filtered = filtered.filter(report => {
        const sellingRate = parseFloat(report.sellingRate);
        return !isNaN(sellingRate) && sellingRate >= minAmount;
      });
    }
    
    if (filters.amountRange.max) {
      const maxAmount = parseFloat(filters.amountRange.max);
      filtered = filtered.filter(report => {
        const sellingRate = parseFloat(report.sellingRate);
        return !isNaN(sellingRate) && sellingRate <= maxAmount;
      });
    }
    
    // Payment method filter
    if (filters.paymentMethod) {
      filtered = filtered.filter(report => report.paymentMethod === filters.paymentMethod);
    }
    
    // Installment filter
    if (filters.installment) {
      filtered = filtered.filter(report => report.installment === filters.installment);
    }
    
    setFilteredReports(filtered);
    
    // Reset selected report if it no longer matches filters
    if (selectedReport && !filtered.find(r => r.id === selectedReport.id)) {
      setSelectedReport(null);
    }
  };
  
  const handleFilterChange = (filterKey, value) => {
    setFilters(prevFilters => {
      if (filterKey.includes('.')) {
        // Handle nested properties (e.g., dateRange.startDate)
        const [parent, child] = filterKey.split('.');
        return {
          ...prevFilters,
          [parent]: {
            ...prevFilters[parent],
            [child]: value
          }
        };
      } else {
        // Handle top-level properties
        return {
          ...prevFilters,
          [filterKey]: value
        };
      }
    });
  };
  
  const resetFilters = () => {
    setFilters({
      dateRange: {
        startDate: '',
        endDate: ''
      },
      bookingType: '',
      region: '',
      agentName: '',
      service: '',
      provider: '',
      destination: '',
      customerName: '',
      amountRange: {
        min: '',
        max: ''
      },
      paymentMethod: '',
      installment: ''
    });
    setFilteredReports(reports);
  };
  
  const getUniqueValues = (field) => {
    const values = [...new Set(reports.map(report => report[field]))];
    return values.filter(Boolean).sort();
  };
  
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Advanced Report Filter</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Filters</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset All
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.startDate}
                    onChange={(e) => handleFilterChange('dateRange.startDate', e.target.value)}
                    className="w-full border rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.endDate}
                    onChange={(e) => handleFilterChange('dateRange.endDate', e.target.value)}
                    className="w-full border rounded p-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Booking Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
              <select
                value={filters.bookingType}
                onChange={(e) => handleFilterChange('bookingType', e.target.value)}
                className="w-full border rounded p-1.5 text-sm"
              >
                <option value="">All Types</option>
                {getUniqueValues('bookingType').map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full border rounded p-1.5 text-sm"
              >
                <option value="">All Regions</option>
                {getUniqueValues('region').map((region, index) => (
                  <option key={index} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            {/* Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
              <select
                value={filters.agentName}
                onChange={(e) => handleFilterChange('agentName', e.target.value)}
                className="w-full border rounded p-1.5 text-sm"
              >
                <option value="">All Agents</option>
                {getUniqueValues('agentName').map((agent, index) => (
                  <option key={index} value={agent}>{agent}</option>
                ))}
              </select>
            </div>
            
            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={filters.service}
                onChange={(e) => handleFilterChange('service', e.target.value)}
                className="w-full border rounded p-1.5 text-sm"
              >
                <option value="">All Services</option>
                {getUniqueValues('service').map((service, index) => (
                  <option key={index} value={service}>{service}</option>
                ))}
              </select>
            </div>
            
            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select
                value={filters.provider}
                onChange={(e) => handleFilterChange('provider', e.target.value)}
                className="w-full border rounded p-1.5 text-sm"
              >
                <option value="">All Providers</option>
                {getUniqueValues('provider').map((provider, index) => (
                  <option key={index} value={provider}>{provider}</option>
                ))}
              </select>
            </div>
            
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={filters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                placeholder="Search customer name"
                className="w-full border rounded p-1.5 text-sm"
              />
            </div>
            
            {/* Amount Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Amount Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min</label>
                  <input
                    type="number"
                    value={filters.amountRange.min}
                    onChange={(e) => handleFilterChange('amountRange.min', e.target.value)}
                    placeholder="Min"
                    className="w-full border rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max</label>
                  <input
                    type="number"
                    value={filters.amountRange.max}
                    onChange={(e) => handleFilterChange('amountRange.max', e.target.value)}
                    placeholder="Max"
                    className="w-full border rounded p-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full border rounded p-1.5 text-sm"
              >
                <option value="">All Methods</option>
                {getUniqueValues('paymentMethod').map((method, index) => (
                  <option key={index} value={method}>{method}</option>
                ))}
              </select>
            </div>
            
            {/* Installment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Installment</label>
              <select
                value={filters.installment}
                onChange={(e) => handleFilterChange('installment', e.target.value)}
                className="w-full border rounded p-1.5 text-sm"
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Results Panel */}
        <div className="md:col-span-3 space-y-6">
          {/* Results Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Search Results</h2>
            <p className="text-gray-600">Found {filteredReports.length} reports matching your criteria</p>
          </div>
          
          {/* Reports List */}
          <div className="bg-white rounded-lg shadow-md">
            {filteredReports.length === 0 ? (
              <div className="text-gray-500 italic text-center py-12">
                No reports found matching your filters
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr 
                        key={report.id} 
                        className={`hover:bg-gray-50 ${
                          selectedReport?.id === report.id ? 'bg-blue-50' : ''
                        }`}
                      >
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
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedReport(
                              selectedReport?.id === report.id ? null : report
                            )}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {selectedReport?.id === report.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Report Details */}
          {selectedReport && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Report Details</h2>
              
              <div className="space-y-4">
                {/* Booking Details */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Booking Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">Booking Type</span>
                      <div>{selectedReport.bookingType}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Date</span>
                      <div>{selectedReport.date}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Agent</span>
                      <div>{selectedReport.agentName}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Region</span>
                      <div>{selectedReport.region}</div>
                    </div>
                  </div>
                </div>
                
                {/* Customer Info */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">Name</span>
                      <div>{selectedReport.customerName}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Nationality</span>
                      <div>{selectedReport.customerNationality}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Mobile</span>
                      <div>{selectedReport.customerMobile}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Source</span>
                      <div>{selectedReport.source}</div>
                    </div>
                  </div>
                </div>
                
                {/* Service Info */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Service</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">Booking ID</span>
                      <div>{selectedReport.bookingId}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Service</span>
                      <div>{selectedReport.service}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Provider</span>
                      <div>{selectedReport.provider}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Destination</span>
                      <div>{selectedReport.destination}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Check In</span>
                      <div>{selectedReport.checkIn || '-'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Pax Number</span>
                      <div>{selectedReport.paxNumber}</div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Info */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Payment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">Currency</span>
                      <div>{selectedReport.currency}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Net Rate</span>
                      <div>{selectedReport.netRate}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Selling Rate</span>
                      <div>{selectedReport.sellingRate}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Payment Method</span>
                      <div>{selectedReport.paymentMethod}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Installment</span>
                      <div>{selectedReport.installment}</div>
                    </div>
                    {selectedReport.installment === 'Yes' && (
                      <>
                        <div>
                          <span className="text-gray-500 text-sm">Paid Amount</span>
                          <div>{selectedReport.installmentPaid}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Due Date</span>
                          <div>{selectedReport.dueDate || '-'}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Remarks */}
                {selectedReport.remarks && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Remarks</h3>
                    <p className="whitespace-pre-wrap">{selectedReport.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilter;