"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInvoices } from '@/hooks/useInvoices';
import { Invoice, InvoiceItem, InvoicePayment, InvoiceStatus } from '@/types/invoice';
import { formatCurrency, formatDate, getInvoiceStatusText, getInvoiceStatusClass, calculateRemainingBalance, getDueDateText } from '@/lib/utils/invoiceUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download, Edit, Send, Printer, CreditCard, AlertTriangle, CheckCircle, Clock, Ban } from 'lucide-react';

interface InvoiceDetailsProps {
  invoice: Invoice;
}

export function InvoiceDetails({ invoice: initialInvoice }: InvoiceDetailsProps) {
  const router = useRouter();
  const { 
    sendInvoice, 
    updateInvoice, 
    deleteInvoice, 
    addInvoicePayment, 
    generateInvoicePdf, 
    loading 
  } = useInvoices();
  
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>(calculateRemainingBalance(invoice).toString());
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  
  // Handle sending invoice
  const handleSendInvoice = async () => {
    if (invoice.status !== 'draft') return;
    
    const updatedInvoice = await sendInvoice(invoice.id);
    if (updatedInvoice) {
      setInvoice(updatedInvoice);
    }
  };
  
  // Handle cancelling invoice
  const handleCancelInvoice = async () => {
    if (['paid', 'cancelled'].includes(invoice.status)) return;
    
    const updatedInvoice = await updateInvoice(invoice.id, { status: 'cancelled' });
    if (updatedInvoice) {
      setInvoice(updatedInvoice);
      setShowCancelDialog(false);
    }
  };
  
  // Handle adding payment
  const handleAddPayment = async () => {
    if (['paid', 'cancelled'].includes(invoice.status)) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const result = await addInvoicePayment(invoice.id, {
      amount,
      payment_method: paymentMethod,
      notes: paymentNotes
    });
    
    if (result) {
      setInvoice(result.invoice);
      setShowPaymentDialog(false);
      
      // Reset form
      setPaymentAmount(calculateRemainingBalance(result.invoice).toString());
      setPaymentMethod('credit_card');
      setPaymentNotes('');
    }
  };
  
  // Handle generating PDF
  const handleGeneratePdf = async () => {
    await generateInvoicePdf(invoice.id);
  };
  
  // Calculate totals
  const subtotal = invoice.subtotal;
  const taxAmount = invoice.tax_amount;
  const totalAmount = invoice.total_amount;
  const paidAmount = invoice.paid_amount || 0;
  const remainingBalance = calculateRemainingBalance(invoice);
  
  // Get status icon
  const getStatusIcon = () => {
    switch (invoice.status) {
      case 'draft':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'sent':
        return <Send className="h-5 w-5 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <Ban className="h-5 w-5 text-gray-700" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
          <Badge className={getInvoiceStatusClass(invoice.status as InvoiceStatus)}>
            {getInvoiceStatusText(invoice.status as InvoiceStatus)}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {invoice.status === 'draft' && (
            <Button onClick={handleSendInvoice} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          )}
          
          {invoice.status === 'draft' && (
            <Button variant="outline" asChild>
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
          
          {['sent', 'overdue'].includes(invoice.status) && (
            <Button variant="default" onClick={() => setShowPaymentDialog(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
          
          <Button variant="outline" onClick={handleGeneratePdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          {!['paid', 'cancelled'].includes(invoice.status) && (
            <AlertDialogTrigger asChild>
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                <Ban className="h-4 w-4 mr-2" />
                Cancel Invoice
              </Button>
            </AlertDialogTrigger>
          )}
        </div>
      </div>
      
      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Invoice Info */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span>{getInvoiceStatusText(invoice.status as InvoiceStatus)}</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice Number:</span>
              <span className="font-medium">{invoice.invoice_number}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issue Date:</span>
              <span>{formatDate(invoice.issue_date)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date:</span>
              <span>{formatDate(invoice.due_date)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Status:</span>
              <span>{getDueDateText(invoice)}</span>
            </div>
            
            {invoice.job_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Related Job:</span>
                <Link href={`/jobs/${invoice.job_id}`} className="text-primary hover:underline">
                  View Job
                </Link>
              </div>
            )}
            
            {invoice.payment_terms && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Terms:</span>
                <span>{invoice.payment_terms}</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Middle Column - Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">
                {invoice.customers?.business_name || invoice.customers?.profiles?.full_name}
              </h3>
              {invoice.customers?.business_name && invoice.customers?.profiles?.full_name && (
                <p className="text-sm text-muted-foreground">
                  Contact: {invoice.customers.profiles.full_name}
                </p>
              )}
            </div>
            
            {invoice.customers?.billing_address && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Billing Address:</h4>
                <p className="text-sm whitespace-pre-line">{invoice.customers.billing_address}</p>
              </div>
            )}
            
            {invoice.customers?.profiles?.email && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Email:</h4>
                <p className="text-sm">{invoice.customers.profiles.email}</p>
              </div>
            )}
            
            {invoice.customers?.profiles?.phone && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone:</h4>
                <p className="text-sm">{invoice.customers.profiles.phone}</p>
              </div>
            )}
            
            <div className="pt-2">
              <Link href={`/customers/${invoice.customer_id}`} className="text-primary text-sm hover:underline">
                View Customer Profile
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Right Column - Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({invoice.tax_rate}%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span>{formatCurrency(paidAmount)}</span>
            </div>
            
            <div className="flex justify-between font-medium">
              <span>Balance Due:</span>
              <span className={remainingBalance > 0 ? 'text-red-500' : 'text-green-500'}>
                {formatCurrency(remainingBalance)}
              </span>
            </div>
            
            {['sent', 'overdue'].includes(invoice.status) && remainingBalance > 0 && (
              <div className="space-y-2 mt-2">
                <Button 
                  className="w-full" 
                  onClick={() => setShowPaymentDialog(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  asChild
                >
                  <Link href={`/invoices/${invoice.id}/pay`}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Online Payment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.invoice_items?.map((item: InvoiceItem) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.description}
                    {item.service_types && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Service: {item.service_types.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({invoice.tax_rate}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payments */}
      {invoice.invoice_payments && invoice.invoice_payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.invoice_payments.map((payment: InvoicePayment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell className="capitalize">{payment.payment_method.replace('_', ' ')}</TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter payment details for invoice #{invoice.invoice_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingBalance}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Remaining balance: {formatCurrency(remainingBalance)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any payment notes or reference numbers"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayment} disabled={loading}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Invoice Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep invoice</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvoice}>
              Yes, cancel invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}