import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const ALLOWED_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  document: ["application/pdf"],
};

const MAX_SIZE_MB = 100;

export async function POST(req: NextRequest) {
  // Require auth for uploads
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) ?? "general";

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // Validate size
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `File exceeds ${MAX_SIZE_MB}MB limit.` }, { status: 413 });
  }

  // Validate type
  const allAllowed = Object.values(ALLOWED_TYPES).flat();
  if (!allAllowed.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed." }, { status: 415 });
  }

  const ext = file.name.split(".").pop();
  const key = `${folder}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ url: publicUrl, key });
}
