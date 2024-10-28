import Link from "next/link"

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <header
        className={cn("flex items-center space-x-4 lg:space-x-6", className)}
        {...props}
      >
        <img src="/icon.png" alt="App Icon" className="h-8 w-8 mr-2" />
        Manager
      </header>
    </nav>
  )
}
