"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form"
import { invoiceSchema, type Invoice, type Item } from "../schemas/contractInvoiceSchemas"
import { useToast } from "../components/ui/use-toast"

const defaultItem: Omit<Item, 'id'> = { description: "", quantity: 1, price: 0, total: 0 };

const defaultInvoiceValues: Invoice = {
    id: ``,
    clientId: ``,
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: `INV-${Date.now()}`,
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    notes: "",
    status: "Draft",
    items: [
        {
            id: `item-${Date.now()}`,
            ...defaultItem
        }
    ],
    subtotal: 0,
    tax: 0,
    totalAmount: 0,
}

export const useInvoiceForm = (
    initialData?: Partial<Invoice> | null,
    onSubmit?: (data: Invoice) => void | Promise<void>
) => {
    const { toast } = useToast()

    const form: UseFormReturn<Invoice> = useForm<Invoice>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: defaultInvoiceValues
    })

    useEffect(() => {
        if (initialData) {
            const { issueDate, dueDate, ...rest } = initialData;
            const newValues: Partial<Invoice> = { ...rest };
            if (issueDate) {
                newValues.issueDate = new Date(issueDate);
            }
            if (dueDate) {
                newValues.dueDate = new Date(dueDate);
            }
            form.reset({ ...defaultInvoiceValues, ...newValues });
        } else {
            form.reset(defaultInvoiceValues);
        }
    }, [initialData, form]);


    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const handleSubmit = async (data: Invoice) => {
        try {
            if (onSubmit) {
                await onSubmit(data)
            }
            toast({
                title: "Invoice Saved",
                description: `Invoice ${data.invoiceNumber} has been successfully saved.`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save invoice.",
                variant: "destructive",
            })
        }
    }

    const addItem = () => {
        append({ id: `item-${Date.now()}`, ...defaultItem });
    }

    const removeItem = (index: number) => {
        remove(index)
    }

    const items = form.watch("items")
    const subtotal = (items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0)
    const taxRate = form.watch('tax') || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    useEffect(() => {
        form.setValue('subtotal', subtotal);
        form.setValue('totalAmount', total);
    }, [subtotal, total, form]);

    return {
        form,
        fields,
        addItem,
        removeItem,
        onSubmit: form.handleSubmit(handleSubmit),
        total,
        subtotal,
        taxAmount
    }
}
