"use client"

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "~/app/_components/ui/button"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Request = {
  id: number
  workerName: string
  effectDate: string
  description: string
  minutes: number
  approver: string
  status: "pending" | "approved" | "rejected"
}
export const columns: ColumnDef<Request>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "workerName",
      header: "Worker Name",
    },
    {
      accessorKey: "effectDate",
      header: "Effect Date",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "minutes",
      header: "Minutes",
    },
    {
      accessorKey: "approver",
      header: "Approver",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Approve</DropdownMenuItem>
              <DropdownMenuItem>Reject</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }
  ]
