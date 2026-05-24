import type { TimelineEvent, Category, Lane } from "../../types";
import eventsData from "../../data/events.json";
import { useState } from "react";

const events = eventsData as TimelineEvent[];

const CATEGORIES: Category[] = [
  "軍事・戦争",
  "思想・宗教・結社",
  "帝国・植民地・資源",
  "金融・通貨・制度",
  "国際機関・諜報・政策ネットワーク",
];

const LANES: Lane[] = ["世界史", "日本史", "制度・組織", "影響"];

export function Timeline() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "全て">("全て");
  const [japanOnly, setJapanOnly] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const filtered = events.filter((e) => {
    if (selectedCategory !== "全て" && e.category !== selectedCategory) return false;
    if (japanOnly && !e.japanConnection) return false;
    return true;
  });

  return (
    <div className="screen-timeline">
      <div className="timeline-toolbar">
        <div className="filter-group">
          <label>カテゴリー</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category | "全て")}
          >
            <option value="全て">全て</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={japanOnly}
              onChange={(e) => setJapanOnly(e.target.checked)}
            />
            日本接続のみ
          </label>
        </div>
      </div>

      <div className="lane-headers">
        {LANES.map((lane) => (
          <div key={lane} className="lane-header">{lane}</div>
        ))}
      </div>

      <div className="timeline-events">
        {filtered.length === 0 && (
          <div className="empty-state">イベントがありません</div>
        )}
        {filtered.map((event) => (
          <div
            key={event.id}
            className={`event-card ${selectedEvent?.id === event.id ? "selected" : ""}`}
            onClick={() => setSelectedEvent(event)}
          >
            <div className="event-year">{event.year}{event.month != null ? `/${event.month}` : ""}</div>
            <div className="event-meta">
              <span className="event-lane">{event.lane}</span>
              <span className="event-category">{event.category}</span>
              {event.isReference && <span className="badge-ref">基準</span>}
              {event.japanConnection && <span className="badge-jp">日本</span>}
            </div>
            <div className="event-title">{event.title}</div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="event-detail-panel">
          <button className="close-btn" onClick={() => setSelectedEvent(null)}>×</button>
          <h2>{selectedEvent.year}年 {selectedEvent.title}</h2>
          {selectedEvent.titleEn && <p className="title-en">{selectedEvent.titleEn}</p>}
          <div className="detail-meta">
            <span>{selectedEvent.lane}</span>
            <span>{selectedEvent.category}</span>
          </div>
          <p className="summary">{selectedEvent.summary}</p>
          <div className="tags">
            {selectedEvent.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
