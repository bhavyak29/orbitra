import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server is not configured.' });
    return;
  }
  try {
    jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}