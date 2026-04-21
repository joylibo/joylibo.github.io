(() => {
  const SELECTOR = "a[data-lb-ga-event]";
  const FEEDBACK_RESET_MS = 2000;

  const sendGaEvent = (link) => {
    if (typeof window.gtag !== "function") {
      return false;
    }

    const eventName = link.dataset.lbGaEvent;
    if (!eventName) {
      return false;
    }

    const payload = {
      event_category: link.dataset.lbGaCategory || "home_course_card",
      event_label: link.dataset.lbGaLabel || link.textContent?.trim() || "",
      link_url: link.href || "",
      transport_type: "beacon",
    };

    window.gtag("event", eventName, payload);
    return true;
  };

  const showFeedback = (link) => {
    const feedbackText = link.dataset.lbFeedbackText || "已收到你的诉求";
    const originalText = link.dataset.lbOriginalLabel || link.textContent?.trim() || "";
    if (!link.dataset.lbOriginalLabel) {
      link.dataset.lbOriginalLabel = originalText;
    }

    link.textContent = feedbackText;
    link.setAttribute("aria-live", "polite");

    if (link.__lbResetTimer) {
      window.clearTimeout(link.__lbResetTimer);
    }
    link.__lbResetTimer = window.setTimeout(() => {
      link.textContent = link.dataset.lbOriginalLabel || originalText;
    }, FEEDBACK_RESET_MS);
  };

  const handleNavigate = (link, event) => {
    const eventName = link.dataset.lbGaEvent;
    const isModifiedClick =
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0;

    if (isModifiedClick) {
      sendGaEvent(link);
      return true;
    }

    if (typeof window.gtag !== "function") {
      return false;
    }

    event.preventDefault();

    let navigated = false;
    const navigate = () => {
      if (navigated) {
        return;
      }
      navigated = true;
      window.location.href = link.href;
    };

    window.gtag("event", eventName, {
      event_category: link.dataset.lbGaCategory || "home_course_card",
      event_label: link.dataset.lbGaLabel || link.textContent?.trim() || "",
      link_url: link.href || "",
      transport_type: "beacon",
      event_callback: navigate,
    });

    window.setTimeout(navigate, 900);
    return true;
  };

  const bindCourseGaEvents = () => {
    document.querySelectorAll(SELECTOR).forEach((link) => {
      if (link.dataset.lbGaBound === "true") {
        return;
      }
      link.dataset.lbGaBound = "true";
      link.addEventListener("click", (event) => {
        const action = link.dataset.lbAction || "navigate";
        if (action === "feedback") {
          event.preventDefault();
          sendGaEvent(link);
          showFeedback(link);
          return;
        }
        handleNavigate(link, event);
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindCourseGaEvents);
  } else {
    bindCourseGaEvents();
  }
})();
