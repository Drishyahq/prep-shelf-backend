import type { Request } from "express";

export interface AdminLoginBody {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface JwtPayload {
  adminId: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiErrorResponse {
  error: string;
}
