"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { RequestColumn, states } from "~/types"
import { ActionMenu } from "./data-table"

interface GetRequestProps {
  approveRequest: (id: number) => void
  rejectRequest: (id: number) => void
}
const columnHelper = createColumnHelper<RequestColumn>()

export const GetRequestColumns = ({ approveRequest, rejectRequest }: GetRequestProps): ColumnDef<RequestColumn>[] => [
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
      cell: ({ row }) => {
        const date = new Date(row.original.effectDate);
        return date.toISOString().split('T')[0];
      },
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
      cell: ({ row }) => states[row.original.status],
    },
    columnHelper.accessor("actions", {
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <ActionMenu
            approveRequest={approveRequest}
            rejectRequest={rejectRequest}
            requestId={row.original.id}
            approverId={row.original.approverId}
            state={row.original.status}
          />
        )
      },
    })
  ]
