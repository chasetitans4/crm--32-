"use client"

import { useAppContext } from '../context/AppContext'
import type { Event, NewEvent } from '../types'

export const useEventActions = () => {
  const { state, dispatch } = useAppContext()

  const addEvent = async (newEvent: NewEvent): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate 5% chance of network error
    if (Math.random() < 0.05) {
      throw new Error('Network error: Failed to create event')
    }

    // AppContext reducer assigns the id
    dispatch({ type: 'ADD_EVENT', payload: newEvent })
  }

  const updateEvent = async (id: string, updates: Partial<NewEvent>): Promise<Event> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate 5% chance of network error
    if (Math.random() < 0.05) {
      throw new Error('Network error: Failed to update event')
    }

    const existingEvent = state.events.find(event => event.id === id)
    if (!existingEvent) {
      throw new Error('Event not found')
    }

    const updatedEvent: Event = {
      ...existingEvent,
      ...updates
    }

    dispatch({ type: 'UPDATE_EVENT', payload: { id, event: updates } })
    return updatedEvent
  }

  const deleteEvent = async (id: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate 5% chance of network error
    if (Math.random() < 0.05) {
      throw new Error('Network error: Failed to delete event')
    }

    const existingEvent = state.events.find(event => event.id === id)
    if (!existingEvent) {
      throw new Error('Event not found')
    }

    dispatch({ type: 'DELETE_EVENT', payload: id })
  }

  const getEvent = (id: string): Event | undefined => {
    return state.events.find(event => event.id === id)
  }

  const getEventsByDate = (date: string): Event[] => {
    return state.events.filter(event => event.date === date)
  }

  const getEventsByDateRange = (startDate: string, endDate: string): Event[] => {
    return state.events.filter(event => {
      return event.date >= startDate && event.date <= endDate
    })
  }

  const getEventsByClient = (clientId: string): Event[] => {
    return state.events.filter(event => 
      event.relatedTo?.type === 'client' && event.relatedTo.id === clientId
    )
  }

  const getEventsByType = (type: Event['type']): Event[] => {
    return state.events.filter(event => event.type === type)
  }

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getEventsByDate,
    getEventsByDateRange,
    getEventsByClient,
    getEventsByType
  }
}
