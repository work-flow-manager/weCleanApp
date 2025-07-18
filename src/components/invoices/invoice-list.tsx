"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInvoices } from '@/hooks/useInvoices';
import { Invoice, InvoiceFilters, InvoiceStatus } from '@/types/invoice';
import { formatCurrency, formatDate, getInvoiceStatusText, getInvoiceStatusClass } from '@/lib/utils/invoiceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Plus, Search, Filter, Download, Send } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceListProps {
  initialInvoices?: Invoice[];
  customerId?: string;
  jobId?: string;
}

export function InvoiceList({ initialInvoices, customerId, jobId }: InvoiceListProps) {
  const router = useRouter();
  const { fetchInvoices, loading, error } = useInvoices();
  
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);
  const [totalInvoices, setTotalInvoices] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [filters, setFilters] = useState<InvoiceFilters>({
    customer_id: customerId,
    job_id: jobId,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Load invoices
  useEffect(() => {
    const loadInvoices = async () => {
      const offset = (page - 1) * limit;
      const result = await fetchInvoices(filters, limit, offset);
      
      if (result) {
        setInvoices(result.invoices);
        setTotalInvoices(result.total);
      }
    };
    
    loadInvoices();
  }, [fetchInvoices, filters, page, limit]);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof InvoiceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };
  
  // Handle search
  const handleSearch = () => {
    // In a real implementation, this would search through invoice numbers, customer names, etc.
    // For now, we'll just filter the current list client-side
    if (!searchTerm.trim()) {
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = invoices.filter(invoice => 
      invoice.invoice_number.toLowerCase().includes(searchLower) ||
      invoice.customers?.business_name?.toLowerCase().includes(searchLower) ||
      invoice.customers?.profiles?.full_name.toLowerCase().includes(searchLower)
    );
    
    setInvoices(filtered);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalInvoices / limit);
  
  // Generate pagination items
  const paginationItems = [];
  const maxPagesToShow = 5;
  
  let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationItems.push(
      <PaginationItem key={i}>
        <PaginationLink
          isActive={page === i}
          onClick={() => setPage(i)}
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Manage and view your invoices</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="default" size="sm" onClick={() => router.push('/invoices/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>Search</Button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.start_date ? format(new Date(filters.start_date), 'PPP') : 'Start Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.start_date ? new Date(filters.start_date) : undefined}
                      onSelect={(date) => 
                        handleFilterChange('start_date', date ? format(date, 'yyyy-MM-dd') : undefined)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.end_date ? format(new Date(filters.end_date), 'PPP') : 'End Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.end_date ? new Date(filters.end_date) : undefined}
                      onSelect={(date) => 
                        handleFilterChange('end_date', date ? format(date, 'yyyy-MM-dd') : undefined)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No invoices found. Create your first invoice to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {invoice.customers?.business_name || 
                       invoice.customers?.profiles?.full_name || 
                       'Unknown Customer'}
                    </TableCell>
                    <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                    <TableCell>
                      <Badge className={getInvoiceStatusClass(invoice.status as InvoiceStatus)}>
                        {getInvoiceStatusText(invoice.status as InvoiceStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/invoices/${invoice.id}`}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/invoices/${invoice.id}/edit`}>
                              <Send className="h-4 w-4" />
                              <span className="sr-only">Send</span>
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/invoices/${invoice.id}/pdf`}>
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download PDF</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {totalPages > 1 && (
        <CardFooter>
          <Pagination className="w-full">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                />
              </PaginationItem>
              
              {paginationItems}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
}