/**
 * Service for handling booking lookups and installment payments
 */

import { getSavedReports, saveReport } from './storageService';

/**
 * Find a booking by ID
 * @param {String} bookingId Booking ID to search for
 * @returns {Object|null} Found booking or null if not found
 */
export const findBookingById = (bookingId) => {
  try {
    const reports = getSavedReports();
    return reports.find(report => report.bookingId === bookingId) || null;
  } catch (error) {
    console.error('Error finding booking:', error);
    return null;
  }
};

/**
 * Process an installment payment for an existing booking
 * @param {String} bookingId Original booking ID
 * @param {Object} paymentData Payment data for the installment
 * @returns {Object} The saved report data
 */
export const processInstallmentPayment = (bookingId, paymentData) => {
  try {
    const originalBooking = findBookingById(bookingId);
    
    if (!originalBooking) {
      throw new Error('Original booking not found');
    }
    
    // Create a new report for this installment payment
    const installmentReport = {
      // Carry over booking details from original booking
      bookingType: 'Installment',
      date: new Date().toISOString().split('T')[0],  // Today's date
      agentName: paymentData.agentName || originalBooking.agentName,
      region: originalBooking.region,
      customerName: originalBooking.customerName,
      customerNationality: originalBooking.customerNationality,
      customerMobile: originalBooking.customerMobile,
      source: 'Returning Customer',
      bookingId: originalBooking.bookingId,
      service: originalBooking.service,
      provider: originalBooking.provider,
      destination: originalBooking.destination,
      checkIn: originalBooking.checkIn,
      paxNumber: originalBooking.paxNumber,
      currency: originalBooking.currency,
      netRate: originalBooking.netRate,
      sellingRate: originalBooking.sellingRate,
      // New payment details
      paymentMethod: paymentData.paymentMethod,
      paymentLink: paymentData.paymentLink || '',
      installment: 'Yes',
      installmentPaid: paymentData.installmentPaid,
      dueDate: paymentData.dueDate || '',
      remarks: `Installment payment for booking ID: ${originalBooking.bookingId}. ${paymentData.remarks || ''}`,
      // Additional file references
      bankFileName: paymentData.bankFileName || null,
      voucherFileName: paymentData.voucherFileName || null,
      invoiceFileName: paymentData.invoiceFileName || null,
      // Reference to original booking
      originalBookingId: originalBooking.id
    };
    
    // Save the installment report
    return saveReport(installmentReport);
  } catch (error) {
    console.error('Error processing installment payment:', error);
    throw new Error('Failed to process installment payment');
  }
};

/**
 * Get installment history for a booking
 * @param {String} bookingId Booking ID to get history for
 * @returns {Array} Array of related reports for this booking ID
 */
export const getInstallmentHistory = (bookingId) => {
  try {
    const reports = getSavedReports();
    return reports.filter(report => report.bookingId === bookingId)
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error getting installment history:', error);
    return [];
  }
};

/**
 * Calculate total amount paid for a booking
 * @param {String} bookingId Booking ID to calculate for
 * @returns {Object} Object containing total paid and remaining amounts
 */
export const calculateBookingPayments = (bookingId) => {
  try {
    const reports = getInstallmentHistory(bookingId);
    if (!reports || reports.length === 0) return { totalPaid: 0, remaining: 0 };
    
    const mainReport = reports[0]; // Most recent or original booking
    const sellingRate = parseFloat(mainReport.sellingRate) || 0;
    
    let totalPaid = 0;
    
    // Sum up all installment payments
    reports.forEach(report => {
      if (report.installment === 'Yes' && report.installmentPaid) {
        totalPaid += parseFloat(report.installmentPaid) || 0;
      }
    });
    
    // Handle case where original booking wasn't an installment
    if (mainReport.installment !== 'Yes') {
      totalPaid = sellingRate; // Assume full payment if not marked as installment
    }
    
    const remaining = Math.max(sellingRate - totalPaid, 0).toFixed(2);
    
    return {
      totalPaid: totalPaid.toFixed(2),
      remaining: remaining
    };
  } catch (error) {
    console.error('Error calculating booking payments:', error);
    return { totalPaid: '0.00', remaining: '0.00' };
  }
};