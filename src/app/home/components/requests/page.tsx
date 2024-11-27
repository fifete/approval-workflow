"use client";

import { DataTable } from "./data-table";
import { api } from "@/trpc/react";
import { GetRequestColumns } from "./columns";
import { useCallback } from "react";

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
    rejectMutation.mutate(id, {
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
        <DataTable columns={GetRequestColumns({ approveRequest, rejectRequest })} data={data ?? []} />
      </div>
  );
}
