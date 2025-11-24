import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserButton } from "@/components/layout/user-button"

export function Header() {
    return (
        <div className="flex items-center p-4 border-b">
            <MobileSidebar />
            <div className="flex w-full justify-end gap-x-2">
                <ThemeToggle />
                <UserButton />
            </div>
        </div>
    )
}


