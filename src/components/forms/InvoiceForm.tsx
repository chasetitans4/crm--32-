"use client"

import * as React from "react"
import { useCallback, useMemo } from "react"
import { X, Save, Plus, Trash2 } from "lucide-react"
import type { Invoice, Item } from "../../schemas/contractInvoiceSchemas"
import type { InvoiceFormData, InvoiceItem } from "../../types/invoice"
import { useInvoiceForm } from "../../hooks/useInvoiceForm"
import InvoiceItemInput from "./InvoiceItemInput"
import ErrorMessage from "../ui/ErrorMessage"
import LoadingSpinner from "../ui/LoadingSpinner"

// Local cn function to avoid import issues
function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(" ")
}

interface InvoiceFormProps {
  onClose: () => void
  onSave: (formData: InvoiceFormData, items: InvoiceItem[]) => Promise<void>
  initialData?: Partial<InvoiceFormData>
  initialItems?: InvoiceItem[]
  mode?: "create" | "edit"
}

// Memoized invoice item row with stable keys and IDs
const InvoiceItemRow = React.memo<{
  item: Item
  onItemChange: (itemId: string, field: keyof Item, value: string | number | boolean) => void
  onRemoveItem: (itemId: string) => void
  canRemove: boolean
  index: number // Add index for stable IDs
}>(({ item, onItemChange, onRemoveItem, canRemove, index }) => {
  const handleDescriptionChange = useCallback(
    (value: string | number) => {
      onItemChange(item.id || '', "description", value as string)
    },
    [item.id, onItemChange],
  )

  const handleQuantityChange = useCallback(
    (value: string | number) => {
      onItemChange(item.id || '', "quantity", value as number)
    },
    [item.id, onItemChange],
  )

  const handlePriceChange = useCallback(
    (value: string | number) => {
      onItemChange(item.id || '', "price", value as number)
    },
    [item.id, onItemChange],
  )

  const handleRemove = useCallback(() => {
    onRemoveItem(item.id || '')
  }, [item.id, onRemoveItem])

  // Generate stable IDs for each input
  const itemId = item.id || `item-${index}`
  const descriptionId = `item-description-${itemId}-${index}`
  const quantityId = `item-quantity-${itemId}-${index}`
  const priceId = `item-price-${itemId}-${index}`

  return (
    <tr key={`invoice-item-${item.id}-${index}`}>
      <td className="px-4 py-3">
        <InvoiceItemInput
          type="text"
          value={item.description}
          onChange={handleDescriptionChange}
          className="w-full"
          placeholder="Item description"
          id={descriptionId}
          name={`description_${item.id}`}
          data-testid={`item-description-${item.id}`}
        />
      </td>
      <td className="px-4 py-3">
        <InvoiceItemInput
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-20"
          min="0"
          step="0.01"
          id={quantityId}
          name={`quantity_${item.id}`}
          data-testid={`item-quantity-${item.id}`}
        />
      </td>
      <td className="px-4 py-3">
        <div className="relative">
          <span className="absolute left-2 top-1 text-gray-500">$</span>
          <InvoiceItemInput
            type="number"
            value={item.price}
            onChange={handlePriceChange}
            className="w-24 pl-6"
            min="0"
            step="0.01"
            id={priceId}
            name={`price_${item.id}`}
            data-testid={`item-price-${item.id}`}
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="font-medium" data-testid={`item-total-${item.id}`}>
          ${(item.quantity * item.price).toFixed(2)}
        </span>
      </td>
      <td className="px-4 py-3">
        {canRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800 transition-colors"
            data-testid={`remove-item-${item.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  )
})

InvoiceItemRow.displayName = "InvoiceItemRow"

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose, onSave, initialData, initialItems, mode = "create" }) => {
  const {
    form,
    fields,
    addItem,
    removeItem,
    onSubmit: submitForm,
    total,
    subtotal,
    taxAmount
  } = useInvoiceForm(initialData, async (data) => {
    // Convert Invoice data to the expected format for onSave
    const invoiceItems: InvoiceItem[] = data.items.map(item => ({
      id: item.id || '',
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.total || item.quantity * item.price
    }))
    
    const formData: InvoiceFormData = {
      invoiceNumber: data.invoiceNumber,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientAddress: data.clientAddress,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      items: invoiceItems,
      notes: data.notes,
      status: data.status,
      subtotal: data.subtotal || 0,
      tax: data.tax || 0,
      totalAmount: data.totalAmount || 0
    }
     await onSave(formData, invoiceItems)
   })



  // Wrapper function to convert itemId to index for removeItem
  const handleRemoveItem = useCallback((itemId: string) => {
    const index = fields.findIndex(field => field.id === itemId)
    if (index !== -1) {
      removeItem(index)
    }
  }, [fields, removeItem])

  // Handle item changes for the InvoiceItemRow component
  const handleItemChange = useCallback((itemId: string, field: keyof Item, value: string | number | boolean) => {
    const index = fields.findIndex(field => field.id === itemId)
    if (index !== -1) {
      form.setValue(`items.${index}.${field}` as any, value)
    }
  }, [fields, form])

  const currencyOptions = useMemo(
    () => [
      { value: "USD", label: "USD ($)" },
      { value: "EUR", label: "EUR (€)" },
      { value: "GBP", label: "GBP (£)" },
    ],
    [],
  )

  // Stable callback functions with proper dependencies
  const handleClientNameChange = useCallback(
    (value: string) => form.setValue("clientName", value),
    [form],
  )

  const handleClientEmailChange = useCallback(
    (value: string) => form.setValue("clientEmail", value),
    [form],
  )



  const handleIssueDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => form.setValue("issueDate", new Date(e.target.value)),
    [form],
  )

  const handleDueDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => form.setValue("dueDate", new Date(e.target.value)),
    [form],
  )

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => form.setValue("notes", e.target.value),
    [form],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        await submitForm()
        onClose()
      } catch (error) {
        console.error("Invoice form submission failed:", error)
      }
    },
    [submitForm, onClose],
  )

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return form.formState.errors[fieldName as keyof Invoice]?.message
    },
    [form.formState.errors],
  )

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-5/6 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{mode === "create" ? "Create New Invoice" : "Edit Invoice"}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close form"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-96">
          {/* Client Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="invoice-client-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  key="invoice-client-name"
                  id="invoice-client-name"
                  name="clientName"
                  type="text"
                  value={form.getValues("clientName") || ""}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  autoComplete="off"
                  data-testid="client-name-input"
                />
                {getFieldError("clientName") && <ErrorMessage message={getFieldError("clientName")!} />}
              </div>

              <div>
                <label htmlFor="invoice-client-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Email <span className="text-red-500">*</span>
                </label>
                <input
                  key="invoice-client-email"
                  id="invoice-client-email"
                  name="clientEmail"
                  type="email"
                  value={form.getValues("clientEmail") || ""}
                  onChange={(e) => handleClientEmailChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  autoComplete="off"
                  data-testid="client-email-input"
                />
                {getFieldError("clientEmail") && <ErrorMessage message={getFieldError("clientEmail")!} />}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="invoice-issue-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  key="invoice-issue-date"
                  id="invoice-issue-date"
                  name="issueDate"
                  type="date"
                  value={form.getValues("issueDate") ? new Date(form.getValues("issueDate")).toISOString().split('T')[0] : ''}
                  onChange={handleIssueDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  data-testid="invoice-issue-date-input"
                />
              </div>

              <div>
                <label htmlFor="invoice-due-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  key="invoice-due-date"
                  id="invoice-due-date"
                  name="dueDate"
                  type="date"
                  value={form.getValues("dueDate") ? new Date(form.getValues("dueDate")).toISOString().split('T')[0] : ''}
                  onChange={handleDueDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  data-testid="due-date-input"
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                data-testid="add-item-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fields.map((item, index) => (
                    <InvoiceItemRow
                      key={`invoice-item-${item.id}-${index}`}
                      item={item}
                      index={index}
                      onItemChange={handleItemChange}
                      onRemoveItem={handleRemoveItem}
                      canRemove={fields.length > 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span data-testid="invoice-subtotal">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span data-testid="invoice-tax">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span data-testid="invoice-total">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div>
              <label htmlFor="invoice-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                key="invoice-notes"
                id="invoice-notes"
                name="notes"
                value={form.getValues("notes") || ''}
                onChange={handleNotesChange}
                placeholder="Thank you for your business!"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="off"
                data-testid="notes-input"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => form.reset()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={form.formState.isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={form.formState.isSubmitting}
              data-testid="submit-invoice-button"
            >
              {form.formState.isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === "create" ? "Create Invoice" : "Update Invoice"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Wrap the component export with error handling
const InvoiceFormWithErrorBoundary: React.FC<InvoiceFormProps> = (props) => {
  try {
    return <InvoiceForm {...props} />
  } catch (error) {
    console.error("InvoiceForm error:", error)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Error</h3>
          <p className="text-gray-600 mb-4">Invoice form encountered an error.</p>
          <button onClick={props.onClose} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    )
  }
}

// Change the export to use the error boundary wrapper
export default InvoiceFormWithErrorBoundary
