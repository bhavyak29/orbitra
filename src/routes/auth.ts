import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Too many attempts. Try again later.' },
});

// compare passwords without leaking timing information
function safeEqual(a: string, b: string) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

router.post('/login', loginLimiter, (req, res) => {
  const secret = process.env.JWT_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!secret || !adminPassword) {
    res.status(500).json({ error: 'Server is not configured.' });
    return;
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!safeEqual(password, adminPassword)) {
    res.status(401).json({ error: 'Wrong password.' });
    return;
  }

  const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '8h' });
  res.json({ token });
});

export default router;