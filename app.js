/* ==========================================================================
   大日本帝国憲法 現代語訳・解説ナビ - インタラクティブロジック (app.js)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 状態管理
    const state = {
        currentTab: "reader",
        currentChapter: "preamble", // 最初は前文を表示
        searchQuery: "",
        viewMode: "all", // "all", "trans", "expl"
        originalStyle: "original", // 原文は「旧字旧仮名」に固定
        selectedPreambleId: "kokubun"
    };

    // DOM要素のキャッシュ
    const elements = {
        themeToggle: document.getElementById("theme-toggle"),
        tabButtons: document.querySelectorAll(".tab-btn"),
        tabContents: document.querySelectorAll(".tab-content"),
        searchInput: document.getElementById("search-input"),
        searchClearBtn: document.getElementById("search-clear-btn"),
        viewModeButtons: document.querySelectorAll("#view-mode-control .control-btn"),
        chapterListNav: document.getElementById("chapter-list-nav"),
        currentChapterTitle: document.getElementById("current-chapter-title"),
        resultsCount: document.getElementById("results-count"),
        articlesContainer: document.getElementById("articles-container"),
        preambleTabHeaders: document.getElementById("preamble-tab-headers"),
        preambleContentBody: document.getElementById("preamble-content-body")
    };

    // ==========================================================================
    // 1. 初期化処理
    // ==========================================================================
    function init() {
        initTheme();
        renderSidebarNav();
        renderPreambleTabs();
        renderPreambleContent();
        renderArticles();
        setupEventListeners();
    }

    // テーマ（ダーク/ライト）初期化
    function initTheme() {
        const savedTheme = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    // ==========================================================================
    // 2. イベントリスナー設定
    // ==========================================================================
    function setupEventListeners() {
        // テーマ切り替え
        elements.themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });

        // タブ切り替え
        elements.tabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const targetTab = btn.getAttribute("data-tab");
                switchTab(targetTab);
            });
        });

        // 検索入力
        elements.searchInput.addEventListener("input", (e) => {
            state.searchQuery = e.target.value.trim();
            if (state.searchQuery !== "") {
                elements.searchClearBtn.style.display = "block";
                state.currentChapter = null; // 検索時は章別フィルターを解除
            } else {
                elements.searchClearBtn.style.display = "none";
                state.currentChapter = "preamble"; // 検索クリア時は前文を表示
            }
            updateSidebarNavActiveState();
            renderArticles();
        });

        // 検索クリア
        elements.searchClearBtn.addEventListener("click", () => {
            elements.searchInput.value = "";
            state.searchQuery = "";
            elements.searchClearBtn.style.display = "none";
            state.currentChapter = "preamble"; // 検索クリア時は前文を表示
            updateSidebarNavActiveState();
            renderArticles();
        });

        // 表示モード（すべて/現代語訳/解説）切り替え
        elements.viewModeButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                elements.viewModeButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                state.viewMode = btn.getAttribute("data-mode");
                renderArticles();
            });
        });
    }

    // タブ切り替え制御
    function switchTab(tabId) {
        state.currentTab = tabId;
        elements.tabButtons.forEach(btn => {
            if (btn.getAttribute("data-tab") === tabId) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        elements.tabContents.forEach(content => {
            if (content.getAttribute("id") === `tab-${tabId}`) {
                content.classList.add("active");
            } else {
                content.classList.remove("active");
            }
        });
    }

    // ==========================================================================
    // 3. 憲法リーダー（タブ1）の実装
    // ==========================================================================

    // サイドバーの章ナビゲーション生成
    function renderSidebarNav() {
        elements.chapterListNav.innerHTML = "";

        // --- 1. 前文（告文・勅語）ナビゲーションを追加 ---
        const preambleLi = document.createElement("li");
        const preambleBtn = document.createElement("button");
        preambleBtn.className = "chapter-nav-item";
        if (state.currentChapter === "preamble") {
            preambleBtn.classList.add("active");
        }
        preambleBtn.setAttribute("data-chapter-id", "preamble");

        const preambleTitleSpan = document.createElement("span");
        preambleTitleSpan.textContent = "前文（告文・勅語）";

        const preambleBadgeSpan = document.createElement("span");
        preambleBadgeSpan.className = "count-pill";
        preambleBadgeSpan.textContent = "3編";

        preambleBtn.appendChild(preambleTitleSpan);
        preambleBtn.appendChild(preambleBadgeSpan);
        preambleLi.appendChild(preambleBtn);
        elements.chapterListNav.appendChild(preambleLi);

        preambleBtn.addEventListener("click", () => {
            elements.searchInput.value = "";
            state.searchQuery = "";
            elements.searchClearBtn.style.display = "none";
            state.currentChapter = "preamble";
            
            updateSidebarNavActiveState();
            renderArticles();
            
            if (window.innerWidth <= 1024) {
                // モバイル向け（画面幅1024px以下）のみスクロール（前文エリアへ）
                const scrollTarget = document.querySelector('.preamble-selector-area');
                if (scrollTarget) {
                    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                // パソコン環境ではページ最上部へスクロール
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // --- 2. 各章のナビゲーションを追加 ---
        CONSTITUTION_DATA.chapters.forEach(chapter => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.className = "chapter-nav-item";
            if (state.currentChapter === chapter.id) {
                btn.classList.add("active");
            }
            btn.setAttribute("data-chapter-id", chapter.id);

            const titleSpan = document.createElement("span");
            titleSpan.textContent = chapter.title;

            const badgeSpan = document.createElement("span");
            badgeSpan.className = "count-pill";
            badgeSpan.textContent = `${chapter.articles.length}条`;

            btn.appendChild(titleSpan);
            btn.appendChild(badgeSpan);
            li.appendChild(btn);
            elements.chapterListNav.appendChild(li);

            // 章別クリックイベント
            btn.addEventListener("click", () => {
                elements.searchInput.value = "";
                state.searchQuery = "";
                elements.searchClearBtn.style.display = "none";
                state.currentChapter = chapter.id;
                
                updateSidebarNavActiveState();
                renderArticles();
                
                if (window.innerWidth <= 1024) {
                    // モバイル向け（画面幅1024px以下）のみスクロール（条文見出しへ）
                    const scrollTarget = document.querySelector('.articles-list-header');
                    if (scrollTarget) {
                        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    // パソコン環境ではページ最上部へスクロール
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    // 章の選択アクティブ状態アップデート
    function updateSidebarNavActiveState() {
        const navButtons = document.querySelectorAll(".chapter-nav-item");
        navButtons.forEach(btn => {
            const chIdRaw = btn.getAttribute("data-chapter-id");
            const isPreamble = chIdRaw === "preamble";
            const chId = isPreamble ? "preamble" : parseInt(chIdRaw, 10);
            if (state.currentChapter === chId) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }

    // 前文タブボタンの生成
    function renderPreambleTabs() {
        elements.preambleTabHeaders.innerHTML = "";
        CONSTITUTION_DATA.preambles.forEach(p => {
            const btn = document.createElement("button");
            btn.className = "preamble-tab";
            if (state.selectedPreambleId === p.id) {
                btn.classList.add("active");
            }
            btn.textContent = p.title;
            btn.setAttribute("data-preamble-id", p.id);
            elements.preambleTabHeaders.appendChild(btn);

            btn.addEventListener("click", () => {
                document.querySelectorAll(".preamble-tab").forEach(tab => tab.classList.remove("active"));
                btn.classList.add("active");
                state.selectedPreambleId = p.id;
                renderPreambleContent();
            });
        });
    }

    // 前文コンテンツの表示
    function renderPreambleContent() {
        const preamble = CONSTITUTION_DATA.preambles.find(p => p.id === state.selectedPreambleId);
        if (!preamble) return;

        // 字体は旧字（original）固定
        let originalText = preamble.original;

        elements.preambleContentBody.innerHTML = `
            <div class="preamble-title-section">
                <h3>${preamble.title}</h3>
                <span class="ruby">${preamble.subtitle}</span>
            </div>
            <div class="preamble-grid">
                <div class="preamble-translation">
                    <span class="section-label label-translation">現代語訳</span>
                    <p>${preamble.translation}</p>
                </div>
                <div class="preamble-original">
                    <span class="section-label">原文</span>
                    <p>${originalText}</p>
                </div>
            </div>
            <div class="preamble-expl-panel">
                <h4>歴史的な意義とやさしい解説</h4>
                <p>${preamble.explanation}</p>
            </div>
        `;
    }

    // 条文カードの描画
    function renderArticles() {
        const preambleArea = document.querySelector('.preamble-selector-area');
        const articlesHeader = document.querySelector('.articles-list-header');
        
        elements.articlesContainer.innerHTML = "";
        
        let filteredArticles = [];
        let sectionHeaderTitle = "";

        if (state.currentChapter === "preamble") {
            // 前文表示時
            if (preambleArea) preambleArea.style.display = "block";
            if (articlesHeader) articlesHeader.style.display = "none";
            // 前文カードを描画して終了
            renderPreambleContent();
            return;
        } else {
            // 章または検索結果表示時
            if (preambleArea) preambleArea.style.display = "none";
            if (articlesHeader) articlesHeader.style.display = "flex";
        }

        if (state.currentChapter !== null && state.currentChapter !== "preamble") {
            // 章別フィルター有効時
            const chapter = CONSTITUTION_DATA.chapters.find(c => c.id === state.currentChapter);
            if (chapter) {
                filteredArticles = chapter.articles.map(art => ({ ...art, chapterTitle: chapter.title }));
                sectionHeaderTitle = chapter.title;
            }
        } else if (state.searchQuery !== "") {
            // キーワード検索有効時
            sectionHeaderTitle = `「${state.searchQuery}」の検索結果`;
            const query = state.searchQuery.toLowerCase();
            
            CONSTITUTION_DATA.chapters.forEach(chapter => {
                chapter.articles.forEach(art => {
                    const matchNum = art.number.toString() === query || art.title.includes(query);
                    const matchOrig = art.original.includes(query) || art.originalNew.includes(query);
                    const matchTrans = art.translation.toLowerCase().includes(query);
                    const matchExpl = art.explanation.toLowerCase().includes(query);
                    const matchTags = art.tags.some(tag => tag.toLowerCase().includes(query));

                    if (matchNum || matchOrig || matchTrans || matchExpl || matchTags) {
                        filteredArticles.push({
                            ...art,
                            chapterTitle: chapter.title
                        });
                    }
                });
            });
        }

        // 章タイトル表示更新
        elements.currentChapterTitle.textContent = sectionHeaderTitle;
        elements.resultsCount.textContent = `全 ${filteredArticles.length} 件`;

        if (filteredArticles.length === 0) {
            elements.articlesContainer.innerHTML = `
                <div class="panel-placeholder" style="padding: 40px 0;">
                    <svg class="placeholder-icon" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
                    <h3>該当する条文が見つかりません</h3>
                    <p>他のキーワードや章を選択してください。</p>
                </div>
            `;
            return;
        }

        // 条文カードのHTML構築
        filteredArticles.forEach(art => {
            const card = document.createElement("article");
            card.className = "article-card";
            card.setAttribute("id", `article-${art.number}`);

            // 原文は旧字（original）固定
            let originalText = art.original;

            // タグのHTML
            const tagsHtml = art.tags.map(t => `<span class="tag">${t}</span>`).join("");

            // 表示オプションによるセクション表示制御
            const showOrig = state.viewMode === "all";
            const showTrans = state.viewMode === "all" || state.viewMode === "trans";
            const showExpl = state.viewMode === "all" || state.viewMode === "expl";

            card.innerHTML = `
                <div class="article-card-header">
                    <div class="article-title-area">
                        <span class="article-number">${art.title}</span>
                        <span class="article-chapter-tag">${art.chapterTitle}</span>
                    </div>
                    <div class="article-tags">${tagsHtml}</div>
                </div>
                <div class="card-sections">
                    <div class="card-section ${showTrans ? '' : 'hidden'}">
                        <span class="section-label label-translation">現代語訳</span>
                        <p class="text-translation">${art.translation}</p>
                    </div>
                    <div class="card-section ${showOrig ? '' : 'hidden'}">
                        <span class="section-label">明治憲法 原文</span>
                        <p class="text-original">${originalText}</p>
                    </div>
                    <div class="card-section ${showExpl ? '' : 'hidden'}">
                        <span class="section-label label-explanation">やさしい解説</span>
                        <p class="text-explanation">${art.explanation}</p>
                    </div>
                </div>
            `;
            elements.articlesContainer.appendChild(card);
        });

        // 読み込み時に前文を描画
        renderPreambleContent();
    }

    // 起動！
    init();
});
