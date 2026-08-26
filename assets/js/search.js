(() => {
  const modal = document.querySelector(".lb-search-modal");
  const indexSource = document.getElementById("lb-search-index-source");
  if (!modal || !indexSource) return;

  const input = modal.querySelector("#lb-search-input");
  const results = modal.querySelector(".lb-search-results");
  const status = modal.querySelector(".lb-search-status");
  const openButtons = document.querySelectorAll('[data-target="search-modal"]');
  const closeButtons = modal.querySelectorAll(
    '[data-target="close-search-modal"]',
  );
  let pages = null;
  let selectedIndex = -1;

  const normalize = (value) => String(value || "").toLocaleLowerCase("zh-CN");

  const resolvePageURL = (slug) => {
    const relativeSlug = String(slug || "").replace(/^\/+/, "");
    return new URL(relativeSlug, indexSource.href).href;
  };

  const loadIndex = async () => {
    if (pages) return pages;
    status.textContent = "正在载入索引…";
    const response = await fetch(indexSource.href);
    if (!response.ok)
      throw new Error(`Search index request failed: ${response.status}`);
    pages = await response.json();
    return pages;
  };

  const excerpt = (page, query) => {
    const source = page.description || page.content || "";
    const normalized = normalize(source);
    const at = normalized.indexOf(query);
    const start = at > 48 ? at - 48 : 0;
    const text = source.slice(start, start + 132).trim();
    return `${start > 0 ? "…" : ""}${text}${source.length > start + 132 ? "…" : ""}`;
  };

  const updateSelection = (nextIndex) => {
    const links = [...results.querySelectorAll("a")];
    if (links.length === 0) {
      selectedIndex = -1;
      return;
    }
    selectedIndex = (nextIndex + links.length) % links.length;
    links.forEach((link, index) =>
      link.classList.toggle("is-selected", index === selectedIndex),
    );
    links[selectedIndex].scrollIntoView({ block: "nearest" });
  };

  const render = (queryValue) => {
    const query = normalize(queryValue.trim());
    results.replaceChildren();
    selectedIndex = -1;
    if (!query) {
      status.textContent = "输入关键词，查找课程与文章";
      return;
    }

    const matches = (pages || [])
      .map((page) => {
        const title = normalize(page.title);
        const description = normalize(page.description);
        const content = normalize(page.content);
        const score =
          (title.includes(query) ? 6 : 0) +
          (description.includes(query) ? 3 : 0) +
          (content.includes(query) ? 1 : 0);
        return { page, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    status.textContent =
      matches.length > 0
        ? `找到 ${matches.length} 条结果`
        : `没有找到“${queryValue.trim()}”`;

    matches.forEach(({ page }) => {
      const link = document.createElement("a");
      link.className = "lb-search-result";
      link.href = resolvePageURL(page.slug);

      const meta = document.createElement("span");
      meta.className = "lb-search-result__meta";
      meta.textContent = `${page.section === "blog" ? "文章" : "课程"} · ${page.date}`;

      const title = document.createElement("strong");
      title.textContent = page.title;

      const summary = document.createElement("span");
      summary.className = "lb-search-result__summary";
      summary.textContent = excerpt(page, query);

      link.append(meta, title, summary);
      results.append(link);
    });
  };

  const open = async () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-search-is-open");
    input.focus();
    try {
      await loadIndex();
      render(input.value);
    } catch (error) {
      console.error(error);
      status.textContent = "搜索索引暂时没有加载成功";
    }
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-search-is-open");
  };

  openButtons.forEach((button) => button.addEventListener("click", open));
  closeButtons.forEach((button) => button.addEventListener("click", close));
  input.addEventListener("input", () => render(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      updateSelection(selectedIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      updateSelection(selectedIndex - 1);
    } else if (event.key === "Enter" && selectedIndex >= 0) {
      results.querySelectorAll("a")[selectedIndex]?.click();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) close();
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      open();
    }
  });
})();
