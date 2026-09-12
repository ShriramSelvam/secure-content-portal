import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateUpload } from "@/lib/validation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await prisma.content.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

// Called after the browser has already PUT the file to the Supabase signed upload URL.
// This just writes the metadata row - it never sees the file bytes, so it stays far
// under any serverless function body-size limit.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { title, description, category, storagePath, mimeType, size } = body || {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!storagePath || !mimeType || typeof size !== "number") {
    return NextResponse.json({ error: "storagePath, mimeType and size are required" }, { status: 400 });
  }
  const validation = validateUpload(mimeType, size);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const item = await prisma.content.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      category: category?.trim() || null,
      type: validation.contentType,
      storagePath,
      mimeType,
      size,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
