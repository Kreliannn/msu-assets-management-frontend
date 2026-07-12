


export interface transferRequestInterfaceInput {
    assetId : string,
    date : string,
    college : string | null,
    custodian : string | null,
    status : "pending" | "approved" | "rejected",
     assetname : string,
}

export interface transferRequestInterface extends transferRequestInterfaceInput {
    _id : string,
}

