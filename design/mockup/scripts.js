const timeSelect = document.querySelector("#time-select");
const photoSelect = document.querySelector("#photo-select");

if (timeSelect && photoSelect) {
  const photoCards = Array.from(document.querySelectorAll(".photo-card[data-time][data-photo-id]"));

  timeSelect.addEventListener("change", () => {
    const selectedTime = timeSelect.value;
    photoSelect.replaceChildren(new Option(selectedTime ? "Chọn ảnh" : "Chọn mốc trước", ""));
    photoSelect.disabled = !selectedTime;

    photoCards
      .filter((card) => card.dataset.time === selectedTime)
      .forEach((card) => {
        const number = card.dataset.photoId.split("-")[1];
        photoSelect.add(new Option(`Ảnh ${number}`, card.dataset.photoId));
      });
  });
}

const detailImage = document.querySelector("#detail-image");

if (detailImage) {
  const counts = { "0630": 7, "0900": 3, "1200": 1, "1530": 2, "1900": 5 };
  const requestedId = new URLSearchParams(window.location.search).get("id") || "0630-01";
  const parts = /^(\d{4})-(\d{2})$/.exec(requestedId);
  const folder = parts?.[1];
  const number = parts?.[2];

  if (folder && number && Number(number) >= 1 && Number(number) <= counts[folder]) {
    const time = `${folder.slice(0, 2)}:${folder.slice(2)}`;
    detailImage.src = `../../assets/img/su-kien/${folder}/${number}.jpg`;
    detailImage.alt = `[Alt ảnh ${time} số ${number} – placeholder]`;
    document.querySelector("#detail-title").textContent = `[Tiêu đề giới thiệu ảnh ${time}/${number} – placeholder]`;
    document.querySelector("#detail-intro").textContent = `[Giới thiệu chi tiết ảnh ${time}/${number} – placeholder]`;
  }
}
