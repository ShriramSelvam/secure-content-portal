import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, BUCKET } from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { title, description, category } = body || {};
  if (title !== undefined && !String(title).trim()) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  const existing = await prisma.content.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const item = await prisma.content.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title: String(title).trim() } : {}),
      ...(description !== undefined ? { description: String(description).trim() || null } : {}),
      ...(category !== undefined ? { category: String(category).trim() || null } : {}),
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.content.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Remove the underlying file first so we don't orphan storage if the DB delete fails,
  // then remove the metadata row.
  await supabaseAdmin.storage.from(BUCKET).remove([existing.storagePath]);
  await prisma.content.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
