"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react';
import type { AuthUser } from '../context/AuthContext';

// Types
interface Sale {
  id: string;
  clientName: string;
  serviceType: string;
  contractValue: number;
  depositAmount: number;
  remainingBalance: number;
  saleDate: string;
  depositPaid: boolean;
  depositPaidDate?: string;
  finalPaymentPaid: boolean;
  finalPaymentDate?: string;
  commissionRate: number;
  agentId?: string;
}

interface CommissionData {
  earned: number;
  pending: number;
  totalDraws: number;
  availableForDraw: number;
  currentMonthSales: number;
  currentMonthRate: number;
  monthlyWebDesignSales: number;
  monthlyWebDesignBonus: number;
  quarterlyWebDesignSales: number;
  quarterlyBonus: number;
}

interface CommissionDraw {
  id: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'paid';
  paidDate?: string;
}

interface CommissionDashboardProps {
  currentUser: AuthUser | null;
  onError?: (error: string) => void;
}

const CommissionDashboard: React.FC<CommissionDashboardProps> = ({ currentUser, onError }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [drawAmount, setDrawAmount] = useState('');
  const [showDrawModal, setShowDrawModal] = useState(false);

  // Sample data - replace with actual data from your backend
  // Filter data based on current user
  const getUserSalesData = (): Sale[] => {
    if (!currentUser) return [];
    
    // Sample data that would be filtered by user ID in a real application
    const allSalesData: Sale[] = [
      {
        id: '1',
         clientName: 'ABC Company',
         serviceType: 'Web Design',
         contractValue: 5000,
         depositAmount: 2500,
         remainingBalance: 2500,
         saleDate: '2025-06-15',
         depositPaid: true,
         depositPaidDate: '2025-06-15',
         finalPaymentPaid: false,
         commissionRate: 35,
         agentId: currentUser.id
      },
      {
        id: '2',
         clientName: 'XYZ Corp',
         serviceType: 'Local SEO',
         contractValue: 3000,
         depositAmount: 1500,
         remainingBalance: 1500,
         saleDate: '2025-06-20',
         depositPaid: true,
         depositPaidDate: '2025-06-20',
         finalPaymentPaid: true,
         finalPaymentDate: '2025-06-25',
         commissionRate: 35,
         agentId: currentUser.id
      },
      {
        id: '3',
         clientName: 'Tech Startup',
         serviceType: 'Web Design',
         contractValue: 8000,
         depositAmount: 4000,
         remainingBalance: 4000,
         saleDate: '2025-06-28',
         depositPaid: false,
         finalPaymentPaid: false,
         commissionRate: 35,
         agentId: currentUser.id
      }
    ];
    
    // In a real app, this would filter by currentUser.id
    return allSalesData;
  };
  
  const [sales, setSales] = useState<Sale[]>(getUserSalesData());

  const [draws, setDraws] = useState<CommissionDraw[]>([
    {
      id: '1',
      amount: 500,
      requestDate: '2025-06-10',
      status: 'paid',
      paidDate: '2025-06-14'
    }
  ]);

  // Calculate commission rate based on monthly sales
  const calculateCommissionRate = (salesCount: number): number => {
    if (salesCount >= 10) return 40;
    if (salesCount >= 5) return 35;
    return 30;
  };

  // Calculate commission data
  const calculateCommissionData = (): CommissionData => {
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
    
    // Filter sales based on when initial deposit was received (per compensation plan)
    // "A sale is credited to the month in which the client's initial deposit payment is successfully received"
    const monthlySales = sales.filter(sale => {
      // Use depositPaidDate if available and deposit is paid, otherwise fall back to saleDate
      const effectiveDate = sale.depositPaid && sale.depositPaidDate 
        ? new Date(sale.depositPaidDate) 
        : new Date(sale.saleDate);
      return effectiveDate >= monthStart && effectiveDate <= monthEnd;
    });

    const currentMonthSales = monthlySales.length;
    const currentMonthRate = calculateCommissionRate(currentMonthSales);

    // Update commission rates for all sales in the month
    const updatedSales = sales.map(sale => {
      // Use depositPaidDate if available and deposit is paid, otherwise fall back to saleDate
      const effectiveDate = sale.depositPaid && sale.depositPaidDate 
        ? new Date(sale.depositPaidDate) 
        : new Date(sale.saleDate);
      if (effectiveDate >= monthStart && effectiveDate <= monthEnd) {
        return { ...sale, commissionRate: currentMonthRate };
      }
      return sale;
    });

    // Calculate earned commissions (from paid invoices)
    let earned = 0;
    updatedSales.forEach(sale => {
      if (sale.depositPaid && sale.depositPaidDate) {
        earned += (sale.depositAmount * sale.commissionRate) / 100;
      }
      if (sale.finalPaymentPaid && sale.finalPaymentDate) {
        earned += (sale.remainingBalance * sale.commissionRate) / 100;
      }
    });

    // Calculate pending commissions (from unpaid invoices)
    let pending = 0;
    updatedSales.forEach(sale => {
      const depositCommission = (sale.depositAmount * sale.commissionRate) / 100;
      const finalCommission = (sale.remainingBalance * sale.commissionRate) / 100;

      if (!sale.depositPaid) {
        // If deposit isn't paid, the entire commission is pending
        pending += depositCommission + finalCommission;
      } else if (!sale.finalPaymentPaid) {
        // If deposit is paid but final payment isn't, only final part is pending
        pending += finalCommission;
      }
    });

    // Calculate total draws for the month
    const totalDraws = draws
      .filter(draw => {
        const drawDate = new Date(draw.requestDate);
        return drawDate >= monthStart && drawDate <= monthEnd && draw.status !== 'pending';
      })
      .reduce((sum, draw) => sum + draw.amount, 0);

    // Calculate quarterly Web Design sales
    const quarterStart = new Date(selectedYear, Math.floor(selectedMonth / 3) * 3, 1);
    const quarterEnd = new Date(selectedYear, Math.floor(selectedMonth / 3) * 3 + 3, 0);
    
    // Calculate monthly Web Design sales (based on finalized sales - contract signed + initial deposit made)
    // According to compensation plan: "A sale is officially defined when the client has signed their contract and made their initial deposit payment"
    const monthlyWebDesignSales = monthlySales.filter(sale => 
      sale.serviceType === 'Web Design'
    ).length;

    const monthlyWebDesignBonus = monthlyWebDesignSales >= 8 ? monthlyWebDesignSales * 30 : 0;

    const quarterlyWebDesignSales = sales.filter(sale => {
      // Use depositPaidDate if available and deposit is paid, otherwise fall back to saleDate
      const effectiveDate = sale.depositPaid && sale.depositPaidDate 
        ? new Date(sale.depositPaidDate) 
        : new Date(sale.saleDate);
      return effectiveDate >= quarterStart && effectiveDate <= quarterEnd && 
             sale.serviceType === 'Web Design';
    }).length;

    const quarterlyBonus = quarterlyWebDesignSales >= 24 ? quarterlyWebDesignSales * 50 : 0;

    return {
      earned,
      pending,
      totalDraws,
      availableForDraw: Math.max(0, earned - totalDraws),
      currentMonthSales,
      currentMonthRate,
      monthlyWebDesignSales,
      monthlyWebDesignBonus,
      quarterlyWebDesignSales,
      quarterlyBonus
    };
  };

  const commissionData = calculateCommissionData();

  const handleDrawRequest = () => {
    try {
      const amount = parseFloat(drawAmount);
      
      // Input validation
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than $0');
      }
      
      if (amount > commissionData.availableForDraw) {
        throw new Error(`Amount cannot exceed available balance of ${formatCurrency(commissionData.availableForDraw)}`);
      }
      
      const newDraw: CommissionDraw = {
        id: Date.now().toString(),
        amount,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      setDraws([...draws, newDraw]);
      setDrawAmount('');
      setShowDrawModal(false);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process draw request';
      console.error('Draw request error:', errorMessage);
      onError?.(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthName = (month: number) => {
    return new Date(2025, month).toLocaleDateString('en-US', { month: 'long' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Commission Dashboard</h1>
        <p className="text-gray-600">Track your earnings, pending commissions, and manage draws</p>
        {currentUser && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {currentUser.name?.charAt(0).toUpperCase() || (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentUser.name || currentUser.email.split('@')[0]}
                </h3>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
                <p className="text-sm text-gray-500 capitalize">Role: {currentUser.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Month/Year Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <Calendar className="text-blue-600" size={20} />
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{getMonthName(i)}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Commission Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Earned Commissions</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(commissionData.earned)}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">From paid invoices</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Commissions</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(commissionData.pending)}</p>
            </div>
            <Clock className="text-orange-600" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">From unpaid invoices</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission Rate</p>
              <p className="text-2xl font-bold text-blue-600">{commissionData.currentMonthRate}%</p>
            </div>
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">{commissionData.currentMonthSales} sales this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available for Draw</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(commissionData.availableForDraw)}</p>
            </div>
            <DollarSign className="text-purple-600" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">After {formatCurrency(commissionData.totalDraws)} in draws</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Bonus</p>
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(commissionData.monthlyWebDesignBonus)}</p>
            </div>
            <AlertCircle className="text-indigo-600" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">{commissionData.monthlyWebDesignSales}/8 Web Design sales</p>
        </div>
      </div>

      {/* Commission Rate Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Commission Rate Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${commissionData.currentMonthSales >= 1 && commissionData.currentMonthSales <= 4 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
            <p className="font-medium">Sales 1-4</p>
            <p className="text-2xl font-bold text-blue-600">30%</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${commissionData.currentMonthSales >= 5 && commissionData.currentMonthSales <= 9 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
            <p className="font-medium">Sales 5-9</p>
            <p className="text-2xl font-bold text-blue-600">35%</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${commissionData.currentMonthSales >= 10 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
            <p className="font-medium">Sales 10+</p>
            <p className="text-2xl font-bold text-blue-600">40%</p>
          </div>
        </div>
      </div>

      {/* Bonus Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Bonus */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Web Design Bonus</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Web Design Sales This Month: {commissionData.monthlyWebDesignSales}</p>
              <p className="text-sm text-gray-600">Need 8 sales for $30/sale bonus</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (commissionData.monthlyWebDesignSales / 8) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {commissionData.monthlyWebDesignSales >= 8 ? 'Bonus Achieved!' : `${8 - commissionData.monthlyWebDesignSales} sales to bonus`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(commissionData.monthlyWebDesignBonus)}</p>
              <p className="text-sm text-gray-600">Monthly Bonus</p>
            </div>
          </div>
        </div>

        {/* Quarterly Bonus */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quarterly Web Design Bonus</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Web Design Sales This Quarter: {commissionData.quarterlyWebDesignSales}</p>
              <p className="text-sm text-gray-600">Need 24 sales for $50/sale bonus</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (commissionData.quarterlyWebDesignSales / 24) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {commissionData.quarterlyWebDesignSales >= 24 ? 'Bonus Achieved!' : `${24 - commissionData.quarterlyWebDesignSales} sales to bonus`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(commissionData.quarterlyBonus)}</p>
              <p className="text-sm text-gray-600">Quarterly Bonus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Sales Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Client</th>
                <th className="text-left py-2">Service</th>
                <th className="text-left py-2">Contract Value</th>
                <th className="text-left py-2">Deposit Status</th>
                <th className="text-left py-2">Final Payment</th>
                <th className="text-left py-2">Commission Rate</th>
                <th className="text-left py-2">Earned</th>
                <th className="text-left py-2">Pending</th>
              </tr>
            </thead>
            <tbody>
              {sales.filter(sale => {
                // Use depositPaidDate if available and deposit is paid, otherwise fall back to saleDate
                const effectiveDate = sale.depositPaid && sale.depositPaidDate 
                  ? new Date(sale.depositPaidDate) 
                  : new Date(sale.saleDate);
                const monthStart = new Date(selectedYear, selectedMonth, 1);
                const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
                return effectiveDate >= monthStart && effectiveDate <= monthEnd;
              }).map(sale => {
                const depositCommission = (sale.depositAmount * sale.commissionRate) / 100;
                const finalCommission = (sale.remainingBalance * sale.commissionRate) / 100;
                const earned = (sale.depositPaid ? depositCommission : 0) + (sale.finalPaymentPaid ? finalCommission : 0);
                const pending = (!sale.depositPaid ? depositCommission : 0) + (!sale.finalPaymentPaid && sale.depositPaid ? finalCommission : 0);
                
                return (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{sale.clientName}</td>
                    <td className="py-2">{sale.serviceType}</td>
                    <td className="py-2">{formatCurrency(sale.contractValue)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${sale.depositPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {sale.depositPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${sale.finalPaymentPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {sale.finalPaymentPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-2">{sale.commissionRate}%</td>
                    <td className="py-2 text-green-600 font-medium">{formatCurrency(earned)}</td>
                    <td className="py-2 text-orange-600 font-medium">{formatCurrency(pending)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Draws */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Commission Draws</h2>
          <button
            onClick={() => setShowDrawModal(true)}
            disabled={commissionData.availableForDraw <= 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={16} />
            Request Draw
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date Requested</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date Paid</th>
              </tr>
            </thead>
            <tbody>
              {draws.map(draw => (
                <tr key={draw.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{formatDate(draw.requestDate)}</td>
                  <td className="py-2">{formatCurrency(draw.amount)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      draw.status === 'paid' ? 'bg-green-100 text-green-800' :
                      draw.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {draw.status ? draw.status.charAt(0).toUpperCase() + draw.status.slice(1) : 'Unknown'}
                    </span>
                  </td>
                  <td className="py-2">{draw.paidDate ? formatDate(draw.paidDate) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draw Request Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Commission Draw</h3>
            <p className="text-gray-600 mb-4">
              Available for draw: {formatCurrency(commissionData.availableForDraw)}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Draw Amount
              </label>
              <input
                type="number"
                value={drawAmount}
                onChange={(e) => setDrawAmount(e.target.value)}
                max={commissionData.availableForDraw}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDrawModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDrawRequest}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Request Draw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionDashboard;
