(() => {
  const header = document.querySelector(".site-header");
  const links = document.querySelectorAll(".site-nav__link, .site-footer__nav a");
  const isMapPage = document.body.classList.contains("site-page--map");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  function setCurrentSection(sectionId) {
    // Một mục điều hướng bao trùm phần mở đầu, dòng thời gian, quiz và giới thiệu.
    const activeId = ["top", "timeline", "quiz", "gioi-thieu"].includes(sectionId)
      ? "top"
      : sectionId;

    links.forEach((link) => {
      const target = new URL(link.getAttribute("href"), window.location.href);
      const isCurrent = target.pathname === window.location.pathname
        && target.hash === `#${activeId}`;

      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  setCurrentSection(isMapPage ? "ban-do" : "top");

  const sections = document.querySelectorAll("#top, #timeline, #quiz, #gioi-thieu, #ban-do");
  if (!("IntersectionObserver" in window) || !sections.length) return;

  // Dải quan sát giữa màn hình giúp mục đang đọc được chọn ổn định khi cuộn.
  let sectionObserver;

  function observeSections() {
    if (sectionObserver) sectionObserver.disconnect();

    const height = window.innerHeight;
    const topMargin = Math.round(height * 0.35);
    const bottomMargin = Math.round(height * 0.55);

    sectionObserver = new IntersectionObserver((entries) => {
      const visibleSections = entries.filter((entry) => entry.isIntersecting);
      if (!visibleSections.length) return;

      const currentSection = visibleSections.reduce((current, entry) => (
        entry.intersectionRatio > current.intersectionRatio ? entry : current
      ));
      setCurrentSection(currentSection.target.id);
    }, { rootMargin: `-${topMargin}px 0px -${bottomMargin}px 0px` });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  observeSections();
  window.addEventListener("resize", observeSections, { passive: true });
})();
