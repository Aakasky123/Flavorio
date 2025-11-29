import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { UserRole } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { env } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const ACCESS_TOKEN_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_COOKIE_MAX_AGE = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

const buildAccessToken = (userId: string, role: UserRole) =>
  jwt.sign({ sub: userId, role }, env.jwtAccessSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });

const buildRefreshToken = (userId: string, role: UserRole, jti: string) =>
  jwt.sign({ sub: userId, role, jti }, env.jwtRefreshSecret, { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` });

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.nodeEnv === 'production',
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE });
};

const persistRefreshToken = async (userId: string, jti: string) => {
  await prisma.refreshToken.create({
    data: {
      token: jti,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE),
    },
  });
};

const revokeRefreshToken = (jti: string) =>
  prisma.refreshToken.update({ where: { token: jti }, data: { revoked: true } });

const generateSession = async (userId: string, role: UserRole) => {
  const jti = randomUUID();
  const accessToken = buildAccessToken(userId, role);
  const refreshToken = buildRefreshToken(userId, role, jti);

  await persistRefreshToken(userId, jti);

  return { accessToken, refreshToken, jti };
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role = UserRole.CUSTOMER } = req.body as {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  };

  const normalizedRole = role || UserRole.CUSTOMER;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: { email, password: hashed, name, role: normalizedRole },
    });

    if (normalizedRole === UserRole.VENDOR) {
      await tx.vendor.create({ data: { userId: createdUser.id } });
    }

    if (normalizedRole === UserRole.DRIVER) {
      await tx.driver.create({ data: { userId: createdUser.id, isAvailable: false } });
    }

    return createdUser;
  });

  const { accessToken, refreshToken } = await generateSession(user.id, user.role);
  setAuthCookies(res, accessToken, refreshToken);

  return res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { accessToken, refreshToken } = await generateSession(user.id, user.role);
  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  });
};

export const refreshSession = async (req: Request, res: Response) => {
  const providedRefreshToken = (req.body as { refreshToken?: string }).refreshToken || req.cookies?.refreshToken;
  if (!providedRefreshToken) {
    return res.status(400).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(providedRefreshToken, env.jwtRefreshSecret) as {
      sub: string;
      role: UserRole;
      jti: string;
    };

    const stored = await prisma.refreshToken.findUnique({ where: { token: decoded.jti } });
    if (!stored || stored.revoked || stored.userId !== decoded.sub || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newJti = randomUUID();
    const accessToken = buildAccessToken(decoded.sub, decoded.role);
    const newRefreshToken = buildRefreshToken(decoded.sub, decoded.role, newJti);

    await prisma.$transaction([
      revokeRefreshToken(decoded.jti),
      prisma.refreshToken.create({
        data: {
          token: newJti,
          userId: decoded.sub,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE),
        },
      }),
    ]);

    setAuthCookies(res, accessToken, newRefreshToken);
    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user });
};
