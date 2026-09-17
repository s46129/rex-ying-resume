# 履歷媒體

- 三種語言各有獨立 template；修改專案內容與資產引用須同步 en / zh / ja。
- 圖片縮圖由 HTML `src` 載入，`data-full` 用於放大；圖說與標題分別取自 figure、article。
- 新增作品使用完整直式圖片；不可沿用代表作品的 16:9 裁切。lightbox 亦須支援直式比例。
- `*-thumb.webp` 用於頁面，`*-large.webp` 用於放大；原始圖片、影片保留。現有前三個代表作品仍用 `gameplay-960.webp` / `gameplay-full.webp`。
- 影片連結指向 `*-web.mp4`，未點擊前 video 無 src；開啟 dialog 才指定 src，不自動播放。關閉（含 Escape）時 pause、移除 src 並 load 以釋放資源。
- `*-poster.jpg` 是影片內容封面；高醫主圖另使用 `kiosk-onsite-*.webp`，來源為 `IMG_6132.jpg`。高醫影片只有遊戲錄影，沒有機台外觀。
- PDF 保留圖片與可點影片連結，隱藏播放 dialog。列印前 decode 所有圖片以避免 lazy 圖片空白。
- 第三頁採 40mm 高度的圖片列與並排技能／學歷以維持三張 A4；手機版改單欄與較大圖片。
- 驗證須涵蓋三語的頁尾不重疊、390px 手機寬度、圖片切換、影片播放與關閉釋放資源；影片不得在首次載入時下載。
- 影片使用自訂播放／暫停、定位與音量控制，不啟用原生 controls，因此不顯示更多選項、下載或倍速選單；這不是素材存取保護。
- 本機使用 `node scripts/preview.cjs`（預設 8765，僅監聽 loopback），支援 HTTP Range。Python 簡易伺服器回 200 而非 206 時，Chromium 的 seekable 可能為 0，currentTime 定位會回到起點。
