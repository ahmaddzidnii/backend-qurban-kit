// Auth DTOs and Types
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
    user: {
        id: string;
        email: string;
        fullName: string;
    };
    accessToken: string;
}

export interface User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Token {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
