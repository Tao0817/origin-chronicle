import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { TimelineEvent, Category, PrimarySource, EventAnalysis } from "../../types";
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

// Analysis サブセクション定義
const ANALYSIS_FIELDS: { key: keyof EventAnalysis; label: string; color: string }[] = [
  { key: "facts",           label: "FACTS",              color: "#3aaa6a" },
  { key: "analysis",        label: "STRUCTURAL ANALYSIS", color: "#5ab4f0" },
  { key: "speculation",     label: "SPECULATION",         color: "#c8a830" },
  { key: "unconfirmed",     label: "UNCONFIRMED",         color: "#c87030" },
  { key: "counter_evidence",label: "COUNTER EVIDENCE",    color: "#c84040" },
];

const EMPTY_ANALYSIS: EventAnalysis = {
  facts: [], analysis: [], speculation: [], unconfirmed: [], counter_evidence: [],
};

// ── インラインスタイル定数 ───────────────────────────────────
const S = {
  section: {
    marginTop: 16,
    background: "#0a1020",
    border: "1px solid #1a2535",
    borderRadius: 5,
    padding: "10px 12px",
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
  } as React.CSSProperties,
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    cursor: "pointer",
    userSelect: "none" as const,
  },
  sectionLabel: { color: "#5ab4f0", letterSpacing: 1, fontSize: 11, fontWeight: 700 },
  badge: {
    background: "#0a2035",
    border: "1px solid #1e3a5a",
    color: "#5ab4f0",
    borderRadius: 3,
    padding: "0 5px",
    fontSize: 10,
    fontVariantNumeric: "tabular-nums",
  } as React.CSSProperties,
  empty: { color: "#3a4a5a", fontSize: 11, padding: "4px 0" },
  itemRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    padding: "3px 0",
    borderBottom: "1px solid #0d1a2a",
  } as React.CSSProperties,
  itemText: { flex: 1, color: "#c0d0e0", fontSize: 11, lineHeight: 1.5, wordBreak: "break-all" as const },
  delBtn: {
    background: "none",
    border: "none",
    color: "#3a4a5a",
    cursor: "pointer",
    padding: "0 3px",
    fontSize: 13,
    lineHeight: 1,
    flexShrink: 0,
  } as React.CSSProperties,
  addRow: { display: "flex", gap: 5, marginTop: 8 } as React.CSSProperties,
  input: {
    flex: 1,
    background: "#060d1a",
    border: "1px solid #1a2535",
    borderRadius: 3,
    color: "#c0d0e0",
    padding: "4px 7px",
    fontSize: 11,
    fontFamily: "inherit",
    outline: "none",
  } as React.CSSProperties,
  addBtn: {
    background: "#0a1f35",
    border: "1px solid #1e3a5a",
    color: "#5ab4f0",
    borderRadius: 3,
    padding: "4px 10px",
    fontSize: 11,
    cursor: "pointer",
    flexShrink: 0,
    fontFamily: "inherit",
  } as React.CSSProperties,
  saveBtn: {
    display: "block",
    width: "100%",
    marginTop: 16,
    background: "#0a1f35",
    border: "1px solid #1e3a5a",
    color: "#5ab4f0",
    borderRadius: 4,
    padding: "7px 0",
    fontSize: 11,
    letterSpacing: 1,
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    textAlign: "center" as const,
  } as React.CSSProperties,
};

export function Timeline() {
  const [activeCat,       setActiveCat]       = useState<Category | "全て">("全て");
  const [japanOnly,       setJapanOnly]       = useState(false);
  const [filterTimeLayer, setFilterTimeLayer] = useState("");
  const [filterUpperCat,  setFilterUpperCat]  = useState("");
  const [filterRegions,   setFilterRegions]   = useState<Set<string>>(new Set());
  const [selected,        setSelected]        = useState<TimelineEvent | null>(null);

  // 編集用ローカル入力状態
  const [newSource,     setNewSource]     = useState("");
  const [newNote,       setNewNote]       = useState("");
  const [analysisInput, setAnalysisInput] = useState<Record<string, string>>({
    facts: "", analysis: "", speculation: "", unconfirmed: "", counter_evidence: "",
  });
  const [analysisOpen, setAnalysisOpen] = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);

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
    // パネルを開く際に入力をリセット
    setNewSource(""); setNewNote("");
    setAnalysisInput({ facts:"", analysis:"", speculation:"", unconfirmed:"", counter_evidence:"" });
    setAnalysisOpen(true);
  }

  // ── 選択イベントのフィールドを更新 ─────────────────────────
  function updateSelected(patch: Partial<TimelineEvent>) {
    if (!selected) return;
    const next = { ...selected, ...patch };
    setSelected(next);
    setSelectedEvent(next);
  }

  // PRIMARY SOURCES
  function handleAddSource() {
    if (!selected || !newSource.trim()) return;
    const entry: PrimarySource = {
      title: newSource.trim(), url: "", publisher: "",
      source_type: "", created_year: null, published_year: null,
      related_timeline: "", related_event: "",
    };
    updateSelected({ primary_sources: [...(selected.primary_sources ?? []), entry] });
    setNewSource("");
  }
  function handleRemoveSource(idx: number) {
    if (!selected) return;
    updateSelected({ primary_sources: (selected.primary_sources ?? []).filter((_, i) => i !== idx) });
  }

  // DISCOVERY NOTES
  function handleAddNote() {
    if (!selected || !newNote.trim()) return;
    updateSelected({ discovery_notes: [...(selected.discovery_notes ?? []), newNote.trim()] });
    setNewNote("");
  }
  function handleRemoveNote(idx: number) {
    if (!selected) return;
    updateSelected({ discovery_notes: (selected.discovery_notes ?? []).filter((_, i) => i !== idx) });
  }

  // ANALYSIS
  function handleAddAnalysis(key: keyof EventAnalysis) {
    if (!selected || !analysisInput[key]?.trim()) return;
    const cur = selected.analysis ?? EMPTY_ANALYSIS;
    updateSelected({ analysis: { ...cur, [key]: [...(cur[key] ?? []), analysisInput[key].trim()] } });
    setAnalysisInput(prev => ({ ...prev, [key]: "" }));
  }
  function handleRemoveAnalysis(key: keyof EventAnalysis, idx: number) {
    if (!selected) return;
    const cur = selected.analysis ?? EMPTY_ANALYSIS;
    updateSelected({ analysis: { ...cur, [key]: (cur[key] ?? []).filter((_, i) => i !== idx) } });
  }

  // SAVE
  async function handleSave() {
    if (!selected || isSaving) return;
    setIsSaving(true);
    try {
      const api = (window as Window & { electronAPI?: { saveEvent?: (e: unknown) => Promise<{ ok: boolean }> } }).electronAPI;
      if (api?.saveEvent) {
        await api.saveEvent(selected);
      } else {
        // ブラウザ fallback: localStorage
        const stored = localStorage.getItem("events_edits") ?? "[]";
        const edits: TimelineEvent[] = JSON.parse(stored);
        const i = edits.findIndex(e => e.id === selected.id);
        if (i >= 0) edits[i] = selected; else edits.push(selected);
        localStorage.setItem("events_edits", JSON.stringify(edits));
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="tl-root">

      {/* ── フィルター行1 ── */}
      <div className="tl-filters">
        <div className="tl-catbtns">
          <button
            className={`cat-btn ${activeCat === "全て" ? "active all" : ""}`}
            onClick={() => setActiveCat("全て")}
          >
            全て<span className="cat-count">{allEvents.length}</span>
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
                <span className="cat-dot" style={{ background: CATEGORY_COLOR[c] }} />
                {c}<span className="cat-count">{count}</span>
              </button>
            );
          })}
        </div>
        <button className={`japan-toggle ${japanOnly ? "on" : ""}`} onClick={() => setJapanOnly((v) => !v)}>
          <span className="toggle-track"><span className="toggle-thumb" /></span>
          日本接続のみ
        </button>
      </div>

      {/* ── フィルター行2 ── */}
      <div className="tl-filters2">
        <select className={`tl-select ${filterTimeLayer ? "sel-active" : ""}`} value={filterTimeLayer} onChange={e => setFilterTimeLayer(e.target.value)}>
          <option value="">時代層：すべて</option>
          {TIME_LAYERS.map(tl => <option key={tl} value={tl}>{tl}</option>)}
        </select>
        <select className={`tl-select ${filterUpperCat ? "sel-active" : ""}`} value={filterUpperCat} onChange={e => setFilterUpperCat(e.target.value)}>
          <option value="">上位分類：すべて</option>
          {UPPER_CATEGORIES.map(uc => <option key={uc} value={uc}>{uc}</option>)}
        </select>
        <div className="tl-region-chips">
          {ALL_REGIONS.map(r => (
            <button key={r} className={`tl-region-chip ${filterRegions.has(r) ? "on" : ""}`} onClick={() => toggleRegion(r)}>{r}</button>
          ))}
        </div>
        <div className="tl-filter-right">
          {hasNewFilters && <button className="tl-clear-btn" onClick={clearNewFilters}>クリア</button>}
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
          {filtered.length === 0 && <div className="tl-empty">条件に合うイベントがありません</div>}
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
                  <span className="ev-cat" style={{ color: CATEGORY_COLOR[event.category] }}>{event.category}</span>
                  {event.upper_category && <span className="ev-upper-cat">{event.upper_category}</span>}
                  {event.japan_connection && <span className="ev-jp-badge">JP</span>}
                </div>
                {event.region_tags && event.region_tags.length > 0 && (
                  <div className="ev-region-tags">
                    {event.region_tags.map(r => <span key={r} className="ev-region-tag">{r}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 詳細パネル */}
        {selected && (
          <div className="tl-detail">
            <button className="detail-close" onClick={() => setSelected(null)} aria-label="閉じる">×</button>
            <div className="detail-cat-bar" style={{ background: CATEGORY_COLOR[selected.category] }} />

            <div className="detail-inner">
              <div className="detail-year">{selected.year}年</div>
              <h2 className="detail-title">{selected.title}</h2>

              <div className="detail-tags">
                <span className="detail-tag" style={{ color: CATEGORY_COLOR[selected.category], borderColor: CATEGORY_COLOR[selected.category] + "55" }}>
                  {selected.category}
                </span>
                <span className="detail-tag">{REGION_LABEL[selected.region] ?? selected.region}</span>
                {selected.japan_connection && <span className="detail-tag jp">日本接続</span>}
                {selected.time_layer     && <span className="detail-tag">{selected.time_layer}</span>}
                {selected.upper_category && <span className="detail-tag">{selected.upper_category}</span>}
                {selected.mid_category   && <span className="detail-tag">{selected.mid_category}</span>}
              </div>

              {selected.region_tags && selected.region_tags.length > 0 && (
                <div className="detail-region-tags">
                  {selected.region_tags.map(r => <span key={r} className="detail-region-tag">{r}</span>)}
                </div>
              )}

              <p className="detail-summary">{selected.summary}</p>

              {/* ══ PRIMARY SOURCES ══ */}
              <div style={S.section}>
                <div style={S.sectionHeader}>
                  <span style={S.sectionLabel}>▸ PRIMARY SOURCES</span>
                  <span style={S.badge}>{(selected.primary_sources ?? []).length}</span>
                </div>
                {(selected.primary_sources ?? []).length === 0
                  ? <div style={S.empty}>未登録</div>
                  : (selected.primary_sources ?? []).map((src, i) => (
                    <div key={i} style={S.itemRow}>
                      <span style={S.itemText}>{src.title || "(無題)"}</span>
                      <button style={S.delBtn} onClick={() => handleRemoveSource(i)}>×</button>
                    </div>
                  ))
                }
                <div style={S.addRow}>
                  <input
                    style={S.input}
                    value={newSource}
                    onChange={e => setNewSource(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddSource()}
                    placeholder="タイトルを入力..."
                  />
                  <button style={S.addBtn} onClick={handleAddSource}>追加</button>
                </div>
              </div>

              {/* ══ DISCOVERY NOTES ══ */}
              <div style={S.section}>
                <div style={S.sectionHeader}>
                  <span style={S.sectionLabel}>▸ DISCOVERY NOTES</span>
                  <span style={S.badge}>{(selected.discovery_notes ?? []).length}</span>
                </div>
                {(selected.discovery_notes ?? []).length === 0
                  ? <div style={S.empty}>未登録</div>
                  : (selected.discovery_notes ?? []).map((note, i) => (
                    <div key={i} style={S.itemRow}>
                      <span style={S.itemText}>{note}</span>
                      <button style={S.delBtn} onClick={() => handleRemoveNote(i)}>×</button>
                    </div>
                  ))
                }
                <div style={S.addRow}>
                  <input
                    style={S.input}
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddNote()}
                    placeholder="メモを入力..."
                  />
                  <button style={S.addBtn} onClick={handleAddNote}>追加</button>
                </div>
              </div>

              {/* ══ ANALYSIS ══ */}
              <div style={S.section}>
                <div style={{ ...S.sectionHeader }} onClick={() => setAnalysisOpen(o => !o)}>
                  <span style={S.sectionLabel}>▸ ANALYSIS</span>
                  <span style={{ ...S.badge, marginLeft: "auto" }}>{analysisOpen ? "▲" : "▼"}</span>
                </div>
                {analysisOpen && (
                  <div>
                    {ANALYSIS_FIELDS.map(({ key, label, color }) => {
                      const items = (selected.analysis ?? EMPTY_ANALYSIS)[key] ?? [];
                      return (
                        <div key={key} style={{ marginBottom: 10 }}>
                          <div style={{ color, fontSize: 10, letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>
                            {label}
                          </div>
                          {items.length === 0
                            ? <div style={S.empty}>—</div>
                            : items.map((item, i) => (
                              <div key={i} style={{ ...S.itemRow, borderColor: "#0a1525" }}>
                                <span style={S.itemText}>{item}</span>
                                <button style={S.delBtn} onClick={() => handleRemoveAnalysis(key, i)}>×</button>
                              </div>
                            ))
                          }
                          <div style={S.addRow}>
                            <input
                              style={{ ...S.input, borderColor: color + "44" }}
                              value={analysisInput[key] ?? ""}
                              onChange={e => setAnalysisInput(prev => ({ ...prev, [key]: e.target.value }))}
                              onKeyDown={e => e.key === "Enter" && handleAddAnalysis(key)}
                              placeholder={`${label}を追加...`}
                            />
                            <button style={{ ...S.addBtn, borderColor: color + "66", color }} onClick={() => handleAddAnalysis(key)}>追加</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── SAVE ── */}
              <button style={{ ...S.saveBtn, opacity: isSaving ? 0.5 : 1 }} onClick={handleSave} disabled={isSaving}>
                {isSaving ? "SAVING..." : "SAVE"}
              </button>

              <SourceDiscoveryPanel event={selected} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
