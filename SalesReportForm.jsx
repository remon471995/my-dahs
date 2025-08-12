import React, { useState, useEffect } from 'react';
import { saveReport } from '../data/storageService';
import { getCurrentUser, isSupervisor } from '../data/authService';

const SalesReportForm = () => {
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    bookingType: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    agentName: '',
    region: '',
    customerName: '',
    customerNationality: '',
    customerMobile: '',
    source: '',
    bookingId: '',
    service: '',
    provider: '',
    destination: '',
    checkIn: '',
    paxNumber: '',
    currency: '',
    netRate: '',
    sellingRate: '',
    paymentMethod: '',
    paymentLink: '',
    installment: 'No',
    installmentPaid: '',
    dueDate: '',
    remarks: ''
  });

  // Load current user data when component mounts
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setFormData(prevData => ({
        ...prevData,
        agentName: user.name,
        region: user.role === 'supervisor' ? '' : user.region
      }));
    }
  }, []);

  const [successMessage, setSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState({
    bankFile: null,
    voucherFile: null,
    invoiceFile: null
  });

  const calculateRemaining = () => {
    const sellingRate = parseFloat(formData.sellingRate) || 0;
    const paid = parseFloat(formData.installmentPaid) || 0;
    return Math.max(sellingRate - paid, 0).toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
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
    
    // Form validation
    const netRate = parseFloat(formData.netRate);
    const sellingRate = parseFloat(formData.sellingRate);
    
    if (sellingRate < netRate) {
      alert("Selling rate cannot be less than net rate.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store file names instead of actual files
      const filesInfo = {
        bankFileName: files.bankFile ? files.bankFile.name : null,
        voucherFileName: files.voucherFile ? files.voucherFile.name : null,
        invoiceFileName: files.invoiceFile ? files.invoiceFile.name : null
      };
      
      // Save to localStorage
      saveReport({
        ...formData,
        ...filesInfo
      });
      
      // Show success message
      setSuccessMessage(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccessMessage(false);
        setFormData({
          bookingType: '',
          date: '',
          agentName: '',
          region: '',
          customerName: '',
          customerNationality: '',
          customerMobile: '',
          source: '',
          bookingId: '',
          service: '',
          provider: '',
          destination: '',
          checkIn: '',
          paxNumber: '',
          currency: '',
          netRate: '',
          sellingRate: '',
          paymentMethod: '',
          paymentLink: '',
          installment: 'No',
          installmentPaid: '',
          dueDate: '',
          remarks: ''
        });
        setFiles({
          bankFile: null,
          voucherFile: null,
          invoiceFile: null
        });
      }, 3000);
      
    } catch (error) {
      alert('Error submitting form: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Sales Report Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Booking Section */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Booking Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select 
              name="bookingType" 
              value={formData.bookingType}
              onChange={(e) => {
                handleInputChange(e);
                // Reset some fields if switching to Installment
                if (e.target.value === 'Installment') {
                  setFormData(prevData => ({
                    ...prevData,
                    installment: 'Yes'
                  }));
                }
              }}
              required 
              className="border rounded p-2"
            >
              <option value="">Select Booking Type</option>
              <option>New Booking</option>
              <option>Modification</option>
              <option>Cancellation</option>
              <option value="Installment">Installment</option>
            </select>
            <input 
              name="date" 
              type="date" 
              value={formData.date}
              onChange={handleInputChange}
              className="border rounded p-2" 
              required 
            />
            <input 
              name="agentName" 
              type="text" 
              value={formData.agentName}
              onChange={handleInputChange}
              placeholder="Agent Name" 
              className="border rounded p-2 bg-gray-50" 
              required 
              readOnly
            />
            {currentUser && currentUser.role === 'supervisor' ? (
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="border rounded p-2"
                required
              >
                <option value="">Select Region</option>
                <option value="Egypt">Egypt</option>
                <option value="UAE">UAE</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Qatar">Qatar</option>
              </select>
            ) : (
              <input 
                name="region" 
                type="text" 
                value={formData.region}
                onChange={handleInputChange}
                placeholder="Region" 
                className="border rounded p-2 bg-gray-50" 
                required 
                readOnly
              />
            )}
          </div>
        </div>
        
        {/* Customer Section */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="customerName" 
              type="text" 
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Customer Name" 
              className="border rounded p-2" 
              required 
            />
            <input 
              name="customerNationality" 
              type="text" 
              value={formData.customerNationality}
              onChange={handleInputChange}
              placeholder="Nationality" 
              className="border rounded p-2" 
              required 
            />
            <input 
              name="customerMobile" 
              type="tel" 
              value={formData.customerMobile}
              onChange={handleInputChange}
              placeholder="Mobile Number" 
              className="border rounded p-2" 
              required 
            />
            <select 
              name="source" 
              value={formData.source}
              onChange={handleInputChange}
              className="border rounded p-2" 
              required
            >
              <option value="">How did the customer reach us?</option>
              <option>Call</option>
              <option>Chat</option>
              <option>Returning Customer</option>
            </select>
          </div>
        </div>
        
        {/* Service Section */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="bookingId" 
              type="text" 
              value={formData.bookingId}
              onChange={handleInputChange}
              placeholder="Booking ID" 
              className="border rounded p-2" 
              required 
            />
            <select 
              name="service" 
              value={formData.service}
              onChange={handleInputChange}
              className="border rounded p-2" 
              required
            >
              <option value="">Service</option>
              <option>Flight</option>
              <option>Hotel</option>
              <option>Transfer</option>
            </select>
            <select 
              name="provider" 
              value={formData.provider}
              onChange={handleInputChange}
              className="border rounded p-2" 
              required
            >
              <option value="">Service Provider</option>
              <option>Smile</option>
              <option>TBO</option>
              <option>TDS</option>
            </select>
            <input 
              name="destination" 
              type="text" 
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="Destination" 
              className="border rounded p-2" 
              required 
            />
            <input 
              name="checkIn" 
              type="date" 
              value={formData.checkIn}
              onChange={handleInputChange}
              className="border rounded p-2" 
            />
            <input 
              name="paxNumber" 
              type="number" 
              value={formData.paxNumber}
              onChange={handleInputChange}
              placeholder="Number of Pax" 
              className="border rounded p-2" 
              required 
            />
          </div>
        </div>
        
        {/* Payment Section */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select 
              name="currency" 
              value={formData.currency}
              onChange={handleInputChange}
              className="border rounded p-2" 
              required
            >
              <option value="">Currency</option>
              <option>SAR</option>
              <option>KWD</option>
              <option>AED</option>
            </select>
            <input 
              name="netRate" 
              type="number" 
              value={formData.netRate}
              onChange={handleInputChange}
              placeholder="Net Rate" 
              className="border rounded p-2" 
              required 
            />
            <input 
              name="sellingRate" 
              type="number" 
              value={formData.sellingRate}
              onChange={handleInputChange}
              placeholder="Selling Rate" 
              className="border rounded p-2" 
              required 
            />
            <select 
              name="paymentMethod" 
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="border rounded p-2" 
              required
            >
              <option value="">Payment Method</option>
              <option value="Payment Link">Payment Link</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            
            {formData.paymentMethod === 'Payment Link' && (
              <input 
                name="paymentLink" 
                type="url" 
                value={formData.paymentLink}
                onChange={handleInputChange}
                placeholder="Payment Link URL" 
                className="border rounded p-2 col-span-2" 
                required 
              />
            )}
            
            {formData.paymentMethod === 'Bank Transfer' && (
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
            
            <select 
              name="installment" 
              value={formData.installment}
              onChange={handleInputChange}
              className="border rounded p-2"
            >
              <option value="No">Is this an installment?</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            
            {formData.installment === 'Yes' && (
              <>
                <input 
                  name="installmentPaid" 
                  type="number" 
                  value={formData.installmentPaid}
                  onChange={handleInputChange}
                  placeholder="Paid Amount" 
                  className="border rounded p-2" 
                  required 
                />
                <input 
                  name="dueDate" 
                  type="date" 
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  placeholder="Due Date" 
                  className="border rounded p-2" 
                  required 
                />
                <div className="border rounded p-2 bg-gray-50">
                  <span className="text-gray-700">Remaining Amount: </span>
                  <span className="font-semibold">{calculateRemaining()}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Attachments & Notes */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Attachments & Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Voucher</label>
              <input 
                type="file" 
                name="voucherFile" 
                onChange={handleFileChange}
                className="border rounded p-2 w-full" 
                accept="application/pdf,image/*" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Invoice</label>
              <input 
                type="file" 
                name="invoiceFile" 
                onChange={handleFileChange}
                className="border rounded p-2 w-full" 
                accept="application/pdf,image/*" 
              />
            </div>
            <div className="col-span-2">
              <textarea 
                name="remarks" 
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Remarks" 
                className="border rounded p-2 w-full h-24"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Submit */}
        <div className="text-center">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          
          {successMessage && (
            <div className="text-green-600 font-semibold mt-4 animate-pulse">
              Form submitted successfully!
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SalesReportForm;