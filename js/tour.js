(() => {
  try {
    const button = document.querySelector("#tour-control");
    const status = document.querySelector("#tour-status");
    const notice = document.querySelector("#tour-notice");
    const hero = document.querySelector("#top");
    const timeline = document.querySelector("#timeline");
    if (!button || !status || !hero || !timeline) return;

    const reduceMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : { matches: false };
    const stepDuration = 4000;
    let running = false;
    let currentIndex = -1;
    let stepTimer = null;
    let noticeTimer = null;

    function scenes() {
      return Array.from(document.querySelectorAll(".scene[data-hour]"));
    }

    function setStatus(message) {
      status.textContent = message;
    }

    function setButtonState(isRunning) {
      button.setAttribute("aria-pressed", String(isRunning));
      button.setAttribute("aria-label", isRunning
        ? "Tạm dừng dẫn tour tự động"
        : "Bắt đầu dẫn tour tự động qua tám mốc giờ");
      button.textContent = isRunning ? "⏸ Tạm dừng" : "▶ Dẫn tour";
    }

    function clearNotice() {
      if (noticeTimer !== null) window.clearTimeout(noticeTimer);
      noticeTimer = null;
      if (notice) notice.hidden = true;
    }

    function stopTour(message = "Đã dừng dẫn tour", showEndNotice = false) {
      if (stepTimer !== null) window.clearTimeout(stepTimer);
      stepTimer = null;
      running = false;
      currentIndex = -1;
      setButtonState(false);
      setStatus(message);
      clearNotice();

      if (showEndNotice && notice) {
        notice.hidden = false;
        noticeTimer = window.setTimeout(() => {
          notice.hidden = true;
          noticeTimer = null;
        }, 3600);
      }
    }

    function nearestSceneIndex(items) {
      const center = window.innerHeight / 2;
      const heroBounds = hero.getBoundingClientRect();
      if (heroBounds.top < center && heroBounds.bottom > center) return 0;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      items.forEach((scene, index) => {
        const bounds = scene.getBoundingClientRect();
        const distance = Math.abs(bounds.top + bounds.height / 2 - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    }

    function showScene(index) {
      if (!running) return;
      const items = scenes();
      const scene = items[index];
      if (!scene) {
        stopTour();
        return;
      }

      currentIndex = index;
      const title = scene.querySelector(".scene__title");
      const hour = scene.dataset.hour || "Mốc giờ";
      const place = title ? title.textContent.trim() : "";
      setStatus(`Đang dẫn tour: ${hour}${place ? ` ${place}` : ""}`);
      scene.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "center"
      });

      stepTimer = window.setTimeout(() => {
        if (currentIndex >= items.length - 1) {
          stopTour("Hết một ngày ở NAU", true);
          return;
        }
        showScene(currentIndex + 1);
      }, stepDuration);
    }

    function startTour() {
      const items = scenes();
      if (items.length === 0) return;
      clearNotice();
      running = true;
      setButtonState(true);
      showScene(nearestSceneIndex(items));
    }

    function handleManualInput(event) {
      if (!running) return;
      if (event.type === "pointerdown" && button.contains(event.target)) return;
      if (event.type === "keydown") {
        const manualKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", " ", "Space", "Spacebar"];
        if (!manualKeys.includes(event.key)) return;
        if (button.contains(event.target) && [" ", "Space", "Spacebar"].includes(event.key)) return;
      }
      stopTour();
    }

    function setButtonVisibility(isNearTimeline) {
      button.hidden = !isNearTimeline;
    }

    setButtonState(false);
    setButtonVisibility(false);
    button.addEventListener("click", () => {
      if (running) stopTour();
      else startTour();
    });

    window.addEventListener("wheel", handleManualInput, { passive: true });
    window.addEventListener("touchstart", handleManualInput, { passive: true });
    window.addEventListener("touchmove", handleManualInput, { passive: true });
    window.addEventListener("pointerdown", handleManualInput, { capture: true });
    window.addEventListener("keydown", handleManualInput, true);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && running) stopTour();
    });

    if ("IntersectionObserver" in window) {
      const nearRegions = new Set();
      const regionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) nearRegions.add(entry.target);
          else nearRegions.delete(entry.target);
        });
        setButtonVisibility(nearRegions.size > 0);
      }, { rootMargin: "120px 0px 120px 0px", threshold: 0 });
      regionObserver.observe(hero);
      regionObserver.observe(timeline);
    } else {
      const updateVisibility = () => {
        const inRange = (element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.bottom > -120 && bounds.top < window.innerHeight + 120;
        };
        setButtonVisibility(inRange(hero) || inRange(timeline));
      };
      window.addEventListener("scroll", updateVisibility, { passive: true });
      window.addEventListener("resize", updateVisibility, { passive: true });
      updateVisibility();
    }
  } catch (error) {
    // Keep a feature error isolated from the page's existing scripts.
  }
})();
