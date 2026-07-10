import Link from "next/link";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center">
        <div className="bg-card border border-border shadow-sm rounded-2xl p-8 md:p-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <SearchX className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-7xl font-black text-primary mb-3">404</h1>
          <h2 className="text-xl font-bold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 text-sm">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition shadow-sm">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
