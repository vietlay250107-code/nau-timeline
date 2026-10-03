(() => {
  const items = document.querySelectorAll(".about__reveal");
  const process = document.querySelector(".about__process");
  const processSteps = process ? [...process.querySelectorAll(".about__process-step")] : [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    processSteps.forEach((step) => step.classList.add("is-reached"));
    if (process) process.style.setProperty("--process-progress", "1");
    return;
  }

  if (items.length) {
    document.documentElement.classList.add("has-reveal");
    const revealObserver = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    items.forEach((item) => revealObserver.observe(item));
  }

  if (process && processSteps.length) {
    // Giữ mốc cao nhất đã xem để đường tiến trình không lùi khi cuộn ngược lên.
    let furthestStep = -1;
    const processObserver = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const stepIndex = processSteps.indexOf(entry.target);
        furthestStep = Math.max(furthestStep, stepIndex);
        entry.target.classList.add("is-reached");
        process.style.setProperty("--process-progress", String((furthestStep + 1) / processSteps.length));
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -12% 0px" });

    processSteps.forEach((step) => processObserver.observe(step));
  }
})();
