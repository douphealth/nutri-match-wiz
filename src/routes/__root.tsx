import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { installWebVitals } from "@/lib/vitals";
import { installEmbedHeightReporter } from "@/lib/embed";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="mt-3 text-lg font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Take the quiz
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try refreshing or head back to the quiz.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Supplement Match — GearUpToFit" },
      {
        name: "description",
        content:
          "Free evidence-aware vitamin & supplement quiz. Personalized, safety-first plan with transparent scoring and food-first alternatives.",
      },
      { name: "author", content: "GearUpToFit" },
      { name: "theme-color", content: "#ffffff" },
      { property: "og:site_name", content: "GearUpToFit Supplement Match" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@gearuptofit" },
      { property: "og:title", content: "Supplement Match — GearUpToFit" },
      { name: "twitter:title", content: "Supplement Match — GearUpToFit" },
      { name: "description", content: "Personalized quiz app for evidence-based vitamin and supplement recommendations." },
      { property: "og:description", content: "Personalized quiz app for evidence-based vitamin and supplement recommendations." },
      { name: "twitter:description", content: "Personalized quiz app for evidence-based vitamin and supplement recommendations." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f8cd8b20-6f51-4804-95de-2201e387f8d4/id-preview-c31f9295--c0d2104a-7e3c-45a2-9f52-6ab2ec917c44.lovable.app-1779132406854.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f8cd8b20-6f51-4804-95de-2201e387f8d4/id-preview-c31f9295--c0d2104a-7e3c-45a2-9f52-6ab2ec917c44.lovable.app-1779132406854.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    installWebVitals();
    return installEmbedHeightReporter();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div id="main">
        <Outlet />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
