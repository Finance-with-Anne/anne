import * as React from "react";

interface AdminBookingNotifyProps {
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

export function AdminBookingNotifyEmail({
  clientName,
  clientEmail,
  service,
  date,
  time,
  notes,
}: AdminBookingNotifyProps) {
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", color: "#111", backgroundColor: "#fff", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px" }}>
          <tr>
            <td>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>ANNE Admin</h1>
              <hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>New Booking Request</h2>
              <p style={{ fontSize: 13, color: "#6b7280" }}>A new booking has just been submitted.</p>

              <table width="100%" cellPadding={0} cellSpacing={0} style={{ background: "#f9fafb", borderRadius: 8, padding: 20, marginTop: 12 }}>
                <tr><td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Name</td><td style={{ fontSize: 13, fontWeight: 600, textAlign: "right" as const }}>{clientName}</td></tr>
                <tr><td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Email</td><td style={{ fontSize: 13, fontWeight: 600, textAlign: "right" as const }}>{clientEmail}</td></tr>
                <tr><td style={{ fontSize: 13, color: "#6b7280", paddingBottom: 8 }}>Service</td><td style={{ fontSize: 13, fontWeight: 600, textAlign: "right" as const }}>{service}</td></tr>
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

              <div style={{ marginTop: 20 }}>
                <a
                  href={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/booking`}
                  style={{ display: "inline-block", backgroundColor: "#000", color: "#fff", padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                >
                  View in Admin →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
