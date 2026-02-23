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

  leadForms.forEach((form) => {
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

        if (!supabase) {
          console.error(
            "[lead_capture:missing_config] Supabase client not initialized. Redirecting anyway."
          );
        } else {
          const { error } = await withTimeout(
            supabase.from("leads").insert([
              {
                name: normalizedName,
                email: normalizedEmail,
              },
            ]),
            LEAD_INSERT_TIMEOUT_MS
          );

          if (error) {
            console.error(
              `[lead_capture:insert_failed] ${formatErrorMessage(error)}`,
              error
            );
          }
        }
      } catch (error) {
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
    });
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
applyStripeLinks();
bindLeadForms();
initScrollAnimations();
initSmoothScroll();
