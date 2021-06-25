export class ContractorListResponse {
    contractorId: number;
    firstName: string;
    lastName: string;
    ssn: string;
    password: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    emergencyContact: string;
    ecPhone: string;
    cellPhone: string;
    emailAddress: string;
    accessLevel: string;
    candidateSourceId: number;
    created: Date;
    modified: Date;
    user: string;
    homeHealthStatus: string;
    isContractService: boolean;
    salesPersonId: number;
    recruiterId: number;
    toReleaseTimesheet: boolean;
    contractorAttachments: UploadedFile[];
}

export class UploadedFile {
    fileName: string;
	fileNameWithPath: string;
    created: Date;
}
