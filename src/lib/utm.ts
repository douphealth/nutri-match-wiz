// Capture UTM parameters from the landing URL so any downstream Brevo
// subscribe call (Stage 3) can attribute the lead to its original source.
// Runs in the browser only; safe to call from useEffect.

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const STORAGE_KEY = "gutf_utm_v1";

export type UTMRecord = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  landing_url?: string;
  referrer?: string;
  captured_at?: string;
};

export function captureUTM(): UTMRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const present: UTMRecord = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) present[k] = v.slice(0, 200);
    }
    if (Object.keys(present).length === 0) return readUTM();
    present.landing_url = window.location.href.slice(0, 500);
    present.referrer = document.referrer.slice(0, 500) || undefined;
    present.captured_at = new Date().toISOString();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(present));
    return present;
  } catch {
    return null;
  }
}

export function readUTM(): UTMRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UTMRecord) : null;
  } catch {
    return null;
  }
}
