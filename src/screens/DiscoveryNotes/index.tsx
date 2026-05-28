import { useState, useEffect } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { useAppContext } from "../../context/AppContext";

const KIND_OPTIONS = [
  "人物", "組織", "語句", "政策", "統計項目", "別事件", "疑問点", "未確認事項",
] as const;
type NoteKind = typeof KIND_OPTIONS[number];

interface StoredNote {
  id: string;
  kind: NoteKind | "";
  content: string;
  related_event: string;
  related_source: string;
  memo: string;
}

const STORAGE_KEY = "discovery_notes";

const SEED_DATA: StoredNote[] = [
  {
    id: "1",
    kind: "組織",
    content: "OPEC",
    related_event: "第一次石油危機",
    related_source: "",
    memo: "",
  },
];

const KIND_COLOR: Record<NoteKind, string> = {
  人物:     "#5b7fff",
  組織:     "#27ae60",
  語句:     "#8e44ad",
  政策:     "#d35400",
  統計項目: "#2980b9",
  別事件:   "#c0392b",
  疑問点:   "#d4a017",
  未確認事項: "#9898b8",
};

function kindColor(kind: string): string {
  return KIND_COLOR[kind as NoteKind] ?? "#9898b8";
}

function emptyForm(): Omit<StoredNote, "id"> {
  return { kind: "", content: "", related_event: "", related_source: "", memo: "" };
}

function NoteCard({
  item,
  onDelete,
}: {
  item: StoredNote;
  onDelete: (id: string) => void;
}) {
  const color = kindColor(item.kind);
  const hasMeta = item.related_event || item.related_source || item.memo;
  return (
    <div className="dn-card" style={{ "--dn-color": color } as CSSProperties}>
      <div className="dn-card-top">
        {item.kind && (
          <span
            className="dn-kind-badge"
            style={{ color, borderColor: color + "55", background: color + "18" }}
          >
            {item.kind}
          </span>
        )}
        <button
          className="dn-delete-btn"
          onClick={() => onDelete(item.id)}
          title="削除"
        >
          ×
        </button>
      </div>

      {item.content && <p className="dn-card-content">{item.content}</p>}

      {hasMeta && (
        <div className="dn-card-meta">
          {item.related_event && (
            <div className="dn-meta-row">
              <span className="dn-meta-label">関連イベント</span>
              <span className="dn-meta-value">{item.related_event}</span>
            </div>
          )}
          {item.related_source && (
            <div className="dn-meta-row">
              <span className="dn-meta-label">関連資料</span>
              <span className="dn-meta-value">{item.related_source}</span>
            </div>
          )}
          {item.memo && (
            <div className="dn-meta-row">
              <span className="dn-meta-label">メモ</span>
              <span className="dn-meta-value">{item.memo}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DiscoveryNotes() {
  const { saveData, loadData, selectedEvent } = useAppContext();
  const [items, setItems] = useState<StoredNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    (async () => {
      const stored = await loadData<StoredNote[]>(STORAGE_KEY);
      if (stored) {
        setItems(stored);
      } else {
        setItems(SEED_DATA);
        await saveData(STORAGE_KEY, SEED_DATA);
      }
    })();
  }, [loadData, saveData]);

  function handleOpenForm() {
    const initialForm = emptyForm();
    if (selectedEvent) {
      initialForm.related_event = selectedEvent.title;
    }
    setForm(initialForm);
    setShowForm(true);
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!form.content.trim()) return;
    const newItem: StoredNote = { ...form, id: crypto.randomUUID() };
    const updated = [newItem, ...items];
    setItems(updated);
    await saveData(STORAGE_KEY, updated);
    setForm(emptyForm());
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    await saveData(STORAGE_KEY, updated);
  }

  function handleCancel() {
    setForm(emptyForm());
    setShowForm(false);
  }

  return (
    <div className="dn-root">
      <div className="dn-toolbar">
        <span className="dn-toolbar-title">発見メモ</span>
        {!showForm && (
          <button className="dn-add-btn" onClick={handleOpenForm}>
            ＋ メモを追加
          </button>
        )}
      </div>

      {selectedEvent && selectedEvent.discovery_notes.length > 0 && (
        <div className="db-readonly-section">
          <div className="db-readonly-header">DBメモ</div>
          <ul className="db-readonly-list">
            {selectedEvent.discovery_notes.map((note, i) => (
              <li key={i} className="db-readonly-item">{note}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="dn-body">
        {showForm && (
          <div className="dn-form-panel">
            <div className="dn-form-header">
              <span className="dn-form-title">新規発見メモ</span>
              <div className="dn-form-actions">
                <button className="dn-cancel-btn" onClick={handleCancel}>
                  キャンセル
                </button>
                <button className="dn-save-btn" onClick={handleSave}>
                  保存
                </button>
              </div>
            </div>
            <div className="dn-form-grid">
              <div className="es-form-group">
                <label className="es-form-label">種別</label>
                <select
                  className="es-form-select"
                  name="kind"
                  value={form.kind}
                  onChange={handleChange}
                >
                  <option value="">— 選択してください —</option>
                  {KIND_OPTIONS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div className="es-form-group">
                <label className="es-form-label">関連イベント</label>
                <input
                  className="es-form-input"
                  name="related_event"
                  value={form.related_event}
                  onChange={handleChange}
                  placeholder="例: 明治維新, 二二六事件"
                />
              </div>
              <div className="dn-form-full es-form-group">
                <label className="es-form-label">内容 *</label>
                <textarea
                  className="es-form-textarea"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="発見した内容を記録してください"
                  rows={4}
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">関連資料</label>
                <input
                  className="es-form-input"
                  name="related_source"
                  value={form.related_source}
                  onChange={handleChange}
                  placeholder="例: 帝国議会議事録 第42回"
                />
              </div>
              <div className="dn-form-full es-form-group">
                <label className="es-form-label">メモ</label>
                <textarea
                  className="es-form-textarea"
                  name="memo"
                  value={form.memo}
                  onChange={handleChange}
                  placeholder="補足・気づきなど"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {items.length === 0 && !showForm ? (
          <div className="dn-empty">
            <div className="dn-empty-icon">🔍</div>
            <p className="dn-empty-title">発見メモがまだありません</p>
            <p className="dn-empty-sub">
              資料を読んで気になった人物・語句・事件などをメモしておきましょう。
            </p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="dn-list-header">
                <span className="ps-list-count">{items.length}件のメモ</span>
              </div>
            )}
            <div className="ps-card-list">
              {items.map((item) => (
                <NoteCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
