"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-ink tracking-tight">
          Content Portal
        </Link>

        {session?.user && (
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm text-ink/80 hover:text-ink">
              Browse
            </Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="text-sm text-ink/80 hover:text-ink">
                Admin
              </Link>
            )}
            <div className="flex items-center gap-2">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <span className="hidden sm:inline text-sm text-ink/70">{session.user.name}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm px-3 py-1.5 rounded-md border border-line hover:bg-white"
            >
              Sign out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
