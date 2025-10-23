"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, FileText, User, Calendar } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  client: string;
  value: number;
  status: 'pending' | 'approved' | 'rejected' | 'review';
  submittedDate: string;
  reviewer?: string;
  notes?: string;
}

const ContractApprovalWorkflow: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: '1',
      title: 'Website Development Contract',
      client: 'Acme Corp',
      value: 15000,
      status: 'pending',
      submittedDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'SEO Services Agreement',
      client: 'Tech Solutions Inc',
      value: 8500,
      status: 'review',
      submittedDate: '2024-01-14',
      reviewer: 'John Smith',
    },
    {
      id: '3',
      title: 'Digital Marketing Package',
      client: 'StartupXYZ',
      value: 12000,
      status: 'approved',
      submittedDate: '2024-01-13',
      reviewer: 'Sarah Johnson',
    },
  ]);

  const handleApprove = (contractId: string) => {
    setContracts(prev => prev.map(contract => 
      contract.id === contractId 
        ? { ...contract, status: 'approved' as const, reviewer: 'Current User' }
        : contract
    ));
  };

  const handleReject = (contractId: string) => {
    setContracts(prev => prev.map(contract => 
      contract.id === contractId 
        ? { ...contract, status: 'rejected' as const, reviewer: 'Current User' }
        : contract
    ));
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'review': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Approval Workflow</h1>
          <p className="text-gray-600 mt-2">Review and approve pending contracts</p>
        </div>
      </div>

      <div className="grid gap-6">
        {contracts.map((contract) => (
          <Card key={contract.id} className="border border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {contract.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {contract.client}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {contract.submittedDate}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${contract.value.toLocaleString()}
                  </div>
                  <Badge className={`${getStatusColor(contract.status)} flex items-center gap-1 mt-2`}>
                    {getStatusIcon(contract.status)}
                    {contract.status ? contract.status.charAt(0).toUpperCase() + contract.status.slice(1) : 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {contract.reviewer && (
                <p className="text-sm text-gray-600 mb-4">
                  Reviewer: {contract.reviewer}
                </p>
              )}
              {contract.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleApprove(contract.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleReject(contract.id)}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContractApprovalWorkflow;
