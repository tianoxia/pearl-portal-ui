export class AccountProfile {
    memberNumber: number;
    accountNumber: number;
    updateIndicator: string |null;
    firstName: string;
    middleName: string;
    lastName: string;
    streetNumber: string;
    streetName: string;
    streetType: string;
    city: string;
    state: string;
    zip: string;
    unit: string;
    count: number;
    contactPhones: Array<ContactPhone>;
    phoneTypes: Array<PhoneType>;
}

export class ContactPhone {
    eCommunicationDetailId: number;
    eCommunicationId: number;
    eCommunicationDescription: string|null;
    phoneNumber: number|null;
    extension: number|null;
    isDelete: boolean;
}

export class PhoneType {
    eCommunicationId: number;
    description: string;
}
