(() => {
  const DEFAULT_LABEL = "复制";
  const SUCCESS_LABEL = "已复制";
  const ERROR_LABEL = "复制失败";

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const createButton = (pre) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lb-code-copy-btn";
    button.setAttribute("aria-label", DEFAULT_LABEL);
    button.textContent = DEFAULT_LABEL;

    let resetTimer = null;
    const setLabel = (label) => {
      button.textContent = label;
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
      if (label !== DEFAULT_LABEL) {
        resetTimer = window.setTimeout(() => {
          button.textContent = DEFAULT_LABEL;
        }, 1400);
      }
    };

    button.addEventListener("click", async () => {
      const text = pre.textContent || "";
      if (!text.trim()) {
        return;
      }
      try {
        await copyText(text);
        setLabel(SUCCESS_LABEL);
      } catch {
        setLabel(ERROR_LABEL);
      }
    });

    return button;
  };

  const attachToBlock = (container, pre) => {
    if (!container || !pre || container.dataset.copyReady === "true") {
      return;
    }
    container.dataset.copyReady = "true";
    container.classList.add("lb-code-block");
    container.appendChild(createButton(pre));
  };

  const initCopyButtons = () => {
    document.querySelectorAll(".content .highlight").forEach((highlight) => {
      const pre = highlight.querySelector("pre");
      attachToBlock(highlight, pre);
    });

    document.querySelectorAll(".content pre").forEach((pre) => {
      if (pre.closest(".highlight")) {
        return;
      }
      // 没写语言的代码块没有外层容器。按钮不能放进 pre：它会跟着横向滚动，
      // 文字也会混进复制内容，所以补一层和其他代码块相同的容器
      const wrapper = document.createElement("div");
      wrapper.className = "highlight";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      attachToBlock(wrapper, pre);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCopyButtons);
  } else {
    initCopyButtons();
  }
})();
