(() => {
  try {
    const timeline = document.querySelector("#timeline");
    const scenes = Array.from(document.querySelectorAll(".scene[data-hour]"));
    if (!timeline || scenes.length === 0 || !document.body) return;

    const reduceMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : { matches: false };
    const nav = document.createElement("nav");
    nav.className = "dot-nav";
    nav.setAttribute("aria-label", "Chuyển nhanh giữa các mốc giờ");
    nav.setAttribute("aria-hidden", "true");
    nav.inert = true;

    const dots = scenes.map((scene) => {
      const title = scene.querySelector(".scene__title");
      const hour = scene.dataset.hour || "Mốc giờ";
      const place = title ? title.textContent.trim() : "";
      const label = place ? `${hour} · ${place}` : hour;
      const button = document.createElement("button");
      const dot = document.createElement("span");
      const text = document.createElement("span");

      button.type = "button";
      button.className = "dot-nav__button";
      button.setAttribute("aria-label", `Đến mốc ${label}`);
      button.dataset.sceneId = scene.id;
      dot.className = "dot-nav__dot";
      dot.setAttribute("aria-hidden", "true");
      text.className = "dot-nav__label";
      text.textContent = label;
      text.setAttribute("aria-hidden", "true");
      button.append(dot, text);
      nav.append(button);

      button.addEventListener("click", () => {
        if (!scene.isConnected) return;
        scene.scrollIntoView({
          behavior: reduceMotion.matches ? "auto" : "smooth",
          block: "center"
        });
        if (!scene.hasAttribute("tabindex")) scene.setAttribute("tabindex", "-1");
        try {
          scene.focus({ preventScroll: true });
        } catch (error) {
          scene.focus();
        }
      });

      return { button, scene };
    });

    document.body.append(nav);

    function setVisible(isVisible) {
      nav.classList.toggle("is-visible", isVisible);
      nav.setAttribute("aria-hidden", String(!isVisible));
      nav.inert = !isVisible;
    }

    function setCurrent(scene) {
      dots.forEach(({ button, scene: target }) => {
        const isCurrent = target === scene;
        button.classList.toggle("dot-nav__button--active", isCurrent);
        if (isCurrent) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
        button.style.removeProperty("--dot-color");
      });

      if (!scene) return;
      const currentButton = dots.find(({ scene: target }) => target === scene)?.button;
      if (currentButton) {
        const skyColor = getComputedStyle(document.documentElement)
          .getPropertyValue("--sky-top").trim();
        if (skyColor) currentButton.style.setProperty("--dot-color", skyColor);
      }
    }

    function closestSceneToCenter(candidates) {
      const center = window.innerHeight / 2;
      return candidates
        .map((scene) => ({
          scene,
          distance: Math.abs(scene.getBoundingClientRect().top
            + scene.getBoundingClientRect().height / 2 - center)
        }))
        .sort((first, second) => first.distance - second.distance)[0]?.scene || null;
    }

    if ("IntersectionObserver" in window) {
      let centralScenes = new Set();
      let sceneObserver = null;

      function observeCentralBand() {
        if (sceneObserver) sceneObserver.disconnect();
        centralScenes = new Set();
        const margin = Math.round(window.innerHeight * 0.45);
        sceneObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) centralScenes.add(entry.target);
            else centralScenes.delete(entry.target);
          });
          setCurrent(closestSceneToCenter(Array.from(centralScenes)));
        }, { rootMargin: `-${margin}px 0px -${margin}px 0px`, threshold: 0 });
        scenes.forEach((scene) => sceneObserver.observe(scene));
      }

      const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => setVisible(entry.isIntersecting));
      }, { threshold: 0 });

      observeCentralBand();
      timelineObserver.observe(timeline);
      window.addEventListener("resize", observeCentralBand, { passive: true });
    } else {
      const updateFallback = () => {
        const bounds = timeline.getBoundingClientRect();
        const isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
        setVisible(isVisible);
        if (isVisible) setCurrent(closestSceneToCenter(scenes));
      };
      window.addEventListener("scroll", updateFallback, { passive: true });
      window.addEventListener("resize", updateFallback, { passive: true });
      updateFallback();
    }
  } catch (error) {
    // Keep a feature error isolated from the page's existing scripts.
  }
})();
