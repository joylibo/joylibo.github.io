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

  if (headings.length > 0) {
    // 高亮哪一项，由「标题此刻的位置」决定，而不是由「标题刚刚进出某个区域」的事件决定：
    // 点目录是瞬间跳转，标题会直接越过任何观察区域，靠事件就会漏掉。
    const header = document.querySelector("header.header");
    const readingLine = () => (header ? header.offsetHeight : 0) + 40;
    let pinnedId = null; // 点了目录之后，先锁定在被点的那一项，直到读者自己滚动

    // 目录很长时，让高亮项始终留在目录面板的可视范围里（只滚面板，不动页面）
    const keepVisible = (link) => {
      if (!toc || toc.scrollHeight <= toc.clientHeight) return;
      const margin = 32;
      const panel = toc.getBoundingClientRect();
      const item = link.getBoundingClientRect();
      if (item.top < panel.top + margin) {
        toc.scrollBy({ top: item.top - panel.top - margin, behavior: "smooth" });
      } else if (item.bottom > panel.bottom - margin) {
        toc.scrollBy({ top: item.bottom - panel.bottom + margin, behavior: "smooth" });
      }
    };

    let activeId;
    const setActive = (id) => {
      if (id === activeId) return;
      activeId = id;
      let activeLink = null;
      tocLinks.forEach((link) => {
        const on = decodeURIComponent(link.hash.slice(1)) === id;
        link.classList.toggle("is-active", on);
        if (on) activeLink = link;
      });
      if (activeLink) keepVisible(activeLink);
    };

    const update = () => {
      if (pinnedId) {
        setActive(pinnedId);
        return;
      }
      const line = readingLine();
      let current = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - line <= 1) current = heading;
        else break;
      }
      // 滚到页面最底部时，最后几节的标题可能到不了阅读线，直接算最后一项
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = headings[headings.length - 1];
      setActive(current ? current.id : null);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    tocLinks.forEach((link) => {
      link.addEventListener("click", () => {
        pinnedId = decodeURIComponent(link.hash.slice(1));
        setActive(pinnedId);
      });
    });
    // 读者自己动手滚动时，解除锁定，回到按位置计算
    ["wheel", "touchstart", "keydown", "mousedown"].forEach((type) =>
      window.addEventListener(
        type,
        (event) => {
          if (type === "mousedown" && toc && toc.contains(event.target)) return;
          if (pinnedId) {
            pinnedId = null;
            onScroll();
          }
        },
        { passive: true },
      ),
    );

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    window.addEventListener("load", update);
    update();
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
