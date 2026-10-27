import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// replace the database and email with fakes, so tests are fast and touch nothing real
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    lead: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));
vi.mock('../src/lib/mailer', () => ({
  notifyNewLead: vi.fn().mockResolvedValue(undefined),
}));

import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';

const validLead = {
  name: 'Ava Martin',
  email: 'ava@example.com',
  company: 'Brightwave',
  teamSize: 'Team size: 11–50',
  message: 'Please send a demo.',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('POST /api/leads (public form)', () => {
  it('rejects an invalid email', async () => {
    const res = await request(app).post('/api/leads').send({ ...validLead, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(prisma.lead.create).not.toHaveBeenCalled();
  });

  it('rejects a missing name', async () => {
    const res = await request(app).post('/api/leads').send({ ...validLead, name: '' });
    expect(res.status).toBe(400);
    expect(prisma.lead.create).not.toHaveBeenCalled();
  });

  it('silently ignores bots that fill the honeypot field', async () => {
    const res = await request(app).post('/api/leads').send({ ...validLead, website: 'http://spam.example' });
    expect(res.status).toBe(200);
    expect(prisma.lead.create).not.toHaveBeenCalled();
  });

  it('saves a valid lead', async () => {
    vi.mocked(prisma.lead.create).mockResolvedValue({ id: '1', ...validLead, stage: 'NEW', createdAt: new Date() } as never);
    const res = await request(app).post('/api/leads').send(validLead);
    expect(res.status).toBe(201);
    expect(prisma.lead.create).toHaveBeenCalledTimes(1);
  });
});

describe('admin protection', () => {
  it('blocks the leads list without a token', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(401);
  });

  it('rejects a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('logs in with the right password and can then list leads', async () => {
    const login = await request(app).post('/api/auth/login').send({ password: 'test-password' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    vi.mocked(prisma.lead.findMany).mockResolvedValue([] as never);
    const list = await request(app).get('/api/leads').set('Authorization', `Bearer ${login.body.token}`);
    expect(list.status).toBe(200);
    expect(list.body).toEqual([]);
  });

  it('rejects an invalid stage', async () => {
    const login = await request(app).post('/api/auth/login').send({ password: 'test-password' });
    const res = await request(app)
      .patch('/api/leads/abc')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ stage: 'NOT_A_STAGE' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/stats/public', () => {
  it('returns totals without personal data', async () => {
    vi.mocked(prisma.lead.groupBy).mockResolvedValue([
      { stage: 'NEW', _count: { _all: 2 } },
      { stage: 'WON', _count: { _all: 1 } },
    ] as never);
    vi.mocked(prisma.lead.findMany).mockResolvedValue([] as never);

    const res = await request(app).get('/api/stats/public');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.byStage.WON).toBe(1);
    expect(res.body.perDay).toHaveLength(7);
    expect(JSON.stringify(res.body)).not.toContain('@');
  });
});