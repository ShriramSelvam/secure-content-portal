import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import PdfViewer from "@/components/PdfViewer";
import HtmlViewer from "@/components/HtmlViewer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.content.findUnique({ where: { id: params.id } });
  if (!item) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <div className="mb-6">
          <span className="text-xs font-medium text-accent bg-accent/10 rounded-sm px-1.5 py-0.5">
            {item.category || item.type}
          </span>
          <h1 className="text-xl font-semibold text-ink mt-2">{item.title}</h1>
          {item.description && <p className="text-sm text-ink/60 mt-1">{item.description}</p>}
        </div>

        {item.type === "VIDEO" && <VideoPlayer contentId={item.id} />}
        {item.type === "PDF" && <PdfViewer contentId={item.id} />}
        {item.type === "HTML" && <HtmlViewer contentId={item.id} />}
      </main>
    </>
  );
}
