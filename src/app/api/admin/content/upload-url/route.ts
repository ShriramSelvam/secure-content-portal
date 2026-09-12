import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, BUCKET, UPLOAD_URL_TTL_SECONDS } from "@/lib/supabase";
import { validateUpload } from "@/lib/validation";

// Belt-and-braces: middleware already blocks non-admins from /api/admin/*,
// but each handler re-checks the session so the route is safe on its own too.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { filename, mimeType, size } = body || {};
  if (!filename || !mimeType || typeof size !== "number") {
    return NextResponse.json({ error: "filename, mimeType and size are required" }, { status: 400 });
  }

  const validation = validateUpload(mimeType, size);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const storagePath = `${validation.contentType.toLowerCase()}/${randomUUID()}.${validation.extension}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: false });

  if (error || !data) {
    return NextResponse.json({ error: `Could not prepare upload: ${error?.message}` }, { status: 500 });
  }

  return NextResponse.json({
    storagePath,
    token: data.token,
    signedUrl: data.signedUrl,
    contentType: validation.contentType,
    expiresIn: UPLOAD_URL_TTL_SECONDS,
  });
}
