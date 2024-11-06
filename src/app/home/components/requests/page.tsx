import { api } from "~/trpc/server";
import { Request } from "~/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Request[]> {
  const data = await api.request.listAll();
  return data;
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
