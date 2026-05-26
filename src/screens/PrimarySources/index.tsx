import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import type { PrimarySource } from "../../types";

const SOURCE_TYPE_COLOR: Record<string, string> = {
  議事録: "#5b7fff",
  白書:   "#27ae60",
  条約:   "#d35400",
  報告書: "#8e44ad",
  新聞:   "#c0392b",
  統計:   "#2980b9",
};

function sourceTypeColor(type: string) {
  return SOURCE_TYPE_COLOR[type] ?? "#9898b8";
}

function SourceCard({ src }: { src: PrimarySource }) {
  const color = sourceTypeColor(src.source_type);
  return (
    <div className="ps-card" style={{ "--ps-color": color } as React.CSSProperties}>
      <div className="ps-card-top">
        <span className="ps-type-badge" style={{ color, borderColor: color + "55", background: color + "18" }}>
          {src.source_type}
        </span>
        {src.url && (
          <a
            className="ps-url-link"
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            外部リンク ↗
          </a>
        )}
      </div>

      <h3 className="ps-card-title">{src.title}</h3>

      <div className="ps-card-meta">
        <div className="ps-meta-row">
          <span className="ps-meta-label">発行元・所蔵元</span>
          <span className="ps-meta-value">{src.publisher || "—"}</span>
        </div>
        <div className="ps-meta-row">
          <span className="ps-meta-label">作成年</span>
          <span className="ps-meta-value">
            {src.created_year != null ? `${src.created_year}年` : "不明"}
          </span>
        </div>
        <div className="ps-meta-row">
          <span className="ps-meta-label">公開年</span>
          <span className="ps-meta-value">
            {src.published_year != null ? (
              typeof src.published_year === "number"
                ? `${src.published_year}年`
                : src.published_year
            ) : "不明"}
          </span>
        </div>
        <div className="ps-meta-row">
          <span className="ps-meta-label">関連年表</span>
          <span className="ps-meta-value">{src.related_timeline || "—"}</span>
        </div>
        <div className="ps-meta-row">
          <span className="ps-meta-label">関連イベント</span>
          <span className="ps-meta-value">{src.related_event || "—"}</span>
        </div>
      </div>
    </div>
  );
}

export function PrimarySources() {
  const { selectedEvent } = useAppContext();
  const navigate = useNavigate();

  if (!selectedEvent) {
    return (
      <div className="ps-empty-state">
        <div className="ps-empty-icon">📄</div>
        <p className="ps-empty-title">年表からイベントを選んでください</p>
        <p className="ps-empty-sub">
          年表でイベントカードをクリックすると、ここに一次資料が表示されます。
        </p>
        <button className="ps-goto-timeline" onClick={() => navigate("/")}>
          年表へ →
        </button>
      </div>
    );
  }

  const sources = selectedEvent.primary_sources;

  return (
    <div className="ps-root">
      {/* イベントヘッダー */}
      <div className="ps-event-header">
        <div className="ps-event-year">{selectedEvent.year}年</div>
        <div className="ps-event-info">
          <h2 className="ps-event-title">{selectedEvent.title}</h2>
          <span className="ps-event-cat">{selectedEvent.category}</span>
        </div>
        <button className="ps-back-btn" onClick={() => navigate("/")}>
          ← 年表に戻る
        </button>
      </div>

      {/* 資料リスト */}
      <div className="ps-body">
        {sources.length === 0 ? (
          <div className="ps-no-sources">
            <p className="ps-no-sources-title">一次資料が未登録です</p>
            <p className="ps-no-sources-sub">このイベントにはまだ一次資料が登録されていません。</p>
          </div>
        ) : (
          <>
            <div className="ps-list-header">
              <span className="ps-list-count">{sources.length}件の一次資料</span>
            </div>
            <div className="ps-card-list">
              {sources.map((src, i) => (
                <SourceCard key={i} src={src} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
