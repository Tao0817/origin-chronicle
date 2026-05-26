import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types";
import { useAppContext } from "../../context/AppContext";

// ─── 探索先リンク定義 ─────────────────────────────────────────────────
interface ArchiveLink { name: string; url: string; desc: string }

const CATEGORY_LINKS: Record<Category, ArchiveLink[]> = {
  "金融・通貨・制度": [
    { name: "IMF",       url: "https://www.imf.org/en/Publications",        desc: "国際通貨基金 出版物・レポート" },
    { name: "BIS",       url: "https://www.bis.org/statistics/",             desc: "国際決済銀行 統計データ" },
    { name: "日本銀行",   url: "https://www.boj.or.jp/statistics/",           desc: "日本銀行 統計・時系列データ" },
    { name: "国会会議録", url: "https://kokkai.ndl.go.jp/",                   desc: "国会会議録検索システム" },
    { name: "世界銀行",   url: "https://data.worldbank.org/",                 desc: "世界銀行 オープンデータ" },
  ],
  "軍事・戦争": [
    { name: "CIA Reading Room",       url: "https://www.cia.gov/readingroom/",                    desc: "CIA 機密解除文書データベース" },
    { name: "FRUS",                   url: "https://history.state.gov/historicaldocuments",        desc: "米国対外関係文書（国務省）" },
    { name: "国立公文書館",           url: "https://www.archives.go.jp/",                          desc: "日本国立公文書館" },
    { name: "アジア歴史資料センター", url: "https://www.jacar.archives.go.jp/",                   desc: "JACAR 公文書データベース" },
  ],
  "帝国・植民地・資源": [
    { name: "OPEC",        url: "https://www.opec.org/opec_web/en/publications/", desc: "OPEC 出版物・石油統計" },
    { name: "国連文書",    url: "https://documents.un.org/",                      desc: "国連公式文書システム" },
    { name: "資源エネルギー庁", url: "https://www.enecho.meti.go.jp/",            desc: "エネルギー統計・政策情報" },
    { name: "世界銀行",    url: "https://data.worldbank.org/",                    desc: "世界銀行 オープンデータ" },
  ],
  "思想・宗教・結社": [
    { name: "国立国会図書館", url: "https://dl.ndl.go.jp/",       desc: "NDL デジタルコレクション" },
    { name: "JSTOR",          url: "https://www.jstor.org/",       desc: "学術論文・書籍データベース" },
    { name: "Google Scholar", url: "https://scholar.google.com/", desc: "学術文献横断検索" },
  ],
  "国際機関・諜報・政策ネットワーク": [
    { name: "CIA Reading Room", url: "https://www.cia.gov/readingroom/",              desc: "CIA 機密解除文書データベース" },
    { name: "FRUS",             url: "https://history.state.gov/historicaldocuments", desc: "米国対外関係文書（国務省）" },
    { name: "外務省外交史料館", url: "https://www.mofa.go.jp/mofaj/annai/honsho/shiryo/", desc: "日本外交史料館" },
    { name: "国連文書",         url: "https://documents.un.org/",                     desc: "国連公式文書システム" },
  ],
};

// ─── 統計リンク定義 ───────────────────────────────────────────────────
const STATS_LINKS: Record<Category, ArchiveLink[]> = {
  "金融・通貨・制度": [
    { name: "IMF WEO データ",       url: "https://www.imf.org/en/Publications/WEO",                         desc: "World Economic Outlook — GDP・インフレ等の時系列データ" },
    { name: "BIS 国際金融統計",     url: "https://www.bis.org/statistics/",                                  desc: "銀行業務・債券・デリバティブ市場の国際統計" },
    { name: "日銀 マネーストック",  url: "https://www.boj.or.jp/statistics/money/",                          desc: "M1/M2/M3 の月次推移データ" },
    { name: "世銀 GDP成長率",       url: "https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG",           desc: "各国GDP成長率の年次データ" },
  ],
  "軍事・戦争": [
    { name: "SIPRI 軍事費データ",   url: "https://www.sipri.org/databases/milex",                            desc: "ストックホルム国際平和研究所 軍事費推移データベース" },
    { name: "世銀 軍事費/GDP",      url: "https://data.worldbank.org/indicator/MS.MIL.XPND.GD.ZS",           desc: "軍事支出/GDP比率 国際比較" },
    { name: "ACLED 紛争データ",     url: "https://acleddata.com/",                                           desc: "武力衝突・抗議活動の地政学データ" },
  ],
  "帝国・植民地・資源": [
    { name: "OPEC 石油統計",        url: "https://www.opec.org/opec_web/en/data_graphs/40.htm",               desc: "OPEC加盟国の生産量・埋蔵量データ" },
    { name: "資源エ庁 エネルギー白書", url: "https://www.enecho.meti.go.jp/about/whitepaper/",               desc: "年次エネルギー白書（需給・価格）" },
    { name: "世銀 資源輸出",        url: "https://data.worldbank.org/indicator/TX.VAL.FUEL.ZS.UN",           desc: "燃料輸出額/総輸出額比率" },
    { name: "UN Comtrade",          url: "https://comtradeplus.un.org/",                                     desc: "国際貿易統計データベース（商品別）" },
  ],
  "思想・宗教・結社": [
    { name: "NDL デジタルコレクション", url: "https://dl.ndl.go.jp/",      desc: "国立国会図書館 デジタルアーカイブ（近代以降）" },
    { name: "JSTOR",                    url: "https://www.jstor.org/",      desc: "人文社会科学系学術論文・書籍" },
    { name: "Google Scholar",           url: "https://scholar.google.com/", desc: "学術文献・引用索引" },
  ],
  "国際機関・諜報・政策ネットワーク": [
    { name: "UN Stats",          url: "https://unstats.un.org/",                                   desc: "国連統計部 多分野統計データ" },
    { name: "外務省 条約データ", url: "https://www.mofa.go.jp/mofaj/gaiko/treaty/",                desc: "日本の条約・協定一覧" },
    { name: "FRUS 文書",         url: "https://history.state.gov/historicaldocuments",             desc: "米国対外関係文書（年代別）" },
  ],
};

// ─── カテゴリーカラー（Timeline と同じ） ──────────────────────────────
const CATEGORY_COLOR: Record<Category, string> = {
  "軍事・戦争":                     "#c0392b",
  "思想・宗教・結社":               "#8e44ad",
  "帝国・植民地・資源":             "#d35400",
  "金融・通貨・制度":               "#2980b9",
  "国際機関・諜報・政策ネットワーク": "#27ae60",
};

// ─── キーワード抽出 ────────────────────────────────────────────────────
function extractKeywords(title: string, summary: string): string[] {
  const combined = `${title}　${summary}`;
  const raw = combined.split(/[・\s　（）「」、。,().：:・\-—]/u).filter((w) => w.length >= 2);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const w of raw) {
    if (!seen.has(w)) { seen.add(w); result.push(w); }
    if (result.length >= 14) break;
  }
  return result;
}

// ─── 人物名検索URL生成 ────────────────────────────────────────────────
function buildPersonSearchUrl(baseUrl: string, name: string): string {
  const enc = encodeURIComponent(name);
  if (baseUrl.includes("scholar.google")) return `https://scholar.google.com/scholar?q=${enc}`;
  if (baseUrl.includes("jstor"))         return `https://www.jstor.org/action/doBasicSearch?Query=${enc}`;
  if (baseUrl.includes("cia.gov"))       return `https://www.cia.gov/readingroom/search/site/${enc}`;
  if (baseUrl.includes("dl.ndl"))        return `https://dl.ndl.go.jp/search/searchResult?fullTextSearch=true&query=${enc}`;
  if (baseUrl.includes("kokkai"))        return `https://kokkai.ndl.go.jp/api/speech?speaker=${enc}&recordPacking=json`;
  return baseUrl;
}

// ─── タブ定義 ─────────────────────────────────────────────────────────
const TABS = ["年代範囲", "組織名", "資料内語句", "人物名", "統計変化"] as const;
type TabName = typeof TABS[number];

// ─── メインコンポーネント ─────────────────────────────────────────────
export function ExternalSearch() {
  const { selectedEvent } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabName>("年代範囲");
  const [personName, setPersonName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  // ── 未選択時 ─────────────────────────────────────────────────────────
  if (!selectedEvent) {
    return (
      <div className="es-root">
        <div className="es-empty">
          <div className="es-empty-icon">⊹</div>
          <p className="es-empty-title">年表からイベントを選んでください</p>
          <p className="es-empty-sub">
            年表でイベントを選択すると、カテゴリーに対応した<br />外部アーカイブへの探索リンクが表示されます
          </p>
          <button className="es-goto-tl" onClick={() => navigate("/")}>
            年表へ →
          </button>
        </div>
      </div>
    );
  }

  // ── 選択済み ──────────────────────────────────────────────────────────
  const ev = selectedEvent;
  const color = CATEGORY_COLOR[ev.category];
  const links = CATEGORY_LINKS[ev.category];
  const statsLinks = STATS_LINKS[ev.category];
  const fromYear = ev.year - 10;
  const toYear   = ev.year + 10;
  const keywords = extractKeywords(ev.title, ev.summary);
  const query1 = `${ev.title} ${fromYear}-${toYear}`;
  const query2 = `${keywords[0] ?? ev.title} ${ev.year}`;

  return (
    <div className="es-root">

      {/* ── イベントヘッダー ── */}
      <div className="es-header">
        <div className="es-header-bar" style={{ background: color }} />
        <div className="es-header-inner">
          <div className="es-header-label">選択中のイベント</div>
          <div className="es-header-meta" style={{ marginBottom: 6 }}>
            <span className="es-year-range" style={{ fontSize: 13, fontWeight: 600 }}>
              {ev.year}年
            </span>
            <span className="es-cat-badge" style={{ color, borderColor: color + "55", background: color + "18" }}>
              {ev.category}
            </span>
          </div>
          <div className="es-header-title">{ev.title}</div>
        </div>
      </div>

      {/* ── 探索先リンク ── */}
      <div className="es-links-section">
        <div className="es-section-label">▸ 探索先リンク / SOURCE ARCHIVES</div>
        <div className="es-link-chips">
          {links.map((l) => (
            <a
              key={l.name}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="es-link-chip"
              title={l.desc}
              style={{ borderColor: color + "55", color }}
            >
              {l.name}
              <span className="es-chip-arrow">↗</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── タブ ── */}
      <div className="es-tabs-root">

        {/* タブバー */}
        <div className="es-tab-bar">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`es-tab-btn ${activeTab === tab ? "active" : ""}`}
              style={activeTab === tab ? { borderBottomColor: color, color } : {}}
              onClick={() => setActiveTab(tab)}
            >
              <span className="es-tab-num" style={activeTab === tab ? { background: color, color: "#fff" } : {}}>
                {i + 1}
              </span>
              {tab}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        <div className="es-tab-content">

          {/* ── Tab 1: 年代範囲 ── */}
          {activeTab === "年代範囲" && (
            <div className="es-pane">
              <div className="es-section-label" style={{ marginBottom: 12 }}>▸ 検索年代範囲（前後10年）</div>
              <div className="es-date-range-box" style={{ borderColor: color + "55" }}>
                <div className="es-date-col">
                  <div className="es-date-label">FROM</div>
                  <div className="es-date-value" style={{ color }}>{fromYear}</div>
                </div>
                <div className="es-date-sep">—</div>
                <div className="es-date-col">
                  <div className="es-date-label">TO</div>
                  <div className="es-date-value" style={{ color }}>{toYear}</div>
                </div>
              </div>

              <div className="es-section-label" style={{ margin: "20px 0 10px" }}>▸ コピー用クエリ</div>
              {[
                { id: "q1", text: query1 },
                { id: "q2", text: query2 },
              ].map(({ id, text }) => (
                <div key={id} className="es-copy-row">
                  <code className="es-copy-field">{text}</code>
                  <button
                    className={`es-copy-btn ${copiedId === id ? "copied" : ""}`}
                    onClick={() => copyText(text, id)}
                  >
                    {copiedId === id ? "COPIED" : "COPY"}
                  </button>
                </div>
              ))}

              <div className="es-section-label" style={{ margin: "24px 0 10px" }}>▸ 年代を指定して探索</div>
              <div className="es-suggest-list">
                {links.map((l) => (
                  <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="es-suggest-item">
                    <span className="es-suggest-name" style={{ color }}>{l.name}</span>
                    <span className="es-suggest-desc">{l.desc}　（{fromYear}〜{toYear}年）</span>
                    <span className="es-suggest-arrow">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 2: 組織名 ── */}
          {activeTab === "組織名" && (
            <div className="es-pane">
              <div className="es-section-label" style={{ marginBottom: 12 }}>▸ タイトルから抽出した語句（クリックでコピー）</div>
              <div className="es-chip-wrap">
                {keywords.slice(0, 8).map((kw) => (
                  <button
                    key={kw}
                    className="es-org-chip"
                    style={{ borderColor: color + "55", color }}
                    onClick={() => copyText(kw, `org-${kw}`)}
                    title="クリックでコピー"
                  >
                    {copiedId === `org-${kw}` ? `✓ ${kw}` : kw}
                  </button>
                ))}
              </div>
              <p className="es-hint">
                ► クリップボードにコピー後、各アーカイブの検索フォームに貼り付けてください
              </p>
              <div className="es-section-label" style={{ margin: "24px 0 10px" }}>▸ 組織名で探索</div>
              <div className="es-suggest-list">
                {links.map((l) => (
                  <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="es-suggest-item">
                    <span className="es-suggest-name" style={{ color }}>{l.name}</span>
                    <span className="es-suggest-desc">{l.desc}</span>
                    <span className="es-suggest-arrow">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 3: 資料内語句 ── */}
          {activeTab === "資料内語句" && (
            <div className="es-pane">
              <div className="es-section-label" style={{ marginBottom: 12 }}>▸ キーワード抽出（クリックでコピー）</div>
              <div className="es-chip-wrap">
                {keywords.map((kw) => (
                  <button
                    key={kw}
                    className="es-kw-chip"
                    onClick={() => copyText(kw, `kw-${kw}`)}
                    title="クリックでコピー"
                  >
                    {copiedId === `kw-${kw}` ? `✓ ${kw}` : kw}
                  </button>
                ))}
              </div>
              <div className="es-info-note">
                イベントタイトルおよび概要から抽出したキーワードです。<br />
                複数キーワードを AND 結合して検索することで精度が向上します。
              </div>
              <div className="es-section-label" style={{ margin: "24px 0 10px" }}>▸ 語句で全文検索</div>
              <div className="es-suggest-list">
                {links.map((l) => (
                  <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="es-suggest-item">
                    <span className="es-suggest-name" style={{ color }}>{l.name}</span>
                    <span className="es-suggest-desc">{l.desc}</span>
                    <span className="es-suggest-arrow">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 4: 人物名 ── */}
          {activeTab === "人物名" && (
            <div className="es-pane">
              <div className="es-section-label" style={{ marginBottom: 12 }}>▸ 人物名で探索</div>
              <div className="es-person-form">
                <div className="es-form-group">
                  <label className="es-form-label" htmlFor="person-input">人物名 / PERSON NAME</label>
                  <input
                    id="person-input"
                    className="es-form-input"
                    type="text"
                    placeholder="例：ヘンリー・キッシンジャー"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                  />
                </div>
                <div className="es-form-group">
                  <div className="es-form-label">検索先を選択</div>
                  <div className="es-person-links">
                    {links.map((l) => (
                      <a
                        key={l.name}
                        href={personName ? buildPersonSearchUrl(l.url, personName) : l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="es-person-link-btn"
                        style={personName ? { borderColor: color + "55", color } : {}}
                      >
                        {l.name} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="es-info-note" style={{ marginTop: 20 }}>
                人物名を入力すると各アーカイブの検索URLが自動生成されます。<br />
                姓名はスペースで区切り、英語表記でも検索可能です。
              </div>
            </div>
          )}

          {/* ── Tab 5: 統計変化 ── */}
          {activeTab === "統計変化" && (
            <div className="es-pane">
              <div className="es-section-label" style={{ marginBottom: 12 }}>▸ カテゴリー別統計リンク</div>
              <div className="es-stats-grid">
                {statsLinks.map((l) => (
                  <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="es-stat-card">
                    <div className="es-stat-name" style={{ color }}>{l.name}</div>
                    <div className="es-stat-desc">{l.desc}</div>
                    <div className="es-stat-url">{l.url}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
