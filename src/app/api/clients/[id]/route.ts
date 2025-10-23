import { NextRequest, NextResponse } from 'next/server'

// Mock client data (in a real app, this would come from a database)
const mockClients = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1-555-0123',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    phone: '+1-555-0456',
    status: 'active',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-25T11:45:00Z'
  }
]

// GET /api/clients/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const client = mockClients.find(c => c.id === id)
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: client
    })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

// PATCH /api/clients/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const clientIndex = mockClients.findIndex(c => c.id === id)
    
    if (clientIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }
    
    const updatedClient = {
      ...mockClients[clientIndex],
      ...body,
      updated_at: new Date().toISOString()
    }
    
    mockClients[clientIndex] = updatedClient
    
    return NextResponse.json({
      success: true,
      data: updatedClient
    })
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const clientIndex = mockClients.findIndex(c => c.id === id)
    
    if (clientIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }
    
    const deletedClient = mockClients.splice(clientIndex, 1)[0]
    
    return NextResponse.json({
      success: true,
      data: deletedClient,
      message: 'Client deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}