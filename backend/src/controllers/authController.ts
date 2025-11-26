import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { prisma } from '../utils/prisma.js';
import { env } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const buildAccessToken = (userId: string, role: string) =>
  jwt.sign({ sub: userId, role }, env.jwtAccessSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });

const buildRefreshToken = (userId: string, role: string, jti: string) =>
  jwt.sign({ sub: userId, role, jti }, env.jwtRefreshSecret, { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` });

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body as {
    email: string;
    password: string;
    name: string;
    role: 'CUSTOMER' | 'VENDOR' | 'DRIVER' | 'ADMIN';
  };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: { email, password: hashed, name, role },
    });

    if (role === 'VENDOR') {
      await tx.vendor.create({ data: { userId: createdUser.id } });
    }

    if (role === 'DRIVER') {
      await tx.driver.create({ data: { userId: createdUser.id } });
    }

    return createdUser;
  });

  const jti = randomUUID();
  const accessToken = buildAccessToken(user.id, user.role);
  const refreshToken = buildRefreshToken(user.id, user.role, jti);

  await prisma.refreshToken.create({
    data: {
      token: jti,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

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

  const jti = randomUUID();
  const accessToken = buildAccessToken(user.id, user.role);
  const refreshToken = buildRefreshToken(user.id, user.role, jti);

  await prisma.refreshToken.create({
    data: {
      token: jti,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  });
};

export const refreshSession = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as {
      sub: string;
      role: string;
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
      prisma.refreshToken.update({ where: { token: decoded.jti }, data: { revoked: true } }),
      prisma.refreshToken.create({
        data: {
          token: newJti,
          userId: decoded.sub,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

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
