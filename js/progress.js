(() => {
  const progress = document.querySelector(".page-progress__fill");
  const backToStart = document.querySelector(".back-to-start");
  if (!progress || !backToStart) return;

  let frameRequested = false;

  function updatePageProgress() {
    frameRequested = false;
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = pageHeight > 0 ? Math.min(1, window.scrollY / pageHeight) : 0;
    progress.style.transform = `scaleX(${ratio})`;
    backToStart.classList.toggle("is-visible", window.scrollY > window.innerHeight);
  }

  function requestUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updatePageProgress);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  requestUpdate();
})();
