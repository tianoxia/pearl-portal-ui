export class MemberDetailsRequest {
    memberNumber: number;
    userName: string;
    password: string;
    securityQuestionId: number;
    securityQuestionAnswer: string;
    removeStoredCreditData: boolean;
    removeStoredBankData: boolean;
    receivePaymentEmail: boolean;
    isPaperlessBilling: boolean;
    isPaperlessOther: boolean;
    receiveServiceOrderEmail: boolean;
    annualMarketingElectricKit: boolean;
    isMarketEmail: boolean;
    canMaskPhone: boolean;
    paperlessAccounts: Array<PaperlessAccount>;
    roundupAccounts: Array<RoundUpAccount>;
}

export class PaperlessAccount {
    accountNumber: number;
    isEmail: boolean;
    isPaperless: boolean;
    isPaperlessOther: boolean;
}

export class RoundUpAccount {
    accountNumber: number;
    isRoundup: boolean;
    amount: number;
    expiration: Date;
}
