import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { notifyNewLead } from '../lib/mailer';
import { leadSchema } from '../schemas/lead.schema';
import { requireAdmin } from '../middleware/auth';

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { error: 'Too many requests. Please try again later.' },
});

// PUBLIC: the contact form
router.post('/', submitLimiter, async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const { website, ...data } = parsed.data;
  if (website) {
    res.json({ ok: true });
    return;
  }

  try {
    const lead = await prisma.lead.create({ data });
    notifyNewLead(lead).catch((err) => console.error('Email failed:', err));
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ADMIN ONLY: everything below needs a valid login token
const stageSchema = z.object({
  stage: z.enum(['NEW', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST']),
});

router.get('/', requireAdmin, async (_req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(leads);
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = stageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid stage.' });
    return;
  }
  try {
    const lead = await prisma.lead.update({
      where: { id: String(req.params.id) },
      data: { stage: parsed.data.stage },
    });
    res.json(lead);
  } catch {
    res.status(404).json({ error: 'Lead not found.' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: String(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Lead not found.' });
  }
});

export default router;