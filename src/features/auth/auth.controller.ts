import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "@features/auth/auth.schema.js";
import { prisma } from "@/database.js";
import { comparePassword, hashPassword } from "@shared/services/password.service.js";
import { Role } from "@prisma/client";
import { generateAccessToken, hashToken } from "@shared/services/token.service.js";
import { InvalidCredentialsError, UserAlreadyExistsError } from "@shared/errors/auth.error.js";
import { env } from "@/env.js";



export async function register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new UserAlreadyExistsError(data.email);
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            fullName: data.name || "",
            role: Role.ADMIN_MASJID,
        },
    });

    const { password, ...safeUser } = user;
    res.status(201).json(safeUser);
}

export async function login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (!user) {
        throw new InvalidCredentialsError();
    }

    const isPasswordValid = await comparePassword(
        data.password,
        user.password
    );
    if (!isPasswordValid) {
        throw new InvalidCredentialsError();
    }

    const accessToken = generateAccessToken();
    const hashedTokenValue = hashToken(accessToken);

    const sessionLifetimeMinutes = env.SESSION_LIFETIME;
    const accessTokenExpiresAt = new Date(Date.now() + sessionLifetimeMinutes * 60 * 1000);

    await prisma.userToken.create({
        data: {
            token: hashedTokenValue,
            userId: user.id,
            expiresAt: accessTokenExpiresAt,
        },
    });
    res.status(200).json({ accessToken });
}

export async function profile(req: Request, res: Response) {
    const authObject = req.auth;

    if (!authObject) {
        throw new InvalidCredentialsError();
    }

    res.status(200).json({
        id: authObject.user.id,
        name: authObject.user.fullName,
        email: authObject.user.email,
        role: authObject.user.role,
    });
}

export async function logout(req: Request, res: Response) {
    const authObject = req.auth;

    if (!authObject) {
        throw new InvalidCredentialsError();
    }

    const hashedTokenValue = hashToken(authObject.token);

    await prisma.userToken.delete({
        where: { token: hashedTokenValue },
    });

    res.status(200).json({ message: "Logged out successfully" });
}
