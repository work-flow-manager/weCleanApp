import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoices } from '@/hooks/useInvoices';
import { CreateInvoiceRequest, UpdateInvoiceRequest, InvoiceItem } from '@/types/invoice';
import { Customer } from '@/types/job';
import { formatCurrency } from '@/lib/utils/invoiceUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

interface InvoiceFormProps {
  initialData?: {
    invoice?: any;
    customerId?: string;
    jobId?: string;
  };
  customers: Customer[];
  serviceTypes: any[];
  isEditing?: boolean;
}

export function InvoiceForm({ initialData, customers, serviceTypes, isEditing = false }: InvoiceFormProps) {
  const router = useRouter();
  const { createInvoice, updateInvoice, fetchInvoiceSettings, loading } = useInvoices();
  
  // Form state
  const [customerId, setCustomerId] = useState<string>(initialData?.customerId || initialData?.invoice?.customer_id || '');
  const [jobId, setJobId] = useState<string>(initialData?.jobId || initialData?.invoice?.job_id || '');
  const [issueDate, setIssueDate] = useState<Date>(initialData?.invoice?.issue_date ? new Date(initialData.invoice.issue_date) : new Date());
  const [dueDate, setDueDate] = useState<Date>(() => {
    if (initialData?.invoice?.due_date) {
      return new Date(initialData.invoice.due_date);
    }
    // Default to 30 days from now
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });
  const [taxRate, setTaxRate] = useState<number>(initialData?.invoice?.tax_rate || 0);
  const [notes, setNotes] = useState<string>(initialData?.invoice?.notes || '');
  const [paymentTerms, setPaymentTerms] = useState<string>(initialData?.invoice?.payment_terms || 'Due within 30 days');
  const [items, setItems] = useState<Partial<InvoiceItem>[]>(
    initialData?.invoice?.invoice_items || [{ description: '', quantity: 1, unit_price: 0 }]
  );
  
  // Calculated values
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  
  // Load invoice settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchInvoiceSettings();
      if (settings && !isEditing) {
        setTaxRate(settings.default_tax_rate || 0);
        setPaymentTerms(settings.default_payment_terms || 'Due within 30 days');
      }
    };
    
    loadSettings();
  }, [fetchInvoiceSettings, isEditing]);
  
  // Calculate totals when items or tax rate changes
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
    
    const newTaxAmount = newSubtotal * (taxRate / 100);
    const newTotal = newSubtotal + newTaxAmount;
    
    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setTotal(newTotal);
  }, [items, taxRate]);
  
  // Add a new item
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };
  
  // Update an item
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? Number(value) : Number(newItems[index].quantity) || 0;
      const unitPrice = field === 'unit_price' ? Number(value) : Number(newItems[index].unit_price) || 0;
      newItems[index].amount = quantity * unitPrice;
    }
    
    setItems(newItems);
  };
  
  // Remove an item
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) {
      alert('Please select a customer');
      return;
    }
    
    if (items.length === 0 || !items.some(item => item.description && item.quantity && item.unit_price)) {
      alert('Please add at least one item with description, quantity, and price');
      return;
    }
    
    // Format dates
    const formattedIssueDate = format(issueDate, 'yyyy-MM-dd');
    const formattedDueDate = format(dueDate, 'yyyy-MM-dd');
    
    // Prepare items data
    const itemsData = items.map(item => ({
      description: item.description || '',
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
      service_type_id: item.service_type_id
    })).filter(item => item.description && item.quantity > 0 && item.unit_price > 0);
    
    if (isEditing && initialData?.invoice?.id) {
      // Update existing invoice
      const updateData: UpdateInvoiceRequest = {
        issue_date: formattedIssueDate,
        due_date: formattedDueDate,
        tax_rate: taxRate,
        notes,
        payment_terms: paymentTerms
      };
      
      const updatedInvoice = await updateInvoice(initialData.invoice.id, updateData);
      if (updatedInvoice) {
        router.push(`/invoices/${updatedInvoice.id}`);
      }
    } else {
      // Create new invoice
      const invoiceData: CreateInvoiceRequest = {
        customer_id: customerId,
        job_id: jobId || undefined,
        issue_date: formattedIssueDate,
        due_date: formattedDueDate,
        tax_rate: taxRate,
        notes,
        payment_terms: paymentTerms,
        items: itemsData
      };
      
      const newInvoice = await createInvoice(invoiceData);
      if (newInvoice) {
        router.push(`/invoices/${newInvoice.id}`);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
        </div>
        
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Invoice' : 'Save Invoice'}
        </Button>
      </div>
      
      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
            <CardDescription>Enter the basic invoice details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={customerId}
                onValueChange={setCustomerId}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.business_name || customer.profiles?.full_name || 'Unknown Customer'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Job Selection (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="job">Related Job (Optional)</Label>
              <Select
                value={jobId || ''}
                onValueChange={setJobId}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No related job</SelectItem>
                  {/* In a real implementation, this would be filtered by customer */}
                  {/* For now, we'll just show a placeholder */}
                  <SelectItem value="job-1">Job #1234 - Office Cleaning</SelectItem>
                  <SelectItem value="job-2">Job #5678 - Residential Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Issue Date */}
            <div className="space-y-2">
              <Label>Issue Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {issueDate ? format(issueDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={issueDate}
                    onSelect={(date) => date && setIssueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
        
        {/* Right Column - Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Enter additional invoice details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tax Rate */}
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
            
            {/* Payment Terms */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes for this invoice"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Invoice Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Invoice Items</CardTitle>
            <CardDescription>Add items to your invoice</CardDescription>
          </div>
          <Button type="button" onClick={addItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Description *</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Quantity *</TableHead>
                  <TableHead>Unit Price *</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.service_type_id || ''}
                        onValueChange={(value) => updateItem(index, 'service_type_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No service type</SelectItem>
                          {serviceTypes.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.unit_price || ''}
                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(
                        (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Invoice' : 'Save Invoice'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}