/**
 * Tests unitarios — authenticate middleware
 * DevBuPlaytime Backend
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: { findUnique: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});
jest.mock('jsonwebtoken');

import { authenticate, authorize } from '../middlewares/auth.middleware';

const mockJwt = jwt as jest.Mocked<typeof jwt>;

const mockReq = (token?: string) => ({
  headers: { authorization: token ? `Bearer ${token}` : undefined },
} as unknown as Request);

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const next: NextFunction = jest.fn();

describe('authenticate middleware', () => {
  it('should call next() on valid token', async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new (PrismaClient as any)();
    mockJwt.verify.mockReturnValue({ userId: 'uuid-1' } as never);
    prisma.user.findUnique.mockResolvedValue({
      id: 'uuid-1', username: 'test', email: 'test@test.com', role: 'PLAYER', isActive: true
    });

    await authenticate(mockReq('valid-token') as any, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no token provided', async () => {
    const res = mockRes();
    await authenticate(mockReq() as any, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 on invalid token', async () => {
    mockJwt.verify.mockImplementation(() => { throw new Error('invalid'); });
    const res = mockRes();
    await authenticate(mockReq('bad-token') as any, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 if user is inactive', async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new (PrismaClient as any)();
    mockJwt.verify.mockReturnValue({ userId: 'uuid-2' } as never);
    prisma.user.findUnique.mockResolvedValue({ id: 'uuid-2', isActive: false });
    const res = mockRes();
    await authenticate(mockReq('token') as any, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('authorize middleware', () => {
  it('should call next() if user has required role', () => {
    const req = { user: { role: 'ADMIN' } } as any;
    const res = mockRes();
    authorize('ADMIN')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if user lacks required role', () => {
    const req = { user: { role: 'PLAYER' } } as any;
    const res = mockRes();
    authorize('ADMIN')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
