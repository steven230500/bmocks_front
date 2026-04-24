import { NextResponse } from 'next/server'
import { mockStore } from '@/lib/mock-store'

interface RouteParams {
  params: Promise<{ resource: string; id: string }>
}

// GET /api/mocks/[resource]/[id] - Get a single item
export async function GET(request: Request, { params }: RouteParams) {
  const { resource, id } = await params
  const item = mockStore.getItem(resource, id)

  if (!item) {
    return NextResponse.json(
      { error: `Item "${id}" not found in "${resource}"` },
      { status: 404 }
    )
  }

  return NextResponse.json({ id: item.id, ...item.data })
}

// PUT /api/mocks/[resource]/[id] - Update an item
export async function PUT(request: Request, { params }: RouteParams) {
  const { resource, id } = await params

  try {
    const body = await request.json()
    const item = mockStore.updateItem(resource, id, body)

    if (!item) {
      return NextResponse.json(
        { error: `Item "${id}" not found in "${resource}"` },
        { status: 404 }
      )
    }

    return NextResponse.json({ id: item.id, ...item.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// PATCH /api/mocks/[resource]/[id] - Partial update an item
export async function PATCH(request: Request, { params }: RouteParams) {
  const { resource, id } = await params

  try {
    const body = await request.json()
    const existingItem = mockStore.getItem(resource, id)

    if (!existingItem) {
      return NextResponse.json(
        { error: `Item "${id}" not found in "${resource}"` },
        { status: 404 }
      )
    }

    const mergedData = { ...existingItem.data, ...body }
    const item = mockStore.updateItem(resource, id, mergedData)

    return NextResponse.json({ id: item!.id, ...item!.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// DELETE /api/mocks/[resource]/[id] - Delete an item
export async function DELETE(request: Request, { params }: RouteParams) {
  const { resource, id } = await params
  const deleted = mockStore.deleteItem(resource, id)

  if (!deleted) {
    return NextResponse.json(
      { error: `Item "${id}" not found in "${resource}"` },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}
