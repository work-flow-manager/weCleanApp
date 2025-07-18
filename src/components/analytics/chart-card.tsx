"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsChartData } from '@/types/analytics';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { cn } from '@/lib/utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

interface ChartCardProps {
  title: string;
  chartData: AnalyticsChartData;
  chartType?: ChartType;
  height?: number;
  className?: string;
}

export function ChartCard({ 
  title, 
  chartData, 
  chartType = 'line',
  height = 300,
  className 
}: ChartCardProps) {
  // Prepare chart data
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.color ? getBackgroundColor(dataset.color) : undefined,
      borderColor: dataset.color,
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: dataset.color,
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: chartType === 'line' ? 'origin' : undefined,
    }))
  };
  
  // Chart options
  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        cornerRadius: 4,
        boxPadding: 4
      }
    },
    scales: chartType === 'line' || chartType === 'bar' ? {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    } : undefined
  };
  
  // Helper function to get background color with opacity
  function getBackgroundColor(color: string) {
    if (chartType === 'line') {
      // For line charts, create a gradient
      return (context: any) => {
        if (!context.chart.chartArea) {
          return;
        }
        
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(
          0, 0, 0, context.chart.height
        );
        gradient.addColorStop(0, `${color}33`); // 20% opacity
        gradient.addColorStop(1, `${color}00`); // 0% opacity
        return gradient;
      };
    } else if (chartType === 'pie' || chartType === 'doughnut') {
      // For pie/doughnut charts, use an array of colors
      return chartData.datasets[0].data.map((_, i) => {
        const colors = [
          '#EC4899', // pink-500
          '#8B5CF6', // violet-500
          '#10B981', // emerald-500
          '#F59E0B', // amber-500
          '#3B82F6', // blue-500
          '#6366F1', // indigo-500
          '#EC4899', // pink-500 (repeat if needed)
        ];
        return colors[i % colors.length];
      });
    }
    
    // For bar charts, use the color with 80% opacity
    return `${color}CC`;
  }
  
  // Render the appropriate chart type
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={data} options={options} height={height} />;
      case 'pie':
        return <Pie data={data} options={options} height={height} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} height={height} />;
      default:
        return <Line data={data} options={options} height={height} />;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}