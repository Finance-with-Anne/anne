import * as React from "react";

interface Props {
  clientName: string;
  clientEmail: string;
  phone?: string;
  service: string;
  date: string;
  time: string;
  answers?: Record<string, string>;
  questions?: { id: string; question: string }[];
  isPaid?: boolean;
  amountPaid?: number;
  currency?: string;
  notes?: string;
}

export function AdminBookingNotifyEmail({ clientName, clientEmail, phone, service, date, time, answers, questions, isPaid, amountPaid, currency, notes }: Props) {
  const hasAnswers = answers && questions && questions.length > 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", color: "#111", backgroundColor: "#fff", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px" }}>
          <tr><td>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Finance with Anne — Admin</h1>
            <hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>
              {isPaid ? "New Booking — Payment Received" : "New Booking Request"}
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              {isPaid
                ? `${clientName} has paid and confirmed their booking.`
                : `A new booking has just been submitted.`}
            </p>

            {isPaid && amountPaid && (
              <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: "#166534", fontWeight: 600 }}>
                Payment: {currency} {amountPaid.toLocaleString()}
              </div>
            )}

            <table width="100%" cellPadding={0} cellSpacing={0} style={{ background: "#f9fafb", borderRadius: 8, padding: 20, marginTop: 12 }}>
              <tr><td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Name</td><td style={{ fontSize: 13, fontWeight: 600, textAlign: "right" as const }}>{clientName}</td></tr>
              <tr><td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Email</td><td style={{ fontSize: 13, fontWeight: 600, textAlign: "right" as const }}>{clientEmail}</td></tr>
              {phone && <tr><td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Phone</td><td style={{ fontSize: 13, fontWeight: 600, textAlign: "right" as const }}>{phone}</td></tr>}
              <tr><td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Session</td><td style={{ fontSize: 13, fontWeight: 600, textAlign: "right" as const }}>{service}</td></tr>
              <tr><td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Date</td><td style={{ fontSize: 13, fontWeight: 600, textAlign: "right" as const }}>{date}</td></tr>
              <tr><td style={{ fontSize: 13, color: "#6b7280" }}>Time</td><td style={{ fontSize: 13, fontWeight: 600, textAlign: "right" as const }}>{time}</td></tr>
              {notes && (
                <tr>
                  <td colSpan={2} style={{ paddingTop: 12, fontSize: 13, color: "#6b7280", borderTop: "1px solid #e5e7eb" }}>
                    <strong>Notes:</strong> {notes}
                  </td>
                </tr>
              )}
            </table>

            {hasAnswers && (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Client Responses</h3>
                <table width="100%" cellPadding={0} cellSpacing={0} style={{ background: "#f9fafb", borderRadius: 8, padding: 20 }}>
                  {questions!.map((q, i) => (
                    <tr key={q.id}>
                      <td style={{ fontSize: 13, color: "#6b7280", paddingBottom: i < questions!.length - 1 ? 10 : 0, verticalAlign: "top", width: "45%" }}>{q.question}</td>
                      <td style={{ fontSize: 13, fontWeight: 600, color: "#111", paddingBottom: i < questions!.length - 1 ? 10 : 0, textAlign: "right" as const }}>{answers![q.id] ?? "—"}</td>
                    </tr>
                  ))}
                </table>
              </>
            )}

            <div style={{ marginTop: 20 }}>
              <a href={`${siteUrl}/admin/booking`} style={{ display: "inline-block", backgroundColor: "#000", color: "#fff", padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                View in Admin →
              </a>
            </div>
          </td></tr>
        </table>
      </body>
    </html>
  );
}
