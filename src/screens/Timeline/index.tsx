import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { TimelineEvent, Category } from "../../types";
import eventsData from "../../data/events.json";
import { useAppContext } from "../../context/AppContext";
import { SourceDiscoveryPanel } from "../../components/SourceDiscoveryPanel";

const allEvents = [...(eventsData as TimelineEvent[])].sort((a, b) => a.year - b.year);

const CATEGORIES: Category[] = [
  "軍事・戦争",
  "思想・宗教・結社",
  "帝国・植民地・資源",
  "金融・通貨・制度",
  "国際機関・諜報・政策ネットワーク",
];

const CATEGORY_COLOR: Record<Category, string> = {
  "軍事・戦争":                    "#c0392b",
  "思想・宗教・結社":               "#8e44ad",
  "帝国・植民地・資源":             "#d35400",
  "金融・通貨・制度":               "#2980b9",
  "国際機関・諜報・政策ネットワーク": "#27ae60",
};

const REGION_LABEL: Record<string, string> = {
  world:       "世界",
  japan:       "日本",
  institution: "制度・組織",
  impact:      "影響",
};

const TIME_LAYERS = [
  "基層", "接続形成層", "制度化層", "世界接続層", "現代秩序層", "デジタル・金融層",
];

const UPPER_CATEGORIES = [
  "基層・正統性",
  "結社・非公式ネットワーク",
  "国家・戦争・国際秩序",
  "通商・資金・企業・資源",
  "知識・政策・情報・技術",
  "社会・人口・環境",
  "法人制度・公益・政治接続",
];

const ALL_REGIONS = [
  "中東", "地中海", "東アジア", "南アジア", "東南アジア", "中央アジア",
  "欧州", "北アフリカ", "サブサハラアフリカ", "北米", "中南米", "オセアニア",
  "日本", "全世界",
];

export function Timeline() {
  const [activeCat,       setActiveCat]       = useState<Category | "全て">("全て");
  const [japanOnly,       setJapanOnly]       = useState(false);
  const [filterTimeLayer, setFilterTimeLayer] = useState("");
  const [filterUpperCat,  setFilterUpperCat]  = useState("");
  const [filterRegions,   setFilterRegions]   = useState<Set<string>>(new Set());
  const [selected,        setSelected]        = useState<TimelineEvent | null>(null);
  const { setSelectedEvent } = useAppContext();
  const navigate = useNavigate();

  // ── AND 絞り込み ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      if (activeCat !== "全て" && e.category !== activeCat) return false;
      if (japanOnly && !e.japan_connection) return false;
      if (filterTimeLayer && e.time_layer !== filterTimeLayer) return false;
      if (filterUpperCat  && e.upper_category !== filterUpperCat) return false;
      if (filterRegions.size > 0) {
        const tags = e.region_tags ?? [];
        if (!Array.from(filterRegions).some(r => tags.includes(r))) return false;
      }
      return true;
    });
  }, [activeCat, japanOnly, filterTimeLayer, filterUpperCat, filterRegions]);

  function toggleRegion(region: string) {
    setFilterRegions(prev => {
      const next = new Set(prev);
      next.has(region) ? next.delete(region) : next.add(region);
      return next;
    });
  }

  function clearNewFilters() {
    setFilterTimeLayer("");
    setFilterUpperCat("");
    setFilterRegions(new Set());
  }

  const hasNewFilters = !!(filterTimeLayer || filterUpperCat || filterRegions.size > 0);

  function handleCardClick(event: TimelineEvent) {
    const next = selected?.id === event.id ? null : event;
    setSelected(next);
    setSelectedEvent(next);
  }

  return (
    <div className="tl-root">

      {/* ── フィルター行1: 旧カテゴリ + 日本接続 ── */}
      <div className="tl-filters">
        <div className="tl-catbtns">
          <button
            className={`cat-btn ${activeCat === "全て" ? "active all" : ""}`}
            onClick={() => setActiveCat("全て")}
          >
            全て
            <span className="cat-count">{allEvents.length}</span>
          </button>
          {CATEGORIES.map((c) => {
            const count = allEvents.filter((e) => e.category === c).length;
            const isActive = activeCat === c;
            return (
              <button
                key={c}
                className={`cat-btn ${isActive ? "active" : ""}`}
                style={
                  isActive
                    ? { borderColor: CATEGORY_COLOR[c], color: CATEGORY_COLOR[c] }
                    : { "--cat-color": CATEGORY_COLOR[c] } as React.CSSProperties
                }
                onClick={() => setActiveCat(isActive ? "全て" : c)}
              >
                <span className="cat-dot" style={{ background: CATEGORY_COLOR[c] }} />
                {c}
                <span className="cat-count">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          className={`japan-toggle ${japanOnly ? "on" : ""}`}
          onClick={() => setJapanOnly((v) => !v)}
        >
          <span className="toggle-track"><span className="toggle-thumb" /></span>
          日本接続のみ
        </button>
      </div>

      {/* ── フィルター行2: time_layer / upper_category / region_tags / 件数 ── */}
      <div className="tl-filters2">
        {/* 時代層 */}
        <select
          className={`tl-select ${filterTimeLayer ? "sel-active" : ""}`}
          value={filterTimeLayer}
          onChange={e => setFilterTimeLayer(e.target.value)}
        >
          <option value="">時代層：すべて</option>
          {TIME_LAYERS.map(tl => (
            <option key={tl} value={tl}>{tl}</option>
          ))}
        </select>

        {/* 上位分類 */}
        <select
          className={`tl-select ${filterUpperCat ? "sel-active" : ""}`}
          value={filterUpperCat}
          onChange={e => setFilterUpperCat(e.target.value)}
        >
          <option value="">上位分類：すべて</option>
          {UPPER_CATEGORIES.map(uc => (
            <option key={uc} value={uc}>{uc}</option>
          ))}
        </select>

        {/* 地域タグ（複数選択） */}
        <div className="tl-region-chips">
          {ALL_REGIONS.map(r => (
            <button
              key={r}
              className={`tl-region-chip ${filterRegions.has(r) ? "on" : ""}`}
              onClick={() => toggleRegion(r)}
            >
              {r}
            </button>
          ))}
        </div>

        {/* クリア + 件数 */}
        <div className="tl-filter-right">
          {hasNewFilters && (
            <button className="tl-clear-btn" onClick={clearNewFilters}>
              クリア
            </button>
          )}
          <span className="tl-count-display">
            <span className="tl-count-n">{filtered.length}</span>
            <span className="tl-count-sep"> / {allEvents.length}</span>
            <span className="tl-count-label">件</span>
          </span>
        </div>
      </div>

      {/* ── メインエリア ── */}
      <div className={`tl-body ${selected ? "has-detail" : ""}`}>

        {/* イベントリスト */}
        <div className="tl-list">
          {filtered.length === 0 && (
            <div className="tl-empty">条件に合うイベントがありません</div>
          )}
          {filtered.map((event) => (
            <div
              key={event.id}
              className={`ev-card ${event.japan_connection ? "jp" : ""} ${selected?.id === event.id ? "selected" : ""}`}
              style={{ "--cat-color": CATEGORY_COLOR[event.category] } as React.CSSProperties}
              onClick={() => handleCardClick(event)}
            >
              <div className="ev-year">{event.year}</div>
              <div className="ev-body">
                <div className="ev-title">{event.title}</div>
                <div className="ev-meta">
                  <span className="ev-cat" style={{ color: CATEGORY_COLOR[event.category] }}>
                    {event.category}
                  </span>
                  {event.upper_category && (
                    <span className="ev-upper-cat">{event.upper_category}</span>
                  )}
                  {event.japan_connection && (
                    <span className="ev-jp-badge">JP</span>
                  )}
                </div>
                {event.region_tags && event.region_tags.length > 0 && (
                  <div className="ev-region-tags">
                    {event.region_tags.map(r => (
                      <span key={r} className="ev-region-tag">{r}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 詳細パネル */}
        {selected && (
          <div className="tl-detail">
            <button
              className="detail-close"
              onClick={() => setSelected(null)}
              aria-label="閉じる"
            >
              ×
            </button>

            <div
              className="detail-cat-bar"
              style={{ background: CATEGORY_COLOR[selected.category] }}
            />

            <div className="detail-inner">
              <div className="detail-year">{selected.year}年</div>
              <h2 className="detail-title">{selected.title}</h2>

              <div className="detail-tags">
                <span
                  className="detail-tag"
                  style={{
                    color: CATEGORY_COLOR[selected.category],
                    borderColor: CATEGORY_COLOR[selected.category] + "55",
                  }}
                >
                  {selected.category}
                </span>
                <span className="detail-tag">
                  {REGION_LABEL[selected.region] ?? selected.region}
                </span>
                {selected.japan_connection && (
                  <span className="detail-tag jp">日本接続</span>
                )}
                {selected.time_layer && (
                  <span className="detail-tag">{selected.time_layer}</span>
                )}
                {selected.upper_category && (
                  <span className="detail-tag">{selected.upper_category}</span>
                )}
                {selected.mid_category && (
                  <span className="detail-tag">{selected.mid_category}</span>
                )}
              </div>

              {selected.region_tags && selected.region_tags.length > 0 && (
                <div className="detail-region-tags">
                  {selected.region_tags.map(r => (
                    <span key={r} className="detail-region-tag">{r}</span>
                  ))}
                </div>
              )}

              <p className="detail-summary">{selected.summary}</p>

              <div className="detail-section-label">一次資料</div>
              <p className="detail-empty-note">
                {selected.primary_sources.length === 0
                  ? "未登録"
                  : `${selected.primary_sources.length}件`}
              </p>
              <button
                className="detail-ps-link"
                onClick={() => navigate("/primary-sources")}
              >
                一次資料を見る →
              </button>

              <div className="detail-section-label">発見メモ</div>
              <p className="detail-empty-note">
                {selected.discovery_notes.length === 0
                  ? "未登録"
                  : `${selected.discovery_notes.length}件`}
              </p>

              <SourceDiscoveryPanel event={selected} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
