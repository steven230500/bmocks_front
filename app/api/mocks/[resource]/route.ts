import { NextResponse } from 'next/server'
import { mockStore } from '@/lib/mock-store'

interface RouteParams {
  params: Promise<{ resource: string }>
}

// GET /api/mocks/[resource] - Get all items in a resource
export async function GET(request: Request, { params }: RouteParams) {
  const { resource } = await params
  const items = mockStore.getItems(resource)
  
  // Return just the data array for easy consumption
  return NextResponse.json(items.map(item => ({ id: item.id, ...item.data })))
}

// POST /api/mocks/[resource] - Add item(s) to a resource
export async function POST(request: Request, { params }: RouteParams) {
  const { resource } = await params
  
  try {
    const body = await request.json()
    
    // Check if resource exists, if not create it
    if (!mockStore.getResource(resource)) {
      mockStore.createResource(resource)
    }

    // Handle bulk import (array) or single item
    if (Array.isArray(body)) {
      const items = mockStore.importItems(resource, body)
      return NextResponse.json(items.map(item => ({ id: item.id, ...item.data })), { status: 201 })
    } else {
      const item = mockStore.addItem(resource, body)
      return NextResponse.json({ id: item.id, ...item.data }, { status: 201 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// DELETE /api/mocks/[resource] - Clear all items in a resource
export async function DELETE(request: Request, { params }: RouteParams) {
  const { resource } = await params
  
  if (!mockStore.getResource(resource)) {
    return NextResponse.json(
      { error: `Resource "${resource}" not found` },
      { status: 404 }
    )
  }

  mockStore.clearItems(resource)
  return NextResponse.json({ success: true })
}
