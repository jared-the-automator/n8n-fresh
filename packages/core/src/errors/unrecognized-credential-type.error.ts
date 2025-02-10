export class UnrecognizedCredentialTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnrecognizedCredentialTypeError';
    }
}
