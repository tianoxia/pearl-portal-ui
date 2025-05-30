import { UploadedFile } from "./uploaded-file";

export class ClientListResponse {
    clientId: number;
    name: string;
    isApproved?: boolean;
    clientStatus: boolean;
    discount: number;
    mileageRate: number;
    created: Date;
    modified: Date;
    user: string;
    isInternal?: boolean;
    salesPersonName: string;
    clientAttachments: UploadedFile[];
}