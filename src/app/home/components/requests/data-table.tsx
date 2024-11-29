"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Button } from "~/app/_components/ui/button";
import { DataTablePagination } from "./data-table-pagination";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useSession, SessionProvider } from "next-auth/react";
import { RequestStatus } from "~/server/api/constants/enums";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

interface ActionMenuProps {
  approveRequest: (id: number) => void;
  rejectRequest: (id: number) => void;
  requestId: number;
}

export function ActionMenu({ approveRequest, rejectRequest, requestId, approverId, state }: ActionMenuProps & { approverId: number, state: number }) {
  return (
    <SessionProvider>
      <ActionMenuContent approveRequest={approveRequest} rejectRequest={rejectRequest} requestId={requestId} approverId={approverId} state={state} />
    </SessionProvider>
  );
}

function ActionMenuContent({ approveRequest, rejectRequest, requestId, approverId, state }: ActionMenuProps & { approverId: number, state: number }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const isAuthorized = Number(session?.user?.id) === approverId;
  if (!isAuthorized) {   
    return <div></div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ background: 'white', borderRadius: '3px', border: '1px solid #e5e7eb' }}>
        <DropdownMenuLabel style={{ padding: '6px 12px 6px 8px' }}>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator style={{ border: '1px solid #e5e7eb' }} />
        <DropdownMenuItem style={{ padding: '4px 12px 4px 8px', cursor: 'pointer' }} onClick={() => approveRequest(requestId)}>Approve</DropdownMenuItem>
        <DropdownMenuItem style={{ padding: '4px 12px 4px 8px', cursor: 'pointer' }} onClick={() => rejectRequest(requestId)}>Reject</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
