"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import ContractFieldInput from "../../components/forms/ContractFieldInput"

describe("ContractFieldInput", () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it("renders text input correctly", () => {
    render(
      <ContractFieldInput
        type="text"
        name="test"
        value="test value"
        onChange={mockOnChange}
        data-testid="test-input"
      />,
    )

    const input = screen.getByTestId("test-input")
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue("test value")
  })

  it("calls onChange when value changes", () => {
    render(<ContractFieldInput type="text" name="test" value="" onChange={mockOnChange} data-testid="test-input" />)

    const input = screen.getByTestId("test-input")
    fireEvent.change(input, { target: { value: "new value" } })

    expect(mockOnChange).toHaveBeenCalledWith("new value")
  })

  it("renders textarea when type is textarea", () => {
    render(
      <ContractFieldInput
        type="textarea"
        name="test"
        value="textarea value"
        onChange={mockOnChange}
        data-testid="test-textarea"
      />,
    )

    const textarea = screen.getByTestId("test-textarea")
    expect(textarea.tagName).toBe("TEXTAREA")
    expect(textarea).toHaveValue("textarea value")
  })

  it("applies disabled state correctly", () => {
    render(
      <ContractFieldInput type="text" name="test" value="" onChange={mockOnChange} disabled data-testid="test-input" />,
    )

    const input = screen.getByTestId("test-input")
    expect(input).toBeDisabled()
    expect(input).toHaveClass("bg-gray-100", "cursor-not-allowed")
  })

  it("applies required attribute correctly", () => {
    render(
      <ContractFieldInput type="text" name="test" value="" onChange={mockOnChange} required data-testid="test-input" />,
    )

    const input = screen.getByTestId("test-input")
    expect(input).toBeRequired()
  })

  it("applies custom className", () => {
    render(
      <ContractFieldInput
        type="text"
        name="test"
        value=""
        onChange={mockOnChange}
        className="custom-class"
        data-testid="test-input"
      />,
    )

    const input = screen.getByTestId("test-input")
    expect(input).toHaveClass("custom-class")
  })
})
