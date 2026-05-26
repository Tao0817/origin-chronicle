import { useState, useEffect } from "react";
import type { ChangeEvent, CSSProperties } from "react";

interface StoredResource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  type: string;
  createdYear: string;
  publishedYear: string;
  relatedTimeline: string;
  relatedEvent: string;
}

const STORAGE_KEY = "ri_resources";

function loadResources(): StoredResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredResource[]) : [];
  } catch {
    return [];
  }
}

function saveResources(items: StoredResource[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage quota exceeded or private browsing restriction
  }
}

const SOURCE_TYPE_COLOR: Record<string, string> = {
  議事録: "#5b7fff",
  白書:   "#27ae60",
  条約:   "#d35400",
  報告書: "#8e44ad",
  新聞:   "#c0392b",
  統計:   "#2980b9",
  書籍:   "#d4a017",
  映像:   "#e74c3c",
};

function typeColor(type: string): string {
  return SOURCE_TYPE_COLOR[type] ?? "#9898b8";
}

function emptyForm(): Omit<StoredResource, "id"> {
  return {
    title: "",
    url: "",
    publisher: "",
    type: "",
    createdYear: "",
    publishedYear: "",
    relatedTimeline: "",
    relatedEvent: "",
  };
}

function ResourceCard({
  item,
  onDelete,
}: {
  item: StoredResource;
  onDelete: (id: string) => void;
}) {
  const color = typeColor(item.type);
  return (
    <div
      className="ps-card ri-card"
      style={{ "--ps-color": color } as CSSProperties}
    >
      <div className="ps-card-top">
        {item.type && (
          <span
            className="ps-type-badge"
            style={{
              color,
              borderColor: color + "55",
              background: color + "18",
            }}
          >
            {item.type}
          </span>
        )}
        <div className="ri-card-actions">
          {item.url && (
            <a
              className="ps-url-link"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              外部リンク ↗
            </a>
          )}
          <button
            className="ri-delete-btn"
            onClick={() => onDelete(item.id)}
            title="削除"
          >
            ×
          </button>
        </div>
      </div>

      <h3 className="ps-card-title">{item.title}</h3>

      <div className="ps-card-meta">
        <div className="ps-meta-row">
          <span className="ps-meta-label">発行元・所蔵元</span>
          <span className="ps-meta-value">{item.publisher || "—"}</span>
        </div>
        <div className="ps-meta-row">
          <span className="ps-meta-label">作成年</span>
          <span className="ps-meta-value">{item.createdYear || "不明"}</span>
        </div>
        <div className="ps-meta-row">
          <span className="ps-meta-label">公開年</span>
          <span className="ps-meta-value">{item.publishedYear || "不明"}</span>
        </div>
        <div className="ps-meta-row">
          <span className="ps-meta-label">関連年表</span>
          <span className="ps-meta-value">{item.relatedTimeline || "—"}</span>
        </div>
        <div className="ps-meta-row">
          <span className="ps-meta-label">関連イベント</span>
          <span className="ps-meta-value">{item.relatedEvent || "—"}</span>
        </div>
      </div>
    </div>
  );
}

export function ResourceInbox() {
  const [items, setItems] = useState<StoredResource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    setItems(loadResources());
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as typeof prev));
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const newItem: StoredResource = { ...form, id: crypto.randomUUID() };
    const updated = [newItem, ...items];
    setItems(updated);
    saveResources(updated);
    setForm(emptyForm());
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveResources(updated);
  }

  function handleCancel() {
    setForm(emptyForm());
    setShowForm(false);
  }

  return (
    <div className="ri-root">
      {/* ツールバー */}
      <div className="ri-toolbar">
        <span className="ri-toolbar-title">資料インボックス</span>
        {!showForm && (
          <button className="ri-add-btn" onClick={() => setShowForm(true)}>
            ＋ 資料を追加
          </button>
        )}
      </div>

      {/* スクロールエリア */}
      <div className="ri-body">
        {/* 追加フォーム */}
        {showForm && (
          <div className="ri-form-panel">
            <div className="ri-form-header">
              <span className="ri-form-title">新規資料カード</span>
              <div className="ri-form-actions">
                <button className="ri-cancel-btn" onClick={handleCancel}>
                  キャンセル
                </button>
                <button className="ri-save-btn" onClick={handleSave}>
                  保存
                </button>
              </div>
            </div>
            <div className="ri-form-grid">
              <div className="ri-form-full es-form-group">
                <label className="es-form-label">資料タイトル *</label>
                <input
                  className="es-form-input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="第71回国会 石油問題に関する特別委員会 会議録"
                />
              </div>
              <div className="ri-form-full es-form-group">
                <label className="es-form-label">URL</label>
                <input
                  className="es-form-input"
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://kokkai.ndl.go.jp/"
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">発行元・所蔵元</label>
                <input
                  className="es-form-input"
                  name="publisher"
                  value={form.publisher}
                  onChange={handleChange}
                  placeholder="国会会議録検索システム"
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">資料種別</label>
                <input
                  className="es-form-input"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  placeholder="議事録"
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">作成年</label>
                <input
                  className="es-form-input"
                  name="createdYear"
                  value={form.createdYear}
                  onChange={handleChange}
                  placeholder="1973"
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">公開年</label>
                <input
                  className="es-form-input"
                  name="publishedYear"
                  value={form.publishedYear}
                  onChange={handleChange}
                  placeholder="1974"
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">関連年表（カテゴリー）</label>
                <input
                  className="es-form-input"
                  name="relatedTimeline"
                  value={form.relatedTimeline}
                  onChange={handleChange}
                  placeholder="帝国・植民地・資源"
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">関連イベント</label>
                <input
                  className="es-form-input"
                  name="relatedEvent"
                  value={form.relatedEvent}
                  onChange={handleChange}
                  placeholder="第一次石油危機"
                />
              </div>
            </div>
          </div>
        )}

        {/* カード一覧 */}
        {items.length === 0 && !showForm ? (
          <div className="ri-empty">
            <div className="ri-empty-icon">📥</div>
            <p className="ri-empty-title">資料カードがまだありません</p>
            <p className="ri-empty-sub">
              「＋ 資料を追加」で見つけた資料を保存してください。
            </p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="ri-list-header">
                <span className="ps-list-count">{items.length}件の資料</span>
              </div>
            )}
            <div className="ps-card-list">
              {items.map((item) => (
                <ResourceCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
