import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Invoice, 
  InvoiceItem, 
  InvoicePayment, 
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceFilters,
  InvoiceStatus
} from '@/types/invoice';
import { 
  processPayment, 
  PaymentMethod, 
  CreditCardInfo, 
  PaymentRequest 
} from '@/lib/payment-gateway';

/**
 * Custom hook for managing invoices
 */
export function useInvoices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Fetch a list of invoices with optional filtering
   */
  const fetchInvoices = useCallback(async (filters?: InvoiceFilters, limit = 10, offset = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customer_id) params.append('customer_id', filters.customer_id);
      if (filters?.job_id) params.append('job_id', filters.job_id);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.min_amount) params.append('min_amount', filters.min_amount.toString());
      if (filters?.max_amount) params.append('max_amount', filters.max_amount.toString());
      
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      
      const response = await fetch(`/api/invoices?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoices');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to fetch invoices', {
        description: errorMessage
      });
      return { invoices: [], total: 0, limit, offset };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single invoice by ID
   */
  const fetchInvoice = useCallback(async (invoiceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoice');
      }
      
      const data = await response.json();
      return data.invoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to fetch invoice', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new invoice
   */
  const createInvoice = useCallback(async (invoiceData: CreateInvoiceRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }
      
      const data = await response.json();
      toast.success('Invoice created successfully');
      return data.invoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to create invoice', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing invoice
   */
  const updateInvoice = useCallback(async (invoiceId: string, invoiceData: UpdateInvoiceRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice');
      }
      
      const data = await response.json();
      toast.success('Invoice updated successfully');
      return data.invoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to update invoice', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an invoice
   */
  const deleteInvoice = useCallback(async (invoiceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }
      
      toast.success('Invoice deleted successfully');
      router.refresh();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to delete invoice', {
        description: errorMessage
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Add an item to an invoice
   */
  const addInvoiceItem = useCallback(async (invoiceId: string, itemData: Partial<InvoiceItem>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add invoice item');
      }
      
      const data = await response.json();
      toast.success('Item added to invoice');
      return data.item;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to add invoice item', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an invoice item
   */
  const updateInvoiceItem = useCallback(async (invoiceId: string, itemId: string, itemData: Partial<InvoiceItem>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice item');
      }
      
      const data = await response.json();
      toast.success('Invoice item updated');
      return data.item;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to update invoice item', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an invoice item
   */
  const deleteInvoiceItem = useCallback(async (invoiceId: string, itemId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice item');
      }
      
      toast.success('Invoice item deleted');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to delete invoice item', {
        description: errorMessage
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a payment to an invoice
   */
  const addInvoicePayment = useCallback(async (invoiceId: string, paymentData: Partial<InvoicePayment>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add payment');
      }
      
      const data = await response.json();
      toast.success('Payment added successfully');
      return { payment: data.payment, invoice: data.invoice };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to add payment', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a payment from an invoice
   */
  const deleteInvoicePayment = useCallback(async (invoiceId: string, paymentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payments/${paymentId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment');
      }
      
      const data = await response.json();
      toast.success('Payment deleted successfully');
      return data.invoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to delete payment', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send an invoice (change status from draft to sent)
   */
  const sendInvoice = useCallback(async (invoiceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invoice');
      }
      
      const data = await response.json();
      toast.success('Invoice sent successfully');
      return data.invoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to send invoice', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate a PDF for an invoice
   */
  const generateInvoicePdf = useCallback(async (invoiceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }
      
      // In a real implementation, this would return a PDF file
      // For now, we're just returning the data that would be used to generate the PDF
      const data = await response.json();
      toast.success('PDF generation initiated');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to generate PDF', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch invoice statistics
   */
  const fetchInvoiceStats = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await fetch(`/api/invoices/stats?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoice statistics');
      }
      
      const data = await response.json();
      return data.stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to fetch invoice statistics', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch invoice settings
   */
  const fetchInvoiceSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/invoices/settings');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoice settings');
      }
      
      const data = await response.json();
      return data.settings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to fetch invoice settings', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update invoice settings
   */
  const updateInvoiceSettings = useCallback(async (settingsData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/invoices/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice settings');
      }
      
      const data = await response.json();
      toast.success('Invoice settings updated successfully');
      return data.settings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to update invoice settings', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    addInvoiceItem,
    updateInvoiceItem,
    deleteInvoiceItem,
    addInvoicePayment,
    deleteInvoicePayment,
    sendInvoice,
    generateInvoicePdf,
    fetchInvoiceStats,
    fetchInvoiceSettings,
    updateInvoiceSettings
  };
}