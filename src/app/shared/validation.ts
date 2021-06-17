export class CustomValidator {
    // Validates US SSN
    static ssnValidator(ssn): any {
        if (ssn.pristine) {
        return null;
        }
        const SSN_REGEXP = /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}(?!00)\d{2}(?!0{4})\d{4}$/;
        ssn.markAsTouched();
        if (SSN_REGEXP.test(ssn.value)) {
        return null;
        }
        return {
        invalidSsn: true
        };
    }
}
