export class ClientRequest {
    clientId: number;
    name: string;
    isActive?: boolean;
    discount: number;
    mileageRate: number;
    created: Date;
    modified: Date;
    user: string;
    isInternal?: boolean;
}