import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function TopBar() {
  const location = useLocation();
  const router = useRouter();
  const isResult = location.pathname.startsWith("/supplement-match");

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = "My Supplement Match — GearUpToFit";
    try {
      if (
        typeof navigator !== "undefined" &&
        (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share
      ) {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title,
          url,
        });
        return;
      }
    } catch {
      /* user cancelled */
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {isResult ? (
            <button
              onClick={() => router.navigate({ to: "/" })}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              New Match
            </button>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Supplement Match
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary glow-primary-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-gradient">
              Nutri Match AI
            </span>
          </Link>
          {isResult && (
            <button
              onClick={onShare}
              aria-label="Share your match"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}
          <a
            href="https://gearuptofit.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Go to GearUpToFit home"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <Home className="h-3.5 w-3.5 text-primary" />
            Home
          </a>
        </div>
      </div>
    </header>
  );
}
