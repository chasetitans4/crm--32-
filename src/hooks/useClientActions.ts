"use client"

import { useCallback } from "react"
import { useAppContext } from "../context/AppContext"
import type { Client } from "../types"

export function useClientActions() {
  const { state, dispatch } = useAppContext()
  const { clients } = state

  const addClient = useCallback(
    async (client: Omit<Client, "id">) => {
      try {
        // In a real app, this would call the API
        // const newClient = await clientsApi.create(client);

        // For now, simulate API call
        const newClient: Client = {
          ...client,
          id: (Math.max(0, ...clients.map((c) => parseInt(c.id) || 0)) + 1).toString(),
        }

        dispatch({ type: "ADD_CLIENT", payload: newClient })
        return newClient
      } catch (error) {
        // Error adding client - error handled silently
        throw error
      }
    },
    [clients, dispatch],
  )

  const updateClient = useCallback(
    async (id: string, data: Partial<Client>) => {
      try {
        // In a real app, this would call the API
        // await clientsApi.update(id, data);

        dispatch({ type: "UPDATE_CLIENT", payload: { id, client: data } })
      } catch (error) {
        // Error updating client - error handled silently
        throw error
      }
    },
    [dispatch],
  )

  const addNote = useCallback(
    async (clientId: string, note: { type: "call" | "email" | "meeting"; content: string }) => {
      try {
        // In a real app, this would call the API
        // await clientsApi.addNote(clientId, note);

        const date = new Date().toISOString().split("T")[0]
        dispatch({
          type: "ADD_CLIENT_NOTE",
          payload: {
            clientId,
            note: { ...note, date },
          },
        })
      } catch (error) {
        // Error adding note - error handled silently
        throw error
      }
    },
    [dispatch],
  )

  const updateClientStage = useCallback(
    async (clientId: string, stage: string) => {
      try {
        // In a real app, this would call the API
        // await clientsApi.updateStage(clientId, stage);

        dispatch({ type: "UPDATE_CLIENT_STAGE", payload: { clientId, stage } })
      } catch (error) {
        // Error updating client stage - error handled silently
        throw error
      }
    },
    [dispatch],
  )

  // Additional actions can be added here

  return {
    clients,
    addClient,
    updateClient,
    addNote,
    updateClientStage,
  }
}
