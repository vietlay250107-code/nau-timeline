(() => {
  const form = document.querySelector("#quiz-form");
  const questionText = document.querySelector("#quiz-question");
  const optionsBox = document.querySelector("#quiz-options");
  const stepText = document.querySelector("#quiz-step");
  const feedback = document.querySelector("#quiz-feedback");
  const submitButton = document.querySelector("#quiz-submit");
  const bestText = document.querySelector("#quiz-best");
  const bestModalText = document.querySelector("#quiz-best-modal");
  const scoreText = document.querySelector("#quiz-result-score");
  const messageText = document.querySelector("#quiz-result-message");
  const modalElement = document.querySelector("#quiz-result");
  const retryButton = document.querySelector("#quiz-retry");
  const storageKey = "nau-quiz-best";

  const questions = [
    {
      question: "Mốc 07:30 diễn ra ở đâu?",
      options: ["Cổng trường", "Phòng học", "Thư viện"],
      answer: 1
    },
    {
      question: "Ở mốc 11:00, mọi người trước quầy căng tin ngó xem điều gì?",
      options: ["Hôm nay có món gì", "Đi chơi không", "Học thôi nào"],
      answer: 0
    },
    {
      question: "Tiêu đề của mốc 22:00 là gì?",
      options: ["Ôn bài", "Căng tin", "Đêm yên tĩnh"],
      answer: 2
    }
  ];

  if (!form || !questionText || !optionsBox || !submitButton) return;

  let currentIndex = 0;
  let score = 0;
  let answered = false;
  let resultTimer = null;
  let bestScore = readBestScore();
  const modal = window.bootstrap && window.bootstrap.Modal && modalElement
    ? window.bootstrap.Modal.getOrCreateInstance(modalElement)
    : null;

  function readBestScore() {
    try {
      const savedScore = Number.parseInt(window.localStorage.getItem(storageKey), 10);
      return Number.isInteger(savedScore) && savedScore >= 0 && savedScore <= questions.length
        ? savedScore
        : 0;
    } catch (error) {
      return 0;
    }
  }

  function showBestScore() {
    const label = `Điểm cao nhất: ${bestScore}/${questions.length}`;
    if (bestText) bestText.textContent = label;
    if (bestModalText) bestModalText.textContent = label;
  }

  function renderQuestion() {
    const question = questions[currentIndex];
    answered = false;
    questionText.textContent = question.question;
    stepText.textContent = `Câu ${currentIndex + 1}/${questions.length}`;
    while (optionsBox.firstChild) optionsBox.removeChild(optionsBox.firstChild);
    feedback.textContent = "";
    feedback.classList.remove("is-correct", "is-wrong");
    submitButton.textContent = "Kiểm tra";
    submitButton.disabled = false;

    question.options.forEach((optionText, optionIndex) => {
      const option = document.createElement("div");
      const input = document.createElement("input");
      const label = document.createElement("label");
      const inputId = `quiz-answer-${currentIndex}-${optionIndex}`;

      option.className = "quiz__option";
      input.className = "quiz__radio";
      input.type = "radio";
      input.name = "quiz-answer";
      input.id = inputId;
      input.value = String(optionIndex);
      label.className = "quiz__option-label";
      label.htmlFor = inputId;
      label.textContent = optionText;

      option.append(input, label);
      optionsBox.append(option);
    });
  }

  function showAnswer() {
    const selected = form.querySelector('input[name="quiz-answer"]:checked');
    if (!selected) {
      feedback.textContent = "Hãy chọn một đáp án trước khi kiểm tra.";
      feedback.classList.remove("is-correct");
      feedback.classList.add("is-wrong");
      return;
    }

    const isCorrect = Number(selected.value) === questions[currentIndex].answer;
    answered = true;
    if (isCorrect) score += 1;
    feedback.textContent = isCorrect ? "Đúng! Chi tiết này có trong dòng thời gian." : "Chưa đúng. Hãy đọc lại chi tiết của mốc giờ.";
    feedback.classList.toggle("is-correct", isCorrect);
    feedback.classList.toggle("is-wrong", !isCorrect);
    form.querySelectorAll('input[name="quiz-answer"]').forEach((input) => {
      input.disabled = true;
    });
    if (currentIndex === questions.length - 1) {
      submitButton.textContent = "Đã hoàn thành";
      submitButton.disabled = true;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultTimer = window.setTimeout(showResults, reduceMotion ? 0 : 700);
    } else {
      submitButton.textContent = "Câu tiếp theo";
    }
  }

  function resultMessage() {
    if (score === questions.length) return "Bạn nhớ rất rõ những chi tiết trong một ngày ở NAU.";
    if (score > 0) return "Bạn đã nhớ được một phần hành trình. Có thể đọc lại các mốc rồi thử lần nữa.";
    return "Hãy đi lại dòng thời gian từ 06:00 và chú ý những chi tiết nhỏ.";
  }

  function saveBestScore() {
    if (score > bestScore) {
      bestScore = score;
      try {
        window.localStorage.setItem(storageKey, String(bestScore));
      } catch (error) {
      }
    }
  }

  function showResults() {
    if (resultTimer !== null) {
      window.clearTimeout(resultTimer);
      resultTimer = null;
    }

    saveBestScore();
    showBestScore();
    scoreText.textContent = `Bạn trả lời đúng ${score}/${questions.length} câu.`;
    messageText.textContent = resultMessage();
    document.dispatchEvent(new CustomEvent("nau:quiz-result", {
      detail: { score, best: bestScore }
    }));

    if (modal) modal.show();
    else feedback.textContent = `${scoreText.textContent} ${messageText.textContent}`;
  }

  function resetQuiz() {
    currentIndex = 0;
    score = 0;
    renderQuestion();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!answered) {
      showAnswer();
      return;
    }

    if (currentIndex === questions.length - 1) {
      showResults();
      return;
    }

    currentIndex += 1;
    renderQuestion();
  });

  if (retryButton) retryButton.addEventListener("click", resetQuiz);
  if (modalElement) modalElement.addEventListener("hidden.bs.modal", resetQuiz);

  showBestScore();
  renderQuestion();
})();
