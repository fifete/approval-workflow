"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { states } from "~/types"
import { ActionMenu } from "./data-table"
import { Request } from "~/types";

interface GetRequestProps {
  approveRequest: (id: number) => void
  rejectRequest: (id: number) => void
}
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const GetRequestColumns = ({ approveRequest, rejectRequest }: GetRequestProps): ColumnDef<Request>[] => [
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
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} de ${month} del ${year}`;
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
    {
      accessorKey: "updaterName",
      header: "Updater",
    },
    {
      accessorKey: "actions",
      header: "Actions",
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
    }
  ]
