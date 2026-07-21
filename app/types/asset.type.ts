export interface assetsInterfaceInput {
    name: string,
    qr : string,
    date: string,
    value : number,
    category : string,
    location: string | null,
    condition : string,
    status : string,
    custodian :  string | null,
    assignTo : string | null,
}

export interface assetsInterface extends assetsInterfaceInput {
    _id : string,
}

