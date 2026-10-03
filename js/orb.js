(() => {
  const timeline = document.querySelector("#timeline");
  const orbit = document.querySelector(".day-orbit");
  if (!timeline || !orbit) return;

  const sun = orbit.querySelector(".day-orbit__sun");
  const moon = orbit.querySelector(".day-orbit__moon");
  let frameRequested = false;

  function clamp(value) {
    return Math.min(1, Math.max(0, value));
  }

  function updateOrbit() {
    frameRequested = false;
    const timelineTop = timeline.getBoundingClientRect().top + window.scrollY;
    const travelDistance = Math.max(1, timeline.offsetHeight - window.innerHeight);
    const progress = clamp((window.scrollY - timelineTop) / travelDistance);
    const sunProgress = clamp(progress / 0.75);
    const moonProgress = clamp((progress - 0.70) / 0.30);
    const sunLift = Math.sin(sunProgress * Math.PI) * 46;
    const moonLift = Math.sin(moonProgress * Math.PI) * 42;

    sun.style.setProperty("--orbit-x", `${8 + sunProgress * 84}%`);
    sun.style.setProperty("--orbit-lift", `${sunLift}%`);
    moon.style.setProperty("--orbit-x", `${8 + moonProgress * 84}%`);
    moon.style.setProperty("--orbit-lift", `${moonLift}%`);
    moon.style.opacity = String(moonProgress);
  }

  function requestUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateOrbit);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  requestUpdate();
})();
