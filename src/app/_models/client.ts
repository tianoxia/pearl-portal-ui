export class Client {
    clientId: number;
    name: string;
    isApproved?: boolean;
    address: string;
    isActive?: boolean;
    discount: number;
    mileageRate: number;
    created: Date;
    modified: Date;
    user: string;
    isInternal?: boolean;
}
