(() => {
  const digits = Array.from(document.querySelectorAll("[data-clock-digit]"));
  const announcement = document.querySelector("#scene-announcement");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pendingTimers = new Map();

  if (digits.length !== 4) return;

  function setDigit(digit, value) {
    const previousTimers = pendingTimers.get(digit) || [];
    previousTimers.forEach((timer) => window.clearTimeout(timer));
    pendingTimers.delete(digit);

    if (digit.textContent === value) return;

    if (reduceMotion.matches) {
      digit.textContent = value;
      digit.classList.remove("is-flipping");
      return;
    }

    digit.classList.remove("is-flipping");
    void digit.offsetWidth;
    digit.classList.add("is-flipping");

    // Số đổi ở nửa vòng lật để khớp với mặt sau của ô đồng hồ.
    const changeTimer = window.setTimeout(() => {
      digit.textContent = value;
    }, 200);
    const finishTimer = window.setTimeout(() => {
      digit.classList.remove("is-flipping");
      pendingTimers.delete(digit);
    }, 400);
    pendingTimers.set(digit, [changeTimer, finishTimer]);
  }

  function showScene(event) {
    const scene = event.detail;
    if (!scene) {
      if (announcement) announcement.textContent = "";
      return;
    }

    const values = scene.hour.replace(":", "").split("");
    digits.forEach((digit, index) => setDigit(digit, values[index]));
    if (announcement) announcement.textContent = `Mốc ${scene.hour}, ${scene.title}.`;
  }

  document.addEventListener("nau:scene", showScene);
})();
