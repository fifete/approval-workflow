export enum RequestStatus {
  Pending = 1,
  Approved = 3,
  Rejected = 0,
}

export interface Request {
  id: number;
  workerName: string;
  effectDate: Date;
  description: string;
  minutes: number;
  approver: string;
  approverId: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RequestColumn extends Request {
  actions: unknown;
  // actions: AccessorKeyColumnDef<RequestColumn, ReactNode>;
}