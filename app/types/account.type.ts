export interface accountInterfaceInput {
    name: string,
    role: string,
    username: string,
    password: string,
    dateCreated : string,
    status : string,
    college: string,
    profile: string,
    idNumber:string,
    email:string,
}

export interface accountInterface extends accountInterfaceInput {
    _id : string,
}