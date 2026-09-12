import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, BUCKET, VIEW_URL_TTL_SECONDS } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  // Middleware already requires a session for anything under /api/content/*, but this
  // route also stands on its own: no session, no URL, regardless of how it's reached.
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const item = await prisma.content.findUnique({ where: { id: params.id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(item.storagePath, VIEW_URL_TTL_SECONDS);

  if (error || !data) {
    return NextResponse.json({ error: "Could not create signed URL" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl, expiresIn: VIEW_URL_TTL_SECONDS, type: item.type });
}
