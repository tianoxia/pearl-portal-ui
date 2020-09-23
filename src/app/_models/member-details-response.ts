import { SecretQuestions } from './register-stepone-response';

export class MemberDetailsResponse {
    memberNumber: number;
    userName: string;
    password: string;
    secretQuestionId: number;
    secretQuestionAnswer: string;
    secretQuestionDesc: string;
    paymentEmailReceived: boolean;
    hasPaperlessBilling: boolean;
    hasPaperlessOther: boolean;
    serviceOrderEmailReceived: boolean;
    electronicKit: boolean;
    marketingEmail: boolean;
    phoneNumberMask: boolean;
    accounts: Array<AccountDetails>;
    secretQuestions: Array<SecretQuestions>;
    paymentTypes: string[];
}

export class AccountDetails {
    accountNumber: number;
    accountType: string;
    hasPaperlessBilling: boolean;
    hasEmailBillNotice: boolean;
    hasOtherPaperlessBillinge: boolean;
    address: string;
    operationRoundup: boolean;
    operationRoundupAmount: number;
    operationRoundupExpiration: string;
}
