// Runtime config is injected by config.js (generated from .env).
const runtimeConfig = window.RUNTIME_CONFIG || {};
const stripeCheckoutUrl = runtimeConfig.STRIPE_CHECKOUT_URL || "";

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

const bindLeadForms = () => {
  const leadForms = document.querySelectorAll("[data-lead-form]");

  // Keep this lightweight until Supabase + Resend wiring is added.
  leadForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const redirect =
        form.getAttribute("data-redirect") ||
        form.getAttribute("action") ||
        "thank-you.html";
      window.location.href = redirect;
    });
  });
};

applyStripeLinks();
bindLeadForms();
