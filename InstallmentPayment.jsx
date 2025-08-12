import React, { useState } from 'react';
import { processInstallmentPayment } from '../data/bookingService';

const InstallmentPayment = ({ bookingData, onCancel, onSuccess }) => {
  const [paymentData, setPaymentData] = useState({
    agentName: '',
    installmentPaid: '',
    paymentMethod: '',
    paymentLink: '',
    dueDate: '',
    remarks: ''
  });
  
  const [files, setFiles] = useState({
    bankFile: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const calculateRemaining = () => {
    const sellingRate = parseFloat(bookingData.sellingRate) || 0;
    const paid = parseFloat(paymentData.installmentPaid) || 0;
    const previouslyPaid = parseFloat(bookingData.installmentPaid) || 0;
    const totalPaid = paid + previouslyPaid;
    
    return Math.max(sellingRate - totalPaid, 0).toFixed(2);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });
  };
  
  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0]
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(paymentData.installmentPaid) <= 0) {
      alert("Payment amount must be greater than zero.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store file names instead of actual files
      const filesInfo = {
        bankFileName: files.bankFile ? files.bankFile.name : null
      };
      
      // Process the installment payment
      const result = processInstallmentPayment(bookingData.bookingId, {
        ...paymentData,
        ...filesInfo
      });
      
      // Call success callback
      onSuccess(result);
      
    } catch (error) {
      alert('Error processing payment: ' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Process Installment Payment</h1>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-blue-800">Booking ID: {bookingData.bookingId}</p>
            <p className="text-sm text-blue-700">Customer: {bookingData.customerName}</p>
            <p className="text-sm text-blue-700">
              Total Amount: {bookingData.currency} {bookingData.sellingRate}
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Payment Details */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="agentName" 
              type="text" 
              value={paymentData.agentName}
              onChange={handleInputChange}
              placeholder="Agent Name" 
              className="border rounded p-2" 
              required 
            />
            
            <input 
              name="installmentPaid" 
              type="number" 
              value={paymentData.installmentPaid}
              onChange={handleInputChange}
              placeholder="Payment Amount" 
              className="border rounded p-2" 
              required 
            />
            
            <select 
              name="paymentMethod" 
              value={paymentData.paymentMethod}
              onChange={handleInputChange}
              className="border rounded p-2" 
              required
            >
              <option value="">Payment Method</option>
              <option value="Payment Link">Payment Link</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
            </select>
            
            {paymentData.paymentMethod === 'Payment Link' && (
              <input 
                name="paymentLink" 
                type="url" 
                value={paymentData.paymentLink}
                onChange={handleInputChange}
                placeholder="Payment Link URL" 
                className="border rounded p-2" 
                required 
              />
            )}
            
            {paymentData.paymentMethod === 'Bank Transfer' && (
              <div className="col-span-2">
                <input 
                  name="bankFile" 
                  type="file" 
                  onChange={handleFileChange}
                  className="border rounded p-2 w-full" 
                  accept="application/pdf,image/*" 
                  required 
                />
              </div>
            )}
            
            <input 
              name="dueDate" 
              type="date" 
              value={paymentData.dueDate}
              onChange={handleInputChange}
              placeholder="Next Due Date (if applicable)" 
              className="border rounded p-2" 
            />
            
            <div className="border rounded p-2 bg-gray-50">
              <span className="text-gray-700">Remaining After This Payment: </span>
              <span className="font-semibold">{bookingData.currency} {calculateRemaining()}</span>
            </div>
          </div>
        </div>
        
        {/* Remarks */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Remarks</h2>
          <textarea 
            name="remarks" 
            value={paymentData.remarks}
            onChange={handleInputChange}
            placeholder="Any additional notes about this payment" 
            className="border rounded p-2 w-full h-24"
          ></textarea>
        </div>
        
        {/* Submit */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Process Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstallmentPayment;