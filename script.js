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

const screenLabels = {
  en: {
    navigation: "Page sections", language: "Language", experience: "Experience", work: "Selected work", expertise: "Expertise",
    print: "Print / PDF", primary: "Explore my work", secondary: "Get in touch", note: "Thoughtful systems. Playful experiences.",
    footerLabel: "HAVE SOMETHING IN MIND?", footerTitle: "Let's build something.", footerNote: "Made with care, in Kaohsiung.", backTop: "Back to top",
  },
  zh: {
    navigation: "頁面導覽", language: "語言", experience: "工作經歷", work: "精選作品", expertise: "專業技能",
    print: "列印 / PDF", primary: "探索我的作品", secondary: "與我聯絡", note: "細緻的系統，生動的體驗。",
    footerLabel: "有個想法想聊聊？", footerTitle: "一起打造新的體驗。", footerNote: "用心製作，來自高雄。", backTop: "回到頂端",
  },
  ja: {
    navigation: "ページ内ナビゲーション", language: "言語", experience: "職務経歴", work: "制作実績", expertise: "専門スキル",
    print: "印刷 / PDF", primary: "制作実績を見る", secondary: "お問い合わせ", note: "丁寧な設計から、遊び心のある体験へ。",
    footerLabel: "アイデアをお聞かせください", footerTitle: "新しい体験を、一緒に。", footerNote: "高雄から、心を込めて。", backTop: "トップに戻る",
  },
};

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealSelector = [
  ".hero",
  ".summary",
  ".experience > .section-heading",
  ".company-row",
  ".experience > .achievement-list",
  ".projects > .section-heading",
  ".project",
  ".additional-work > .section-heading",
  ".mini-project-list article",
  ".bottom-grid > section",
].join(", ");

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(revealEntries, { rootMargin: "0px 0px -5% 0px", threshold: 0.01 })
    : null;

let lightboxIndex = 0;
let activeLanguage = "en";
let scrollFrame = null;

function renderResume(language, preservePosition = false) {
  const template = document.querySelector(`#resume-${language}`);

  if (!template) return;

  const position = preservePosition ? captureReadingPosition() : null;
  revealObserver?.disconnect();
  resume.replaceChildren(template.content.cloneNode(true));
  const meta = languageMeta[language];
  activeLanguage = language;

  document.documentElement.lang = meta.lang;
  document.title = meta.title;
  try {
    localStorage.setItem("resume-language", language);
  } catch {
    // The resume also works when browser storage is unavailable.
  }

  decorateResume(screenLabels[language]);

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

  if (position) restoreReadingPosition(position);
  observeReveals();
  scheduleScrollUpdate();
}

function decorateResume(labels) {
  const hero = resume.querySelector(".hero");
  const identity = hero.querySelector(".identity");
  hero.id = "top";
  resume.querySelector(".experience").id = "experience";
  resume.querySelector(".projects").id = "work";
  resume.querySelector(".bottom-grid").id = "expertise";

  const index = document.createElement("p");
  index.className = "hero-index screen-only";
  index.textContent = "UNITY · XR · INTERACTIVE";
  identity.prepend(index);

  const note = document.createElement("p");
  note.className = "hero-note screen-only";
  note.textContent = labels.note;
  identity.append(note);

  const actions = document.createElement("div");
  actions.className = "hero-actions screen-only";
  for (const [className, href, label, arrow] of [
    ["primary-link", "#work", labels.primary, "↗"],
    ["secondary-link", "mailto:ted56129@gmail.com", labels.secondary, "↗"],
  ]) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = label;
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = arrow;
    link.append(icon);
    actions.append(link);
  }
  identity.append(actions);

  const art = document.createElement("div");
  art.className = "hero-art screen-only";
  art.setAttribute("aria-hidden", "true");
  art.innerHTML = `
    <div class="orbit-scene">
      <div class="orbit-halo"></div>
      <div class="orbit-ring orbit-ring-one"></div>
      <div class="orbit-ring orbit-ring-two"></div>
      <div class="orbit-ring orbit-ring-three"></div>
      <div class="orbit-axis orbit-axis-x"></div>
      <div class="orbit-axis orbit-axis-y"></div>
      <div class="orbit-core"></div>
      <div class="orbit-dot orbit-dot-one"></div>
      <div class="orbit-dot orbit-dot-two"></div>
    </div>
    <div class="art-caption"><span>INTERACTIVE SYSTEMS</span><span>01 — ∞</span></div>`;
  identity.after(art);

  const numberedHeadings = [
    ".summary .section-label", ".experience .section-heading", ".projects .section-heading",
    ".additional-work .section-heading", ".bottom-grid > section:first-child .section-heading",
    ".bottom-grid > section:last-child .section-heading",
  ];
  numberedHeadings.forEach((selector, index) => {
    resume.querySelector(selector).dataset.sectionNumber = String(index + 1).padStart(2, "0");
  });
  resume.querySelectorAll(".project").forEach((project, index) => {
    project.dataset.projectNumber = String(index + 1).padStart(2, "0");
  });

  document.querySelector(".section-nav")?.setAttribute("aria-label", labels.navigation);
  document.querySelector(".language-switch")?.setAttribute("aria-label", labels.language);
  for (const key of ["experience", "work", "expertise"]) {
    const link = document.querySelector(`[data-nav="${key}"]`);
    if (link) link.textContent = labels[key];
  }
  for (const [attribute, key] of [
    ["print-label", "print"], ["footer-label", "footerLabel"], ["footer-title", "footerTitle"],
    ["footer-note", "footerNote"], ["back-top", "backTop"],
  ]) {
    const label = document.querySelector(`[data-${attribute}]`);
    if (label) label.textContent = labels[key];
  }
}

const readingBlockSelector = ".hero, .summary, .experience, .project, .additional-work, .bottom-grid";

function captureReadingPosition() {
  if (window.scrollY === 0) return null;
  const inset = (document.querySelector(".screen-toolbar")?.getBoundingClientRect().height || 0) + 24;
  const blocks = [...resume.querySelectorAll(readingBlockSelector)];
  let index = 0;
  blocks.forEach((block, blockIndex) => {
    if (block.getBoundingClientRect().top <= inset) index = blockIndex;
  });
  const rect = blocks[index].getBoundingClientRect();
  return { index, inset, fraction: Math.max(0, (inset - rect.top) / Math.max(rect.height, 1)) };
}

function restoreReadingPosition({ index, inset, fraction }) {
  const block = resume.querySelectorAll(readingBlockSelector)[index];
  if (!block) return;
  const rect = block.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + rect.top + rect.height * fraction - inset, behavior: "instant" });
}

function scheduleScrollUpdate() {
  if (scrollFrame !== null) return;
  scrollFrame = window.requestAnimationFrame(updateScrollState);
}

function updateScrollState() {
  scrollFrame = null;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
  const progressBar = document.querySelector(".reading-progress > span");
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

  const inset = (document.querySelector(".screen-toolbar")?.getBoundingClientRect().height || 0) + 80;
  const links = [...document.querySelectorAll("[data-nav]")];
  let current = null;
  for (const link of links) {
    const section = document.getElementById(link.dataset.nav);
    if (section && section.getBoundingClientRect().top <= inset) current = link;
  }
  for (const link of links) {
    if (link === current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

function observeReveals() {
  if (!revealObserver) return;

  revealObserver.disconnect();
  resume.querySelectorAll(revealSelector).forEach((element) => {
    if (motionPreference.matches) {
      element.classList.add("is-visible");
      return;
    }
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
  button.addEventListener("click", () => {
    if (button.dataset.language !== activeLanguage) renderResume(button.dataset.language, true);
  });
});

window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
window.addEventListener("load", scheduleScrollUpdate);
motionPreference.addEventListener("change", observeReveals);

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

let savedLanguage;
try {
  savedLanguage = localStorage.getItem("resume-language");
} catch {
  // Use English when browser storage is unavailable.
}
renderResume(["en", "zh", "ja"].includes(savedLanguage) ? savedLanguage : "en");
