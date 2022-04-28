import { UploadedFile } from "./uploaded-file";

export class ProviderEmployeeListResponse {
    employeeStatus: string;
    firstName: string;
    lastName: string;
    providerEmployeeId: number;
    ssn: string;
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
    candidateSourceId: number;
    created: Date;
    modified: Date;
    user: string;
    serviceType: string;
    isContractService: boolean;
    providerEmployeeAttachments: UploadedFile[];
}
