import { Resend } from 'resend';

type LeadInfo = { name: string; email: string; company: string; teamSize: string; message: string };

export async function notifyNewLead(lead: LeadInfo) {
  if (!process.env.RESEND_API_KEY) return; // no key set: skip email, lead is still saved
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [process.env.NOTIFY_TO!],
    replyTo: lead.email,
    subject: `New demo request from ${lead.name}`,
    text: `Name: ${lead.name}\nEmail: ${lead.email}\nCompany: ${lead.company}\nTeam size: ${lead.teamSize}\n\n${lead.message}`,
  });
}