/**
 * Auth DTOs - Request and Response types
 * DTOs are used for API contracts and validation
 */

export interface RegisterRequestDTO {
    email: string;
    password: string;
    name?: string;
}

export interface LoginRequestDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    accessToken: string;
}
