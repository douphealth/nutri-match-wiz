// Lightweight Core Web Vitals collector. Logs to the console in dev and is
// a no-op on the server. Replace the reporter with a real beacon when an
// analytics provider is wired in.

export function installWebVitals() {
  if (typeof window === "undefined") return;
  void import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    const report = (metric: { name: string; value: number; id: string }) => {
      if (import.meta.env.DEV) {
        console.debug("[vitals]", metric.name, Math.round(metric.value), metric.id);
      }
    };
    onCLS(report);
    onINP(report);
    onLCP(report);
    onFCP(report);
    onTTFB(report);
  });
}
