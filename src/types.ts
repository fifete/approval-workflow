import { AccessorKeyColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";

//todo: move to a separate file
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
  effectDate: string;
  description: string;
  minutes: number;
  approver: string;
  approverId: number;
  updaterName: string;
  status: number;
  actions: ReactNode;
}