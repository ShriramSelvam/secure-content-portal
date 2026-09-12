import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function UnauthorizedPage() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-ink mb-2">You don&apos;t have access to that page</h1>
        <p className="text-sm text-ink/60 mb-6">
          This area is restricted to admins. If you think that&apos;s wrong, check with whoever manages this portal.
        </p>
        <Link href="/dashboard" className="text-sm text-accent hover:underline">
          Back to browse
        </Link>
      </div>
    </>
  );
}
