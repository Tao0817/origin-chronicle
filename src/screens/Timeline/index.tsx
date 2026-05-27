import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { TimelineEvent, Category } from "../../types";
import eventsData from "../../data/events.json";
import { useAppContext } from "../../context/AppContext";

const allEvents = [...(eventsData as TimelineEvent[])].sort((a, b) => a.year - b.year);

const CATEGORIES: Category[] = [
  "軍事・戦争",
  "思想・宗教・結社",
  "帝国・植民地・資源",
  "金融・通貨・制度",
  "国際機関・諜報・政策ネットワーク",
];

const CATEGORY_COLOR: Record<Category, string> = {
  "軍事・戦争":               "#c0392b",
  "思想・宗教・結社":           "#8e44ad",
  "帝国・植民地・資源":         "#d35400",
  "金融・通貨・制度":           "#2980b9",
  "国際機関・諜報・政策ネットワーク": "#27ae60",
};

const REGION_LABEL: Record<string, string> = {
  world:       "世界",
  japan:       "日本",
  institution: "制度・組織",
  impact:      "影響",
};

export function Timeline() {
  const [activeCat, setActiveCat] = useState<Category | "全て">("全て");
  const [japanOnly, setJapanOnly] = useState(false);
  const [selected, setSelected]   = useState<TimelineEvent | null>(null);
  const { setSelectedEvent } = useAppContext();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      if (activeCat !== "全て" && e.category !== activeCat) return false;
      if (japanOnly && !e.japan_connection) return false;
      return true;
    });
  }, [activeCat, japanOnly]);

  function handleCardClick(event: TimelineEvent) {
    const next = selected?.id === event.id ? null : event;
    setSelected(next);
    setSelectedEvent(next);
  }

  return (
    <div className="tl-root">

      {/* ── フィルター行 ── */}
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
                style={isActive ? { borderColor: CATEGORY_COLOR[c], color: CATEGORY_COLOR[c] } : { "--cat-color": CATEGORY_COLOR[c] } as React.CSSProperties}
                onClick={() => setActiveCat(isActive ? "全て" : c)}
              >
                <span
                  className="cat-dot"
                  style={{ background: CATEGORY_COLOR[c] }}
                />
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
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
          日本接続のみ
        </button>
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
                  <span
                    className="ev-cat"
                    style={{ color: CATEGORY_COLOR[event.category] }}
                  >
                    {event.category}
                  </span>
                  {event.japan_connection && (
                    <span className="ev-jp-badge">JP</span>
                  )}
                </div>
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
              </div>

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
