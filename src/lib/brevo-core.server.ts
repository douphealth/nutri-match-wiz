import { z } from "zod";

const utmSchema = z
  .object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
    term: z.string().max(100).optional(),
    content: z.string().max(100).optional(),
    referrer: z.string().max(500).optional(),
    landing: z.string().max(500).optional(),
  })
  .partial()
  .optional();

export const brevoSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(255)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  firstName: z.string().trim().max(100).optional(),
  source: z.enum(["quiz_gate", "exit_popup", "inline_hero", "footer", "blog_inline"]),
  consent: z.literal(true),
  topSupplement: z.string().max(150).optional(),
  topBrand: z.string().max(100).optional(),
  primaryGoal: z.string().max(120).optional(),
  archetype: z.string().max(120).optional(),
  reportURL: z.string().url().max(2048).optional(),
  utm: utmSchema,
});

export type BrevoSubscribeInput = z.infer<typeof brevoSubscribeSchema>;

const PUBLIC_APP_ORIGIN = "https://nutri-match-wiz.lovable.app";
const BREVO_GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";
const BREVO_API_URL = "https://api.brevo.com/v3";
const REQUEST_TIMEOUT_MS = 12_000;

function listIdFor(source: BrevoSubscribeInput["source"]): number {
  const env = process.env.BREVO_LIST_ID_QUIZ_GATE ?? process.env.BREVO_LIST_ID ?? "1";
  const fallback = parseInt(env, 10) || 1;
  const map: Record<BrevoSubscribeInput["source"], number> = {
    quiz_gate: parseInt(process.env.BREVO_LIST_ID_QUIZ_GATE ?? "", 10) || fallback,
    exit_popup: parseInt(process.env.BREVO_LIST_ID_EXIT_POPUP ?? "", 10) || fallback,
    inline_hero: parseInt(process.env.BREVO_LIST_ID_INLINE_HERO ?? "", 10) || fallback,
    footer: parseInt(process.env.BREVO_LIST_ID_FOOTER ?? "", 10) || fallback,
    blog_inline: parseInt(process.env.BREVO_LIST_ID_BLOG_INLINE ?? "", 10) || fallback,
  };
  return map[source];
}

const senderName = () => process.env.BREVO_SENDER_NAME ?? "GearUpToFit · SupplementMatch AI";
const senderEmail = () => process.env.BREVO_SENDER_EMAIL ?? "info@gearuptofit.com";

function normalizeReportURL(raw?: string): string {
  if (!raw) return `${PUBLIC_APP_ORIGIN}/supplement-match/`;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (host.includes("lovableproject.com") || host.includes("id-preview") || host === "lovable.dev") {
      url.protocol = "https:";
      url.host = new URL(PUBLIC_APP_ORIGIN).host;
    }
    return url.toString();
  } catch {
    return `${PUBLIC_APP_ORIGIN}/supplement-match/`;
  }
}

function escapeHTML(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

function brevoHeaders(apiKey: string): HeadersInit {
  const lovableApiKey = process.env.LOVABLE_API_KEY;
  if (lovableApiKey && apiKey.startsWith("lovc_")) {
    return {
      Authorization: `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    };
  }
  return { "api-key": apiKey, "content-type": "application/json", accept: "application/json" };
}

async function attemptBrevoPost(path: string, body: unknown, apiKey: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const lovableApiKey = process.env.LOVABLE_API_KEY;
  const useConnectorGateway = Boolean(lovableApiKey && apiKey.startsWith("lovc_"));
  const url = useConnectorGateway ? `${BREVO_GATEWAY_URL}${path}` : `${BREVO_API_URL}${path}`;

  try {
    return await fetch(url, {
      method: "POST",
      headers: brevoHeaders(apiKey),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function postBrevo(path: string, body: unknown, apiKey: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await attemptBrevoPost(path, body, apiKey);
      if (response.status !== 429 && response.status < 500) return response;
      if (attempt === 1) return response;
    } catch (err) {
      lastError = err;
      if (attempt === 1) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }
  throw lastError instanceof Error ? lastError : new Error("Brevo request failed");
}

function welcomeHTML(input: BrevoSubscribeInput) {
  const name = input.firstName?.trim() || "there";
  const top = input.topSupplement ?? "your personalized stack";
  const brand = input.topBrand ?? "";
  const goal = input.primaryGoal ?? "your goals";
  const archetype = input.archetype ?? "personalized";
  const url = normalizeReportURL(input.reportURL);
  const subject = `${name}, your SupplementMatch playbook is ready`;
  const preheader = `Your personal playbook is live — ${top}${brand ? ` (${brand})` : ""}, dosing, timing, and what to verify on every bottle.`;
  const text = `Hi ${name},

Your SupplementMatch playbook is ready.

— TOP RECOMMENDATION —
${top}${brand ? ` (${brand})` : ""}

Wellness archetype: ${archetype}
Primary goal: ${goal}

Open your playbook:
${url}

Before you buy anything, check three things:
  1. Third-party testing (USP, NSF, Informed Sport)
  2. Dose vs. the dose actually studied in the research
  3. Interactions with anything you already take

Reply to this email with two brands you're torn between
and I'll tell you which one I'd buy and why.

Alex
GearUpToFit · SupplementMatch AI
https://gearuptofit.com`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHTML(subject)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
  @media (max-width:620px){
    .container{width:100%!important;border-radius:0!important;}
    .px{padding-left:22px!important;padding-right:22px!important;}
    .hero-title{font-size:26px!important;line-height:1.18!important;}
    .score{font-size:48px!important;}
    .cta-btn{display:block!important;width:100%!important;box-sizing:border-box;text-align:center!important;}
    .stack-col{display:block!important;width:100%!important;}
    .stack-col + .stack-col{margin-top:10px;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#eef0f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f1117;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:transparent;height:0;width:0;">${escapeHTML(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f5;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" class="container" width="620" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e3e6ee;box-shadow:0 24px 60px rgba(17,24,39,0.10);">

      <!-- Brand bar -->
      <tr><td class="px" style="padding:24px 36px 0;background:#0b0d14;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="left" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <span style="display:inline-block;background:#ff3b6b;color:#fff;font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;padding:6px 10px;border-radius:6px;">GearUpToFit</span>
              <span style="display:inline-block;margin-left:10px;font-size:11px;color:#9aa0b4;letter-spacing:.22em;text-transform:uppercase;font-weight:700;">SupplementMatch AI</span>
            </td>
            <td align="right" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:#6b7180;letter-spacing:.14em;text-transform:uppercase;font-weight:700;">
              Playbook · v1
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Hero -->
      <tr><td class="px" style="padding:30px 36px 26px;background:#0b0d14;">
        <h1 class="hero-title" style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:32px;line-height:1.14;color:#ffffff;font-weight:800;letter-spacing:-0.02em;">
          ${escapeHTML(name)}, your playbook is ready.
        </h1>
        <p style="margin:0;color:#c4c8d4;font-size:15px;line-height:1.65;max-width:520px;">
          Built around your goals, biology, and meds — not the loudest label on the shelf. Ranking happens before any affiliate link is attached.
        </p>
      </td></tr>

      <!-- Spotlight card -->
      <tr><td class="px" style="padding:28px 36px 6px;background:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6e8f0;border-radius:14px;overflow:hidden;background:#fbfbfd;">
          <tr><td style="padding:18px 22px 6px;">
            <div style="font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:#ff3b6b;font-weight:800;">Your top recommendation</div>
          </td></tr>
          <tr><td style="padding:0 22px 18px;">
            <div style="font-size:22px;line-height:1.22;font-weight:800;color:#0f1117;letter-spacing:-0.01em;">
              ${escapeHTML(top)}${brand ? `<span style="font-weight:500;color:#6b7180;"> · ${escapeHTML(brand)}</span>` : ""}
            </div>
          </td></tr>
          <tr><td style="padding:0 22px 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="stack-col" valign="top" style="width:50%;padding-right:8px;">
                  <div style="border:1px solid #ececf3;border-radius:10px;padding:12px 14px;background:#ffffff;">
                    <div style="font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#6b7180;margin-bottom:4px;">Archetype</div>
                    <div style="font-size:14px;font-weight:700;color:#0f1117;">${escapeHTML(archetype)}</div>
                  </div>
                </td>
                <td class="stack-col" valign="top" style="width:50%;padding-left:8px;">
                  <div style="border:1px solid #ececf3;border-radius:10px;padding:12px 14px;background:#ffffff;">
                    <div style="font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#6b7180;margin-bottom:4px;">Primary goal</div>
                    <div style="font-size:14px;font-weight:700;color:#0f1117;">${escapeHTML(goal)}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- CTA -->
      <tr><td class="px" align="center" style="padding:22px 36px 8px;background:#ffffff;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHTML(url)}" style="height:50px;v-text-anchor:middle;width:300px;" arcsize="20%" fillcolor="#ff3b6b" stroke="f">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;letter-spacing:1px;">OPEN MY PLAYBOOK →</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-- -->
        <a href="${escapeHTML(url)}" class="cta-btn" style="display:inline-block;background:#ff3b6b;background-image:linear-gradient(135deg,#ff3b6b 0%,#ff6b8a 100%);color:#ffffff;text-decoration:none;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:16px 30px;border-radius:10px;font-size:13.5px;box-shadow:0 14px 32px rgba(255,59,107,.32);">
          Open my playbook →
        </a>
        <!--<![endif]-->
      </td></tr>
      <tr><td class="px" align="center" style="padding:8px 36px 24px;background:#ffffff;">
        <div style="font-size:11.5px;color:#8b91a3;line-height:1.55;">Or copy this link into your browser:</div>
        <div style="margin-top:4px;font-size:11.5px;word-break:break-all;"><a href="${escapeHTML(url)}" style="color:#ff3b6b;text-decoration:none;">${escapeHTML(url)}</a></div>
      </td></tr>

      <!-- Divider -->
      <tr><td class="px" style="padding:0 36px;background:#ffffff;"><div style="border-top:1px solid #ececf3;"></div></td></tr>

      <!-- Three things to check -->
      <tr><td class="px" style="padding:24px 36px 8px;background:#ffffff;">
        <div style="font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:#0f1117;font-weight:800;">Before you buy anything</div>
        <div style="font-size:15px;color:#373b48;line-height:1.7;margin-top:10px;">Three checks that catch most label tricks:</div>
      </td></tr>
      <tr><td class="px" style="padding:6px 36px 4px;background:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${[
            ["1", "Third-party tested", "USP, NSF, or Informed Sport on the bottle — not just on the website."],
            ["2", "Dose matches the studies", "Marketing doses are often a fraction of what was tested. Check the supplement facts panel."],
            ["3", "No conflicts with what you take", "Cross-check meds, blood thinners, and thyroid/heart treatments before adding anything new."],
          ]
            .map(
              ([n, h, b]) => `<tr><td style="padding:8px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="top" style="width:34px;">
                  <div style="width:26px;height:26px;border-radius:8px;background:#0f1117;color:#fff;text-align:center;line-height:26px;font-weight:800;font-size:12px;">${n}</div>
                </td>
                <td valign="top" style="padding-left:4px;">
                  <div style="font-size:14px;font-weight:700;color:#0f1117;">${h}</div>
                  <div style="font-size:13px;color:#6b7180;line-height:1.55;margin-top:2px;">${b}</div>
                </td>
              </tr>
            </table>
          </td></tr>`,
            )
            .join("")}
        </table>
      </td></tr>

      <!-- Sign-off -->
      <tr><td class="px" style="padding:22px 36px 6px;background:#ffffff;">
        <div style="border-top:1px solid #ececf3;padding-top:18px;font-size:14.5px;color:#373b48;line-height:1.7;">
          Reply with two brands you're torn between and I'll tell you which one I'd buy and why.
        </div>
      </td></tr>
      <tr><td class="px" style="padding:6px 36px 28px;background:#ffffff;">
        <div style="font-size:15px;color:#0f1117;font-weight:800;margin-top:8px;">Alex</div>
        <div style="font-size:12.5px;color:#6b7180;font-weight:500;">GearUpToFit · SupplementMatch AI</div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:18px 36px 22px;background:#f5f6fa;border-top:1px solid #ececf3;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:11px;color:#7b8194;line-height:1.6;">
              Educational only — not medical advice. Talk with a qualified clinician before starting any supplement, especially if you're pregnant, breastfeeding, under 18, on medication, or managing a condition.
            </td>
          </tr>
          <tr>
            <td style="padding-top:12px;font-size:11px;color:#9aa0b4;line-height:1.6;">
              © ${new Date().getFullYear()} GearUpToFit · <a href="https://gearuptofit.com" style="color:#6b7180;text-decoration:underline;">gearuptofit.com</a> · <a href="https://gearuptofit.com/privacy-policy/" style="color:#6b7180;text-decoration:underline;">Privacy</a>
            </td>
          </tr>
        </table>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
  return { subject, html, text };
}

export type SubscribeResult =
  | { success: true; welcomeSent: boolean }
  | { success: false; error: string };

export async function runBrevoSubscribe(data: BrevoSubscribeInput): Promise<SubscribeResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Email service not configured" };
  }

  const reportURL = normalizeReportURL(data.reportURL);
  const attributes: Record<string, unknown> = {
    FIRSTNAME: data.firstName ?? "",
    SOURCE: data.source,
    TOP_SUPPLEMENT: data.topSupplement ?? "",
    TOP_BRAND: data.topBrand ?? "",
    PRIMARY_GOAL: data.primaryGoal ?? "",
    ARCHETYPE: data.archetype ?? "",
    REPORT_URL: reportURL,
    UTM_SOURCE: data.utm?.source ?? "",
    UTM_MEDIUM: data.utm?.medium ?? "",
    UTM_CAMPAIGN: data.utm?.campaign ?? "",
    REFERRER: data.utm?.referrer ?? "",
    OPT_IN_DATE: new Date().toISOString(),
  };

  try {
    const upsertRes = await postBrevo(
      "/contacts",
      {
        email: data.email,
        attributes,
        listIds: [listIdFor(data.source)],
        updateEnabled: true,
      },
      apiKey,
    );
    const txt = await upsertRes.text();
    let json: unknown = null;
    try { json = txt ? JSON.parse(txt) : null; } catch { /* ignore */ }
    const duplicateOk = json && typeof json === "object" && (json as { code?: string }).code === "duplicate_parameter";
    if (!upsertRes.ok && !duplicateOk) {
      console.error("brevo upsert failed", upsertRes.status, txt);
      return { success: false, error: "Subscription failed. Please try again." };
    }
  } catch (err) {
    console.error("brevo upsert exception", err);
    return { success: false, error: "Network error contacting email service" };
  }

  let welcomeSent = false;
  try {
    const templateIdRaw = process.env.BREVO_WELCOME_TEMPLATE_ID;
    const templateId = templateIdRaw ? parseInt(templateIdRaw, 10) : NaN;
    const sendBody: Record<string, unknown> = {
      sender: { name: senderName(), email: senderEmail() },
      to: [{ email: data.email, name: data.firstName || undefined }],
      tags: ["supplementmatch-day-0", `source-${data.source}`],
      headers: { "X-Mailin-Custom": "drip:0" },
    };
    if (Number.isFinite(templateId) && templateId > 0) {
      sendBody.templateId = templateId;
      sendBody.params = {
        FIRSTNAME: data.firstName || "there",
        TOP_SUPPLEMENT: data.topSupplement || "",
        TOP_BRAND: data.topBrand || "",
        PRIMARY_GOAL: data.primaryGoal || "",
        ARCHETYPE: data.archetype || "",
        REPORT_URL: reportURL,
      };
    } else {
      const { subject, html, text } = welcomeHTML({ ...data, reportURL });
      sendBody.subject = subject;
      sendBody.htmlContent = html;
      sendBody.textContent = text;
    }
    const sendRes = await postBrevo("/smtp/email", sendBody, apiKey);
    welcomeSent = sendRes.ok;
    if (!sendRes.ok) {
      const errTxt = await sendRes.text();
      console.error("brevo welcome send failed", sendRes.status, errTxt);
      if (Number.isFinite(templateId) && templateId > 0) {
        const { subject, html, text } = welcomeHTML({ ...data, reportURL });
        const fallbackRes = await postBrevo(
          "/smtp/email",
          { ...sendBody, templateId: undefined, params: undefined, subject, htmlContent: html, textContent: text },
          apiKey,
        );
        welcomeSent = fallbackRes.ok;
        if (!fallbackRes.ok) {
          const fallbackTxt = await fallbackRes.text();
          console.error("brevo fallback welcome send failed", fallbackRes.status, fallbackTxt);
        }
      }
    }
  } catch (err) {
    console.error("brevo welcome send exception", err);
  }

  return { success: true, welcomeSent };
}
