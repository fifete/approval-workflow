import { ReactNode } from "react";
import { RequestStatus } from "./server/api/constants/enums";

export const states = {
  [Number(RequestStatus.PENDING)]: "Pending",
  [Number(RequestStatus.APPROVED)]: "Approved",
  [Number(RequestStatus.REJECTED)]: "Rejected",
  [Number(RequestStatus.PENDINGBYDIRECTOR)]: "Pending by director",
}

export interface Request {
  id: number;
  workerName: string;
  effectDate: string;
  description: string;
  minutes: number;
  approver: string;
  approverId: number;
  updaterName: string;
  status: number;
  actions: ReactNode;
}