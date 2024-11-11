export enum RequestStatus {
  Pending = 1,
  Approved = 3,
  Rejected = 2,
}

export const states = {
  [Number(RequestStatus.Pending)]: "Pending",
  [Number(RequestStatus.Approved)]: "Approved",
  [Number(RequestStatus.Rejected)]: "Rejected",
}

export interface Request {
  id: number;
  workerName: string;
  effectDate: Date;
  description: string;
  minutes: number;
  approver: string;
  approverId: number;
  status: number;
}

export interface RequestColumn extends Request {
  actions: unknown;
  // actions: AccessorKeyColumnDef<RequestColumn, ReactNode>;
}