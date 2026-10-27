import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import path from 'path';
import leadsRouter from './routes/leads';
import authRouter from './routes/auth';
import statsRouter from './routes/stats';

export const app = express();
app.set('trust proxy', 1); // needed when deployed behind a host like Render

// CSP is off because your pages use inline scripts, Google Fonts and three.js from unpkg
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/stats', statsRouter);

// bad JSON or oversized bodies return a clean JSON error instead of an HTML page
app.use((err: { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status && err.status < 500 ? err.status : 500).json({ error: 'Bad request.' });
});