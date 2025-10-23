"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Download, CreditCard, CheckCircle, ArrowLeft } from "lucide-react"
import StripePayment from "./StripePayment"

interface ClientInvoicePaymentProps {
  invoiceId: string
  onClose: () => void
}

// Mock invoice data - in a real app, this would be fetched from the API
const mockInvoice = {
  id: "INV-2025-001",
  clientName: "TechCorp Solutions",
  clientEmail: "contact@techcorp.com",
  date: "2025-05-01",
  dueDate: "2025-05-15",
  items: [
    {
      description: "Website Design",
      quantity: 1,
      rate: 2500,
      amount: 2500,
    },
    {
      description: "Website Development",
      quantity: 1,
      rate: 5000,
      amount: 5000,
    },
  ],
  subtotal: 7500,
  tax: 750,
  total: 8250,
  notes: "Thank you for your business!",
}

const ClientInvoicePayment: React.FC<ClientInvoicePaymentProps> = ({ invoiceId, onClose }) => {
  const [invoice, setInvoice] = useState(mockInvoice)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  // In a real app, this would fetch the invoice data from the API
  useEffect(() => {
    // Simulate API call
    const fetchInvoice = async () => {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setInvoice(mockInvoice)
    }

    fetchInvoice()
  }, [invoiceId])

  const handlePayNow = () => {
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setPaymentComplete(true)
    setShowPayment(false)

    // In a real app, this would update the invoice status in the database
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {showPayment && (
            <button onClick={() => setShowPayment(false)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold">
            {showPayment ? "Payment" : paymentComplete ? "Payment Confirmation" : "Invoice"}
          </h2>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      {paymentComplete ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Payment Successful</h3>
          <p className="text-gray-600 mb-6">Thank you for your payment of ${invoice.total.toFixed(2)}.</p>
          <p className="text-gray-600 mb-6">A receipt has been sent to {invoice.clientEmail}.</p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Close
          </button>
        </div>
      ) : showPayment ? (
        <StripePayment amount={invoice.total} onSuccess={handlePaymentSuccess} onCancel={handlePaymentCancel} />
      ) : (
        <>
          <div className="flex justify-between mb-8">
            <div>
              <h3 className="font-bold text-gray-700 mb-1">From</h3>
              <p className="text-gray-600">Your Web Dev Company</p>
              <p className="text-gray-600">123 Web Street</p>
              <p className="text-gray-600">San Francisco, CA 94107</p>
              <p className="text-gray-600">contact@yourcompany.com</p>
            </div>

            <div className="text-right">
              <h3 className="font-bold text-gray-700 mb-1">To</h3>
              <p className="text-gray-600">{invoice.clientName}</p>
              <p className="text-gray-600">{invoice.clientEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-medium">{invoice.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Invoice Date</p>
              <p className="font-medium">{invoice.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">{invoice.dueDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount Due</p>
              <p className="font-medium">${invoice.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">${item.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span>${invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mb-8">
              <h3 className="font-bold text-gray-700 mb-1">Notes</h3>
              <p className="text-gray-600">{invoice.notes}</p>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-1"
            >
              <Download size={16} />
              Download PDF
            </button>

            <button
              type="button"
              onClick={handlePayNow}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <CreditCard size={16} />
              Pay Now
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ClientInvoicePayment
