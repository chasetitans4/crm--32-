import { NextRequest, NextResponse } from 'next/server'

// Mock client data
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

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Return raw array to match clientsApi expectations
    return NextResponse.json(mockClients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const newClient = {
      id: Date.now().toString(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockClients.push(newClient)
    
    // Return created client object directly
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}