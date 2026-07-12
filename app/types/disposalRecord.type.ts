export interface disposalRecordInterfaceInput {
    assetname: string,
    message: string,
    date: string,
    college: string,
    recordedBy: string,
    proof  : string
}

export interface disposalRecordInterface extends disposalRecordInterfaceInput {
    _id: string,
}
