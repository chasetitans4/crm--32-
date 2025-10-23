"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface FinancialMetric {
  label: string
  value: number
  change: number
  trend: "up" | "down"
  format: "currency" | "percentage" | "number"
}

interface Transaction {
  id: string
  type: "income" | "expense"
  description: string
  amount: number
  date: string
  category: string
  status: "completed" | "pending" | "failed"
}

interface Invoice {
  id: string
  client: string
  amount: number
  status: "paid" | "pending" | "overdue"
  dueDate: string
  invoiceNumber: string
}

const FinancialDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const [metrics] = useState<FinancialMetric[]>([
    {
      label: "Total Revenue",
      value: 125000,
      change: 12.5,
      trend: "up",
      format: "currency",
    },
    {
      label: "Net Profit",
      value: 45000,
      change: 8.2,
      trend: "up",
      format: "currency",
    },
    {
      label: "Expenses",
      value: 80000,
      change: -5.1,
      trend: "down",
      format: "currency",
    },
    {
      label: "Profit Margin",
      value: 36,
      change: 2.3,
      trend: "up",
      format: "percentage",
    },
  ])

  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      description: "Website Development - Acme Corp",
      amount: 15000,
      date: "2024-01-18",
      category: "Web Development",
      status: "completed",
    },
    {
      id: "2",
      type: "expense",
      description: "Software Licenses",
      amount: 2500,
      date: "2024-01-17",
      category: "Software",
      status: "completed",
    },
    {
      id: "3",
      type: "income",
      description: "SEO Services - Tech Solutions",
      amount: 8500,
      date: "2024-01-16",
      category: "SEO",
      status: "pending",
    },
    {
      id: "4",
      type: "expense",
      description: "Office Rent",
      amount: 3000,
      date: "2024-01-15",
      category: "Office",
      status: "completed",
    },
  ])

  const [invoices] = useState<Invoice[]>([
    {
      id: "1",
      client: "Acme Corp",
      amount: 15000,
      status: "paid",
      dueDate: "2024-01-15",
      invoiceNumber: "INV-2024-001",
    },
    {
      id: "2",
      client: "Tech Solutions Inc",
      amount: 8500,
      status: "pending",
      dueDate: "2024-02-01",
      invoiceNumber: "INV-2024-002",
    },
    {
      id: "3",
      client: "StartupXYZ",
      amount: 12000,
      status: "overdue",
      dueDate: "2024-01-20",
      invoiceNumber: "INV-2024-003",
    },
  ])

  const formatValue = (value: number, format: FinancialMetric["format"]) => {
    switch (format) {
      case "currency":
        return `$${value.toLocaleString()}`
      case "percentage":
        return `${value}%`
      default:
        return value.toLocaleString()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "overdue")
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your business financial performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("week")}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("month")}
            size="sm"
          >
            Month
          </Button>
          <Button
            variant={selectedPeriod === "year" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("year")}
            size="sm"
          >
            Year
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold">{formatValue(metric.value, metric.format)}</p>
                  <div className="flex items-center mt-2">
                    {metric.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ml-1 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                <p className="text-xl font-bold text-orange-600">${pendingAmount.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status</CardTitle>
              <CardDescription>Track outstanding and paid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">
                        {invoice.client} • Due: {invoice.dueDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${invoice.amount.toLocaleString()}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Web Development</span>
                    <span className="font-bold">60%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SEO Services</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Consulting</span>
                    <span className="font-bold">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Expense Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Software & Tools</span>
                    <span className="font-bold">$12,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Office & Rent</span>
                    <span className="font-bold">$8,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Marketing</span>
                    <span className="font-bold">$5,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancialDashboard
