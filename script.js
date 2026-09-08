const resume = document.querySelector("#resume");
const languageButtons = document.querySelectorAll("[data-language]");
const printButton = document.querySelector("[data-print]");

function renderResume(language) {
  const template = document.querySelector(`#resume-${language}`);

  if (!template) return;

  resume.replaceChildren(template.content.cloneNode(true));
  const languageMeta = {
    en: { lang: "en", title: "Rex Ying Resume" },
    zh: { lang: "zh-Hant", title: "Rex Ying 履歷" },
    ja: { lang: "ja", title: "Rex Ying 履歴書" },
  }[language];

  document.documentElement.lang = languageMeta.lang;
  document.title = languageMeta.title;
  localStorage.setItem("resume-language", language);

  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => renderResume(button.dataset.language));
});

printButton.addEventListener("click", () => window.print());

const savedLanguage = localStorage.getItem("resume-language");
renderResume(["en", "zh", "ja"].includes(savedLanguage) ? savedLanguage : "en");
