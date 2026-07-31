export interface borrowInterfaceInput {
    studentName: string,
    studentd: string,
    studentSection: string,
    borrowDate : string,
    borrowTime : string,
    returnDate : string | null,
    returnTime : string | null,
    assetId : string,
    assetName : string,
    assetQr : string,
    status : string,
}

export interface borrowInterface extends borrowInterfaceInput {
    _id : string,
}
