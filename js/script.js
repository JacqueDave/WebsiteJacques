// Runtime config is injected by config.js (generated from env vars at build time).
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

// ── Stripe Links ──
const applyStripeLinks = () => {
  const stripeLinks = document.querySelectorAll("[data-stripe-link]");

  stripeLinks.forEach((link) => {
    if (stripeCheckoutUrl) {
      link.href = stripeCheckoutUrl;
      link.removeAttribute("aria-disabled");
    } else {
      link.setAttribute("aria-disabled", "true");
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
      const originalButtonText = submitButton.innerText;

      if (!supabase) {
        console.error("Supabase client not initialized.");
        alert("Configuration error: Supabase client not initialized.");
        return;
      }

      const formData = new FormData(form);
      const name = formData.get("name");
      const email = formData.get("email");

      if (!email || !String(email).trim()) {
        alert("Please enter a valid email.");
        return;
      }

      try {
        submitButton.disabled = true;
        submitButton.innerText = "Sending...";

        const { error } = await supabase.from("leads").insert([
          {
            name: name ? String(name).trim() : null,
            email: String(email).trim().toLowerCase(),
          },
        ]);

        if (error) {
          console.error("Supabase error (non-fatal):", error);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        // ALWAYS redirect, even if email capture failed
        const redirect =
          form.getAttribute("data-redirect") ||
          form.getAttribute("action") ||
          "thank-you.html";
        window.location.href = redirect;
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
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
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
