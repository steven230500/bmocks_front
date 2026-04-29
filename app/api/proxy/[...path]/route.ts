import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ path: string[] }>
}

async function handler(req: NextRequest, { params }: RouteParams) {
  const { path } = await params
  const target = req.headers.get("x-proxy-target")

  if (!target) {
    return NextResponse.json({ error: "Missing x-proxy-target header" }, { status: 400 })
  }

  const base = target.replace(/\/$/, "")
  const url = `${base}/${path.join("/")}`

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const auth = req.headers.get("authorization")
  if (auth) headers["Authorization"] = auth

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined

  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
  })

  const text = await res.text()

  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
