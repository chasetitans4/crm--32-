import React from 'react'
import { formatDateForInput, parseISOToDate } from '../../utils/dateUtils'

interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  date, 
  setDate, 
  placeholder = "Select date", 
  className = "" 
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const parsedDate = value ? parseISOToDate(value + 'T00:00:00') : undefined
    setDate(parsedDate || undefined)
  }
  
  return (
    <div className={`relative ${className}`}>
      <input
        type="date"
        value={formatDateForInput(date)}
        onChange={handleDateChange}
        
        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
      />
    </div>
  )
}
