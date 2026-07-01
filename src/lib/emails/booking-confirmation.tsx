import * as React from "react";

interface Props {
  clientName: string;
  service: string;
  date: string;
  time: string;
  googleMeetLink?: string;
  answers?: Record<string, string>;
  questions?: { id: string; question: string }[];
  isPaid?: boolean;
  notes?: string;
}

export function BookingConfirmationEmail({ clientName, service, date, time, googleMeetLink, answers, questions, isPaid, notes }: Props) {
  const hasAnswers = answers && questions && questions.length > 0;
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", color: "#111", backgroundColor: "#fff", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px" }}>
          <tr><td>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Finance with Anne</h1>
            <hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              {isPaid ? "Booking Confirmed: Payment Received" : "Booking Confirmed"}
            </h2>
            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
              Hi {clientName}, your session has been confirmed. Here&apos;s a summary:
            </p>

            <table width="100%" cellPadding={0} cellSpacing={0} style={{ background: "#f9fafb", borderRadius: 8, padding: 20, marginTop: 16 }}>
              <tr>
                <td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Session</td>
                <td style={{ fontSize: 13, fontWeight: 600, color: "#111", paddingBottom: 8, textAlign: "right" as const }}>{service}</td>
              </tr>
              <tr>
                <td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Date</td>
                <td style={{ fontSize: 13, fontWeight: 600, color: "#111", paddingBottom: 8, textAlign: "right" as const }}>{date}</td>
              </tr>
              <tr>
                <td style={{ fontSize: 13, color: "#6b7280" }}>Time</td>
                <td style={{ fontSize: 13, fontWeight: 600, color: "#111", textAlign: "right" as const }}>{time}</td>
              </tr>
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
                <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Your Responses</h3>
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

            {googleMeetLink && (
              <div style={{ marginTop: 24, background: "#eff6ff", borderRadius: 8, padding: 20, textAlign: "center" as const }}>
                <p style={{ fontSize: 13, color: "#1e40af", fontWeight: 600, margin: "0 0 12px" }}>Join your session via Google Meet</p>
                <a href={googleMeetLink} style={{ display: "inline-block", background: "#0822C0", color: "#fff", fontSize: 13, fontWeight: 600, padding: "10px 24px", borderRadius: 6, textDecoration: "none" }}>
                  Join Google Meet →
                </a>
                <p style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>{googleMeetLink}</p>
              </div>
            )}

            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, marginTop: 20 }}>
              If you have any questions, simply reply to this email.
            </p>
            <p style={{ fontSize: 14, color: "#4b5563", marginTop: 20 }}>
              Warm regards,<br /><strong>Anne</strong>
            </p>
            <hr style={{ borderColor: "#e5e7eb", margin: "32px 0 16px" }} />
            <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" as const }}>Finance with Anne: Building Wealth, One Step at a Time</p>
          </td></tr>
        </table>
      </body>
    </html>
  );
}
