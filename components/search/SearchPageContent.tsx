"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Search, Loader2, Building2, Briefcase } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface SearchResult {
    name: string
    company: string
    position: string
}

export function SearchPageContent() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const supabase = createClient()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setHasSearched(true)
        try {
            const { data, error } = await supabase.rpc('search_contacts_secure', {
                query_text: query
            })
            if (error) throw error
            setResults(data || [])
        } catch (error) {
            console.error('Search error', error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
                <Input 
                    placeholder="Search for names or companies..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="text-lg h-12"
                />
                <Button type="submit" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </Button>
            </form>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((result, i) => (
                    <Card key={i} className="hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-lg">{result.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    <span>{result.company || 'Unknown Company'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    <span>{result.position || 'Unknown Position'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {hasSearched && !loading && results.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    No results found for &quot;{query}&quot;.
                </div>
            )}
        </div>
    )
}
