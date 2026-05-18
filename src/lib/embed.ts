// WordPress iframe embed helpers.
//
// When the app is loaded inside the gearuptofit.com page with `?embed=1`,
// we (a) mark the document so CSS can drop the page background, and
// (b) post the body height back to the parent so the iframe can auto-grow.

export const EMBED_QUERY_KEY = "embed";
export const EMBED_MESSAGE_TYPE = "supplementMatchHeight";

export function isEmbedMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get(EMBED_QUERY_KEY) === "1";
  } catch {
    return false;
  }
}

export function installEmbedHeightReporter(): () => void {
  if (typeof window === "undefined") return () => {};
  if (!isEmbedMode()) return () => {};
  document.documentElement.setAttribute("data-embed", "true");

  let last = 0;
  const post = () => {
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
    );
    if (h !== last) {
      last = h;
      window.parent?.postMessage({ type: EMBED_MESSAGE_TYPE, height: h }, "*");
    }
  };

  const ro = new ResizeObserver(post);
  ro.observe(document.documentElement);
  if (document.body) ro.observe(document.body);
  const interval = window.setInterval(post, 750);
  post();

  return () => {
    ro.disconnect();
    window.clearInterval(interval);
  };
}
