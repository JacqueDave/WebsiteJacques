// Runtime config is injected by config.js (generated from .env).
const runtimeConfig = window.RUNTIME_CONFIG || {};

const stripeCheckoutUrl = runtimeConfig.STRIPE_CHECKOUT_URL || "";
const supabaseUrl = runtimeConfig.SUPABASE_URL || "";
const supabaseKey = runtimeConfig.SUPABASE_ANON_KEY || "";

const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

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

      try {
        submitButton.disabled = true;
        submitButton.innerText = "Sending...";

        const { error } = await supabase.from("leads").insert([{ name, email }]);

        if (error) throw error;

        const redirect =
          form.getAttribute("data-redirect") ||
          form.getAttribute("action") ||
          "thank-you.html";
        window.location.href = redirect;
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("There was an error submitting your information. Please try again.");
        submitButton.disabled = false;
        submitButton.innerText = originalButtonText;
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
