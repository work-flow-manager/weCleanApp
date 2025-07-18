/**
 * Payment Gateway Integration
 * 
 * This module provides a simulated payment gateway integration.
 * In a real application, this would integrate with a payment processor like Stripe, PayPal, etc.
 */

// Payment method types
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'other';

// Credit card information
export interface CreditCardInfo {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

// Bank transfer information
export interface BankTransferInfo {
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  reference?: string;
}

// Payment request
export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;
  creditCard?: CreditCardInfo;
  bankTransfer?: BankTransferInfo;
}

// Payment response
export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
}

/**
 * Process a payment through the payment gateway
 * @param paymentRequest Payment request details
 * @returns Payment response
 */
export async function processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
  // In a real implementation, this would call a payment gateway API
  // For now, we'll simulate a payment process with validation and a timeout
  
  // Validate the payment request
  if (!paymentRequest.amount || paymentRequest.amount <= 0) {
    return {
      success: false,
      error: 'Invalid payment amount',
      status: 'failed',
      timestamp: new Date().toISOString(),
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      paymentMethod: paymentRequest.paymentMethod
    };
  }
  
  // Validate credit card details if paying by card
  if (paymentRequest.paymentMethod === 'credit_card') {
    const { creditCard } = paymentRequest;
    
    if (!creditCard) {
      return {
        success: false,
        error: 'Credit card information is required',
        status: 'failed',
        timestamp: new Date().toISOString(),
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        paymentMethod: paymentRequest.paymentMethod
      };
    }
    
    // Basic validation
    if (!creditCard.cardNumber || creditCard.cardNumber.replace(/\s/g, '').length !== 16) {
      return {
        success: false,
        error: 'Invalid card number',
        status: 'failed',
        timestamp: new Date().toISOString(),
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        paymentMethod: paymentRequest.paymentMethod
      };
    }
    
    if (!creditCard.cardholderName) {
      return {
        success: false,
        error: 'Cardholder name is required',
        status: 'failed',
        timestamp: new Date().toISOString(),
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        paymentMethod: paymentRequest.paymentMethod
      };
    }
    
    if (!creditCard.expiryDate || !creditCard.expiryDate.includes('/')) {
      return {
        success: false,
        error: 'Invalid expiry date',
        status: 'failed',
        timestamp: new Date().toISOString(),
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        paymentMethod: paymentRequest.paymentMethod
      };
    }
    
    if (!creditCard.cvv || creditCard.cvv.length < 3) {
      return {
        success: false,
        error: 'Invalid CVV',
        status: 'failed',
        timestamp: new Date().toISOString(),
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        paymentMethod: paymentRequest.paymentMethod
      };
    }
  }
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a random transaction ID
  const transactionId = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
  
  // Simulate a successful payment (95% success rate)
  const isSuccessful = Math.random() < 0.95;
  
  if (isSuccessful) {
    return {
      success: true,
      transactionId,
      status: 'completed',
      timestamp: new Date().toISOString(),
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      paymentMethod: paymentRequest.paymentMethod
    };
  } else {
    return {
      success: false,
      error: 'Payment processing failed. Please try again.',
      status: 'failed',
      timestamp: new Date().toISOString(),
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      paymentMethod: paymentRequest.paymentMethod
    };
  }
}

/**
 * Get payment status
 * @param transactionId Transaction ID
 * @returns Payment status
 */
export async function getPaymentStatus(transactionId: string): Promise<PaymentResponse | null> {
  // In a real implementation, this would call a payment gateway API to check status
  // For now, we'll simulate a response
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate a 90% chance the payment is found
  const isFound = Math.random() < 0.9;
  
  if (!isFound) {
    return null;
  }
  
  // Simulate payment status
  const statuses: Array<'completed' | 'pending' | 'failed'> = ['completed', 'pending', 'failed'];
  const randomStatus = statuses[Math.floor(Math.random() * (statuses.length - 1))]; // Bias toward completed
  
  return {
    success: randomStatus === 'completed',
    transactionId,
    status: randomStatus,
    timestamp: new Date().toISOString(),
    amount: Math.floor(Math.random() * 10000) / 100, // Random amount between 0 and 100
    currency: 'USD',
    paymentMethod: 'credit_card'
  };
}

/**
 * Generate a payment receipt
 * @param transactionId Transaction ID
 * @returns Receipt URL or data
 */
export async function generateReceipt(transactionId: string): Promise<string> {
  // In a real implementation, this would generate a receipt PDF or HTML
  // For now, we'll just return a simulated URL
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return `https://api.example.com/receipts/${transactionId}`;
}