"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { CreditCard, Lock, CheckCircle, DollarSign, Receipt, Send } from 'lucide-react'
import { useToast } from '../hooks/useAppState'
import { advancedEncryption } from '../utils/encryption'
import { secureStorage, setSecureItemAdvanced } from '../utils/secureStorage'

interface PaymentMethod {
  id: string
  type: 'stripe' | 'paypal' | 'square'
  name: string
  icon: React.ReactNode
  enabled: boolean
}

interface PaymentLink {
  id: string
  invoiceId: string
  amount: number
  currency: string
  expiresAt: string
  status: 'active' | 'expired' | 'used'
  url: string
}

interface EnhancedPaymentSystemProps {
  invoiceId?: string
  amount?: number
  currency?: string
  onSuccess?: (paymentData: any) => void
  onCancel?: () => void
  allowPartialPayments?: boolean
  paymentMethods?: string[]
}

const EnhancedPaymentSystem: React.FC<EnhancedPaymentSystemProps> = ({
  invoiceId,
  amount = 100,
  currency = 'USD',
  onSuccess = () => {},
  onCancel = () => {},
  allowPartialPayments = false,
  paymentMethods = ['stripe', 'paypal']
}) => {
  const { showSuccess, showError } = useToast()
  const [selectedMethod, setSelectedMethod] = useState<string>('stripe')
  const [paymentAmount, setPaymentAmount] = useState(amount)
  const [processing, setProcessing] = useState(false)
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null)
  const [showLinkGenerator, setShowLinkGenerator] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })

  // Secure functions for handling sensitive card data
  const setSecureCardDetails = useCallback(async (field: string, value: string) => {
    try {
      // Encrypt the sensitive card data before storing
      const encryptedValue = await advancedEncryption.encrypt(value)
      setCardDetails(prev => ({ ...prev, [field]: value })) // Keep plain text for UI
      
      // Store encrypted version temporarily for processing
      const sessionKey = `temp_card_${field}_${Date.now()}`
      await setSecureItemAdvanced(sessionKey, encryptedValue)
      
      // Clear the temporary storage after 5 minutes
      setTimeout(() => {
        secureStorage.removeItem(sessionKey)
      }, 5 * 60 * 1000)
    } catch (error) {
      console.error('Failed to encrypt card data:', error)
    }
  }, [])

  const clearSensitiveData = useCallback(() => {
    // Clear all card details from memory
    setCardDetails({
      number: '',
      expiry: '',
      cvc: '',
      name: ''
    })
    
    // Clear any temporary encrypted storage
    const keys = secureStorage.getAllKeys()
    keys.forEach(key => {
      if (key.startsWith('temp_card_')) {
        secureStorage.removeItem(key)
      }
    })
  }, [])

  useEffect(() => {
    setPaymentAmount(amount)
  }, [amount])

  // Cleanup sensitive data on unmount
  useEffect(() => {
    return () => {
      clearSensitiveData()
    }
  }, [clearSensitiveData])

  const availablePaymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      type: 'stripe',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />,
      enabled: paymentMethods.includes('stripe')
    },
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      icon: <DollarSign className="w-5 h-5" />,
      enabled: paymentMethods.includes('paypal')
    },
    {
      id: 'square',
      type: 'square',
      name: 'Square',
      icon: <Receipt className="w-5 h-5" />,
      enabled: paymentMethods.includes('square')
    }
  ]

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    return parts.length ? parts.join(' ') : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return value
  }

  const generatePaymentLink = async () => {
    try {
      setProcessing(true)
      
      // Simulate API call to generate payment link
      const linkData: PaymentLink = {
        id: `link_${Date.now()}`,
        invoiceId: invoiceId || '',
        amount: paymentAmount,
        currency,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'active',
        url: `https://pay.pixelworks.net/invoice/${invoiceId}?token=${Math.random().toString(36).substr(2, 9)}`
      }
      
      setPaymentLink(linkData)
      showSuccess('Success', 'Payment link generated successfully!')
    } catch (error) {
      showError('Error', 'Failed to generate payment link')
    } finally {
      setProcessing(false)
    }
  }

  const processPayment = async () => {
    try {
      setProcessing(true)
      
      // Validate card details
      if (selectedMethod === 'stripe') {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
          throw new Error('Please fill in all card details')
        }
      }

      // For real implementation, card details would be sent directly to payment processor
      // without storing them locally. This is just for demonstration.
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const paymentData = {
        id: `pay_${Date.now()}`,
        amount: paymentAmount,
        currency,
        method: selectedMethod,
        status: 'succeeded',
        invoiceId,
        timestamp: new Date().toISOString(),
        // Never store actual card details in payment data
        cardLast4: selectedMethod === 'stripe' ? cardDetails.number.slice(-4) : undefined
      }
      
      // Clear sensitive data immediately after processing
      clearSensitiveData()
      
      onSuccess(paymentData)
      showSuccess('Payment Successful', `Payment of ${currency} ${paymentAmount} processed successfully!`)
    } catch (error) {
      // Clear sensitive data even on error
      clearSensitiveData()
      showError('Payment Failed', error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const copyPaymentLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink.url)
      showSuccess('Copied', 'Payment link copied to clipboard!')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
        <p className="text-gray-600">
          Amount: <span className="font-semibold">{currency} {amount.toFixed(2)}</span>
        </p>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid gap-3">
          {availablePaymentMethods.filter(method => method.enabled).map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`flex items-center p-3 border rounded-lg transition-colors ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {method.icon}
              <span className="ml-3 font-medium">{method.name}</span>
              {selectedMethod === method.id && (
                <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Partial Payment Option */}
      {allowPartialPayments && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {currency}
            </span>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              max={amount}
              min={0.01}
              step="0.01"
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum: {currency} {amount.toFixed(2)}
          </p>
        </div>
      )}

      {/* Card Details for Stripe */}
      {selectedMethod === 'stripe' && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardDetails.number}
              onChange={(e) => {
                const formattedNumber = formatCardNumber(e.target.value)
                setCardDetails(prev => ({ ...prev, number: formattedNumber }))
                setSecureCardDetails('number', formattedNumber)
              }}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={cardDetails.expiry}
                onChange={(e) => {
                  const formattedExpiry = formatExpiry(e.target.value)
                  setCardDetails(prev => ({ ...prev, expiry: formattedExpiry }))
                  setSecureCardDetails('expiry', formattedExpiry)
                }}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVC
              </label>
              <input
                type="text"
                value={cardDetails.cvc}
                onChange={(e) => {
                  const cvcValue = e.target.value.replace(/\D/g, '')
                  setCardDetails(prev => ({ ...prev, cvc: cvcValue }))
                  setSecureCardDetails('cvc', cvcValue)
                }}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) => {
                setCardDetails(prev => ({ ...prev, name: e.target.value }))
                setSecureCardDetails('name', e.target.value)
              }}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Payment Link Generator */}
      <div className="mb-6">
        <button
          onClick={() => setShowLinkGenerator(!showLinkGenerator)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Generate Payment Link Instead
        </button>
        
        {showLinkGenerator && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Generate a secure payment link to send to your client
            </p>
            <button
              onClick={generatePaymentLink}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Generate Link
            </button>
            
            {paymentLink && (
              <div className="mt-4 p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Payment Link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={paymentLink.url}
                    readOnly
                    className="flex-1 text-sm px-2 py-1 border rounded"
                  />
                  <button
                    onClick={copyPaymentLink}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Expires: {new Date(paymentLink.expiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={processPayment}
          disabled={processing}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {processing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay {currency} {paymentAmount.toFixed(2)}
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
        <Lock className="w-3 h-3 mr-1" />
        Secured by 256-bit SSL encryption
      </div>
    </div>
  )
}

export default EnhancedPaymentSystem
