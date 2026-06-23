import * as React from "react";

interface CourseAnnouncementEmailProps {
  studentName: string;
  courseTitle: string;
  announcementTitle: string;
  announcementBody: string;
  courseUrl: string;
}

export function CourseAnnouncementEmail({
  studentName,
  courseTitle,
  announcementTitle,
  announcementBody,
  courseUrl,
}: CourseAnnouncementEmailProps) {
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", color: "#111", backgroundColor: "#fff", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px" }}>
          <tr>
            <td>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>ANNE</h1>
              <hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

              <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 4 }}>Hi {studentName},</p>
              <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 20 }}>
                There&apos;s a new announcement in <strong>{courseTitle}</strong>:
              </p>

              <div style={{ borderLeft: "3px solid #0822C0", paddingLeft: 16, marginBottom: 24 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 10px" }}>{announcementTitle}</p>
                <div
                  style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: announcementBody }}
                />
              </div>

              <a
                href={courseUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: "#0822C0",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "10px 20px",
                  borderRadius: 8,
                  textDecoration: "none",
                  marginBottom: 32,
                }}
              >
                Go to course →
              </a>

              <hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" as const }}>
                You&apos;re receiving this because you&apos;re enrolled in a course on Finance With Anne.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
