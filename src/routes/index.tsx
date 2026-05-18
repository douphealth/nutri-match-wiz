import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GearUpToFit — Personalized Vitamin & Supplement Match" },
      {
        name: "description",
        content:
          "Evidence-aware, safety-first quiz to find the vitamins and supplements that actually fit your body, goals, and lifestyle.",
      },
      { property: "og:title", content: "GearUpToFit — Vitamin & Supplement Match" },
      {
        property: "og:description",
        content: "Free quiz with transparent scoring, safety checks, and food-first guidance.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center">
        <Badge variant="outline" className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> New · Evidence-aware quiz
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Find Your Best-Fit Vitamins &amp; Supplements
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground sm:text-lg">
          A safety-first, personalized supplement plan based on your diet, training, lifestyle, and medications —
          with transparent scoring and food-first alternatives.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="gap-1.5"><FlaskConical className="h-3.5 w-3.5" />Evidence-aware</Badge>
          <Badge variant="secondary" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Safety-first</Badge>
          <Badge variant="secondary">No diagnosis</Badge>
          <Badge variant="secondary">Transparent scoring</Badge>
        </div>
        <Button asChild size="lg">
          <Link to="/supplement-match">
            Start the free quiz <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <p className="max-w-xl text-xs text-muted-foreground">
          Educational only. Not medical advice. Talk with a qualified clinician before changing supplements.
        </p>
      </section>
    </div>
  );
}
