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
