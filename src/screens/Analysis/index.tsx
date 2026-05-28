import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAppContext } from "../../context/AppContext";

type TextKey =
  | "facts"
  | "analysis"
  | "speculation"
  | "consideration"
  | "unconfirmed"
  | "counter_evidence";

interface StoredAnalysis {
  id: string;
  related_event: string;
  facts: string;
  analysis: string;
  speculation: string;
  consideration: string;
  unconfirmed: string;
  counter_evidence: string;
  next_source: string;
  is_origin_candidate: boolean;
}

const STORAGE_KEY = "analysis";

const SEED_DATA: StoredAnalysis[] = [
  {
    id: "1",
    related_event: "第一次石油危機",
    facts: "1973年10月、OPECが石油禁輸措置を発動。原油価格が約4倍に上昇。",
    analysis: "石油価格上昇が日本の物価・産業に直撃した。",
    speculation: "OPECの決定には米国の中東政策への対抗が含まれていた可能性がある。",
    consideration: "",
    unconfirmed: "日本政府の事前情報収集の有無",
    counter_evidence: "",
    next_source: "FRUS 1973-1976 Volume XXXVI",
    is_origin_candidate: true,
  },
];

function emptyForm(): Omit<StoredAnalysis, "id"> {
  return {
    related_event: "",
    facts: "",
    analysis: "",
    speculation: "",
    consideration: "",
    unconfirmed: "",
    counter_evidence: "",
    next_source: "",
    is_origin_candidate: false,
  };
}

const TEXT_SECTIONS: { key: TextKey; label: string }[] = [
  { key: "facts",           label: "事実" },
  { key: "analysis",        label: "分析" },
  { key: "speculation",     label: "推察" },
  { key: "consideration",   label: "考察" },
  { key: "unconfirmed",     label: "未確認" },
  { key: "counter_evidence", label: "反対材料" },
];

function AnalysisCard({
  item,
  onDelete,
}: {
  item: StoredAnalysis;
  onDelete: (id: string) => void;
}) {
  const hasTextSections = TEXT_SECTIONS.some(({ key }) => item[key]);
  return (
    <div className={`an-card${item.is_origin_candidate ? " origin" : ""}`}>
      <div className="an-card-top">
        <span className="an-card-event">
          {item.related_event || "（イベント未設定）"}
        </span>
        {item.is_origin_candidate && (
          <span className="an-origin-badge">◆ ORIGIN候補</span>
        )}
        <button
          className="an-delete-btn"
          onClick={() => onDelete(item.id)}
          title="削除"
        >
          ×
        </button>
      </div>

      {hasTextSections && (
        <div className="an-card-sections">
          {TEXT_SECTIONS.map(({ key, label }) => {
            const val = item[key];
            return val ? (
              <div key={key} className="an-section">
                <span className="an-section-label">{label}</span>
                <p className="an-section-body">{val}</p>
              </div>
            ) : null;
          })}
        </div>
      )}

      {item.next_source && (
        <div className="an-next-source">
          <span className="an-next-label">次に見る資料</span>
          <span className="an-next-value">{item.next_source}</span>
        </div>
      )}
    </div>
  );
}

export function Analysis() {
  const { saveData, loadData, selectedEvent } = useAppContext();
  const dbAnalysis = selectedEvent?.analysis;
  const DB_ANALYSIS_SECTIONS = [
    { key: "facts"          as const, label: "事実" },
    { key: "analysis"       as const, label: "分析" },
    { key: "speculation"    as const, label: "推察" },
    { key: "unconfirmed"    as const, label: "未確認" },
    { key: "counter_evidence" as const, label: "反対材料" },
  ];
  const [items, setItems] = useState<StoredAnalysis[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    (async () => {
      const stored = await loadData<StoredAnalysis[]>(STORAGE_KEY);
      if (stored) {
        setItems(stored);
      } else {
        setItems(SEED_DATA);
        await saveData(STORAGE_KEY, SEED_DATA);
      }
    })();
  }, [loadData, saveData]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCheckbox(e: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, is_origin_candidate: e.target.checked }));
  }

  async function handleSave() {
    if (!form.related_event.trim() && !form.facts.trim()) return;
    const newItem: StoredAnalysis = { ...form, id: crypto.randomUUID() };
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
    <div className="an-root">
      <div className="an-toolbar">
        <span className="an-toolbar-title">推察・考察</span>
        {!showForm && (
          <button className="an-add-btn" onClick={() => setShowForm(true)}>
            ＋ 考察を追加
          </button>
        )}
      </div>

      {dbAnalysis && DB_ANALYSIS_SECTIONS.some(s => dbAnalysis[s.key].length > 0) && (
        <div className="db-readonly-section">
          <div className="db-readonly-header">DB考察</div>
          {DB_ANALYSIS_SECTIONS.map(({ key, label }) =>
            dbAnalysis[key].length > 0 ? (
              <div key={key} className="db-readonly-group">
                <div className="db-readonly-group-label">{label}</div>
                <ul className="db-readonly-list">
                  {dbAnalysis[key].map((item, i) => (
                    <li key={i} className="db-readonly-item">{item}</li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}

      <div className="an-body">
        {showForm && (
          <div className="an-form-panel">
            <div className="an-form-header">
              <span className="an-form-title">新規推察・考察</span>
              <div className="an-form-actions">
                <button className="an-cancel-btn" onClick={handleCancel}>
                  キャンセル
                </button>
                <button className="an-save-btn" onClick={handleSave}>
                  保存
                </button>
              </div>
            </div>
            <div className="an-form-grid">
              <div className="an-form-full es-form-group">
                <label className="es-form-label">関連イベント</label>
                <input
                  className="es-form-input"
                  name="related_event"
                  value={form.related_event}
                  onChange={handleChange}
                  placeholder="例: 日比谷焼打事件, ポーツマス条約"
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">事実</label>
                <textarea
                  className="es-form-textarea"
                  name="facts"
                  value={form.facts}
                  onChange={handleChange}
                  placeholder="確認済みの事実を記録"
                  rows={4}
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">分析</label>
                <textarea
                  className="es-form-textarea"
                  name="analysis"
                  value={form.analysis}
                  onChange={handleChange}
                  placeholder="事実から読み取れること"
                  rows={4}
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">推察</label>
                <textarea
                  className="es-form-textarea"
                  name="speculation"
                  value={form.speculation}
                  onChange={handleChange}
                  placeholder="根拠のある推測"
                  rows={4}
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">考察</label>
                <textarea
                  className="es-form-textarea"
                  name="consideration"
                  value={form.consideration}
                  onChange={handleChange}
                  placeholder="総合的な考察"
                  rows={4}
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">未確認</label>
                <textarea
                  className="es-form-textarea"
                  name="unconfirmed"
                  value={form.unconfirmed}
                  onChange={handleChange}
                  placeholder="まだ確認できていない点"
                  rows={4}
                />
              </div>
              <div className="es-form-group">
                <label className="es-form-label">反対材料</label>
                <textarea
                  className="es-form-textarea"
                  name="counter_evidence"
                  value={form.counter_evidence}
                  onChange={handleChange}
                  placeholder="推察に反する証拠・論点"
                  rows={4}
                />
              </div>
              <div className="an-form-full es-form-group">
                <label className="es-form-label">次に見る資料</label>
                <input
                  className="es-form-input"
                  name="next_source"
                  value={form.next_source}
                  onChange={handleChange}
                  placeholder="例: 外交記録集第3巻, 山縣有朋日記"
                />
              </div>
              <div className="an-form-full">
                <label className="an-form-checkbox-label">
                  <input
                    type="checkbox"
                    className="an-form-checkbox"
                    checked={form.is_origin_candidate}
                    onChange={handleCheckbox}
                  />
                  ORIGIN素材候補にする
                </label>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 && !showForm ? (
          <div className="an-empty">
            <div className="an-empty-icon">🧠</div>
            <p className="an-empty-title">推察・考察がまだありません</p>
            <p className="an-empty-sub">
              収集した資料をもとに、事実・分析・推察を整理しましょう。
            </p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="an-list-header">
                <span className="ps-list-count">{items.length}件の考察</span>
              </div>
            )}
            <div className="ps-card-list">
              {items.map((item) => (
                <AnalysisCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
