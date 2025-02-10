export class UnrecognizedNodeTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnrecognizedNodeTypeError';
    }
}
