"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConfigStore } from "@/lib/config-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Settings2, ChevronRight, Globe } from "lucide-react"

const METHODS = [
  { method: "GET", path: "/{resource}", desc: "List all records", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { method: "GET", path: "/{resource}/:id", desc: "Get single record", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { method: "POST", path: "/{resource}", desc: "Create record", color: "bg-green-500/10 text-green-600 border-green-200" },
  { method: "PUT", path: "/{resource}/:id", desc: "Update record", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
  { method: "DELETE", path: "/{resource}/:id", desc: "Delete record", color: "bg-red-500/10 text-red-600 border-red-200" },
]

const QUICK = ["shifts", "opportunities", "users", "products", "orders", "tasks"]

export default function Home() {
  const router = useRouter()
  const { baseUrl, authHeader, idField, setBaseUrl, setAuthHeader, setIdField } = useConfigStore()

  const [url, setUrl] = useState("")
  const [auth, setAuth] = useState("")
  const [id, setId] = useState("id")
  const [resourceInput, setResourceInput] = useState("")
  const [mounted, setMounted] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setUrl(baseUrl)
      setAuth(authHeader)
      setId(idField)
    }
  }, [mounted, baseUrl, authHeader, idField])

  const handleSave = () => {
    setBaseUrl(url)
    setAuthHeader(auth)
    setIdField(id)
  }

  const handleNavigate = () => {
    if (!resourceInput.trim()) return
    handleSave()
    const path = resourceInput.startsWith("/") ? resourceInput : `/${resourceInput}`
    router.push(path)
  }

  if (!mounted) return null

  const displayUrl = url || "https://bmocks.com"

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground mb-6">
            <Globe className="h-3 w-3" />
            REST Mock Explorer
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">bmocks</h1>
          <p className="text-muted-foreground text-lg">
            Navigate to any route — it calls your API automatically
          </p>
        </div>

        {/* Concept visual */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/40 px-6 py-4 border-b">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">How it works</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              {["shifts", "users/:id"].map((example) => (
                <div key={example} className="flex items-center gap-3 text-sm">
                  <code className="bg-muted px-3 py-1.5 rounded font-mono text-foreground min-w-0 flex-shrink-0">
                    yourdomain.com/<span className="text-primary font-semibold">{example}</span>
                  </code>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <code className="bg-muted px-3 py-1.5 rounded font-mono text-muted-foreground min-w-0 truncate">
                    {displayUrl}/<span className="text-foreground">{example}</span>
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Methods */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="bg-muted/40 px-6 py-4 border-b">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available operations</p>
            </div>
            <div className="divide-y">
              {METHODS.map(({ method, path, desc, color }) => (
                <div key={method + path} className="flex items-center gap-4 px-6 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono ${color} w-16 text-center flex-shrink-0`}>
                    {method}
                  </span>
                  <code className="text-sm font-mono text-foreground flex-1">{path}</code>
                  <span className="text-sm text-muted-foreground hidden sm:block">{desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigate */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                <span className="px-3 py-2 bg-muted text-muted-foreground text-sm border-r whitespace-nowrap font-mono">
                  {displayUrl}/
                </span>
                <Input
                  className="border-0 focus-visible:ring-0 rounded-none font-mono"
                  placeholder="shifts"
                  value={resourceInput}
                  onChange={(e) => setResourceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
                />
              </div>
              <Button onClick={handleNavigate} disabled={!resourceInput.trim()}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK.map((r) => (
                <Button
                  key={r}
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs"
                  onClick={() => {
                    handleSave()
                    router.push(`/${r}`)
                  }}
                >
                  /{r}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Config toggle */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            {showConfig ? "Hide configuration" : "Configure API"}
          </Button>

          {showConfig && (
            <Card className="mt-2">
              <CardHeader>
                <CardTitle className="text-base">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://bmocks.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth">Authorization Header <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="auth"
                    placeholder="Bearer your-token"
                    value={auth}
                    onChange={(e) => setAuth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idField">ID Field</Label>
                  <Input
                    id="idField"
                    placeholder="id"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Field used as record identifier (id, _id, uuid…)</p>
                </div>
                <Button onClick={handleSave} className="w-full">Save</Button>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </main>
  )
}
