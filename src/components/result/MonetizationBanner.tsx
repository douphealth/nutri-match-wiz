import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  ExternalLink,
  ShieldCheck,
  Truck,
  RotateCcw,
  Trophy,
  Sparkles,
  Star,
  X,
  TrendingUp,
  Clock,
} from "lucide-react";
import type { AmazonProduct } from "@/lib/supplement-products";
import { amazonLink } from "@/lib/supplement-products";

interface Props {
  product: AmazonProduct;
  matchScore: number;
  supplementName: string;
}

/**
 * SOTA monetization: a premium inline hero card + a sticky bottom bar that
 * appears after the user scrolls past the inline card. Both convert to the
 * same Amazon affiliate link.
 */
export default function MonetizationBanner({ product, matchScore, supplementName }: Props) {
  const href = amazonLink(product.asin);
  return (
    <>
      <InlineHero product={product} matchScore={matchScore} supplementName={supplementName} href={href} />
      <StickyBottomBar product={product} matchScore={matchScore} supplementName={supplementName} href={href} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Inline premium hero                                                 */
/* ------------------------------------------------------------------ */

function InlineHero({
  product,
  matchScore,
  supplementName,
  href,
}: Props & { href: string }) {
  return (
    <motion.aside
      id="monetization-inline"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative my-12 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a0a14] via-[#0f0814] to-[#0a0a14] p-[1px] shadow-[0_40px_120px_-40px_rgba(244,63,94,0.55)]"
    >
      {/* Animated gradient border */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[1px] rounded-[2rem] opacity-60"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, rgba(244,63,94,0.4), rgba(168,85,247,0.25), rgba(244,63,94,0.4), rgba(251,146,60,0.3), rgba(244,63,94,0.4))",
          filter: "blur(2px)",
          animation: "spin 12s linear infinite",
        }}
      />

      <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-gradient-to-br from-[#170914] via-[#0e0a18] to-[#0a0a12]">
        {/* Decorative glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/3 h-80 w-80 rounded-full bg-rose-500/25 blur-[120px]" />
          <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-fuchsia-600/15 blur-[120px]" />
          <div className="absolute top-1/2 left-0 h-48 w-48 rounded-full bg-amber-500/10 blur-[100px]" />
        </div>

        {/* Subtle grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top ticker strip */}
        <div className="relative flex items-center justify-between gap-3 border-b border-white/5 bg-black/30 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-2 text-rose-300/90">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            <span className="hidden sm:inline">Verified · Updated May 2026</span>
            <span className="sm:hidden">Verified</span>
          </div>
          <div className="hidden items-center gap-4 text-white/50 md:flex">
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" /> Top pick this week
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Ships today
            </span>
          </div>
          <a
            href="/methodology"
            className="shrink-0 text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            How we verify →
          </a>
        </div>

        <div className="relative grid gap-7 p-5 sm:p-8 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
          {/* Product image with match ring + ribbon */}
          <div className="relative mx-auto md:mx-0">
            <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-rose-500/40 via-fuchsia-500/20 to-amber-500/30 blur-2xl" />
            <div className="relative flex h-40 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4 ring-1 ring-white/10 backdrop-blur-sm">
              {product.image ? (
                <img
                  src={product.image}
                  alt={`${product.brand} ${product.title}`}
                  className="h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="text-center text-sm font-bold uppercase tracking-wider text-white/70">
                  {product.brand}
                </div>
              )}
              {/* Match ring */}
              <div className="absolute -right-3 -top-3 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 text-center shadow-[0_10px_30px_-5px_rgba(244,63,94,0.7)] ring-4 ring-[#0e0a18]">
                <div className="text-base font-black leading-none text-white tabular-nums">
                  {matchScore}%
                </div>
                <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/95">
                  Match
                </div>
              </div>
              {/* #1 ribbon */}
              <div className="absolute -left-2 top-3 inline-flex items-center gap-1 rounded-r-md bg-gradient-to-r from-amber-400 to-amber-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-amber-950 shadow-md">
                <Trophy className="h-2.5 w-2.5" /> #1
              </div>
            </div>
          </div>

          {/* Title + meta */}
          <div className="min-w-0 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> AI-verified pick
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/60">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="ml-1 text-white/50">4.8 · 12k+ reviews</span>
              </span>
            </div>
            <h3 className="mt-2.5 text-2xl font-black leading-tight text-white sm:text-[1.7rem]">
              {product.brand}{" "}
              <span className="bg-gradient-to-r from-white via-rose-100 to-white bg-clip-text text-transparent">
                {product.title}
              </span>
            </h3>
            <p className="mt-1.5 text-sm text-white/60">
              Matched to your <span className="font-semibold text-white/85">{supplementName}</span> protocol — third-party tested for purity & potency.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <TrustChip icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Verified retailer" />
              <TrustChip icon={<Truck className="h-3.5 w-3.5" />} label="Free shipping" />
              <TrustChip icon={<RotateCcw className="h-3.5 w-3.5" />} label="30-day returns" />
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-2 md:items-end">
            <a
              href={href}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_15px_40px_-10px_rgba(244,63,94,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_25px_50px_-12px_rgba(244,63,94,1)] active:translate-y-0 md:w-auto"
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
              />
              <ShoppingCart className="h-4 w-4 drop-shadow" />
              <span>Buy on Amazon</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80 transition-transform group-hover:translate-x-0.5" />
            </a>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
              Prime · Lowest price tracked
            </p>
          </div>
        </div>

        {/* Footer disclosure */}
        <div className="relative border-t border-white/5 bg-black/40 px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 backdrop-blur sm:px-7">
          Affiliate link · Commission-blind ranking · Tag papalex-20
        </div>
      </div>
    </motion.aside>
  );
}

function TrustChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
      <span className="text-rose-300">{icon}</span>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Sticky bottom bar                                                   */
/* ------------------------------------------------------------------ */

function StickyBottomBar({
  product,
  matchScore,
  supplementName,
  href,
}: Props & { href: string }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      const scrolled = window.scrollY;
      const inline = document.getElementById("monetization-inline");
      const inlineTop = inline ? inline.getBoundingClientRect().top + window.scrollY : 800;
      // show after user has scrolled at least 600px AND is below the inline hero's top
      setVisible(scrolled > 600 && scrolled > inlineTop - window.innerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const show = visible && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-5 sm:pb-5"
        >
          <div
            className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a0a14]/95 via-[#120816]/95 to-[#0a0a14]/95 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.55),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl"
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Decorative glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
              <div className="absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-rose-500/30 blur-[60px]" />
              <div className="absolute -right-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-fuchsia-600/20 blur-[60px]" />
            </div>

            <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
              {/* Image + match badge */}
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.06] p-1.5 ring-1 ring-white/10 sm:h-16 sm:w-16">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt=""
                      className="h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="text-[10px] font-bold uppercase text-white/70">
                      {product.brand.slice(0, 4)}
                    </div>
                  )}
                </div>
                <div className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-700 text-[10px] font-black tabular-nums text-white shadow-lg ring-2 ring-[#120816]">
                  {matchScore}
                </div>
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-3 w-3 shrink-0 text-amber-400" />
                  <span className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300/90">
                    #1 Match · {supplementName}
                  </span>
                </div>
                <div className="truncate text-sm font-bold text-white sm:text-base">
                  {product.brand} {product.title}
                </div>
                <div className="hidden items-center gap-3 text-[10px] font-medium text-white/55 sm:flex">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-rose-300" /> Verified
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3 w-3 text-rose-300" /> Free shipping
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.8
                  </span>
                </div>
              </div>

              {/* CTA */}
              <a
                href={href}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_25px_-8px_rgba(244,63,94,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_15px_30px_-8px_rgba(244,63,94,1)] sm:px-6 sm:text-sm"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Buy on Amazon</span>
                <span className="sm:hidden">Buy</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss"
                className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
