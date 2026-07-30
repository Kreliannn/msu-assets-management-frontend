export interface logsInterfaceInput {
    type: "create" | "update" | "delete" | "others",
    entity: string,
    entityId: string,
    performedBy: string,
    description: string,
    date: string,
}

export interface logsInterface extends logsInterfaceInput {
    _id: string,
}
