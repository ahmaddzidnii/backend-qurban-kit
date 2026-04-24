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
