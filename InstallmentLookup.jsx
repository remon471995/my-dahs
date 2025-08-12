import React, { useState } from 'react';
import { findBookingById, getInstallmentHistory, calculateBookingPayments } from '../data/bookingService';

const InstallmentLookup = ({ onInstallmentSubmit }) => {
  const [bookingId, setBookingId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [installmentHistory, setInstallmentHistory] = useState([]);
  const [paymentCalculation, setPaymentCalculation] = useState(null);

  const handleLookup = (e) => {
    e.preventDefault();
    setLookupError('');
    
    if (!bookingId.trim()) {
      setLookupError('Please enter a Booking ID');
      return;
    }
    
    // Find the booking
    const booking = findBookingById(bookingId);
    
    if (!booking) {
      setLookupError('Booking not found. Please check the ID and try again.');
      setBookingData(null);
      setInstallmentHistory([]);
      setPaymentCalculation(null);
      return;
    }
    
    // Get payment history
    const history = getInstallmentHistory(bookingId);
    const payments = calculateBookingPayments(bookingId);
    
    setBookingData(booking);
    setInstallmentHistory(history);
    setPaymentCalculation(payments);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const handleProceedToInstallment = () => {
    if (bookingData && parseFloat(paymentCalculation.remaining) > 0) {
      onInstallmentSubmit(bookingData);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Installment Lookup</h1>
      
      <form onSubmit={handleLookup} className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter Booking ID"
              className="border rounded p-2 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Look Up
          </button>
        </div>
        
        {lookupError && (
          <div className="mt-2 text-red-600">{lookupError}</div>
        )}
      </form>
      
      {bookingData && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Booking Information</h2>
            <div className="text-sm px-3 py-1 bg-gray-100 rounded-full">
              {bookingData.bookingType}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Booking ID</span>
              <div className="font-semibold">{bookingData.bookingId}</div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Service</span>
              <div>{bookingData.service}</div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Customer</span>
              <div>{bookingData.customerName}</div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Destination</span>
              <div>{bookingData.destination}</div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Check In</span>
              <div>{bookingData.checkIn || '-'}</div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Selling Rate</span>
              <div className="font-semibold">
                {bookingData.currency} {bookingData.sellingRate}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="font-bold text-lg">
                  {bookingData.currency} {bookingData.sellingRate}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-500">Total Paid</div>
                <div className="font-bold text-lg text-green-600">
                  {bookingData.currency} {paymentCalculation.totalPaid}
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded">
                <div className="text-sm text-gray-500">Remaining</div>
                <div className="font-bold text-lg text-orange-600">
                  {bookingData.currency} {paymentCalculation.remaining}
                </div>
              </div>
            </div>
          </div>
          
          {parseFloat(paymentCalculation.remaining) > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleProceedToInstallment}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Proceed to Payment
              </button>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Payment History</h3>
            {installmentHistory.length > 0 ? (
              <div className="divide-y">
                {installmentHistory.map((report, index) => (
                  <div key={report.id} className="py-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div>
                      <span className="text-gray-500 text-sm">Date</span>
                      <div>{formatDate(report.date || report.timestamp)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Type</span>
                      <div>{report.bookingType}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">
                        {report.installment === 'Yes' ? 'Installment Amount' : 'Amount'}
                      </span>
                      <div className="font-semibold">
                        {report.currency} {report.installment === 'Yes' ? report.installmentPaid : report.sellingRate}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Payment Method</span>
                      <div>{report.paymentMethod}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No payment history found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallmentLookup;