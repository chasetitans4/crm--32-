"use client";

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EnhancedErrorBoundary } from '@/components/EnhancedErrorBoundary';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';

interface Report {
  id: string;
  name: string;
  createdAt: string;
  dateRange: DateRange;
  data: any[];
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: new Date(2024, 0, 20),
  });

  const generateReport = useCallback(() => {
    const from = date?.from || new Date();
    const to = date?.to || new Date();
    const newReport: Report = {
      id: new Date().toISOString(),
      name: `Report - ${from.toLocaleDateString()} to ${to.toLocaleDateString()}`,
      createdAt: new Date().toLocaleDateString(),
      dateRange: { from, to },
      data: Array.from({ length: 12 }, (_, i) => ({
        name: `Month ${i + 1}`,
        sales: Math.floor(Math.random() * 5000) + 1000,
      })),
    };
    setReports([...reports, newReport]);
  }, [reports, date]);

  // Memoized ReportCard component to prevent unnecessary re-renders
  const ReportCard = memo(({ report }: { report: any }) => (
    <Card key={report.id}>
      <CardHeader>
        <CardTitle>{report.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Created on: {report.createdAt}</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={report.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  ));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-[300px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={generateReport}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

// Wrap the component with error boundary and providers
const ReportsPageWithProviders = () => {
  return (
    <EnhancedErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <ReportsPage />
        </AppProvider>
      </AuthProvider>
    </EnhancedErrorBoundary>
  );
};

export default ReportsPageWithProviders;