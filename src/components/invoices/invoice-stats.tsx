import React, { useState, useEffect } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceStats } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils/invoiceUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { CalendarIcon, DollarSign, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function InvoiceStats() {
  const { fetchInvoiceStats, loading } = useInvoices();
  
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  
  // Load stats based on date range
  useEffect(() => {
    const loadStats = async () => {
      let start: string | undefined;
      let end: string | undefined;
      
      switch (dateRange) {
        case 'month':
          start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
          end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
          break;
        case 'year':
          start = format(startOfYear(new Date()), 'yyyy-MM-dd');
          end = format(endOfYear(new Date()), 'yyyy-MM-dd');
          break;
        case 'custom':
          start = format(startDate, 'yyyy-MM-dd');
          end = format(endDate, 'yyyy-MM-dd');
          break;
        case 'all':
        default:
          // No date filtering
          break;
      }
      
      const result = await fetchInvoiceStats(start, end);
      if (result) {
        setStats(result);
      }
    };
    
    loadStats();
  }, [fetchInvoiceStats, dateRange, startDate, endDate]);
  
  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setDateRange(value as 'all' | 'month' | 'year' | 'custom');
    
    // Update date range based on selection
    switch (value) {
      case 'month':
        setStartDate(startOfMonth(new Date()));
        setEndDate(endOfMonth(new Date()));
        break;
      case 'year':
        setStartDate(startOfYear(new Date()));
        setEndDate(endOfYear(new Date()));
        break;
      // For 'all' and 'custom', keep the current dates
    }
  };
  
  // Calculate collection rate
  const collectionRate = stats ? 
    stats.total_amount > 0 ? (stats.paid_amount / stats.total_amount) * 100 : 0 : 0;
  
  // Calculate overdue rate
  const overdueRate = stats ? 
    stats.total_amount > 0 ? (stats.overdue_amount / stats.total_amount) * 100 : 0 : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Invoice Statistics</h2>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[130px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <span className="text-muted-foreground">to</span>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[130px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !stats ? (
        <div className="text-center py-8 text-muted-foreground">
          No invoice data available.
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-0.5">
                  <CardTitle className="text-base">Total Invoiced</CardTitle>
                  <CardDescription>
                    {stats.total_invoices} invoice{stats.total_invoices !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.total_amount)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-0.5">
                  <CardTitle className="text-base">Paid</CardTitle>
                  <CardDescription>Collection rate: {collectionRate.toFixed(1)}%</CardDescription>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.paid_amount)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-0.5">
                  <CardTitle className="text-base">Outstanding</CardTitle>
                  <CardDescription>Awaiting payment</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {formatCurrency(stats.sent_amount)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-0.5">
                  <CardTitle className="text-base">Overdue</CardTitle>
                  <CardDescription>Overdue rate: {overdueRate.toFixed(1)}%</CardDescription>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(stats.overdue_amount)}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Stats */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="status">By Status</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Summary</CardTitle>
                  <CardDescription>
                    Overview of your invoices for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Invoices</h3>
                        <p className="text-2xl font-bold">{stats.total_invoices}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Amount</h3>
                        <p className="text-2xl font-bold">{formatCurrency(stats.total_amount)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Paid Amount</h3>
                        <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.paid_amount)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Collection Rate</h3>
                        <p className="text-2xl font-bold">{collectionRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Outstanding Amount</h3>
                        <p className="text-2xl font-bold">
                          {formatCurrency(stats.total_amount - stats.paid_amount)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Overdue Amount</h3>
                        <p className="text-2xl font-bold text-red-500">{formatCurrency(stats.overdue_amount)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invoices by Status</CardTitle>
                  <CardDescription>
                    Breakdown of invoices by their current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Draft</h3>
                        <p className="text-xl font-bold">{formatCurrency(stats.draft_amount)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Sent</h3>
                        <p className="text-xl font-bold text-blue-500">{formatCurrency(stats.sent_amount)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Paid</h3>
                        <p className="text-xl font-bold text-green-500">{formatCurrency(stats.paid_amount)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Overdue</h3>
                        <p className="text-xl font-bold text-red-500">{formatCurrency(stats.overdue_amount)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}