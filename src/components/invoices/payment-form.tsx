"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { Invoice } from '@/types/invoice';
import { formatCurrency, calculateRemainingBalance } from '@/lib/utils/invoiceUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreditCard, AlertCircle, CheckCircle, DollarSign, Building, CreditCardIcon } from 'lucide-react';

interface PaymentFormProps {
  invoice: Invoice;
  onPaymentComplete?: (updatedInvoice: Invoice) => void;
  onCancel?: () => void;
}

export function PaymentForm({ invoice, onPaymentComplete, onCancel }: PaymentFormProps) {
  const router = useRouter();
  const { addInvoicePayment } = useInvoices();
  const { 
    processCreditCardPayment, 
    processBankTransferPayment, 
    processCashPayment, 
    loading, 
    paymentStatus: gatewayPaymentStatus 
  } = usePayments();
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [amount, setAmount] = useState<string>(calculateRemainingBalance(invoice).toFixed(2));
  const [notes, setNotes] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Calculate remaining balance
  const remainingBalance = calculateRemainingBalance(invoice);
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };
  
  // Validate form
  const validateForm = () => {
    // Validate amount
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount');
      return false;
    }
    
    if (paymentAmount > remainingBalance) {
      setErrorMessage(`Payment amount cannot exceed the remaining balance of ${formatCurrency(remainingBalance)}`);
      return false;
    }
    
    // Validate credit card details if paying by card
    if (paymentMethod === 'credit_card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setErrorMessage('Please enter a valid 16-digit card number');
        return false;
      }
      
      if (!cardName) {
        setErrorMessage('Please enter the name on the card');
        return false;
      }
      
      if (!expiryDate || expiryDate.length !== 5) {
        setErrorMessage('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      
      if (!cvv || cvv.length < 3) {
        setErrorMessage('Please enter a valid CVV code');
        return false;
      }
    }
    
    return true;
  };
  
  // Handle payment submission
  const handleSubmitPayment = async () => {
    // Clear any previous errors
    setErrorMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Set processing state
    setPaymentStatus('processing');
    
    try {
      const paymentAmount = parseFloat(amount);
      let result;
      
      // Process payment based on selected method
      if (paymentMethod === 'credit_card') {
        // Process credit card payment
        result = await processCreditCardPayment(
          invoice.id,
          paymentAmount,
          {
            cardNumber: cardNumber.replace(/\s/g, ''),
            cardholderName: cardName,
            expiryDate: expiryDate,
            cvv: cvv
          },
          notes || `Payment for invoice #${invoice.invoice_number}`
        );
      } else if (paymentMethod === 'bank_transfer') {
        // Process bank transfer
        const reference = `INV-${invoice.invoice_number}`;
        result = await processBankTransferPayment(
          invoice.id,
          paymentAmount,
          reference,
          notes || `Bank transfer for invoice #${invoice.invoice_number}`
        );
      } else {
        // Process cash payment
        result = await processCashPayment(
          invoice.id,
          paymentAmount,
          notes || `Cash payment for invoice #${invoice.invoice_number}`
        );
      }
      
      if (result && result.success) {
        setPaymentStatus('success');
        
        // Notify parent component if available
        if (onPaymentComplete && result.invoice) {
          onPaymentComplete(result.invoice);
        }
        
        // Redirect after a delay
        setTimeout(() => {
          if (result.payment && paymentMethod === 'credit_card') {
            // For credit card payments, redirect to receipt page
            router.push(`/invoices/${invoice.id}/payments/${result.payment.id}/receipt`);
          } else {
            // For other payment methods, redirect to invoice page
            router.push(`/invoices/${invoice.id}`);
          }
          router.refresh();
        }, 2000);
      } else {
        setPaymentStatus('error');
        setErrorMessage(result?.error || 'Failed to process payment. Please try again.');
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage('An error occurred during payment processing. Please try again.');
      console.error('Payment error:', error);
    }
  };
  
  // If payment is successful, show success message
  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center">Payment Successful</CardTitle>
          <CardDescription className="text-center">
            Your payment of {formatCurrency(parseFloat(amount))} has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4 bg-muted/50">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Invoice Number:</span>
              <span className="font-medium">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-medium capitalize">
                {paymentMethod.replace('_', ' ')}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => router.push(`/invoices/${invoice.id}`)}
          >
            View Invoice
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Make Payment</CardTitle>
        <CardDescription>
          Pay invoice #{invoice.invoice_number} for {formatCurrency(invoice.total_amount)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="border rounded-md p-4 bg-muted/50">
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Invoice Total:</span>
            <span className="font-medium">{formatCurrency(invoice.total_amount)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Amount Paid:</span>
            <span className="font-medium">{formatCurrency(invoice.paid_amount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining Balance:</span>
            <span className="font-medium">{formatCurrency(remainingBalance)}</span>
          </div>
        </div>
        
        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {/* Payment Method Selection */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Tabs 
            value={paymentMethod} 
            onValueChange={setPaymentMethod}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="credit_card">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Credit Card
              </TabsTrigger>
              <TabsTrigger value="bank_transfer">
                <Building className="h-4 w-4 mr-2" />
                Bank Transfer
              </TabsTrigger>
              <TabsTrigger value="cash">
                <DollarSign className="h-4 w-4 mr-2" />
                Cash
              </TabsTrigger>
            </TabsList>
            
            {/* Credit Card Form */}
            <TabsContent value="credit_card" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19} // 16 digits + 3 spaces
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5} // MM/YY
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Bank Transfer Form */}
            <TabsContent value="bank_transfer" className="space-y-4 pt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Bank Transfer Instructions</AlertTitle>
                <AlertDescription>
                  Please use the following details to make your bank transfer:
                  <div className="mt-2 space-y-1">
                    <p><span className="font-medium">Account Name:</span> We-Clean Inc.</p>
                    <p><span className="font-medium">Account Number:</span> 1234567890</p>
                    <p><span className="font-medium">Routing Number:</span> 987654321</p>
                    <p><span className="font-medium">Reference:</span> INV-{invoice.invoice_number}</p>
                  </div>
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                After making the transfer, please enter the amount and any reference details below.
              </p>
            </TabsContent>
            
            {/* Cash Form */}
            <TabsContent value="cash" className="space-y-4 pt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Cash Payment</AlertTitle>
                <AlertDescription>
                  Please record cash payments received from the customer.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Payment Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Payment Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the amount you wish to pay (maximum: {formatCurrency(remainingBalance)})
          </p>
        </div>
        
        {/* Payment Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Enter any payment notes or reference numbers"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmitPayment} 
          disabled={loading || paymentStatus === 'processing'}
        >
          {paymentStatus === 'processing' ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay {formatCurrency(parseFloat(amount) || 0)}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}