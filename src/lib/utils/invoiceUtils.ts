import { Invoice, InvoiceItem } from '@/types/invoice';

// Define InvoiceStatus type locally since it's not exported from the invoice types
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

/**
 * Format a currency amount with the specified currency code
 * @param amount The amount to format
 * @param currencyCode The ISO currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a date in the local format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate the total amount for an invoice based on its items
 * @param items Array of invoice items
 * @param taxRate Tax rate percentage
 * @returns Object containing subtotal, tax amount, and total
 */
export function calculateInvoiceTotal(items: InvoiceItem[], taxRate: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  return {
    subtotal,
    taxAmount,
    total
  };
}

/**
 * Generate a new invoice number based on the prefix and next number
 * @param prefix Invoice number prefix
 * @param nextNumber Next invoice number
 * @returns Formatted invoice number
 */
export function generateInvoiceNumber(prefix: string, nextNumber: number): string {
  // Format the number with leading zeros (e.g., 000001)
  const formattedNumber = nextNumber.toString().padStart(6, '0');
  return `${prefix}${formattedNumber}`;
}

/**
 * Get the display text for an invoice status
 * @param status Invoice status
 * @returns Human-readable status text
 */
export function getInvoiceStatusText(status: InvoiceStatus): string {
  const statusMap: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled'
  };
  
  return statusMap[status] || status;
}

/**
 * Get the CSS class for an invoice status badge
 * @param status Invoice status
 * @returns CSS class name
 */
export function getInvoiceStatusClass(status: InvoiceStatus): string {
  const statusClassMap: Record<InvoiceStatus, string> = {
    draft: 'bg-gray-500 text-white',
    sent: 'bg-blue-500 text-white',
    paid: 'bg-green-500 text-white',
    overdue: 'bg-red-500 text-white',
    cancelled: 'bg-gray-700 text-white'
  };
  
  return statusClassMap[status] || '';
}

/**
 * Calculate the remaining balance on an invoice
 * @param invoice Invoice object
 * @returns Remaining balance
 */
export function calculateRemainingBalance(invoice: Invoice): number {
  const paidAmount = invoice.paid_amount || 0;
  return invoice.total_amount - paidAmount;
}

/**
 * Check if an invoice is fully paid
 * @param invoice Invoice object
 * @returns Boolean indicating if invoice is fully paid
 */
export function isInvoicePaid(invoice: Invoice): boolean {
  return invoice.status === 'paid' || calculateRemainingBalance(invoice) <= 0;
}

/**
 * Check if an invoice is overdue
 * @param invoice Invoice object
 * @returns Boolean indicating if invoice is overdue
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return false;
  }
  
  const dueDate = new Date(invoice.due_date);
  const today = new Date();
  
  // Reset time part for accurate date comparison
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}

/**
 * Get the payment status text for an invoice
 * @param invoice Invoice object
 * @returns Payment status text
 */
export function getPaymentStatusText(invoice: Invoice): string {
  if (invoice.status === 'cancelled') {
    return 'Cancelled';
  }
  
  if (isInvoicePaid(invoice)) {
    return 'Paid in Full';
  }
  
  const paidAmount = invoice.paid_amount || 0;
  if (paidAmount > 0) {
    return 'Partially Paid';
  }
  
  if (isInvoiceOverdue(invoice)) {
    return 'Overdue';
  }
  
  return 'Unpaid';
}

/**
 * Calculate the number of days until an invoice is due or overdue
 * @param invoice Invoice object
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilDue(invoice: Invoice): number {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return 0;
  }
  
  const dueDate = new Date(invoice.due_date);
  const today = new Date();
  
  // Reset time part for accurate date comparison
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the due date display text
 * @param invoice Invoice object
 * @returns Due date display text
 */
export function getDueDateText(invoice: Invoice): string {
  if (invoice.status === 'paid') {
    return `Paid on ${formatDate(invoice.paid_date || '')}`;
  }
  
  if (invoice.status === 'cancelled') {
    return 'Cancelled';
  }
  
  const daysUntilDue = getDaysUntilDue(invoice);
  
  if (daysUntilDue < 0) {
    return `Overdue by ${Math.abs(daysUntilDue)} days`;
  }
  
  if (daysUntilDue === 0) {
    return 'Due Today';
  }
  
  return `Due in ${daysUntilDue} days`;
}