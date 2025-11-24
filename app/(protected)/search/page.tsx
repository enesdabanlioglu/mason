import { SearchPageContent } from "@/components/search/SearchPageContent"

export default async function SearchPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Search Network</h2>
                <p className="text-muted-foreground">
                    Find people across the entire network by name or company.
                </p>
            </div>
            <SearchPageContent />
        </div>
    )
}


