export class RegisterUser {
    memberNumber: string;
    userNameExists: boolean;
    memberNumberExists: boolean;
    secretQuestions: Array<SecretQuestions>;
}

export class SecretQuestions {
    id: string;
    description: string;
    visible: boolean;
}
