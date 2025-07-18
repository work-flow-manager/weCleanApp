import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils/invoiceUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Printer } from 'lucide-react';

interface PaymentReceiptProps {
  payment: any;
  invoice: any;
  company: any;
}

export function PaymentReceipt({ payment, invoice, company }: PaymentReceiptProps) {
  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Handle print action
  const handlePrint = () => {
    window.print();
  };
  
  // Handle download action (in a real implementation, this would generate a PDF)
  const handleDownload = () => {
    alert('In a real implementation, this would download a PDF receipt');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Receipt</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      <Card className="border-2 border-dashed border-gray-200 p-8 print:border-none print:shadow-none">
        <CardHeader className="p-0 pb-6">
          <div className="flex justify-between items-start">
            <div>
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="h-16 object-contain mb-2"
                />
              ) : (
                <h1 className="text-2xl font-bold">{company.name}</h1>
              )}
              <div className="text-sm text-muted-foreground">
                <p>{company.address?.street}</p>
                <p>{company.address?.city}, {company.address?.state} {company.address?.postalCode}</p>
                <p>{company.phone}</p>
                <p>{company.email}</p>
              </div>
            </div>
            
            <div className="text-right">
              <h1 className="text-3xl font-bold text-primary mb-2">RECEIPT</h1>
              <div className="text-sm">
                <p><span className="font-medium">Receipt #:</span> {payment.id.substring(0, 8).toUpperCase()}</p>
                <p><span className="font-medium">Date:</span> {formatDate(payment.payment_date)}</p>
                <p><span className="font-medium">Invoice #:</span> {invoice.invoice_number}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 space-y-6">
          {/* Customer Information */}
          <div className="border-t border-b py-4">
            <h2 className="text-lg font-medium mb-2">Payment From:</h2>
            <div>
              <p className="font-medium">
                {invoice.customers?.business_name || invoice.customers?.profiles?.full_name}
              </p>
              {invoice.customers?.business_name && invoice.customers?.profiles?.full_name && (
                <p>Attn: {invoice.customers.profiles.full_name}</p>
              )}
              {invoice.customers?.billing_address && (
                <p className="whitespace-pre-line">{invoice.customers.billing_address}</p>
              )}
              {invoice.customers?.profiles?.email && (
                <p>{invoice.customers.profiles.email}</p>
              )}
            </div>
          </div>
          
          {/* Payment Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Payment Details</h2>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Payment Method</td>
                    <td className="py-3 px-4 text-right">
                      {formatPaymentMethod(payment.payment_method)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Amount Paid</td>
                    <td className="py-3 px-4 text-right font-bold">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                  {payment.transaction_id && (
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Transaction ID</td>
                      <td className="py-3 px-4 text-right">
                        {payment.transaction_id}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-3 px-4 font-medium">Status</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Invoice Summary */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-medium text-muted-foreground">Invoice Summary</h3>
              <div className="border rounded-md p-4 bg-muted/50">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Invoice Total:</span>
                  <span>{formatCurrency(invoice.total_amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Previous Payments:</span>
                  <span>{formatCurrency((invoice.paid_amount || 0) - payment.amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">This Payment:</span>
                  <span className="font-medium">{formatCurrency(payment.amount)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="font-medium">Remaining Balance:</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.total_amount - (invoice.paid_amount || 0))}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {payment.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <div className="border rounded-md p-4 bg-muted/50">
                  <p className="text-sm">{payment.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            <p>Thank you for your payment!</p>
            {company.company_invoice_settings?.invoice_footer && (
              <p className="mt-2">{company.company_invoice_settings.invoice_footer}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}