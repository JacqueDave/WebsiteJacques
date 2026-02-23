// Runtime config is injected by js/config.js (generated from env vars at build time).
const runtimeConfig = window.RUNTIME_CONFIG || {};

const readConfigValue = (keys) => {
  for (const key of keys) {
    const value = runtimeConfig[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const stripeCheckoutUrl = readConfigValue([
  "STRIPE_CHECKOUT_URL",
  "NEXT_PUBLIC_STRIPE_CHECKOUT_URL",
  "VITE_STRIPE_CHECKOUT_URL",
  "PUBLIC_STRIPE_CHECKOUT_URL",
]);

const supabaseUrl = readConfigValue([
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "PUBLIC_SUPABASE_URL",
]);

const supabaseKey = readConfigValue([
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_ANON_KEY",
  "PUBLIC_SUPABASE_ANON_KEY",
]);

let supabase = null;
if (window.supabase && supabaseUrl && supabaseKey) {
  try {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("Supabase client initialization failed:", error);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase config values in RUNTIME_CONFIG.");
}

const formatErrorMessage = (error) => {
  if (!error) return "Unknown error.";
  const parts = [error.message, error.details, error.hint, error.code].filter(Boolean);
  return parts.length ? parts.join(" | ") : "Unknown error.";
};

const LEAD_INSERT_TIMEOUT_MS = 5000;

const withTimeout = (promise, timeoutMs) => {
  let timeoutHandle = null;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = window.setTimeout(() => {
      const timeoutError = new Error(`Timed out after ${timeoutMs}ms`);
      timeoutError.reasonCode = "timeout";
      reject(timeoutError);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
    }
  });
};

const readRedirectTarget = (form) =>
  form.getAttribute("data-redirect") ||
  form.getAttribute("action") ||
  "thank-you.html";

const buildLeadsEndpoint = () => {
  if (!supabaseUrl) return "";
  return `${supabaseUrl.replace(/\/$/, "")}/rest/v1/leads`;
};

const insertLeadRecord = async ({ name, email, source }) => {
  if (!supabaseUrl || !supabaseKey) {
    const error = new Error("Missing Supabase REST configuration.");
    error.reasonCode = "missing_config";
    throw error;
  }

  const endpoint = buildLeadsEndpoint();
  const response = await withTimeout(
    fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([{ name, email }]),
    }),
    LEAD_INSERT_TIMEOUT_MS
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    const error = new Error(
      `HTTP ${response.status} ${response.statusText}${details ? ` | ${details}` : ""}`
    );
    error.reasonCode = "insert_failed";
    throw error;
  }

  console.log(`[lead_capture:ok] source=${source} email=${email}`);
};

const rescueNativeLeadSubmission = async () => {
  const { pathname, search, hash } = window.location;
  if (!search) return false;

  const params = new URLSearchParams(search);
  const rawEmail = params.get("email");
  if (!rawEmail || !rawEmail.trim()) return false;

  const normalizedEmail = rawEmail.trim().toLowerCase();
  const rawName = params.get("name");
  const normalizedName =
    typeof rawName === "string" && rawName.trim() ? rawName.trim() : null;

  const rescueToken = `${pathname}|${normalizedEmail}|${normalizedName || ""}`;
  const rescueKey = "lead_capture_query_rescue";

  try {
    if (window.sessionStorage.getItem(rescueKey) === rescueToken) {
      return false;
    }
    window.sessionStorage.setItem(rescueKey, rescueToken);
  } catch (_) {
    // Ignore storage errors and continue with rescue flow.
  }

  try {
    await insertLeadRecord({
      name: normalizedName,
      email: normalizedEmail,
      source: "query_rescue",
    });
  } catch (error) {
    if (error && error.reasonCode === "missing_config") {
      console.error("[lead_capture:query_rescue_missing_config] Missing Supabase runtime config.");
    } else if (error && error.reasonCode === "insert_failed") {
      console.error(
        `[lead_capture:query_rescue_insert_failed] ${formatErrorMessage(error)}`,
        error
      );
    } else
    if (error && error.reasonCode === "timeout") {
      console.error(
        `[lead_capture:query_rescue_timeout] Insert timed out after ${LEAD_INSERT_TIMEOUT_MS}ms.`,
        error
      );
    } else {
      console.error(
        `[lead_capture:query_rescue_unexpected_error] ${formatErrorMessage(error)}`,
        error
      );
    }
  }

  const cleanUrl = `${pathname}${hash || ""}`;
  window.history.replaceState({}, document.title, cleanUrl);

  const isLandingPage = pathname === "/" || pathname.endsWith("/index.html");
  if (isLandingPage) {
    window.location.replace("thank-you.html");
    return true;
  }

  return false;
};

// ── Stripe Links ──
const applyStripeLinks = () => {
  const stripeLinks = document.querySelectorAll("[data-stripe-link]");

  stripeLinks.forEach((link) => {
    if (stripeCheckoutUrl) {
      link.href = stripeCheckoutUrl;
      link.removeAttribute("aria-disabled");
      link.addEventListener("click", (event) => {
        const currentHref = link.getAttribute("href");
        if (!currentHref || currentHref === "#") {
          event.preventDefault();
          window.location.assign(stripeCheckoutUrl);
        }
      });
    } else {
      link.setAttribute("aria-disabled", "true");
      link.href = "#";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        alert("Checkout link is not configured yet.");
      });
    }
  });
};

// ── Lead Forms (Supabase) ──
const bindLeadForms = () => {
  const leadForms = document.querySelectorAll("[data-lead-form]");
  if (!leadForms.length) return;

  console.log(`[lead_capture:init] Found ${leadForms.length} lead form(s).`);

  leadForms.forEach((form) => {
    if (form.dataset.leadBound === "true") return;
    form.dataset.leadBound = "true";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.innerText : "";
      const redirectTarget = readRedirectTarget(form);

      const formData = new FormData(form);
      const nameValue = formData.get("name");
      const emailValue = formData.get("email");
      const normalizedName =
        typeof nameValue === "string" && nameValue.trim()
          ? nameValue.trim()
          : null;
      const normalizedEmail =
        typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

      if (!normalizedEmail) {
        alert("Please enter a valid email.");
        return;
      }

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerText = "Sending...";
        }

        await insertLeadRecord({
          name: normalizedName,
          email: normalizedEmail,
          source: "form_submit",
        });
      } catch (error) {
        if (error && error.reasonCode === "missing_config") {
          console.error("[lead_capture:missing_config] Missing Supabase runtime config.");
        } else if (error && error.reasonCode === "insert_failed") {
          console.error(`[lead_capture:insert_failed] ${formatErrorMessage(error)}`, error);
        } else
        if (error && error.reasonCode === "timeout") {
          console.error(
            `[lead_capture:timeout] Insert timed out after ${LEAD_INSERT_TIMEOUT_MS}ms.`,
            error
          );
        } else {
          console.error(
            `[lead_capture:unexpected_error] ${formatErrorMessage(error)}`,
            error
          );
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerText = originalButtonText;
        }
        window.location.href = redirectTarget;
      }
    }, true);
  });
};

// ── Scroll-triggered animations ──
const initScrollAnimations = () => {
  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .stagger");

  if (!("IntersectionObserver" in window)) {
    // Fallback: show everything immediately
    revealElements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((el) => observer.observe(el));
};

// ── Smooth scroll for anchor links ──
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]:not([data-stripe-link])').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") {
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
};

// ── Init ──
const init = async () => {
  applyStripeLinks();
  const rescued = await rescueNativeLeadSubmission();
  if (rescued) return;

  bindLeadForms();
  initScrollAnimations();
  initSmoothScroll();
};

init();
