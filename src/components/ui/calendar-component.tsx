"use client"

import React from "react"
import { useState } from "react"
import { Plus, X, ChevronLeft, ChevronRight, CalendarIcon, Clock, User, Tag, Info, Edit, Trash2 } from "lucide-react"
import { useAppContext } from "../../context/AppContext"
import { useEventActions } from "../../hooks/useEventActions"
import type { NewEvent, Event } from "../../types/index"
import { DatePicker } from "./date-picker"

const CalendarComponent: React.FC = () => {
  const { state } = useAppContext()
  const { clients, events } = state
  const { addEvent, updateEvent, deleteEvent } = useEventActions()

  const [viewMode, setViewMode] = useState("month")
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showDayDetail, setShowDayDetail] = useState(false)
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00 AM",
    type: "meeting",
    relatedTo: null,
  })

  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Navigate to today
  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const days = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Get the first day of the month
    const firstDay = new Date(year, month, 1).getDay()

    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Get the number of days in the previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDate = new Date(year, month - 1, daysInPrevMonth - firstDay + i + 1)
      days.push({
        day: daysInPrevMonth - firstDay + i + 1,
        date: formatDate(prevMonthDate),
        isCurrentMonth: false,
        isPast: prevMonthDate < new Date(new Date().setHours(0, 0, 0, 0)),
        events: events.filter((event) => event.date === formatDate(prevMonthDate)),
      })
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i)
      const dateStr = formatDate(currentDate)
      days.push({
        day: i,
        date: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === formatDate(new Date()),
        isPast: currentDate < new Date(new Date().setHours(0, 0, 0, 0)),
        events: events.filter((event) => event.date === dateStr),
      })
    }

    // Add empty cells for days after the last day of the month
    const lastDay = new Date(year, month, daysInMonth).getDay()
    const nextDays = 6 - lastDay
    for (let i = 1; i <= nextDays; i++) {
      const nextMonthDate = new Date(year, month + 1, i)
      days.push({
        day: i,
        date: formatDate(nextMonthDate),
        isCurrentMonth: false,
        isPast: nextMonthDate < new Date(new Date().setHours(0, 0, 0, 0)),
        events: events.filter((event) => event.date === formatDate(nextMonthDate)),
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  // Handle day click to show events for that day
  const handleDayClick = (date: string, dayEvents: Event[]) => {
    setSelectedDate(new Date(date))
    setSelectedDayEvents(dayEvents)
    setShowDayDetail(true)

    // Pre-fill the new event form with the selected date
    setNewEvent({
      ...newEvent,
      date: date,
    })
  }

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) return

    try {
      if (isEditing && editingEvent) {
        await updateEvent(editingEvent.id, newEvent)
      } else {
        await addEvent(newEvent)
      }
      setNewEvent({
        title: "",
        date: selectedDate ? formatDate(selectedDate) : new Date().toISOString().split("T")[0],
        time: "09:00 AM",
        type: "meeting",
        relatedTo: null,
      })
      setShowAddEvent(false)
      setIsEditing(false)
      setEditingEvent(null)
    } catch (error) {
      console.error("Error adding event:", error)
    }
  }

  // Handle editing an event
  const handleEditEvent = (event: Event) => {
    setIsEditing(true)
    setEditingEvent(event)
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type,
      relatedTo: event.relatedTo,
      description: event.description,
    })
    setShowAddEvent(true)
  }

  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId)
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  // Get month name and year for display
  const monthName = currentMonth.toLocaleString("default", { month: "long" })
  const year = currentMonth.getFullYear()

  // Get event type color with improved contrast
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-50 text-blue-900 border-l-4 border-blue-500 hover:bg-blue-100"
      case "call":
        return "bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500 hover:bg-emerald-100"
      case "deadline":
        return "bg-red-50 text-red-900 border-l-4 border-red-500 hover:bg-red-100"
      case "internal":
        return "bg-purple-50 text-purple-900 border-l-4 border-purple-500 hover:bg-purple-100"
      default:
        return "bg-gray-50 text-gray-900 border-l-4 border-gray-500 hover:bg-gray-100"
    }
  }

  // Get event type badge color
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500 text-white"
      case "call":
        return "bg-emerald-500 text-white"
      case "deadline":
        return "bg-red-500 text-white"
      case "internal":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  // Format time for display
  const formatTime = (time: string) => {
    return time
  }

  // Get client name from ID
  const getClientName = (clientId: string | number | undefined) => {
    if (clientId === undefined || clientId === null) return "N/A"
    const clientIdStr = String(clientId)
    const client = clients.find((c) => String(c.id) === clientIdStr)
    return client ? client.name : "N/A"
  }

  return (
    <div className="p-8 fade-in bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Calendar
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex rounded-xl overflow-hidden shadow-lg border border-white/20">
            <button
              onClick={() => setViewMode("month")}
              className={`px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                viewMode === "month"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                viewMode === "week"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                viewMode === "day"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              Day
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date())
              setShowAddEvent(true)
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Plus size={18} />
            Add Event
          </button>
        </div>
      </div>

      {viewMode === "month" && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <h3 className="text-2xl font-bold text-white">
                {monthName} {year}
              </h3>
              <button
                onClick={nextMonth}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-110"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-6 py-3 text-sm font-semibold bg-white text-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 text-center font-semibold p-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <div className="text-red-600 py-2">Sun</div>
            <div className="text-gray-700 py-2">Mon</div>
            <div className="text-gray-700 py-2">Tue</div>
            <div className="text-gray-700 py-2">Wed</div>
            <div className="text-gray-700 py-2">Thu</div>
            <div className="text-gray-700 py-2">Fri</div>
            <div className="text-blue-600 py-2">Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1 p-3 bg-slate-50">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`min-h-32 rounded-xl p-2 transition-all duration-200 cursor-pointer ${
                  day.isCurrentMonth
                    ? day.isToday
                      ? "bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg ring-2 ring-blue-400 transform scale-105"
                      : day.isPast
                        ? "bg-white hover:bg-blue-50 hover:shadow-md"
                        : "bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102"
                    : "bg-gray-100/50 text-gray-400 hover:bg-gray-200/50"
                } border border-gray-200/50`}
                onClick={() => handleDayClick(day.date, day.events)}
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    day.isToday
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto shadow-md"
                      : "text-gray-800 text-center"
                  }`}
                >
                  {day.day}
                </div>
                <div className="space-y-1 max-h-20 overflow-hidden">
                  {day.events?.slice(0, 3).map((event, eIdx) => (
                    <div
                      key={eIdx}
                      className={`text-xs p-1.5 rounded-lg truncate shadow-sm font-medium transition-all duration-200 ${getEventTypeColor(event.type)}`}
                    >
                      <div className="font-semibold">{event.time.substring(0, 5)}</div>
                      <div className="truncate">
                        {event.title.length > 12 ? event.title.substring(0, 12) + "..." : event.title}
                      </div>
                    </div>
                  ))}
                  {day.events && day.events.length > 3 && (
                    <div className="text-xs text-center text-blue-600 font-semibold bg-blue-50 rounded-lg py-1">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {showDayDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 sticky top-0 z-10 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddEvent(true)
                      setShowDayDetail(false)
                    }}
                    className="px-4 py-2 bg-white text-blue-600 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <Plus size={16} />
                    Add Event
                  </button>
                  <button
                    onClick={() => setShowDayDetail(false)}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {selectedDayEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${getEventTypeColor(event.type)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-lg">
                              <Clock size={16} />
                              <span className="font-medium">{formatTime(event.time)}</span>
                            </div>
                            {event.relatedTo?.type === "client" && (
                              <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-lg">
                                <User size={16} />
                                <span className="font-medium">{getClientName(event.relatedTo.id)}</span>
                              </div>
                            )}
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold ${getEventTypeBadge(event.type)}`}
                            >
                              <Tag size={16} />
                              {event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : 'Unknown'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 shadow-md"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-110 shadow-md"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-110 shadow-md">
                            <Info size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <CalendarIcon size={40} className="text-blue-600" />
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">No events scheduled for this day</p>
                  <button
                    onClick={() => {
                      setShowAddEvent(true)
                      setShowDayDetail(false)
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    Add an event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-white/20 scale-in">
            <div className="p-6 border-b bg-gradient-to-r from-green-600 to-blue-600 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{isEditing ? "Edit Event" : "Add New Event"}</h3>
                <button
                  onClick={() => {
                    setShowAddEvent(false)
                    setIsEditing(false)
                    setEditingEvent(null)
                  }}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800">Date</label>
                  <DatePicker
                    date={selectedDate}
                    setDate={(d) => {
                      setSelectedDate(d)
                      setNewEvent((ne) => ({
                        ...ne,
                        date: d ? formatDate(d) : new Date().toISOString().split("T")[0],
                      }))
                    }}
                    placeholder="Pick a date"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800">Time</label>
                  <select
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  >
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <React.Fragment key={hour}>
                        <option value={`${hour.toString().padStart(2, "0")}:00 ${hour < 12 ? "AM" : "PM"}`}>
                          {hour === 0 ? "12" : hour > 12 ? hour - 12 : hour}:00 {hour < 12 ? "AM" : "PM"}
                        </option>
                        <option value={`${hour.toString().padStart(2, "0")}:30 ${hour < 12 ? "AM" : "PM"}`}>
                          {hour === 0 ? "12" : hour > 12 ? hour - 12 : hour}:30 {hour < 12 ? "AM" : "PM"}
                        </option>
                      </React.Fragment>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-800">Event Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {["meeting", "call", "deadline", "internal"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, type: type as any })}
                      className={`px-4 py-3 text-sm font-semibold rounded-xl shadow-md transition-all duration-200 hover:scale-105 ${
                        newEvent.type === type
                          ? getEventTypeBadge(type) + " ring-2 ring-offset-2 ring-blue-400 shadow-lg"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Related To</label>
                <select
                  value={newEvent.relatedTo ? `${newEvent.relatedTo.type}-${newEvent.relatedTo.id}` : ""}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setNewEvent({ ...newEvent, relatedTo: null })
                      return
                    }

                    const [type, id] = e.target.value.split("-")
                    setNewEvent({
                      ...newEvent,
                      relatedTo: { type: type as "client" | "internal", id },
                    })
                  }}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                >
                  <option value="">None</option>
                  <optgroup label="Clients">
                    {clients.map((client) => (
                      <option key={`client-${client.id}`} value={`client-${client.id}`}>
                        {client.name}
                      </option>
                    ))}
                  </optgroup>
                  <option value="internal-0">Internal Team</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Description (Optional)</label>
                <textarea
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm h-24 resize-none transition-all duration-200"
                  placeholder="Add any additional details..."
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="px-6 py-3 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  {isEditing ? "Update Event" : "Add Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="grid grid-cols-7 text-center">
              <div className="font-semibold text-white py-2">Sunday</div>
              <div className="font-semibold text-white py-2">Monday</div>
              <div className="font-semibold text-white py-2">Tuesday</div>
              <div className="font-semibold text-white py-2">Wednesday</div>
              <div className="font-semibold text-white py-2">Thursday</div>
              <div className="font-semibold text-white py-2">Friday</div>
              <div className="font-semibold text-white py-2">Saturday</div>
            </div>
          </div>

          <div className="flex">
            <div className="w-20 pr-3 py-3 bg-gradient-to-b from-slate-50 to-blue-50">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 text-sm text-gray-600 text-right pr-3 font-semibold flex items-center justify-end"
                >
                  {i + 8}:00
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 flex-1">
              {Array.from({ length: 7 }).map((_, dayIdx) => (
                <div key={dayIdx} className="border-l border-gray-200">
                  {Array.from({ length: 12 }).map((_, hourIdx) => (
                    <div
                      key={hourIdx}
                      className="h-16 border-b border-gray-100 relative hover:bg-blue-50 transition-colors duration-200"
                    >
                      {/* Placeholder for week events */}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="p-6 text-center bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 className="font-bold text-white text-xl">
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
          </div>

          <div className="space-y-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex h-20 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100"
              >
                <div className="w-20 text-sm text-gray-600 pt-2 font-semibold pl-4 bg-gradient-to-r from-slate-50 to-blue-50">
                  {i + 8}:00 AM
                </div>
                <div className="flex-1 pl-4 relative border-l border-gray-200">{/* Placeholder for day events */}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarComponent
export { CalendarComponent as Calendar }