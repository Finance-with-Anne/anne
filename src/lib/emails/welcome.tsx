import * as React from "react";

interface WelcomeEmailProps {
  name?: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", color: "#111", backgroundColor: "#fff", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px" }}>
          <tr>
            <td>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>ANNE</h1>
              <hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Welcome{name ? `, ${name}` : ""}! 🎉
              </h2>
              <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
                You&apos;re now part of the ANNE community. We&apos;re so glad to have you here.
              </p>
              <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
                Here&apos;s what you can look forward to:
              </p>

              <ul style={{ fontSize: 14, color: "#4b5563", lineHeight: 2, paddingLeft: 20 }}>
                <li>Weekly money tips and insights</li>
                <li>Early access to new courses and resources</li>
                <li>Exclusive community events and Money Talks</li>
                <li>Special offers on coaching and digital products</li>
              </ul>

              <div style={{ marginTop: 24, textAlign: "center" as const }}>
                <a
                  href={process.env.NEXT_PUBLIC_SITE_URL ?? "#"}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#000",
                    color: "#fff",
                    padding: "12px 28px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Explore ANNE
                </a>
              </div>

              <p style={{ fontSize: 14, color: "#4b5563", marginTop: 28 }}>
                Warm regards,<br />
                <strong>The ANNE Team</strong>
              </p>

              <hr style={{ borderColor: "#e5e7eb", margin: "32px 0 16px" }} />
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
                You&apos;re receiving this because you subscribed at anne.com.
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
