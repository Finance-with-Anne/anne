import * as React from "react";

interface BookingConfirmationProps {
  clientName: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

export function BookingConfirmationEmail({
  clientName,
  service,
  date,
  time,
  notes,
}: BookingConfirmationProps) {
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", color: "#111", backgroundColor: "#fff", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px" }}>
          <tr>
            <td>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>ANNE</h1>
              <hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Booking Confirmed</h2>
              <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
                Hi {clientName}, your session has been received. Here&apos;s a summary:
              </p>

              <table width="100%" cellPadding={0} cellSpacing={0} style={{ background: "#f9fafb", borderRadius: 8, padding: 20, marginTop: 16 }}>
                <tr>
                  <td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Service</td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: "#111", paddingBottom: 8, textAlign: "right" }}>{service}</td>
                </tr>
                <tr>
                  <td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Date</td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: "#111", paddingBottom: 8, textAlign: "right" }}>{date}</td>
                </tr>
                <tr>
                  <td style={{ fontSize: 13, color: "#6b7280" }}>Time</td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: "#111", textAlign: "right" }}>{time}</td>
                </tr>
                {notes && (
                  <tr>
                    <td colSpan={2} style={{ paddingTop: 12, fontSize: 13, color: "#6b7280", borderTop: "1px solid #e5e7eb", marginTop: 12 }}>
                      <strong>Notes:</strong> {notes}
                    </td>
                  </tr>
                )}
              </table>

              <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, marginTop: 20 }}>
                We&apos;ll be in touch to confirm your slot shortly. If you have any questions, just reply to this email.
              </p>

              <p style={{ fontSize: 14, color: "#4b5563", marginTop: 20 }}>
                Warm regards,<br />
                <strong>The ANNE Team</strong>
              </p>

              <hr style={{ borderColor: "#e5e7eb", margin: "32px 0 16px" }} />
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
                ANNE Finance Platform — Building Wealth, One Step at a Time
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
