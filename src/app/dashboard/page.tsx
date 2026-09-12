import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import { prisma } from "@/lib/prisma";

// This page always needs a fresh, authenticated view of the catalog - never statically cached.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const items = await prisma.content.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, category: true, type: true },
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <h1 className="text-xl font-semibold text-ink mb-1">Browse content</h1>
        <p className="text-sm text-ink/60 mb-8">Training and reference material shared with your organization.</p>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-ink/50">
            Nothing has been uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ContentCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
