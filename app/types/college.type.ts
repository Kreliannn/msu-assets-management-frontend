export interface collegeInterfaceInput {
    department: string,
    custodian:{
        name :  string,
        idNumber :  string,
        email :  string,
    },
    dean :{
        name :  string,
        idNumber :  string,
        email :  string,
    },
}

export interface collegeInterface extends collegeInterfaceInput {
    _id : string,
}