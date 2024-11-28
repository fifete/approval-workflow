export enum NodeTypes {
    APPROVER = 1,
    STATE = 2,
    VALIDATION =3,
    END = 4
}

export enum AttendanceStatus {
    PRESENT = 1,
    VACATION = 2,
    SICK = 3,
    ABSENT = 4
}

export enum Roles {
    DIRECTOR = 1,
    LEADER = 2,
    WORKER = 3
}

export enum RequestStatus {
    PENDING = 1,
    APPROVED = 2,
    REJECTED = 3,
    PENDINGBYDIRECTOR = 4
}

export enum WorkflowStatus {
    PROCESSING = 1,
    FINISHED = 2
}