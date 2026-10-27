import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100),
  email: z.string().trim().email('Please enter a valid email.').max(150),
  company: z.string().trim().max(150).default(''),
  teamSize: z.string().trim().max(40).default(''),
  message: z.string().trim().max(2000).default(''),
  website: z.string().default(''), // honeypot field: real users leave it empty
});