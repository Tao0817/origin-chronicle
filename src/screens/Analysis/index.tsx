const LEVELS = ["facts", "analysis", "speculation", "unconfirmed", "counter_evidence"] as const;
const LEVEL_LABELS: Record<typeof LEVELS[number], string> = {
  facts: "事実",
  analysis: "分析",
  speculation: "推察",
  unconfirmed: "未確認",
  counter_evidence: "反対材料",
};

export function Analysis() {
  return (
    <div className="screen-placeholder">
      <h2>推察・考察</h2>
      <div className="level-legend">
        {LEVELS.map((l) => (
          <span key={l} className="level-badge">{LEVEL_LABELS[l]}</span>
        ))}
      </div>
      <p>事実・分析・推察・未確認・反対材料を分けて整理します。</p>
    </div>
  );
}
