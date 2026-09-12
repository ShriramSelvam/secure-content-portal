export type ContentItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  type: "VIDEO" | "PDF" | "HTML";
  mimeType: string;
  size: number;
  createdAt: string;
};
