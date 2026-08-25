'use client';

import { useState } from 'react';
import { PaymentMethod, Booking } from '../../lib/types';
import { Button } from '../ui/button';
import { X, CreditCard, Wallet, Receipt, Upload, Check } from 'lucide-react';
import { useBooking } from '../../lib/context';

interface PaymentModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  const { paymentConfig, recordPayment } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [reference, setReference] = useState('');
  const [showReferenceInput, setShowReferenceInput] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method === 'counter') {
      setShowReferenceInput(false);
      setScreenshotFile(null);
      setScreenshotPreview(null);
    } else {
      setShowReferenceInput(true);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    if (selectedMethod !== 'counter' && !reference) {
      alert('Please enter your GCash/Maya account number');
      return;
    }

    if ((selectedMethod === 'gcash' || selectedMethod === 'maya') && !screenshotFile) {
      alert('Please upload a screenshot or transaction proof');
      return;
    }

    // Record the payment with screenshot for GCASH/MAYA
    recordPayment(
      booking.id,
      selectedMethod,
      booking.totalPrice,
      reference || undefined,
      screenshotPreview || undefined
    );

    alert(`Payment recorded successfully!\n\nMethod: ${selectedMethod === 'counter' ? 'Pay Over the Counter' : selectedMethod.toUpperCase()}\nAmount: ₱${booking.totalPrice}${reference ? `\nAccount Number: ${reference}` : ''}\n\nAdmin will verify your payment shortly.`);

    // Reset form
    setSelectedMethod(null);
    setReference('');
    setShowReferenceInput(false);
    setScreenshotFile(null);
    setScreenshotPreview(null);
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Select Payment Method
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Booking Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-2">Booking Summary</h3>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Guest:</span> {booking.guestName}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Room:</span> {booking.roomNumber}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Dates:</span> {booking.checkInDate} to {booking.checkOutDate}
            </p>
            <div className="border-t border-blue-200 mt-3 pt-3">
              <p className="text-lg font-bold text-gray-800">
                Total Amount: ₱{booking.totalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Choose Payment Method:</h3>

            {/* Online Payment Section */}
            {(paymentConfig.gcashNumber || paymentConfig.mayaNumber) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-xs font-semibold text-green-600 uppercase px-2 bg-green-50 rounded-full">Online Payment (Peer to Peer)</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* GCash Payment */}
                {paymentConfig.gcashNumber && (
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('gcash')}
                    className={`w-full p-4 rounded-lg border-2 transition flex items-start gap-4 ${
                      selectedMethod === 'gcash'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <Wallet size={24} className={selectedMethod === 'gcash' ? 'text-green-600' : 'text-green-700'} />
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">GCash</p>
                      <p className="text-sm text-gray-600">Send payment to: <span className="font-mono text-gray-800">{paymentConfig.gcashNumber}</span></p>
                      <p className="text-xs text-amber-600 mt-1">Requires screenshot verification from admin</p>
                    </div>
                  </button>
                )}

                {/* Maya Payment */}
                {paymentConfig.mayaNumber && (
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('maya')}
                    className={`w-full p-4 rounded-lg border-2 transition flex items-start gap-4 ${
                      selectedMethod === 'maya'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <CreditCard size={24} className={selectedMethod === 'maya' ? 'text-purple-600' : 'text-purple-700'} />
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Maya</p>
                      <p className="text-sm text-gray-600">Send payment to: <span className="font-mono text-gray-800">{paymentConfig.mayaNumber}</span></p>
                      <p className="text-xs text-amber-600 mt-1">Requires screenshot verification from admin</p>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* In-Person Payment Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3 mt-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-xs font-semibold text-blue-600 uppercase px-2 bg-blue-50 rounded-full">In-Person Payment</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <button
                type="button"
                onClick={() => handleMethodSelect('counter')}
                className={`w-full p-4 rounded-lg border-2 transition flex items-start gap-4 ${
                  selectedMethod === 'counter'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <Receipt size={24} className={selectedMethod === 'counter' ? 'text-blue-600' : 'text-blue-700'} />
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Pay Over the Counter</p>
                  <p className="text-sm text-gray-600">Pay at the hotel reception desk</p>
                  <p className="text-xs text-blue-600 mt-1">Pay when you arrive at the hotel</p>
                </div>
              </button>
            </div>
          </div>

          {/* GCash/Maya Payment Details */}
          {showReferenceInput && selectedMethod !== 'counter' && (
            <div className={`p-4 rounded-lg border-2 space-y-4 ${
              selectedMethod === 'gcash' ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className={`text-sm font-semibold ${selectedMethod === 'gcash' ? 'text-green-800' : 'text-purple-800'}`}>
                Complete Your Payment
              </div>

              {/* Payment Instructions */}
              <div className={`text-sm p-3 rounded-lg ${selectedMethod === 'gcash' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                <p className="font-semibold mb-1">📱 Payment Instructions:</p>
                <ol className="text-xs list-decimal ml-5 space-y-1">
                  <li>Open your {selectedMethod === 'gcash' ? 'GCash' : 'Maya'} app</li>
                  <li>Send ₱{booking.totalPrice.toLocaleString()} to: <span className="font-mono font-bold">{selectedMethod === 'gcash' ? paymentConfig.gcashNumber : paymentConfig.mayaNumber}</span></li>
                  <li>Take a screenshot of the confirmation/transaction number</li>
                  <li>Upload the screenshot below and submit</li>
                </ol>
              </div>

              {/* Your Account Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your {selectedMethod === 'gcash' ? 'GCash' : 'Maya'} Account Number
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={`E.g., 09XXXXXXXXX (the number you sent from)`}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                    selectedMethod === 'gcash'
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-purple-300 focus:ring-purple-500'
                  }`}
                />
                <p className="text-xs text-gray-600 mt-1">
                  The account number/phone you sent the payment from (for verification purposes)
                </p>
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📸 Upload Transaction Proof
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className={`w-full px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer transition flex items-center justify-center gap-2 ${
                      screenshotFile 
                        ? selectedMethod === 'gcash' ? 'bg-green-50 border-green-400' : 'bg-purple-50 border-purple-400'
                        : selectedMethod === 'gcash' ? 'hover:bg-green-50 border-green-300' : 'hover:bg-purple-50 border-purple-300'
                    }`}
                  >
                    <Upload size={18} className={selectedMethod === 'gcash' ? 'text-green-600' : 'text-purple-600'} />
                    <div className="text-left">
                      <p className="text-sm text-gray-700 font-medium">
                        {screenshotFile ? screenshotFile.name : 'Click to upload screenshot'}
                      </p>
                      <p className="text-xs text-gray-600">PNG, JPG (Max 5MB)</p>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  ✓ Screenshot must show the transaction number or confirmation message from {selectedMethod === 'gcash' ? 'GCash' : 'Maya'}
                </p>
              </div>

              {/* Screenshot Preview */}
              {screenshotPreview && (
                <div className="bg-white p-3 rounded-lg border-2 border-green-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">✓ Screenshot Ready</p>
                    <Check size={18} className="text-green-600" />
                  </div>
                  <img
                    src={screenshotPreview}
                    alt="Transaction screenshot preview"
                    className="w-full h-48 object-contain rounded border border-gray-200"
                  />
                </div>
              )}

              {/* Verification Notice */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs text-blue-800">
                <p className="font-semibold mb-1">⏳ What happens next?</p>
                <p>The admin will verify your payment screenshot. Once approved, you'll be able to check in. This usually takes a few minutes.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!selectedMethod || (selectedMethod !== 'counter' && (!reference || !screenshotFile))}
            >
              Proceed to Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
