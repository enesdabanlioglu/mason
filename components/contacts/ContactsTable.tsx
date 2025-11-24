"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useDebounce } from "@/lib/hooks"
import { Contact } from "@/types/index"

interface ContactsTableProps {
    contacts: Contact[]
    pageCount: number
    currentPage: number
}

export function ContactsTable({ contacts, pageCount, currentPage }: ContactsTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('query') || '')
    const debouncedSearch = useDebounce(search, 500)

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        const currentQuery = searchParams.get('query') || ''
        
        if (debouncedSearch !== currentQuery) {
            if (debouncedSearch) {
                params.set('query', debouncedSearch)
            } else {
                params.delete('query')
            }
            params.set('page', '1')
            router.replace(`?${params.toString()}`)
        }
    }, [debouncedSearch, router, searchParams])

    const handlePage = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', newPage.toString())
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search contacts..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Platform</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id}>
                                <TableCell className="font-medium">{contact.name}</TableCell>
                                <TableCell>{contact.company}</TableCell>
                                <TableCell>{contact.position}</TableCell>
                                <TableCell>{contact.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">{contact.source_platform}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                        {contacts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No contacts found. Import some from the Import page.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex items-center justify-end space-x-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePage(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {pageCount}
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePage(currentPage + 1)}
                    disabled={currentPage >= pageCount}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
