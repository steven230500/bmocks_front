"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEndpoints } from "@/hooks/use-endpoints"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, Layers } from "lucide-react"

const METHOD_STYLES: Record<string, string> = {
  GET:    "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400",
  POST:   "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400",
  PUT:    "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800 dark:text-yellow-400",
  PATCH:  "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800 dark:text-orange-400",
  DELETE: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800 dark:text-red-400",
}

function methodStyle(method: string) {
  return METHOD_STYLES[method.toUpperCase()] ?? "bg-muted text-muted-foreground border-border"
}

export function EndpointsExplorer() {
  const router = useRouter()
  const { groups, loading, hasEndpoints } = useEndpoints()
  const [query, setQuery] = useState("")

  const filtered = query.trim()
    ? groups.filter(
        (g) =>
          g.resource.toLowerCase().includes(query.toLowerCase()) ||
          g.endpoints.some((e) => e.path.toLowerCase().includes(query.toLowerCase()))
      )
    : groups

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="bg-muted/40 px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">API Endpoints</p>
          </div>
          <div className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 sm:px-6 py-3 flex items-center gap-3 animate-pulse">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasEndpoints) return null

  return (
    <Card>
      <CardContent className="p-0">
        <div className="bg-muted/40 px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              API Endpoints
            </p>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {groups.length}
            </span>
          </div>
          <div className="relative w-40 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              className="pl-7 h-7 text-xs"
              placeholder="Filter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No endpoints match &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((group) => (
              <button
                key={group.resource}
                onClick={() => router.push(`/${group.resource}`)}
                className="w-full text-left px-4 sm:px-6 py-3 sm:py-3.5 flex items-start sm:items-center gap-3 sm:gap-4 hover:bg-muted/40 transition-colors group"
              >
                <code className="text-sm font-semibold font-mono text-foreground min-w-[100px] sm:min-w-[140px] flex-shrink-0 group-hover:text-primary transition-colors">
                  /{group.resource}
                </code>
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                  {group.endpoints.map((ep, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono flex-shrink-0 ${methodStyle(ep.method)}`}
                      >
                        {ep.method.toUpperCase()}
                      </span>
                      <code className="text-[10px] text-muted-foreground font-mono hidden sm:inline truncate max-w-[160px]">
                        {ep.path}
                      </code>
                    </div>
                  ))}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
