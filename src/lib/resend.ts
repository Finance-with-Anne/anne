import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
const rawFrom = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
export const EMAIL_FROM = rawFrom.includes("<") ? rawFrom : `Finance with Anne <${rawFrom}>`;
