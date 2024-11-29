"use client";

import { DataTable } from "./data-table";
import { api } from "@/trpc/react";
import { GetRequestColumns } from "./columns";
import { useCallback } from "react";
import { DialogDemo } from "../create-dialog";

export default function DemoPage() {
  const { data, refetch } = api.request.listAll.useQuery();
  const approveMutation = api.request.approve.useMutation()
  const rejectMutation = api.request.reject.useMutation()

  const approveRequest = useCallback((id: number) => {
    approveMutation.mutate({
      requestId: id,
      isApproving: true
    }, {
      onSuccess: () => {
        refetch();
      },
      onError: (e) => {
        console.log('error ', e)
      },
    });
  }
    , [approveMutation, refetch]);

  const rejectRequest = useCallback((id: number) => {
    rejectMutation.mutate({
      requestId: id,
      isApproving: false
    }, {
      onSuccess: () => {
        refetch();
      },
      onError: (e) => {
        console.log('error ', e)
      },
    });
  }
    , [rejectMutation, refetch]);

  return (
      <div className="container mx-auto py-10">
        <div className="flex justify-end mb-4">
          <DialogDemo />
        </div>
        <DataTable columns={GetRequestColumns({ approveRequest, rejectRequest })} data={data ?? []} />
      </div>
  );
}
