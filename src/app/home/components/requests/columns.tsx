"use client"

import { ColumnDef } from "@tanstack/react-table"

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
  ]
