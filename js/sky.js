(() => {
  const timeline = document.querySelector("#timeline");
  const scenes = Array.from(document.querySelectorAll("section.scene[data-hour]"));
  const root = document.documentElement;

  // Bảng nằm ở đây để mọi cảnh và hiệu ứng dùng chung một nguồn màu.
  const palettes = {
    h06: { hour: "06:00", top: "#FFB38A", bottom: "#FFD9B0", ink: "#3A1F12" },
    h0730: { hour: "07:30", top: "#FFC9A0", bottom: "#FFE8CC", ink: "#3A1F12" },
    h10: { hour: "10:00", top: "#8EC9E8", bottom: "#D9F0F7", ink: "#10303F" },
    h11: { hour: "11:00", top: "#A9DCEF", bottom: "#EAF8FB", ink: "#10303F" },
    h14: { hour: "14:00", top: "#F7D58A", bottom: "#FFEBC2", ink: "#3B2A00" },
    h17: { hour: "17:00", top: "#F58A4B", bottom: "#FFC38A", ink: "#3A1A08" },
    // Hạ nhẹ nền cuối ngày để chữ phụ pha từ mực sáng vẫn đủ tương phản.
    h19: { hour: "19:00", top: "#2F4363", bottom: "#465B7B", ink: "#F4F1E8" },
    h22: { hour: "22:00", top: "#0C1830", bottom: "#1B2D4F", ink: "#F4F1E8" }
  };
  const firstPalette = palettes.h06;
  const visibleRatios = new Map();
  let timelineIsVisible = timeline
    ? timeline.getBoundingClientRect().bottom > 0 && timeline.getBoundingClientRect().top < window.innerHeight
    : false;
  let currentScene = null;

  function setPalette(palette) {
    root.style.setProperty("--sky-top", palette.top);
    root.style.setProperty("--sky-bottom", palette.bottom);
    root.style.setProperty("--ink", palette.ink);
  }

  function publishScene(scene) {
    let detail = null;
    if (scene) {
      const title = scene.querySelector(".scene__title");
      detail = {
        id: scene.id,
        hour: scene.dataset.hour,
        index: scenes.indexOf(scene) + 1,
        title: title ? title.textContent.trim() : ""
      };
    }

    document.dispatchEvent(new CustomEvent("nau:scene", { detail }));
  }

  function resetScene() {
    currentScene = null;
    scenes.forEach((scene) => scene.classList.remove("is-active"));
    visibleRatios.clear();
    setPalette(firstPalette);
    root.dataset.scene = "h06";
    root.dataset.tone = "light";
    publishScene(null);
  }

  function activateScene(scene) {
    if (!scene || !timelineIsVisible) return;

    currentScene = scene;
    scenes.forEach((item) => item.classList.toggle("is-active", item === scene));
    setPalette(palettes[scene.id]);
    root.dataset.scene = scene.id;
    root.dataset.tone = scene.id === "h19" || scene.id === "h22" ? "dark" : "light";
    publishScene(scene);
  }

  // Lần đầu mở trang nằm ngoài dòng thời gian thì trả màu về buổi sớm.
  if (!timelineIsVisible) {
    resetScene();
  } else {
    setPalette(firstPalette);
    root.dataset.scene = "h06";
    root.dataset.tone = "light";
  }

  if (!("IntersectionObserver" in window) || !timeline || scenes.length === 0) return;

  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleRatios.set(entry.target, entry.intersectionRatio);
      } else {
        visibleRatios.delete(entry.target);
      }
    });

    if (!timelineIsVisible) return;

    const candidates = Array.from(visibleRatios.entries())
      .filter(([, ratio]) => ratio >= 0.55)
      .sort((a, b) => b[1] - a[1]);

    if (candidates.length > 0) activateScene(candidates[0][0]);
    else if (currentScene && !visibleRatios.has(currentScene)) currentScene = null;
  }, { threshold: 0.55 });

  scenes.forEach((scene) => sceneObserver.observe(scene));

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      timelineIsVisible = entry.isIntersecting;
      if (!timelineIsVisible) {
        resetScene();
        return;
      }

      const candidates = Array.from(visibleRatios.entries())
        .filter(([, ratio]) => ratio >= 0.55)
        .sort((a, b) => b[1] - a[1]);
      if (candidates.length > 0) activateScene(candidates[0][0]);
    });
  }, { threshold: 0 });

  timelineObserver.observe(timeline);
})();
