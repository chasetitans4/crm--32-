import { renderHook, act } from "@testing-library/react"
import { useInvoiceForm } from "../../hooks/useInvoiceForm"
import type { Invoice } from "../../schemas/contractInvoiceSchemas"

describe("useInvoiceForm", () => {
  const mockOnSubmit = jest.fn<void, [Invoice]>()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it("initializes with default values", () => {
    const { result } = renderHook(() => useInvoiceForm(null, mockOnSubmit))

    expect(result.current.form.getValues("clientName")).toBe("")
    
    expect(result.current.fields).toHaveLength(1)
    expect(result.current.form.formState.errors).toEqual({})
    expect(result.current.form.formState.isSubmitting).toBe(false)
  })

  it("updates form data correctly", () => {
    const { result } = renderHook(() => useInvoiceForm(null, mockOnSubmit))

    act(() => {
      result.current.form.setValue("clientName", "John Doe")
    })

    expect(result.current.form.getValues("clientName")).toBe("John Doe")
  })

  it("adds new item correctly", () => {
    const { result } = renderHook(() => useInvoiceForm(null, mockOnSubmit))

    act(() => {
      result.current.addItem()
    })

    expect(result.current.fields).toHaveLength(2)
  })

  it("removes item correctly", () => {
    const { result } = renderHook(() => useInvoiceForm(null, mockOnSubmit))

    act(() => {
      result.current.addItem()
    })

    expect(result.current.fields).toHaveLength(2)

    act(() => {
      result.current.removeItem(1)
    })

    expect(result.current.fields).toHaveLength(1)
  })

  it("calculates totals correctly", () => {
    const { result } = renderHook(() => useInvoiceForm(null, mockOnSubmit))

    act(() => {
      const items = result.current.form.getValues("items")
      items[0].quantity = 2
      items[0].price = 100
      result.current.form.setValue("items", items)
    })

    expect(result.current.subtotal).toBe(200)
    expect(result.current.total).toBe(200) // No tax by default
  })

  it("validates form correctly", async () => {
    const { result } = renderHook(() => useInvoiceForm(null, mockOnSubmit))

    await act(async () => {
      const isValid = await result.current.form.trigger()
      expect(isValid).toBe(false)
    })
  })

  it("resets form correctly", () => {
    const { result } = renderHook(() => useInvoiceForm(null, mockOnSubmit))

    act(() => {
      result.current.form.setValue("clientName", "John Doe")
      result.current.addItem()
    })

    act(() => {
      result.current.form.reset()
    })

    expect(result.current.form.getValues("clientName")).toBe("")
    expect(result.current.fields).toHaveLength(1) // Default has 1 item
  })
})
