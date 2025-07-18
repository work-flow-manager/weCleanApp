import React from 'react';
import { Invoice } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/utils/invoiceUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface InvoicePdfViewerProps {
  invoice: Invoice;
  companyInfo: any;
}

export function InvoicePdfViewer({ invoice, companyInfo }: InvoicePdfViewerProps) {
  // In a real implementation, this would render a PDF using a library like react-pdf
  // For now, we'll just render a preview of what the PDF would look like
  
  const handleDownload = () => {
    // In a real implementation, this would download the PDF
    alert('PDF download functionality would be implemented here');
  };
  
  const handlePrint = () => {
    // In a real implementation, this would print the PDF
    window.print();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoice Preview</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <Card className="border-2 border-dashed border-gray-200 p-8 print:border-none print:shadow-none">
        <CardContent className="p-0">
          <div className="pdf-preview space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                {companyInfo.logo_url ? (
                  <img 
                    src={companyInfo.logo_url} 
                    alt={companyInfo.name} 
                    className="h-16 object-contain mb-2"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
                )}
                <div className="text-sm text-muted-foreground">
                  <p>{companyInfo.address?.street}</p>
                  <p>{companyInfo.address?.city}, {companyInfo.address?.state} {companyInfo.address?.postalCode}</p>
                  <p>{companyInfo.phone}</p>
                  <p>{companyInfo.email}</p>
                </div>
              </div>
              
              <div className="text-right">
                <h1 className="text-3xl font-bold text-primary mb-2">INVOICE</h1>
                <div className="text-sm">
                  <p><span className="font-medium">Invoice #:</span> {invoice.invoice_number}</p>
                  <p><span className="font-medium">Issue Date:</span> {formatDate(invoice.issue_date)}</p>
                  <p><span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}</p>
                </div>
              </div>
            </div>
            
            {/* Bill To */}
            <div className="border-t border-b py-4">
              <h2 className="text-lg font-medium mb-2">Bill To:</h2>
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
            
            {/* Invoice Items */}
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 text-left">
                    <th className="py-2 px-4">Description</th>
                    <th className="py-2 px-4 text-right">Quantity</th>
                    <th className="py-2 px-4 text-right">Unit Price</th>
                    <th className="py-2 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.invoice_items?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">
                        {item.description}
                        {item.service_types && (
                          <div className="text-xs text-muted-foreground">
                            Service: {item.service_types.name}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4 text-right">{item.quantity}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Totals */}
              <div className="mt-4 flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-1">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Tax ({invoice.tax_rate}%):</span>
                    <span>{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold border-t mt-1 pt-1">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  
                  {invoice.paid_amount && invoice.paid_amount > 0 && (
                    <>
                      <div className="flex justify-between py-1">
                        <span>Amount Paid:</span>
                        <span>{formatCurrency(invoice.paid_amount)}</span>
                      </div>
                      <div className="flex justify-between py-1 font-bold border-t mt-1 pt-1">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(invoice.total_amount - invoice.paid_amount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {invoice.notes && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Notes:</h3>
                <p className="whitespace-pre-line text-sm">{invoice.notes}</p>
              </div>
            )}
            
            {/* Payment Terms */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Payment Terms:</h3>
              <p className="text-sm">{invoice.payment_terms || 'Due within 30 days'}</p>
            </div>
            
            {/* Footer */}
            <div className="border-t pt-4 text-center text-sm text-muted-foreground">
              <p>Thank you for your business!</p>
              {companyInfo.company_invoice_settings?.invoice_footer && (
                <p className="mt-2">{companyInfo.company_invoice_settings.invoice_footer}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}