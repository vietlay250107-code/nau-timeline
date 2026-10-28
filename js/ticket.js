(() => {
  try {
    const form = document.querySelector("#ticket-form");
    const nameInput = document.querySelector("#ticket-name");
    const nameError = document.querySelector("#ticket-name-error");
    const hourSelect = document.querySelector("#ticket-hour");
    const messageInput = document.querySelector("#ticket-message");
    const messageCount = document.querySelector("#ticket-message-count");
    const canvas = document.querySelector("#ticket-canvas");
    const downloadButton = document.querySelector("#ticket-download");
    const shareButton = document.querySelector("#ticket-share");
    const downloadHint = document.querySelector("#ticket-download-hint");
    const status = document.querySelector("#ticket-status");

    if (!form || !nameInput || !nameError || !hourSelect || !messageInput
      || !messageCount || !canvas || !downloadButton || !downloadHint || !status) return;

    let context = null;
    try {
      context = canvas.getContext("2d");
    } catch (error) {
      context = null;
    }

    const width = 1080;
    const height = 1350;
    const logoSource = "assets/logo/logo-sm.png";
    const ticketCodes = new Map();
    const imagePromises = new Map();
    let touchedName = false;
    let renderTimer = null;
    let renderVersion = 0;
    let renderReady = false;

    // Đồng bộ với palettes trong js/sky.js; sky.js chưa công khai bảng màu ra DOM.
    const skyPalettes = {
      h06: { top: "#FFB38A", bottom: "#FFD9B0" },
      h0730: { top: "#FFC9A0", bottom: "#FFE8CC" },
      h10: { top: "#8EC9E8", bottom: "#D9F0F7" },
      h11: { top: "#A9DCEF", bottom: "#EAF8FB" },
      h14: { top: "#F7D58A", bottom: "#FFEBC2" },
      h17: { top: "#F58A4B", bottom: "#FFC38A" },
      h19: { top: "#2F4363", bottom: "#465B7B" },
      h22: { top: "#0C1830", bottom: "#1B2D4F" }
    };

    const sceneRecords = Array.from(document.querySelectorAll(".scene[data-hour]"))
      .map((scene, index) => {
        const title = scene.querySelector(".scene__title");
        const photo = scene.querySelector("img.scene__photo");
        const hour = scene.dataset.hour || "";
        if (!hour || !title) return null;
        return {
          key: scene.id || `scene-${index + 1}`,
          id: scene.id,
          hour,
          title: title.textContent.trim(),
          photoSource: photo ? (photo.currentSrc || photo.src || photo.getAttribute("src")) : ""
        };
      })
      .filter(Boolean);

    function setStatus(message) {
      status.textContent = message;
    }

    function selectedScene() {
      return sceneRecords.find((scene) => scene.key === hourSelect.value) || sceneRecords[0] || null;
    }

    function makeRandomCode() {
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const values = new Uint32Array(4);
      if (window.crypto && typeof window.crypto.getRandomValues === "function") {
        window.crypto.getRandomValues(values);
      } else {
        for (let index = 0; index < values.length; index += 1) {
          values[index] = Math.floor(Math.random() * 0xffffffff);
        }
      }
      return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
    }

    function getTicketCode(scene) {
      if (!scene) return "NAU-0000-XXXX";
      if (!ticketCodes.has(scene.key)) {
        ticketCodes.set(scene.key, `NAU-${scene.hour.replace(":", "")}-${makeRandomCode()}`);
      }
      return ticketCodes.get(scene.key);
    }

    function updateNameState(showError = touchedName) {
      const trimmedName = nameInput.value.trim();
      const valid = trimmedName.length > 0 && trimmedName.length <= 30;
      const shouldShowError = showError && !valid;
      nameInput.setAttribute("aria-invalid", String(shouldShowError));
      if (shouldShowError) {
        nameError.textContent = trimmedName.length === 0
          ? "Bạn hãy nhập tên để tạo vé nhé."
          : "Tên chỉ nên dài tối đa 30 ký tự.";
      } else {
        nameError.textContent = "";
      }
      downloadButton.disabled = !valid || !context || !renderReady;
      if (shareButton) shareButton.disabled = !valid || !context || !renderReady;
      downloadHint.textContent = valid ? "" : "Nhập tên để nhận vé.";
      return valid;
    }

    function updateMessageCount() {
      messageCount.textContent = `${messageInput.value.length}/60 ký tự`;
    }

    function loadImage(source) {
      if (!source || typeof window.Image !== "function") return Promise.resolve(null);
      if (imagePromises.has(source)) return imagePromises.get(source);

      const promise = new Promise((resolve) => {
        const image = new window.Image();
        image.decoding = "async";
        const finish = () => resolve(image.naturalWidth > 0 ? image : null);
        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", () => resolve(null), { once: true });
        image.src = source;
        if (image.complete) window.queueMicrotask(finish);
      });
      imagePromises.set(source, promise);
      return promise;
    }

    function loadFonts() {
      if (!document.fonts || typeof document.fonts.load !== "function") return Promise.resolve();
      const requests = [
        '700 80px "Be Vietnam Pro"',
        '400 30px "Be Vietnam Pro"',
        '500 24px "Roboto Mono"'
      ];
      try {
        return Promise.all(requests.map((font) => Promise.resolve(document.fonts.load(font)).catch(() => [])));
      } catch (error) {
        return Promise.resolve();
      }
    }

    function fitFontSize(targetContext, text, family, weight, maxWidth, startSize, minSize) {
      let size = startSize;
      while (size > minSize) {
        targetContext.font = `${weight} ${size}px "${family}", sans-serif`;
        if (targetContext.measureText(text).width <= maxWidth) break;
        size -= 2;
      }
      targetContext.font = `${weight} ${size}px "${family}", sans-serif`;
      return size;
    }

    function graphemes(value) {
      if (window.Intl && typeof window.Intl.Segmenter === "function") {
        const segmenter = new window.Intl.Segmenter("vi", { granularity: "grapheme" });
        return Array.from(segmenter.segment(value), (part) => part.segment);
      }
      return Array.from(value);
    }

    function wrapText(targetContext, text, maxWidth, maxLines, lineHeight) {
      const words = text.trim().split(/\s+/u).filter(Boolean);
      if (words.length === 0) return [];

      const lines = [];
      let line = "";
      words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (targetContext.measureText(candidate).width <= maxWidth) {
          line = candidate;
          return;
        }

        if (line) lines.push(line);
        line = "";
        if (targetContext.measureText(word).width <= maxWidth) {
          line = word;
          return;
        }

        graphemes(word).forEach((character) => {
          const part = line + character;
          if (line && targetContext.measureText(part).width > maxWidth) {
            lines.push(line);
            line = character;
          } else {
            line = part;
          }
        });
      });
      if (line) lines.push(line);

      if (lines.length > maxLines) {
        lines.length = maxLines;
        let lastLine = lines[maxLines - 1];
        while (lastLine && targetContext.measureText(`${lastLine}…`).width > maxWidth) {
          lastLine = graphemes(lastLine).slice(0, -1).join("");
        }
        lines[maxLines - 1] = `${lastLine}…`;
      }
      return lines.slice(0, maxLines).map((value) => ({ value, lineHeight }));
    }

    function drawCover(targetContext, image, x, y, boxWidth, boxHeight) {
      if (!image || image.naturalWidth === 0 || image.naturalHeight === 0) return false;
      const scale = Math.max(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight);
      const sourceWidth = boxWidth / scale;
      const sourceHeight = boxHeight / scale;
      const sourceX = (image.naturalWidth - sourceWidth) / 2;
      const sourceY = (image.naturalHeight - sourceHeight) / 2;
      targetContext.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, boxWidth, boxHeight);
      return true;
    }

    function drawBarcode(targetContext, code, x, y, boxWidth, boxHeight) {
      const source = code || "NAU";
      const bars = [];
      Array.from(source).forEach((character) => {
        const value = character.charCodeAt(0);
        for (let bit = 0; bit < 7; bit += 1) {
          bars.push((value >> bit) & 1 ? 3 : 1);
          bars.push(1);
        }
      });
      const naturalWidth = bars.reduce((total, barWidth) => total + barWidth, 0);
      const scale = Math.min(1.8, boxWidth / naturalWidth);
      let offset = x + (boxWidth - naturalWidth * scale) / 2;
      targetContext.fillStyle = "#3a1f12";
      bars.forEach((barWidth, index) => {
        if (index % 2 === 0) targetContext.fillRect(offset, y, Math.max(1, barWidth * scale), boxHeight);
        offset += barWidth * scale;
      });
    }

    function formattedDate() {
      const now = new Date();
      if (typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function") {
        const parts = new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }).formatToParts(now);
        const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
        if (values.day && values.month && values.year) {
          return `${values.day}/${values.month}/${values.year}`;
        }
      }
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}/${now.getFullYear()}`;
    }

    function drawPlaceholder(targetContext, x, y, boxWidth, boxHeight, fill, label) {
      targetContext.fillStyle = fill;
      targetContext.fillRect(x, y, boxWidth, boxHeight);
      targetContext.strokeStyle = "#ae1f24";
      targetContext.lineWidth = 2;
      targetContext.setLineDash([8, 8]);
      targetContext.strokeRect(x + 1, y + 1, boxWidth - 2, boxHeight - 2);
      targetContext.setLineDash([]);
      targetContext.fillStyle = "#3a1f12";
      targetContext.font = '700 30px "Be Vietnam Pro", sans-serif';
      targetContext.textAlign = "center";
      targetContext.textBaseline = "middle";
      targetContext.fillText(label, x + boxWidth / 2, y + boxHeight / 2, boxWidth - 40);
      targetContext.textAlign = "left";
      targetContext.textBaseline = "alphabetic";
    }

    function drawTicket(scene, name, message, code, palette, logo, photo) {
      if (!context) return false;
      context.clearRect(0, 0, width, height);

      const skyGradient = context.createLinearGradient(0, 0, 0, height);
      skyGradient.addColorStop(0, palette.top);
      skyGradient.addColorStop(1, palette.bottom);
      context.fillStyle = skyGradient;
      context.fillRect(0, 0, width, height);

      const card = { x: 48, y: 48, width: 984, height: 1254 };
      context.fillStyle = "#fffdf7";
      context.fillRect(card.x, card.y, card.width, card.height);
      context.strokeStyle = "#bba98a";
      context.lineWidth = 2;
      context.setLineDash([10, 10]);
      context.strokeRect(card.x + 1, card.y + 1, card.width - 2, card.height - 2);
      context.setLineDash([]);

      const logoX = 104;
      const logoY = 98;
      const logoWidth = 176;
      const logoHeight = 73;
      if (logo) {
        context.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
      } else {
        drawPlaceholder(context, logoX, logoY, logoWidth, logoHeight, palette.bottom, "NAU");
      }

      context.fillStyle = "#8f1a1e";
      context.textAlign = "right";
      context.textBaseline = "alphabetic";
      context.font = '700 36px "Be Vietnam Pro", sans-serif';
      context.fillText("VÉ NGÀY HỌC", 976, 150);
      context.font = '500 22px "Roboto Mono", monospace';
      context.fillStyle = "#5a4034";
      context.fillText("NAU TIMELINE · 06:00 — 22:00", 976, 186);

      context.textAlign = "left";
      context.fillStyle = "#8f1a1e";
      context.font = '500 22px "Roboto Mono", monospace';
      context.fillText("VÉ CỦA RIÊNG BẠN", 104, 260);

      const displayName = name || "Tên của bạn";
      const nameSize = fitFontSize(context, displayName, "Be Vietnam Pro", 700, 870, 86, 48);
      context.fillStyle = name ? "#3a1f12" : "#857565";
      context.fillText(displayName, 104, 344, 870);
      context.fillStyle = "#ae1f24";
      context.fillRect(104, 371, Math.min(230, nameSize * 2.6), 5);

      const sceneLabel = scene ? `${scene.hour} · ${scene.title}` : "Chưa có mốc giờ";
      const sceneSize = fitFontSize(context, sceneLabel, "Be Vietnam Pro", 700, 872, 44, 30);
      context.fillStyle = "#3a1f12";
      context.fillText(sceneLabel, 104, 425, 872);

      const photoBox = { x: 104, y: 458, width: 872, height: 440 };
      if (!drawCover(context, photo, photoBox.x, photoBox.y, photoBox.width, photoBox.height)) {
        drawPlaceholder(context, photoBox.x, photoBox.y, photoBox.width, photoBox.height, palette.top, "Ảnh mốc giờ chưa tải được");
      }
      context.strokeStyle = "#e8ddc7";
      context.lineWidth = 2;
      context.strokeRect(photoBox.x, photoBox.y, photoBox.width, photoBox.height);

      context.fillStyle = "#8f1a1e";
      context.font = '500 20px "Roboto Mono", monospace';
      context.fillText("LỜI NHẮN GỬI CUỐI NGÀY", 104, 944);
      context.fillStyle = "#3a1f12";
      context.font = '400 29px "Be Vietnam Pro", sans-serif';
      const messageLines = wrapText(context, message || "Một ngày ở NAU, một kỷ niệm để nhớ.", 850, 3, 42);
      messageLines.forEach((line, index) => {
        context.fillText(line.value, 104, 987 + index * line.lineHeight, 850);
      });

      const perforationY = 1092;
      context.fillStyle = skyGradient;
      context.beginPath();
      context.arc(card.x, perforationY, 27, 0, Math.PI * 2);
      context.arc(card.x + card.width, perforationY, 27, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#bba98a";
      context.lineWidth = 2;
      context.setLineDash([9, 9]);
      context.beginPath();
      context.moveTo(card.x + 30, perforationY);
      context.lineTo(card.x + card.width - 30, perforationY);
      context.stroke();
      context.setLineDash([]);

      drawBarcode(context, code, 344, 1142, 392, 67);
      context.fillStyle = "#3a1f12";
      context.font = '500 22px "Roboto Mono", monospace';
      context.textAlign = "left";
      context.fillText(code, 104, 1260);
      context.textAlign = "right";
      context.fillText(formattedDate(), 976, 1260);
      context.textAlign = "left";
      context.textBaseline = "alphabetic";

      canvas.setAttribute("aria-label", `Vé ngày học của ${name || "bạn"}, mốc ${sceneLabel}, mã ${code}, ngày ${formattedDate()}.`);
      return true;
    }

    function readPalette(scene) {
      if (scene && skyPalettes[scene.id]) return skyPalettes[scene.id];
      const styles = getComputedStyle(document.documentElement);
      return {
        top: styles.getPropertyValue("--sky-top").trim() || "#FFB38A",
        bottom: styles.getPropertyValue("--sky-bottom").trim() || "#FFD9B0"
      };
    }

    async function renderTicket(version) {
      const scene = selectedScene();
      const name = nameInput.value.trim();
      const message = messageInput.value.trim();
      const code = getTicketCode(scene);
      const palette = readPalette(scene);
      const [, logo, photo] = await Promise.all([
        loadFonts(),
        loadImage(logoSource),
        loadImage(scene ? scene.photoSource : "")
      ]);
      if (version !== renderVersion) return;
      if (!context) {
        setStatus("Trình duyệt này chưa hỗ trợ canvas để tạo vé.");
        updateNameState();
        return;
      }

      try {
        drawTicket(scene, name, message, code, palette, logo, photo);
        const problems = [];
        if (!logo) problems.push("Logo NAU chưa tải được, vé đang dùng ô thay thế.");
        if (scene && !photo) problems.push("Ảnh mốc giờ chưa tải được, vé đang dùng ô màu thay thế.");
        setStatus(problems.join(" "));
        renderReady = true;
        updateNameState();
      } catch (error) {
        renderReady = false;
        updateNameState();
        setStatus("Chưa thể vẽ vé. Hãy thử tải lại trang.");
      }
    }

    function scheduleRender() {
      if (renderTimer !== null) window.clearTimeout(renderTimer);
      const version = ++renderVersion;
      renderReady = false;
      updateNameState();
      if (nameInput.value.trim()) downloadHint.textContent = "Đang cập nhật vé…";
      renderTimer = window.setTimeout(() => {
        renderTimer = null;
        renderTicket(version).catch(() => setStatus("Chưa thể vẽ vé. Hãy thử tải lại trang."));
      }, 150);
    }

    function populateHours() {
      sceneRecords.forEach((scene, index) => {
        const option = document.createElement("option");
        option.value = scene.key;
        option.textContent = `${scene.hour} · ${scene.title}`;
        if (index === 0) option.selected = true;
        hourSelect.append(option);
      });
      if (sceneRecords.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Chưa có mốc giờ";
        hourSelect.append(option);
        hourSelect.disabled = true;
        setStatus("Chưa tìm thấy mốc giờ để tạo vé.");
      } else {
        hourSelect.value = sceneRecords[0].key;
      }
    }

    function supportsFileSharing() {
      if (!shareButton || !navigator.share || !navigator.canShare || typeof File !== "function") return false;
      try {
        const sample = new File([new Uint8Array([0])], "nau-ve.png", { type: "image/png" });
        return navigator.canShare({ files: [sample] });
      } catch (error) {
        return false;
      }
    }

    function createPng(callback) {
      if (!context || typeof canvas.toBlob !== "function") {
        setStatus("Không thể xuất ảnh PNG trên trình duyệt này.");
        callback(null);
        return;
      }
      try {
        canvas.toBlob((blob) => callback(blob), "image/png");
      } catch (error) {
        callback(null);
      }
    }

    function filenameFor(name) {
      const normalized = name.trim().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return `nau-ve-${normalized || "ban"}.png`;
    }

    populateHours();
    updateNameState(false);
    updateMessageCount();
    if (shareButton) shareButton.hidden = !supportsFileSharing();

    nameInput.addEventListener("input", () => {
      if (touchedName) updateNameState(true);
      else updateNameState(false);
      scheduleRender();
    });
    nameInput.addEventListener("blur", () => {
      touchedName = true;
      updateNameState(true);
    });
    hourSelect.addEventListener("change", () => {
      const scene = selectedScene();
      if (scene) getTicketCode(scene);
      scheduleRender();
    });
    messageInput.addEventListener("input", () => {
      updateMessageCount();
      scheduleRender();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      touchedName = true;
      if (!updateNameState(true)) nameInput.focus();
      else scheduleRender();
    });
    downloadButton.addEventListener("click", () => {
      touchedName = true;
      if (!updateNameState(true)) {
        nameInput.focus();
        return;
      }
      createPng((blob) => {
        if (!blob) {
          setStatus("Chưa tạo được ảnh vé. Bạn thử lại nhé.");
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filenameFor(nameInput.value);
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        setStatus("Vé đã tải về máy của bạn.");
      });
    });
    if (shareButton) {
      shareButton.addEventListener("click", () => {
        touchedName = true;
        if (!updateNameState(true)) {
          nameInput.focus();
          return;
        }
        createPng(async (blob) => {
          if (!blob) {
            setStatus("Chưa tạo được ảnh vé để chia sẻ.");
            return;
          }
          try {
            const file = new File([blob], filenameFor(nameInput.value), { type: "image/png" });
            if (!navigator.canShare({ files: [file] })) {
              shareButton.hidden = true;
              setStatus("Trình duyệt này chưa hỗ trợ chia sẻ ảnh vé.");
              return;
            }
            await navigator.share({ files: [file], title: "Vé ngày học NAU" });
            setStatus("Đã mở tuỳ chọn chia sẻ vé.");
          } catch (error) {
            if (error && error.name !== "AbortError") setStatus("Chưa thể chia sẻ vé lúc này.");
          }
        });
      });
    }

    scheduleRender();
  } catch (error) {
    // Keep a feature error isolated from the page's existing scripts.
  }
})();
