# 履歷媒體

- 三種語言各有獨立 template；修改專案內容與資產引用須同步 en / zh / ja。
- 螢幕作品集樣式置於以 `media="screen"` 載入的 `screen.css`；`styles.css` 保留三張 A4 的字級與尺寸。螢幕裝飾不得影響列印。
- 語言重繪會重建螢幕裝飾、區塊錨點及 observer；保留目前閱讀區塊的相對位置。localStorage 不可用時仍須正常渲染。
- 捲動進度與導覽共用 passive scroll + requestAnimationFrame；reduced-motion 下停止自動動畫、平滑捲動與淡入。CSS 不得讓列印或減少動畫模式的內容保持透明。
- 不加入非本人作品的技術模擬。活力來自真實作品圖片、各作品的重點色與 CSS hover／focus 回饋；reduced-motion 停止位移與縮放。
- 視覺以作品與技術內容為主；不加章節編號、無關裝飾球體或泛用頁尾口號。列印與影片操作採圖示並保留三語 aria-label；影片文字在列印時恢復。
- 圖片縮圖由 HTML `src` 載入，`data-full` 用於放大；圖說與標題分別取自 figure、article。
- 新增作品使用完整直式圖片；不可沿用代表作品的 16:9 裁切。lightbox 亦須支援直式比例。
- `*-thumb.webp` 用於頁面，`*-large.webp` 用於放大；原始圖片、影片保留。現有前三個代表作品仍用 `gameplay-960.webp` / `gameplay-full.webp`。
- 影片連結指向 `*-web.mp4`，未點擊前 video 無 src；開啟 dialog 才指定 src，不自動播放。關閉（含 Escape）時 pause、移除 src 並 load 以釋放資源。
- `*-poster.jpg` 是影片內容封面；高醫主圖另使用 `kiosk-onsite-*.webp`，來源為 `IMG_6132.jpg`。高醫影片只有遊戲錄影，沒有機台外觀。
- PDF 保留圖片與可點影片連結，隱藏播放 dialog。列印前 decode 所有圖片以避免 lazy 圖片空白。
- 列印第三頁採 40mm 高度的圖片列與並排技能／學歷以維持三張 A4；螢幕版依 760px / 520px 切換欄位與圖片尺寸。
- 驗證須涵蓋三語的頁尾不重疊、390px 手機寬度、圖片切換、影片播放與關閉釋放資源；影片不得在首次載入時下載。
- 影片使用自訂播放／暫停、定位與音量控制，不啟用原生 controls，因此不顯示更多選項、下載或倍速選單；這不是素材存取保護。
- 本機使用 `node scripts/preview.cjs`（預設 8765，僅監聽 loopback），支援 HTTP Range。Python 簡易伺服器回 200 而非 206 時，Chromium 的 seekable 可能為 0，currentTime 定位會回到起點。

- Keroro 僅保留專案說明與官方 X 介紹連結，不再託管圖片、影片或封面；不得自行重新加入舊素材。
- ChatGPT Sites 的靜態目錄為 `dist`；`scripts/build-sites.cjs` 只複製四個網頁檔（HTML、兩份 CSS、一份 JS）與 HTML 引用的 assets，避免把文件與未使用的素材公開。修改素材引用後須重新 build。
- 高醫 `kiosk-demo-site.mp4` 是 Sites 用的 540px、faststart 版本（約 15 MB），原 `kiosk-demo-web.mp4` 保留但不打包。影片時長、操作及 poster 不变。
- 履歷 QR 圖與三語連結須同時指向 `.openai/hosting.json` 對應 Site 的正式 URL。
