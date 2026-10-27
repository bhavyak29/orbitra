import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { notifyNewLead } from '../lib/mailer';
import { leadSchema } from '../schemas/lead.schema';

const router = Router();

router.post('/', async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const { website, ...data } = parsed.data;
  if (website) {            // a bot filled the hidden field: pretend success, save nothing
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

export default router;