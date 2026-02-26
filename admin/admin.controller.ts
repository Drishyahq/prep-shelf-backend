import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { env } from "../config/env.js";
import type {
  AdminLoginBody,
  AdminLoginResponse,
  ApiErrorResponse,
  AuthenticatedRequest,
  JwtPayload,
} from "./admin.types.js";

export async function login(
  req: Request<object, AdminLoginResponse | ApiErrorResponse, AdminLoginBody>,
  res: Response<AdminLoginResponse | ApiErrorResponse>,
): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await prisma.admin.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  /*
  REASON FOR NOT USING BCRYPT:  ^___^
  Reson we are not using bcrypt is that admin account would be very less and we can easily add a new admin account 
  by directly inserting into the database.
  */
  if (user.password !== password) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const payload: JwtPayload = {
    adminId: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  const decoded = jwt.decode(token) as jwt.JwtPayload;
  const expiresAt = new Date((decoded.exp ?? 0) * 1000);

  await prisma.session.create({
    data: {
      token,
      adminId: user.id,
      expiresAt,
    },
  });

  res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

export async function logout(
  req: AuthenticatedRequest,
  res: Response<{ message: string } | ApiErrorResponse>,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(400).json({ error: "Token not provided" });
    return;
  }

  await prisma.session.deleteMany({
    where: { token },
  });

  res.status(200).json({ message: "Logged out successfully" });
}
