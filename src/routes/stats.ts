import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';

const router = Router();

const limiter = rateLimit({ windowMs: 60 * 1000, limit: 60 });

// PUBLIC: totals only, no personal data
router.get('/public', limiter, async (_req, res) => {
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6); // start of the day 6 days ago = 7 days total

    const [grouped, recent] = await Promise.all([
      prisma.lead.groupBy({ by: ['stage'], _count: { _all: true } }),
      prisma.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    ]);

    const byStage = { NEW: 0, QUALIFIED: 0, NEGOTIATION: 0, WON: 0, LOST: 0 };
    for (const g of grouped) byStage[g.stage] = g._count._all;
    const total = Object.values(byStage).reduce((a, b) => a + b, 0);

    const perDay = Array(7).fill(0);
    for (const lead of recent) {
      const day = new Date(lead.createdAt);
      day.setHours(0, 0, 0, 0);
      const index = Math.round((day.getTime() - since.getTime()) / 86400000);
      if (index >= 0 && index < 7) perDay[index]++;
    }

    res.set('Cache-Control', 'public, max-age=30');
    res.json({ total, byStage, perDay });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load stats.' });
  }
});

export default router;