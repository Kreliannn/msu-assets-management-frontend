export interface assetsInterfaceInput {
    name: string,
    qr : string,
    category : string,
    location: string | null,
    condition : string,
    status : string,
    custodian :  string | null,
}

export interface assetsInterface extends assetsInterfaceInput {
    _id : string,
}

