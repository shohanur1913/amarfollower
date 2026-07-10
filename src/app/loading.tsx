import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border shadow-sm rounded-2xl p-8 md:p-10 flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>
  );
}
