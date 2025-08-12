/**
 * Service for handling local storage operations for sales reports
 */
import { getCurrentUser, isSupervisor, canAccessReport } from './authService';

const STORAGE_KEY = 'sales_reports';

/**
 * Get all saved reports based on user role and region
 * @param {Boolean} filterByUser Whether to filter by the current user's permissions
 * @returns {Array} Array of report objects
 */
export const getSavedReports = (filterByUser = true) => {
  try {
    const savedReports = localStorage.getItem(STORAGE_KEY);
    const reports = savedReports ? JSON.parse(savedReports) : [];
    
    if (!filterByUser) return reports;
    
    const currentUser = getCurrentUser();
    
    // If not logged in, return no reports
    if (!currentUser) return [];
    
    // If user is supervisor, they can see all reports
    if (isSupervisor()) return reports;
    
    // Otherwise filter reports by agent name and region
    return reports.filter(report => 
      report.agentName === currentUser.name || 
      report.region === currentUser.region
    );
  } catch (error) {
    console.error('Error getting saved reports:', error);
    return [];
  }
};

/**
 * Save a new report
 * @param {Object} reportData Report data object
 * @returns {Object} Saved report with ID and timestamp
 */
export const saveReport = (reportData) => {
  try {
    const reports = getSavedReports(false); // Get all reports without filtering
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('You must be logged in to save a report');
    }
    
    // Create a new report with ID, timestamp, and user information
    const newReport = {
      ...reportData,
      id: generateId(),
      timestamp: new Date().toISOString(),
      agentName: reportData.agentName || currentUser.name,
      userId: currentUser.id
    };
    
    // Add to beginning of array (newest first)
    reports.unshift(newReport);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    
    return newReport;
  } catch (error) {
    console.error('Error saving report:', error);
    throw new Error('Failed to save report');
  }
};

/**
 * Delete a report by ID
 * @param {String} reportId Report ID to delete
 * @returns {Boolean} Success status
 */
export const deleteReport = (reportId) => {
  try {
    const reports = getSavedReports(false); // Get all reports without filtering
    const report = reports.find(r => r.id === reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    const currentUser = getCurrentUser();
    
    // Check if user has permission to delete
    if (!currentUser) {
      throw new Error('You must be logged in to delete a report');
    }
    
    if (!isSupervisor() && report.userId !== currentUser.id) {
      throw new Error('You do not have permission to delete this report');
    }
    
    const updatedReports = reports.filter(report => report.id !== reportId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
    return true;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

/**
 * Get reports for a specific user
 * @param {String} userId The user ID to get reports for
 * @returns {Array} Array of reports for the user
 */
export const getUserReports = (userId) => {
  try {
    const reports = getSavedReports(false); // Get all without filtering
    return reports.filter(report => report.userId === userId);
  } catch (error) {
    console.error('Error getting user reports:', error);
    return [];
  }
};

/**
 * Generate a unique ID for a report
 * @returns {String} Unique ID
 */
const generateId = () => {
  return 'report_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
};