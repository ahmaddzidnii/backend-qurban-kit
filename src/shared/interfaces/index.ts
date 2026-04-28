// Shared interfaces and types

export interface MessageResponse {
    message: string;
}

export interface ErrorResponse {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
    stack?: string;
}
