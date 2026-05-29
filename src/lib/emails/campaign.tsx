import * as React from "react";

interface CampaignEmailProps {
  subject: string;
  body: string;
  subscriberName?: string;
}

export function CampaignEmail({ subject, body, subscriberName }: CampaignEmailProps) {
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", color: "#111", backgroundColor: "#fff", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px" }}>
          <tr>
            <td>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>ANNE</h1>
              <hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

              {subscriberName && (
                <p style={{ fontSize: 14, color: "#4b5563" }}>Hi {subscriberName},</p>
              )}

              <div
                style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: body }}
              />

              <hr style={{ borderColor: "#e5e7eb", margin: "32px 0 16px" }} />
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" as const }}>
                You&apos;re receiving this because you subscribed to ANNE updates.
                <br />
                <a href="#" style={{ color: "#9ca3af" }}>Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
