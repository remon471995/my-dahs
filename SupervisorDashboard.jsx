import React, { useState, useEffect } from 'react';
import { getSavedReports } from '../data/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { LineChart, Line } from 'recharts';

const SupervisorDashboard = () => {
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState({
    salesByRegion: [],
    salesByAgent: [],
    salesByMonth: [],
    salesByService: []
  });
  const [filterOptions, setFilterOptions] = useState({
    dateRange: 'all', // all, thisMonth, lastMonth, thisYear
    region: '',
    agent: '',
    service: ''
  });
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    loadReports();
  }, []);
  
  useEffect(() => {
    calculateStatistics(filterReports(reports));
  }, [reports, filterOptions]);
  
  const loadReports = () => {
    // Get all reports without filtering by user permissions
    const savedReports = getSavedReports(false);
    setReports(savedReports);
  };
  
  const calculateStatistics = (filteredReports) => {
    // Group by region
    const regionData = {};
    filteredReports.forEach(report => {
      regionData[report.region] = (regionData[report.region] || 0) + parseFloat(report.sellingRate || 0);
    });
    
    // Group by agent
    const agentData = {};
    filteredReports.forEach(report => {
      agentData[report.agentName] = (agentData[report.agentName] || 0) + parseFloat(report.sellingRate || 0);
    });
    
    // Group by month
    const monthData = {};
    filteredReports.forEach(report => {
      const date = new Date(report.timestamp);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthData[monthYear] = (monthData[monthYear] || 0) + parseFloat(report.sellingRate || 0);
    });
    
    // Group by service
    const serviceData = {};
    filteredReports.forEach(report => {
      serviceData[report.service] = (serviceData[report.service] || 0) + parseFloat(report.sellingRate || 0);
    });
    
    // Convert to array format for charts
    const salesByRegion = Object.keys(regionData).map(region => ({
      name: region,
      value: regionData[region]
    }));
    
    const salesByAgent = Object.keys(agentData).map(agent => ({
      name: agent,
      value: agentData[agent]
    }));
    
    const salesByMonth = Object.keys(monthData)
      .sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
      })
      .map(month => ({
        name: month,
        value: monthData[month]
      }));
    
    const salesByService = Object.keys(serviceData).map(service => ({
      name: service,
      value: serviceData[service]
    }));
    
    setStatistics({
      salesByRegion,
      salesByAgent,
      salesByMonth,
      salesByService
    });
  };
  
  const filterReports = (allReports) => {
    return allReports.filter(report => {
      const reportDate = new Date(report.timestamp);
      const now = new Date();
      
      // Date filtering
      let passesDateFilter = true;
      if (filterOptions.dateRange === 'thisMonth') {
        passesDateFilter = reportDate.getMonth() === now.getMonth() && 
                          reportDate.getFullYear() === now.getFullYear();
      } else if (filterOptions.dateRange === 'lastMonth') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        passesDateFilter = reportDate.getMonth() === lastMonth && 
                          reportDate.getFullYear() === lastMonthYear;
      } else if (filterOptions.dateRange === 'thisYear') {
        passesDateFilter = reportDate.getFullYear() === now.getFullYear();
      }
      
      // Region filtering
      const passesRegionFilter = !filterOptions.region || report.region === filterOptions.region;
      
      // Agent filtering
      const passesAgentFilter = !filterOptions.agent || report.agentName === filterOptions.agent;
      
      // Service filtering
      const passesServiceFilter = !filterOptions.service || report.service === filterOptions.service;
      
      return passesDateFilter && passesRegionFilter && passesAgentFilter && passesServiceFilter;
    });
  };
  
  const handleFilterChange = (filterType, value) => {
    setFilterOptions(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Get unique values for dropdown filters
  const getUniqueValues = (field) => {
    const values = [...new Set(reports.map(report => report[field]))];
    return values.filter(Boolean);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Sales Statistics</h1>
      
      {/* Filter controls */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filterOptions.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
            </select>
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
      
      {/* Sales by Region Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Sales by Region</h2>
          {statistics.salesByRegion.length === 0 ? (
            <div className="text-gray-500 italic text-center py-12">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.salesByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} />
                <Legend />
                <Bar dataKey="value" name="Sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Sales by Agent Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Sales by Agent</h2>
          {statistics.salesByAgent.length === 0 ? (
            <div className="text-gray-500 italic text-center py-12">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.salesByAgent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} />
                <Legend />
                <Bar dataKey="value" name="Sales" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      
      {/* Sales by Month and Service */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Month Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Sales by Month</h2>
          {statistics.salesByMonth.length === 0 ? (
            <div className="text-gray-500 italic text-center py-12">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} />
                <Legend />
                <Line type="monotone" dataKey="value" name="Sales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Sales by Service Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Sales by Service</h2>
          {statistics.salesByService.length === 0 ? (
            <div className="text-gray-500 italic text-center py-12">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.salesByService}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statistics.salesByService.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;