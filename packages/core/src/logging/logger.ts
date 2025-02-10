export interface Logger {
    debug(message: string, metadata?: object): void;
    info(message: string, metadata?: object): void;
    warn(message: string, metadata?: object): void;
    error(message: string, metadata?: object): void;
}
