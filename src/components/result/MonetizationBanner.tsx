import { motion } from "framer-motion";
import { ShoppingCart, ExternalLink, ShieldCheck, Truck, RotateCcw, Trophy } from "lucide-react";
import type { AmazonProduct } from "@/lib/supplement-products";
import { amazonLink } from "@/lib/supplement-products";

interface Props {
  product: AmazonProduct;
  matchScore: number;
  supplementName: string;
}

/**
 * High-conversion bottom-of-results monetization banner.
 * Pinned design echoing the top product hero, with verified retailer badges,
 * gradient red CTA and animated match ring.
 */
export default function MonetizationBanner({ product, matchScore, supplementName }: Props) {
  const href = amazonLink(product.asin);
  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="relative my-10 overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-background to-background shadow-[0_30px_80px_-30px_rgba(244,63,94,0.45)]"
    >
      {/* Glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-rose-500/20 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-rose-600/15 blur-[120px]" />
      </div>

      {/* Top verification strip */}
      <div className="flex items-center justify-between border-b border-rose-500/20 bg-background/40 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur sm:px-6">
        <span className="truncate">
          Supplement specifications verified against manufacturer sources · Database last updated{" "}
          <span className="text-foreground">May 2026</span>
        </span>
        <a
          href="/methodology"
          className="hidden shrink-0 text-rose-400 underline-offset-2 hover:underline sm:inline"
        >
          How we verify
        </a>
      </div>

      <div className="flex flex-col items-stretch gap-5 p-4 sm:flex-row sm:items-center sm:p-6">
        {/* Product image with match ring */}
        <div className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-card p-3 ring-1 ring-border/60 sm:mx-0">
          {product.image ? (
            <img
              src={product.image}
              alt={`${product.brand} ${product.title}`}
              className="h-full w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {product.brand}
            </div>
          )}
          <div className="absolute -left-2 -top-2 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-center shadow-lg ring-2 ring-background">
            <div className="text-sm font-extrabold leading-none text-white tabular-nums">
              {matchScore}%
            </div>
            <div className="text-[8px] font-bold uppercase tracking-wider text-white/90">
              Match
            </div>
          </div>
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
              <Trophy className="h-3 w-3" /> #1 Match
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              AI-verified pick · {supplementName}
            </span>
          </div>
          <h3 className="mt-1.5 text-xl font-bold leading-tight text-foreground sm:text-2xl">
            {product.brand} {product.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-medium text-muted-foreground sm:justify-start">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-400" /> Verified retailer
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-rose-400" /> Free shipping
            </span>
            <span className="inline-flex items-center gap-1">
              <RotateCcw className="h-3.5 w-3.5 text-rose-400" /> 30-day returns
            </span>
          </div>
        </div>

        {/* CTA */}
        <a
          href={href}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_30px_-10px_rgba(244,63,94,0.7)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_rgba(244,63,94,0.9)] sm:px-8"
        >
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
          <ShoppingCart className="h-4 w-4" />
          Buy on Amazon
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </a>
      </div>

      {/* Footer disclosure */}
      <div className="border-t border-rose-500/15 bg-background/40 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur sm:px-6">
        Affiliate link · Commission-blind ranking · Tag papalex-20
      </div>
    </motion.aside>
  );
}
