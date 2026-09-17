const resume = document.querySelector("#resume");
const languageButtons = document.querySelectorAll("[data-language]");
const printButton = document.querySelector("[data-print]");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector(".lightbox-image");
const lightboxTitle = lightbox.querySelector("#lightbox-title");
const lightboxText = lightbox.querySelector("[data-lightbox-text]");
const lightboxCounter = lightbox.querySelector("[data-lightbox-counter]");

const languageMeta = {
  en: { lang: "en", title: "Rex Ying Resume", close: "Close", previous: "Previous image", next: "Next image" },
  zh: { lang: "zh-Hant", title: "Rex Ying 履歷", close: "關閉", previous: "上一張", next: "下一張" },
  ja: { lang: "ja", title: "Rex Ying 履歴書", close: "閉じる", previous: "前の画像", next: "次の画像" },
};

const revealSelector = [
  ".hero",
  ".summary",
  ".experience",
  ".projects > .section-heading",
  ".project",
  ".additional-work > .section-heading",
  ".mini-project-list article",
  ".bottom-grid > section",
].join(", ");

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(revealEntries, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 })
    : null;

let lightboxIndex = 0;

function renderResume(language) {
  const template = document.querySelector(`#resume-${language}`);

  if (!template) return;

  resume.replaceChildren(template.content.cloneNode(true));
  const meta = languageMeta[language];

  document.documentElement.lang = meta.lang;
  document.title = meta.title;
  localStorage.setItem("resume-language", language);

  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });

  lightbox.querySelector("[data-lightbox-close]").setAttribute("aria-label", meta.close);
  lightbox.querySelector('[data-lightbox-step="-1"]').setAttribute("aria-label", meta.previous);
  lightbox.querySelector('[data-lightbox-step="1"]').setAttribute("aria-label", meta.next);

  observeReveals();
}

function observeReveals() {
  if (!revealObserver) return;

  revealObserver.disconnect();
  resume.querySelectorAll(revealSelector).forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
}

function revealEntries(entries, observer) {
  entries
    .filter((entry) => entry.isIntersecting)
    .forEach((entry, index) => {
      entry.target.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 70}ms`);
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
}

function projectImages() {
  return [...resume.querySelectorAll(".project-visual img")];
}

function showLightboxImage(index) {
  const images = projectImages();
  lightboxIndex = (index + images.length) % images.length;
  const image = images[lightboxIndex];

  // Show the cached thumbnail first so opening feels instant, then swap in the full-size file.
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = image.closest(".project").querySelector("h3").textContent;
  lightboxText.textContent = image.closest("figure").querySelector("figcaption").textContent;
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${images.length}`;

  const fullImage = new Image();
  fullImage.src = image.dataset.full;
  fullImage.decode().then(
    () => {
      if (projectImages()[lightboxIndex] === image) lightboxImage.src = fullImage.src;
    },
    () => {},
  );
}

// Lazy images that never scrolled into view would otherwise print blank.
function loadAllImages() {
  const images = [...resume.querySelectorAll("img")];
  images.forEach((image) => {
    image.loading = "eager";
  });
  return Promise.allSettled(images.map((image) => image.decode()));
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => renderResume(button.dataset.language));
});

resume.addEventListener("click", (event) => {
  const trigger = event.target.closest(".visual-trigger");

  if (!trigger) return;

  showLightboxImage(projectImages().indexOf(trigger.querySelector("img")));
  lightbox.showModal();
});

lightbox.addEventListener("click", (event) => {
  const stepButton = event.target.closest("[data-lightbox-step]");

  if (stepButton) {
    showLightboxImage(lightboxIndex + Number(stepButton.dataset.lightboxStep));
  } else if (!event.target.closest(".lightbox-image, .lightbox-caption")) {
    lightbox.close();
  }
});

lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showLightboxImage(lightboxIndex - 1);
  if (event.key === "ArrowRight") showLightboxImage(lightboxIndex + 1);
});

printButton.addEventListener("click", async () => {
  await loadAllImages();
  window.print();
});

window.addEventListener("beforeprint", loadAllImages);

const savedLanguage = localStorage.getItem("resume-language");
renderResume(["en", "zh", "ja"].includes(savedLanguage) ? savedLanguage : "en");
