(() => {
  const FIT_LABEL = "查看大图";
  let dialog = null;
  let view = null;

  const canZoomIn = () => {
    return (
      view.naturalWidth > view.clientWidth + 1 ||
      view.naturalHeight > view.clientHeight + 1
    );
  };

  const setActual = (actual, event) => {
    if (actual) {
      const rect = view.getBoundingClientRect();
      const ratioX = event ? (event.clientX - rect.left) / rect.width : 0.5;
      const ratioY = event ? (event.clientY - rect.top) / rect.height : 0.5;
      dialog.classList.add("is-actual");
      // 放大后让点击的位置留在屏幕中间
      dialog.scrollLeft = view.offsetWidth * ratioX - dialog.clientWidth / 2;
      dialog.scrollTop = view.offsetHeight * ratioY - dialog.clientHeight / 2;
      return;
    }
    dialog.classList.remove("is-actual");
    dialog.scrollTo(0, 0);
  };

  const buildDialog = () => {
    dialog = document.createElement("dialog");
    dialog.className = "lb-zoom";
    dialog.setAttribute("aria-label", FIT_LABEL);

    view = document.createElement("img");
    view.className = "lb-zoom__img";
    view.alt = "";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "lb-zoom__close";
    close.setAttribute("aria-label", "关闭");
    close.textContent = "×";

    dialog.append(view, close);
    document.body.appendChild(dialog);

    view.addEventListener("load", () => {
      dialog.classList.toggle("can-zoom", canZoomIn());
    });

    dialog.addEventListener("click", (event) => {
      if (event.target !== view) {
        dialog.close();
        return;
      }
      if (dialog.classList.contains("is-actual")) {
        setActual(false);
      } else if (dialog.classList.contains("can-zoom")) {
        setActual(true, event);
      }
    });

    dialog.addEventListener("close", () => {
      dialog.classList.remove("is-actual", "can-zoom");
      document.documentElement.classList.remove("lb-zoom-open");
      view.removeAttribute("src");
    });
  };

  const open = (img) => {
    if (!dialog) {
      buildDialog();
    }
    view.alt = img.alt;
    dialog.showModal();
    document.documentElement.classList.add("lb-zoom-open");
    view.src = img.currentSrc || img.src;
  };

  const init = () => {
    document.querySelectorAll(".content img").forEach((img) => {
      if (img.closest("a, button")) {
        return;
      }
      img.classList.add("lb-zoomable");
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", img.alt || FIT_LABEL);
      img.addEventListener("click", () => open(img));
      img.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(img);
        }
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
