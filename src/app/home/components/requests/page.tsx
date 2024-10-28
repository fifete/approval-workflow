import { Request, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Request[]> {
    // Fetch data from your API here.
    return [
      {
        id: 1,
        workerName: "John Doe",
        effectDate: "2023-10-01",
        description: "Worked on project X",
        minutes: 120,
        approver: "Jane Smith",
        status: "pending",
      },
      {
        id: 2,
        workerName: "Alice Johnson",
        effectDate: "2023-10-02",
        description: "Completed task Y",
        minutes: 90,
        approver: "Bob Brown",
        status: "pending",
      },
      {
        id: 3,
        workerName: "Michael Brown",
        effectDate: "2023-10-03",
        description: "Reviewed documents",
        minutes: 60,
        approver: "Sarah Davis",
        status: "approved",
      },
      // Add more data as needed
    ]
  }

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
