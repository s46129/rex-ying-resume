# Rex Ying Resume

Rex Ying（英智淵）的雙語線上履歷，介紹 Unity 技術領導、遊戲系統、XR 與多人連線相關經驗。

[查看線上履歷](https://s46129.github.io/rex-ying-resume/) · [GitHub 個人頁面](https://github.com/s46129)

## 專案特色

- 中英文履歷即時切換，並記住上次選擇的語言
- 針對螢幕閱讀與 A4 列印分別設計版面
- 可直接透過瀏覽器列印或另存為 PDF
- 響應式設計，支援桌面與行動裝置
- 使用語意化 HTML 與基本無障礙標記
- 純 HTML、CSS、JavaScript，無框架、無建置步驟

## 履歷重點

- 8 年以上 Unity 開發與技術領導經驗
- Nintendo Switch、VR、AR、互動裝置與跨平台應用
- 遊戲系統架構、多人連線、物理、渲染最佳化與 Unity 編輯器工具
- 曾參與《BIRDIE WING -Golf Girls' Story-》、《歡迎來到霹靂宇宙》與《妖果小學》等作品

## 在本機開啟

下載專案後，可直接開啟 `index.html`，或在專案目錄啟動簡易伺服器：

```bash
python3 -m http.server 8000
```

接著前往 [http://localhost:8000](http://localhost:8000)。

## 編輯指南

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 中英文履歷內容與頁面結構 |
| `styles.css` | 螢幕、響應式與列印樣式 |
| `script.js` | 語言切換、偏好記錄與列印操作 |
| `assets/` | 專案圖片與線上履歷 QR Code |

修改履歷內容時，請同步檢查中英文兩份 `<template>`。列印前建議先在瀏覽器切換至目標語言，再點選頁面右上角的 **Print / PDF**。

## 部署

本站可直接部署到任何靜態網站服務。本倉庫目前透過 GitHub Pages 發布：

<https://s46129.github.io/rex-ying-resume/>

---

## English

A bilingual online resume for Rex Ying, highlighting experience in Unity technical leadership, game systems, XR, and multiplayer development.

### Highlights

- Instant English and Traditional Chinese switching with saved language preference
- Screen, responsive, and A4 print layouts
- Browser-based printing and PDF export
- Semantic HTML with basic accessibility support
- Plain HTML, CSS, and JavaScript with no build step

### Run locally

Open `index.html` directly, or start a local server from the project directory:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

[View the live resume](https://s46129.github.io/rex-ying-resume/)
