(() => {
  const toc = document.querySelector(".lb-article-toc-panel");
  const openButton = document.querySelector("[data-toc-open]");
  const closeButtons = document.querySelectorAll("[data-toc-close]");

  const setTocOpen = (open) => {
    if (!toc || !openButton) return;
    document.body.classList.toggle("lb-toc-is-open", open);
    toc.classList.toggle("is-open", open);
    openButton.setAttribute("aria-expanded", String(open));
  };

  openButton?.addEventListener("click", () => setTocOpen(true));
  closeButtons.forEach((button) =>
    button.addEventListener("click", () => setTocOpen(false)),
  );
  toc?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setTocOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setTocOpen(false);
  });

  const tocLinks = toc ? [...toc.querySelectorAll('a[href^="#"]')] : [];
  const headings = tocLinks
    .map((link) =>
      document.getElementById(decodeURIComponent(link.hash.slice(1))),
    )
    .filter(Boolean);

  if (headings.length > 0 && "IntersectionObserver" in window) {
    const linksById = new Map(
      tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (!visible) return;
        tocLinks.forEach((link) => link.classList.remove("is-active"));
        linksById.get(visible.target.id)?.classList.add("is-active");
      },
      { rootMargin: "-18% 0px -70%", threshold: 0 },
    );
    headings.forEach((heading) => observer.observe(heading));
  }

  document.querySelectorAll("[data-copy-share]").forEach((button) => {
    button.addEventListener("click", async () => {
      const original = button.textContent;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href);
        } else {
          const input = document.createElement("input");
          input.value = window.location.href;
          input.style.position = "fixed";
          input.style.left = "-9999px";
          document.body.append(input);
          input.select();
          document.execCommand("copy");
          input.remove();
        }
        button.textContent = "已复制";
      } catch {
        button.textContent = "复制失败";
      }
      window.setTimeout(() => {
        button.textContent = original;
      }, 1400);
    });
  });

  document.querySelectorAll("[data-native-share]").forEach((button) => {
    if (!navigator.share) {
      button.hidden = true;
      return;
    }
    button.addEventListener("click", () => {
      navigator
        .share({
          title: button.dataset.shareTitle || document.title,
          url: window.location.href,
        })
        .catch(() => {});
    });
  });
})();
