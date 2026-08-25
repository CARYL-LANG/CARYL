/**
 * GCash and Maya Payment Integration
 * Handles automatic payment processing with real API integration
 */

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  description: string;
  guestName: string;
  guestEmail: string;
  redirectUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  qrCode?: string;
  status?: string;
  error?: string;
  reference?: string;
}

export interface WebhookPayload {
  status: string;
  reference: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
  signature: string;
}

// GCash API Configuration
const GCASH_API_URL = process.env.GCASH_API_URL || 'https://api.gcash.ph/v1';
const GCASH_API_KEY = process.env.GCASH_API_KEY || '';
const GCASH_MERCHANT_ID = process.env.GCASH_MERCHANT_ID || '';
const GCASH_WEBHOOK_SECRET = process.env.GCASH_WEBHOOK_SECRET || '';

// Maya API Configuration
const MAYA_API_URL = process.env.MAYA_API_URL || 'https://api.maya.ph/v1';
const MAYA_API_KEY = process.env.MAYA_API_KEY || '';
const MAYA_PUBLIC_KEY = process.env.MAYA_PUBLIC_KEY || '';
const MAYA_WEBHOOK_SECRET = process.env.MAYA_WEBHOOK_SECRET || '';

/**
 * Create GCash payment link
 */
export async function createGCashPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    if (!GCASH_API_KEY || !GCASH_MERCHANT_ID) {
      return {
        success: false,
        error: 'GCash API credentials not configured',
      };
    }

    const response = await fetch(`${GCASH_API_URL}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GCASH_API_KEY}`,
        'Merchant-ID': GCASH_MERCHANT_ID,
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        referenceNumber: request.bookingId,
        customerName: request.guestName,
        customerEmail: request.guestEmail,
        redirectUrl: request.redirectUrl,
        metadata: {
          bookingId: request.bookingId,
          type: 'booking',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GCash API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      paymentId: data.paymentId,
      paymentUrl: data.paymentUrl,
      reference: data.referenceNumber,
      status: 'pending',
    };
  } catch (error) {
    console.error('GCash payment creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'GCash payment failed',
    };
  }
}

/**
 * Create Maya payment link
 */
export async function createMayaPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    if (!MAYA_API_KEY || !MAYA_PUBLIC_KEY) {
      return {
        success: false,
        error: 'Maya API credentials not configured',
      };
    }

    const response = await fetch(`${MAYA_API_URL}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAYA_API_KEY}`,
        'X-API-Version': '2.0',
      },
      body: JSON.stringify({
        amount: {
          value: request.amount,
          currency: request.currency,
        },
        description: request.description,
        reference: request.bookingId,
        customer: {
          name: request.guestName,
          email: request.guestEmail,
        },
        redirectUrl: {
          success: request.redirectUrl,
          failure: request.redirectUrl,
        },
        metadata: {
          bookingId: request.bookingId,
          type: 'booking',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Maya API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      paymentId: data.id,
      paymentUrl: data.links?.redirect?.href,
      reference: data.reference,
      status: 'pending',
    };
  } catch (error) {
    console.error('Maya payment creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Maya payment failed',
    };
  }
}

/**
 * Verify GCash payment status
 */
export async function verifyGCashPayment(reference: string): Promise<PaymentResponse> {
  try {
    if (!GCASH_API_KEY || !GCASH_MERCHANT_ID) {
      return {
        success: false,
        error: 'GCash API credentials not configured',
      };
    }

    const response = await fetch(`${GCASH_API_URL}/payment/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GCASH_API_KEY}`,
        'Merchant-ID': GCASH_MERCHANT_ID,
      },
    });

    if (!response.ok) {
      throw new Error(`GCash verification error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: data.status === 'completed',
      status: data.status,
      reference: data.referenceNumber,
    };
  } catch (error) {
    console.error('GCash verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Verify Maya payment status
 */
export async function verifyMayaPayment(paymentId: string): Promise<PaymentResponse> {
  try {
    if (!MAYA_API_KEY) {
      return {
        success: false,
        error: 'Maya API credentials not configured',
      };
    }

    const response = await fetch(`${MAYA_API_URL}/payment/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MAYA_API_KEY}`,
        'X-API-Version': '2.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Maya verification error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: data.status === 'COMPLETED',
      status: data.status,
      reference: data.reference,
    };
  } catch (error) {
    console.error('Maya verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Verify webhook signature from GCash
 */
export function verifyGCashWebhook(payload: string, signature: string): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', GCASH_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('GCash webhook verification failed:', error);
    return false;
  }
}

/**
 * Verify webhook signature from Maya
 */
export function verifyMayaWebhook(payload: string, signature: string): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', MAYA_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Maya webhook verification failed:', error);
    return false;
  }
}

/**
 * Generate QR code for display (can be used with qrcode library)
 */
export function generateQRCodeData(amount: number, recipientNumber: string, reference: string): string {
  // This would typically be used with a QR code library
  // Format: gcash://<number>?amount=<amount>&reference=<reference>
  const gcashQRData = `gcash://${recipientNumber}?amount=${amount}&reference=${reference}`;
  return gcashQRData;
}
