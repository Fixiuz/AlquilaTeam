import Link from "next/link";
import { Users } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              AlquilaTeam
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
