import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import authRouter from './routes/auth';
import path from 'path';
import leadsRouter from './routes/leads';
import statsRouter from './routes/stats';

const app = express();
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));