import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  processPayment, 
  PaymentMethod, 
  CreditCardInfo, 
  PaymentRequest,
  PaymentResponse,
  getPaymentStatus,
  generateReceipt
} from '@/lib/payment-gateway';

/**
 * Custom hook for managing online payments
 */
export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const router = useRouter();

  /**
   * Process a credit card payment
   */
  const processCreditCardPayment = useCallback(async (
    invoiceId: string,
    amount: number,
    cardDetails: CreditCardInfo,
    description?: string
  ) => {
    setLoading(true);
    setError(null);
    setPaymentStatus('processing');
    
    try {
      // First, process the payment through the payment gateway
      const paymentRequest: PaymentRequest = {
        amount,
        currency: 'USD',
        paymentMethod: 'credit_card',
        description: description || `Payment for invoice #${invoiceId}`,
        creditCard: cardDetails,
        metadata: {
          invoiceId
        }
      };
      
      const paymentResult = await processPayment(paymentRequest);
      
      if (!paymentResult.success) {
        setPaymentStatus('failed');
        throw new Error(paymentResult.error || 'Payment processing failed');
      }
      
      // If payment was successful, record it in our system
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          payment_method: 'credit_card',
          transaction_id: paymentResult.transactionId,
          notes: `Online payment via credit card. Transaction ID: ${paymentResult.transactionId}`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Even if our system fails to record the payment, the payment was processed
        // We should notify the user but not mark the payment as failed
        toast.warning('Payment was processed but failed to update invoice. Please contact support.', {
          description: errorData.error || 'System error'
        });
        
        setPaymentStatus('success');
        return { 
          success: true, 
          transactionId: paymentResult.transactionId,
          systemError: true
        };
      }
      
      const data = await response.json();
      setPaymentStatus('success');
      
      toast.success('Payment processed successfully');
      
      return { 
        success: true, 
        transactionId: paymentResult.transactionId,
        payment: data.payment,
        invoice: data.invoice
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setPaymentStatus('failed');
      
      toast.error('Payment failed', {
        description: errorMessage
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Process a bank transfer payment
   */
  const processBankTransferPayment = useCallback(async (
    invoiceId: string,
    amount: number,
    reference: string,
    notes?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // For bank transfers, we just record the payment as pending
      // In a real system, this would be updated when the bank transfer is confirmed
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          payment_method: 'bank_transfer',
          transaction_id: reference,
          notes: notes || `Bank transfer. Reference: ${reference}`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record bank transfer');
      }
      
      const data = await response.json();
      toast.success('Bank transfer recorded successfully');
      
      return { 
        success: true, 
        payment: data.payment,
        invoice: data.invoice
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast.error('Failed to record bank transfer', {
        description: errorMessage
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Process a cash payment
   */
  const processCashPayment = useCallback(async (
    invoiceId: string,
    amount: number,
    notes?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // For cash payments, we just record the payment
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          payment_method: 'cash',
          notes: notes || 'Cash payment'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record cash payment');
      }
      
      const data = await response.json();
      toast.success('Cash payment recorded successfully');
      
      return { 
        success: true, 
        payment: data.payment,
        invoice: data.invoice
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast.error('Failed to record cash payment', {
        description: errorMessage
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check payment status
   */
  const checkPaymentStatus = useCallback(async (transactionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const status = await getPaymentStatus(transactionId);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate a payment receipt
   */
  const getPaymentReceipt = useCallback(async (transactionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const receiptUrl = await generateReceipt(transactionId);
      return receiptUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    paymentStatus,
    processCreditCardPayment,
    processBankTransferPayment,
    processCashPayment,
    checkPaymentStatus,
    getPaymentReceipt
  };
}