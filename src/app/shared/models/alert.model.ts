export class Alert {
    type: AlertType;
    message: string;
  }
export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}

export class Response {
    succeeded: boolean;
    errors: Error[];
}

export class Error {
    code: string;
    description: string;
}
