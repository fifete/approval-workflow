export enum RequestStatus {
  Pending = 1,
  Approved = 3,
  Rejected = 0,
}

export interface Request {
  id: number;
  workerName: string;
  effectDate: string;
  description: string;
  minutes: number;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
}
