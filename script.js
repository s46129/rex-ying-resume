const resume = document.querySelector("#resume");
const languageButtons = document.querySelectorAll("[data-language]");
const printButton = document.querySelector("[data-print]");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector(".lightbox-image");
const lightboxTitle = lightbox.querySelector("#lightbox-title");
const lightboxText = lightbox.querySelector("[data-lightbox-text]");
const lightboxCounter = lightbox.querySelector("[data-lightbox-counter]");
const videoDialog = document.querySelector(".video-dialog");
const videoPlayer = videoDialog.querySelector("video");
const videoSeek = videoDialog.querySelector("[data-video-seek]");
const videoPlay = videoDialog.querySelector("[data-video-play]");
const videoMute = videoDialog.querySelector("[data-video-mute]");
const videoVolume = videoDialog.querySelector("[data-video-volume]");
const videoTime = videoDialog.querySelector("[data-video-time]");
const videoStatus = videoDialog.querySelector(".video-status");
const videoLabels = {
  en: { play: "Play", pause: "Pause", mute: "Mute", unmute: "Unmute", seek: "Seek", volume: "Volume", error: "Unable to play this video. Please close and try again." },
  zh: { play: "播放", pause: "暫停", mute: "靜音", unmute: "取消靜音", seek: "播放進度", volume: "音量", error: "影片無法播放，請關閉後重試。" },
  ja: { play: "再生", pause: "一時停止", mute: "ミュート", unmute: "ミュート解除", seek: "再生位置", volume: "音量", error: "動画を再生できません。閉じて再試行してください。" },
};
let activeVideoLabels = videoLabels.en;

function formatVideoTime(seconds) {
  const value = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

function updateVideoControls() {
  const duration = videoPlayer.duration;
  videoSeek.disabled = !Number.isFinite(duration) || duration <= 0;
  videoSeek.max = videoSeek.disabled ? 100 : duration;
  videoSeek.value = videoPlayer.currentTime;
  videoSeek.setAttribute("aria-valuetext", `${formatVideoTime(videoPlayer.currentTime)} / ${formatVideoTime(duration)}`);
  videoTime.textContent = `${formatVideoTime(videoPlayer.currentTime)} / ${formatVideoTime(duration)}`;
  const playLabel = videoPlayer.paused ? activeVideoLabels.play : activeVideoLabels.pause;
  videoPlay.setAttribute("aria-label", playLabel);
  videoPlay.title = playLabel;
  videoPlay.classList.toggle("is-playing", !videoPlayer.paused);
  const muteLabel = videoPlayer.muted ? activeVideoLabels.unmute : activeVideoLabels.mute;
  videoMute.setAttribute("aria-label", muteLabel);
  videoMute.title = muteLabel;
  videoMute.classList.toggle("is-muted", videoPlayer.muted || videoPlayer.volume === 0);
  videoMute.setAttribute("aria-pressed", String(videoPlayer.muted));
  videoVolume.value = videoPlayer.muted ? 0 : videoPlayer.volume;
}

videoPlay.addEventListener("click", async () => {
  if (!videoPlayer.paused) return videoPlayer.pause();
  try {
    await videoPlayer.play();
    videoStatus.textContent = "";
  } catch {
    if (videoDialog.open) videoStatus.textContent = activeVideoLabels.error;
  }
});
videoSeek.addEventListener("input", () => { videoPlayer.currentTime = Number(videoSeek.value); });
videoMute.addEventListener("click", () => { videoPlayer.muted = !videoPlayer.muted; });
videoVolume.addEventListener("input", () => {
  videoPlayer.volume = Number(videoVolume.value);
  videoPlayer.muted = videoPlayer.volume === 0;
});
for (const event of ["loadedmetadata", "durationchange", "timeupdate", "play", "pause", "ended", "volumechange", "emptied"]) {
  videoPlayer.addEventListener(event, updateVideoControls);
}
videoPlayer.addEventListener("error", () => {
  if (videoDialog.open) videoStatus.textContent = activeVideoLabels.error;
});

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
  const videoClose = videoDialog.querySelector("[data-video-close]");
  videoClose.setAttribute("aria-label", meta.close);
  videoClose.title = meta.close;
  activeVideoLabels = videoLabels[language];
  videoSeek.setAttribute("aria-label", activeVideoLabels.seek);
  videoVolume.setAttribute("aria-label", activeVideoLabels.volume);
  updateVideoControls();

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
  lightboxTitle.textContent = image.closest("article").querySelector("h3").textContent;
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
  const videoLink = event.target.closest(".video-link");
  if (videoLink) {
    event.preventDefault();
    videoDialog.querySelector("#video-title").textContent = videoLink.closest("article").querySelector("h3").textContent;
    videoPlayer.poster = videoLink.dataset.videoPoster;
    videoStatus.textContent = "";
    videoPlayer.src = videoLink.href;
    videoDialog.showModal();
    return;
  }
  const trigger = event.target.closest(".visual-trigger");

  if (!trigger) return;

  showLightboxImage(projectImages().indexOf(trigger.querySelector("img")));
  lightbox.showModal();
});

videoDialog.querySelector("[data-video-close]").addEventListener("click", () => videoDialog.close());
videoDialog.addEventListener("close", () => {
  videoPlayer.pause();
  videoPlayer.removeAttribute("src");
  videoPlayer.load();
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
