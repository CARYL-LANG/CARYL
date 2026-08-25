'use client';

import { useState, useEffect } from 'react';
import { PaymentMethod, Booking } from '../../lib/types';
import { Button } from '../ui/button';
import { X, CreditCard, Wallet, Receipt, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useBooking } from '../../lib/context';

interface PaymentModalAutoProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentModalAuto({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: PaymentModalAutoProps) {
  const { paymentConfig, updateBooking } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [verificationInterval, setVerificationInterval] = useState<NodeJS.Timeout | null>(null);

  if (!isOpen || !booking) return null;

  // Check payment status periodically
  useEffect(() => {
    if (paymentStatus === 'processing' && booking) {
      const interval = setInterval(async () => {
        try {
          const result = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: booking.paymentReference,
              method: selectedMethod,
              paymentId: booking.id,
            }),
          }).then((res) => res.json());

          if (result.success) {
            setPaymentStatus('success');
            // Update booking status
            updateBooking(booking.id, {
              paymentStatus: 'completed',
              status: 'confirmed',
            });
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
        }
      }, 3000); // Check every 3 seconds

      setVerificationInterval(interval);

      return () => clearInterval(interval);
    }
  }, [paymentStatus, booking, selectedMethod, updateBooking]);

  const handleCreatePayment = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Create payment link
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalPrice,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          method: method,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment creation failed');
      }

      setPaymentLink(data.paymentUrl);

      // Store payment reference
      if (data.reference) {
        updateBooking(booking.id, {
          paymentMethod: method,
          paymentReference: data.reference,
          paymentStatus: 'pending',
        });
      }

      // Open payment link in new window
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  const handleCounterPayment = () => {
    setSelectedMethod('counter');
    updateBooking(booking.id, {
      paymentMethod: 'counter',
      paymentStatus: 'completed',
      status: 'confirmed',
    });
    setPaymentStatus('success');
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
    setPaymentLink('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {paymentStatus === 'success' ? 'Payment Successful' : 'Select Payment Method'}
          </h2>
          {paymentStatus !== 'processing' && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={24} className="text-gray-600" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
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

          {/* Success State */}
          {paymentStatus === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 flex flex-col items-center text-center">
                <CheckCircle size={48} className="text-green-600 mb-3" />
                <h3 className="text-lg font-bold text-green-900 mb-1">Payment Received!</h3>
                <p className="text-sm text-green-700 mb-4">
                  Your payment has been successfully processed. Your booking is now confirmed.
                </p>
                <p className="text-xs text-green-600 font-mono bg-green-100 px-3 py-2 rounded">
                  Booking ID: {booking.id}
                </p>
              </div>
              <Button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Complete Booking
              </Button>
            </div>
          )}

          {/* Error State */}
          {paymentStatus === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-red-900">Payment Failed</h4>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                </div>
              </div>
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Processing State */}
          {paymentStatus === 'processing' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
                <h4 className="font-semibold text-blue-900 mb-2">Processing Payment...</h4>
                <p className="text-sm text-blue-700 mb-4">
                  A new window has opened with {selectedMethod === 'gcash' ? 'GCash' : 'Maya'} payment page.
                </p>
                <p className="text-xs text-blue-600 bg-blue-100 px-3 py-2 rounded">
                  Please complete the payment in the opened window. Checking status...
                </p>
              </div>
              {paymentLink && (
                <Button
                  onClick={() => window.open(paymentLink, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Open Payment Link
                </Button>
              )}
            </div>
          )}

          {/* Idle State - Payment Methods */}
          {paymentStatus === 'idle' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Choose Payment Method:</h3>

              {/* Online Payment */}
              {(paymentConfig.gcashNumber || paymentConfig.mayaNumber) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-xs font-semibold text-green-600 uppercase px-2 bg-green-50 rounded-full">
                      Online Payment
                    </span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  {/* GCash */}
                  {paymentConfig.gcashNumber && (
                    <button
                      onClick={() => handleCreatePayment('gcash')}
                      className="w-full p-4 rounded-lg border-2 border-green-200 hover:border-green-600 hover:bg-green-50 transition flex items-start gap-4"
                    >
                      <Wallet size={24} className="text-green-700" />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-800">GCash</p>
                        <p className="text-sm text-gray-600">Fast and secure payment</p>
                        <p className="text-xs text-green-600 mt-1">✓ Automatic verification</p>
                      </div>
                    </button>
                  )}

                  {/* Maya */}
                  {paymentConfig.mayaNumber && (
                    <button
                      onClick={() => handleCreatePayment('maya')}
                      className="w-full p-4 rounded-lg border-2 border-purple-200 hover:border-purple-600 hover:bg-purple-50 transition flex items-start gap-4"
                    >
                      <CreditCard size={24} className="text-purple-700" />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-800">Maya</p>
                        <p className="text-sm text-gray-600">Credit/Debit card payment</p>
                        <p className="text-xs text-purple-600 mt-1">✓ Automatic verification</p>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Counter Payment */}
              <div>
                <div className="flex items-center gap-2 mb-3 mt-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-xs font-semibold text-blue-600 uppercase px-2 bg-blue-50 rounded-full">
                    In-Person Payment
                  </span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <button
                  onClick={handleCounterPayment}
                  className="w-full p-4 rounded-lg border-2 border-blue-200 hover:border-blue-600 hover:bg-blue-50 transition flex items-start gap-4"
                >
                  <Receipt size={24} className="text-blue-700" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-800">Pay Over the Counter</p>
                    <p className="text-sm text-gray-600">Pay at hotel reception</p>
                    <p className="text-xs text-blue-600 mt-1">Pay upon arrival</p>
                  </div>
                </button>
              </div>

              {/* Info */}
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800">
                <p className="font-semibold mb-1">ℹ️ Secure Payment</p>
                <p>
                  All payments are encrypted and processed securely. Your payment information is protected.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
