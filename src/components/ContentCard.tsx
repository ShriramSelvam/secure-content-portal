import Link from "next/link";

const TYPE_LABEL: Record<string, string> = {
  VIDEO: "Video",
  PDF: "PDF",
  HTML: "Page",
};

export default function ContentCard({
  id,
  title,
  description,
  category,
  type,
}: {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  type: string;
}) {
  return (
    <Link
      href={`/content/${id}`}
      className="block rounded-lg border border-line bg-white p-4 hover:border-accent/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-accent bg-accent/10 rounded-sm px-1.5 py-0.5">
          {TYPE_LABEL[type] || type}
        </span>
        {category && <span className="text-xs text-ink/40">{category}</span>}
      </div>
      <h3 className="font-medium text-ink mb-1 line-clamp-2">{title}</h3>
      {description && <p className="text-sm text-ink/60 line-clamp-2">{description}</p>}
    </Link>
  );
}
